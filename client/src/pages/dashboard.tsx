import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import StatusBanner from "@/components/StatusBanner";
import IntegrationStatus from "@/components/IntegrationStatus";
import { useCapture } from "@/hooks/useCapture";

export default function Dashboard() {
  const [filter, setFilter] = useState<string>("all");
  const { captureActive, toggleCapture, sessionDuration } = useCapture();

  return (
    <div className="min-h-screen bg-sap-bg">
      <Header captureActive={captureActive} toggleCapture={toggleCapture} />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <StatusBanner 
              captureActive={captureActive} 
              sessionDuration={sessionDuration} 
            />
            
            <TaskList filter={filter} setFilter={setFilter} />
            
            <IntegrationStatus />
          </div>
        </main>
      </div>
    </div>
  );
}
