import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertClickCaptureSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ success: true });
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Protected routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.put("/api/tasks/:id/status", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }

      const task = await storage.updateTaskStatus(id, status);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/by-section", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      const sections: { [key: string]: number } = {};
      
      tasks.forEach(task => {
        sections[task.section] = (sections[task.section] || 0) + 1;
      });
      
      const data = Object.entries(sections).map(([section, count]) => ({
        section,
        count
      }));
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Click capture routes
  app.post("/api/captures", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClickCaptureSchema.parse(req.body);
      const capture = await storage.createClickCapture(validatedData);
      
      const settings = await storage.getSettings();
      if (settings?.autoTaskGeneration) {
        const taskName = generateImprovedTaskName(capture);
        const section = extractSection(capture.pageUrl);
        
        await storage.createTask({
          name: taskName,
          element: capture.elementText || capture.elementSelector,
          section: section,
          status: "completed",
          clickData: JSON.stringify(capture)
        });
        
        await storage.markCaptureProcessed(capture.id);
      }
      
      res.json(capture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid capture data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create capture" });
      }
    }
  });

  app.get("/api/captures", requireAuth, async (req, res) => {
    try {
      const captures = await storage.getClickCaptures();
      res.json(captures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch captures" });
    }
  });

  // Settings routes
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Statistics route
  app.get("/api/statistics", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Simulate click capture (for demo purposes)
  app.post("/api/simulate-click", requireAuth, async (req, res) => {
    try {
      const { elementText, elementSelector, section } = req.body;
      
      // Create click capture
      const capture = await storage.createClickCapture({
        elementSelector: elementSelector || `button:contains("${elementText}")`,
        elementText: elementText,
        pageUrl: `https://successfactors.com/${section}`
      });

      // Auto-generate task
      const taskName = generateImprovedTaskName(capture);
      await storage.createTask({
        name: taskName,
        element: elementText,
        section: section,
        status: "completed",
        clickData: JSON.stringify(capture)
      });

      await storage.markCaptureProcessed(capture.id);
      
      res.json({ success: true, capture });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate click" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateImprovedTaskName(capture: ClickCapture): string {
  const elementText = capture.elementText || "";
  const elementSelector = capture.elementSelector;
  
  // Handle input fields
  if (elementSelector.includes('input')) {
    const placeholder = elementText || extractAttribute(elementSelector, 'placeholder');
    const label = extractLabel(elementSelector);
    if (label) {
      return `Enter value in ${label} field`;
    }
    if (placeholder) {
      return `Enter value in ${placeholder} field`;
    }
    return "Enter value in input field";
  }
  
  // Handle select/picklist
  if (elementSelector.includes('select') || elementSelector.includes('combobox')) {
    const label = extractLabel(elementSelector);
    if (label) {
      return `Select value from ${label} dropdown`;
    }
    return `Select ${elementText || 'value'} from dropdown`;
  }
  
  // Handle buttons
  if (elementSelector.includes('button')) {
    return `Click ${elementText || 'button'}`;
  }
  
  // Handle links
  if (elementSelector.includes('a[')) {
    return `Navigate to ${elementText}`;
  }
  
  // Default case
  return `Click in ${elementText || 'element'}`;
}

function extractLabel(selector: string): string {
  // This is a simplified version - you'd want to enhance this based on your specific UI framework
  const labelMatch = selector.match(/label\[.*?text="(.*?)"\]/);
  return labelMatch ? labelMatch[1] : '';
}

function extractAttribute(selector: string, attr: string): string {
  const match = selector.match(new RegExp(`\\[${attr}="(.*?)"`));
  return match ? match[1] : '';
}

function extractSection(url: string): string {
  const sections: { [key: string]: string } = {
    'profile': 'Employee Profile',
    'learning': 'Learning Management',
    'goals': 'Performance Goals',
    'compensation': 'Compensation',
    'timeoff': 'Time Off',
    'directory': 'Employee Directory'
  };
  
  for (const [key, value] of Object.entries(sections)) {
    if (url.includes(key)) {
      return value;
    }
  }
  
  return 'General';
}