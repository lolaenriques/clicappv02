import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MousePointer, Eye, Check, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/tasks/${task.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/tasks/${task.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Task Deleted",
        description: "Task has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleMarkComplete = () => {
    updateStatusMutation.mutate("completed");
  };

  const handleRetry = () => {
    updateStatusMutation.mutate("processing");
    // Simulate completion after 2 seconds
    setTimeout(() => {
      updateStatusMutation.mutate("completed");
    }, 2000);
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate();
  };

  const handleViewDetails = () => {
    toast({
      title: "Task Details",
      description: `${task.name} - ${task.element} in ${task.section}`,
    });
  };

  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return "text-sap-success";
      case "processing":
        return "text-sap-warning";
      case "failed":
        return "text-sap-error";
      default:
        return "text-gray-400";
    }
  };

  const getStatusDotColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-sap-success";
      case "processing":
        return "bg-sap-warning";
      case "failed":
        return "bg-sap-error";
      default:
        return "bg-gray-400";
    }
  };

  const getIconComponent = () => {
    switch (task.status) {
      case "failed":
        return <AlertTriangle className="text-sap-error h-4 w-4" />;
      case "processing":
        return <MousePointer className="text-sap-warning h-4 w-4" />;
      default:
        return <MousePointer className="text-sap-blue h-4 w-4" />;
    }
  };

  const getIconBgColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-sap-blue/10";
      case "processing":
        return "bg-sap-warning/10";
      case "failed":
        return "bg-sap-error/10";
      default:
        return "bg-gray-100";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 ${getIconBgColor()} rounded-lg flex items-center justify-center`}>
            {getIconComponent()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{task.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-sap-neutral mt-1">
              <span>{formatTimestamp(task.timestamp)}</span>
              <span>{task.element} • {task.section} Section</span>
              <span className="flex items-center space-x-1">
                <div className={`w-2 h-2 ${getStatusDotColor()} rounded-full`}></div>
                <span className={getStatusColor()}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="text-sap-neutral hover:text-sap-blue"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {task.status === "failed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={updateStatusMutation.isPending}
              className="text-sap-neutral hover:text-sap-warning"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {task.status !== "processing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkComplete}
              disabled={updateStatusMutation.isPending}
              className="text-sap-neutral hover:text-sap-success"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
            className="text-sap-neutral hover:text-sap-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
