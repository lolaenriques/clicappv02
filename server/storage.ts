import { 
  users, 
  tasks, 
  clickCaptures, 
  captureSettings,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type ClickCapture,
  type InsertClickCapture,
  type CaptureSettings,
  type InsertCaptureSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Click capture methods
  getClickCaptures(): Promise<ClickCapture[]>;
  createClickCapture(capture: InsertClickCapture): Promise<ClickCapture>;
  markCaptureProcessed(id: number): Promise<boolean>;
  getUnprocessedCaptures(): Promise<ClickCapture[]>;
  
  // Settings methods
  getSettings(): Promise<CaptureSettings | undefined>;
  updateSettings(settings: Partial<CaptureSettings>): Promise<CaptureSettings>;
  
  // Statistics
  getStatistics(): Promise<{
    todayClicks: number;
    tasksGenerated: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private clickCaptures: Map<number, ClickCapture>;
  private settings: CaptureSettings;
  private currentUserId: number;
  private currentTaskId: number;
  private currentCaptureId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.clickCaptures = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentCaptureId = 1;
    
    // Initialize default settings
    this.settings = {
      id: 1,
      autoTaskGeneration: true,
      realTimeSync: true,
      captureActive: false,
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      timestamp: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, status };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Click capture methods
  async getClickCaptures(): Promise<ClickCapture[]> {
    return Array.from(this.clickCaptures.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createClickCapture(insertCapture: InsertClickCapture): Promise<ClickCapture> {
    const id = this.currentCaptureId++;
    const capture: ClickCapture = { 
      ...insertCapture, 
      id, 
      timestamp: new Date(),
      processed: false
    };
    this.clickCaptures.set(id, capture);
    return capture;
  }

  async markCaptureProcessed(id: number): Promise<boolean> {
    const capture = this.clickCaptures.get(id);
    if (capture) {
      const updatedCapture = { ...capture, processed: true };
      this.clickCaptures.set(id, updatedCapture);
      return true;
    }
    return false;
  }

  async getUnprocessedCaptures(): Promise<ClickCapture[]> {
    return Array.from(this.clickCaptures.values()).filter(c => !c.processed);
  }

  // Settings methods
  async getSettings(): Promise<CaptureSettings | undefined> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<CaptureSettings>): Promise<CaptureSettings> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  // Statistics
  async getStatistics(): Promise<{ todayClicks: number; tasksGenerated: number; successRate: number; }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCaptures = Array.from(this.clickCaptures.values()).filter(
      c => new Date(c.timestamp) >= today
    );
    
    const todayTasks = Array.from(this.tasks.values()).filter(
      t => new Date(t.timestamp) >= today
    );
    
    const completedTasks = todayTasks.filter(t => t.status === "completed").length;
    const successRate = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 98.2;
    
    return {
      todayClicks: todayCaptures.length,
      tasksGenerated: todayTasks.length,
      successRate: Math.round(successRate * 10) / 10
    };
  }
}

export const storage = new MemStorage();
