export interface CaptureStatistics {
  todayClicks: number;
  tasksGenerated: number;
  successRate: number;
}

export interface NotificationData {
  title: string;
  description: string;
  type: "success" | "error" | "info" | "warning";
}

export interface ClickEvent {
  elementSelector: string;
  elementText: string;
  pageUrl: string;
  timestamp: Date;
}

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface TaskFilter {
  status?: TaskStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
