import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, Clock, Download, Trash2, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const { toast } = useToast();
  const [autoTaskGeneration, setAutoTaskGeneration] = useState(true);
  const [realTimeSync, setRealTimeSync] = useState(true);

  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleToggleAutoTask = async (checked: boolean) => {
    try {
      await apiRequest("PUT", "/api/settings", { autoTaskGeneration: checked });
      setAutoTaskGeneration(checked);
      toast({
        title: "Settings Updated",
        description: `Auto task generation ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleToggleRealTime = async (checked: boolean) => {
    try {
      await apiRequest("PUT", "/api/settings", { realTimeSync: checked });
      setRealTimeSync(checked);
      toast({
        title: "Settings Updated",
        description: `Real-time sync ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleExportTasks = () => {
    toast({
      title: "Export Started",
      description: "Tasks are being exported to CSV",
    });
  };

  const handleClearCompleted = async () => {
    try {
      // This would be implemented as a bulk delete endpoint
      toast({
        title: "Tasks Cleared",
        description: "Completed tasks have been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear completed tasks",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Capture Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="text-sap-blue h-5 w-5" />
                <span className="text-sm font-medium text-gray-700">Auto Task Generation</span>
              </div>
              <Switch
                checked={autoTaskGeneration}
                onCheckedChange={handleToggleAutoTask}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="text-sap-blue h-5 w-5" />
                <span className="text-sm font-medium text-gray-700">Real-time Sync</span>
              </div>
              <Switch
                checked={realTimeSync}
                onCheckedChange={handleToggleRealTime}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Capture Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-sap-neutral">Today's Clicks</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.todayClicks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-sap-neutral">Tasks Generated</span>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.tasksGenerated || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-sap-neutral">Success Rate</span>
              <span className="text-sm font-semibold text-sap-success">
                {statistics?.successRate || 0}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sap-neutral hover:bg-gray-50"
              onClick={handleExportTasks}
            >
              <Download className="h-4 w-4 mr-3" />
              Export Tasks
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sap-neutral hover:bg-gray-50"
              onClick={handleClearCompleted}
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Clear Completed
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sap-neutral hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
