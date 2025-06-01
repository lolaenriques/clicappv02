import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskItem from "./TaskItem";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TaskListProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export default function TaskList({ filter, setFilter }: TaskListProps) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const simulateClickMutation = useMutation({
    mutationFn: async (clickData: { elementText: string; section: string }) => {
      const response = await apiRequest("POST", "/api/simulate-click", clickData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });

  // Simulate some click activity for demo
  const handleSimulateClick = () => {
    const sampleClicks = [
      { elementText: "View My Profile", section: "profile" },
      { elementText: "Employee Directory Search", section: "directory" },
      { elementText: "Learning Modules Navigation", section: "learning" },
      { elementText: "Performance Goals Dashboard", section: "goals" },
      { elementText: "Compensation Statement", section: "compensation" },
    ];
    
    const randomClick = sampleClicks[Math.floor(Math.random() * sampleClicks.length)];
    simulateClickMutation.mutate(randomClick);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "pending") return task.status === "pending";
    if (filter === "completed") return task.status === "completed";
    if (filter === "failed") return task.status === "failed";
    return true;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Generated Tasks</h2>
        <div className="flex items-center space-x-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="px-3 py-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateClick}
            disabled={simulateClickMutation.isPending}
          >
            Simulate Click
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {filter === "all" 
              ? "Start capturing clicks to generate tasks automatically"
              : `No ${filter} tasks found`
            }
          </p>
          <Button onClick={handleSimulateClick} disabled={simulateClickMutation.isPending}>
            Simulate Click to Generate Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      {filteredTasks.length > 0 && (
        <div className="text-center mt-6">
          <Button variant="outline" className="px-6 py-3">
            Load More Tasks
          </Button>
        </div>
      )}
    </div>
  );
}
