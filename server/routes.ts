import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertClickCaptureSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
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

  app.put("/api/tasks/:id/status", async (req, res) => {
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

  app.delete("/api/tasks/:id", async (req, res) => {
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

  // Click capture routes
  app.post("/api/captures", async (req, res) => {
    try {
      const validatedData = insertClickCaptureSchema.parse(req.body);
      const capture = await storage.createClickCapture(validatedData);
      
      // Auto-generate task if settings allow
      const settings = await storage.getSettings();
      if (settings?.autoTaskGeneration) {
        const taskName = generateTaskName(capture);
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

  app.get("/api/captures", async (req, res) => {
    try {
      const captures = await storage.getClickCaptures();
      res.json(captures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch captures" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Simulate click capture (for demo purposes)
  app.post("/api/simulate-click", async (req, res) => {
    try {
      const { elementText, elementSelector, section } = req.body;
      
      // Create click capture
      const capture = await storage.createClickCapture({
        elementSelector: elementSelector || `button:contains("${elementText}")`,
        elementText: elementText,
        pageUrl: `https://successfactors.com/${section}`
      });

      // Auto-generate task
      const taskName = `Click in ${elementText}`;
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

function generateTaskName(capture: ClickCapture): string {
  const elementText = capture.elementText || "Unknown Element";
  return `Click in ${elementText}`;
}

function extractSection(url: string): string {
  // Extract section from URL path
  const urlParts = url.split('/');
  const section = urlParts[urlParts.length - 1] || "Explorer";
  return section.charAt(0).toUpperCase() + section.slice(1);
}
