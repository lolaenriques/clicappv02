import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useCapture() {
  const [captureActive, setCaptureActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState("00:00:00");
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { captureActive: boolean }) => {
      const response = await apiRequest("PUT", "/api/settings", settings);
      return response.json();
    },
  });

  // Update session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (captureActive && sessionStart) {
      interval = setInterval(() => {
        const elapsed = Date.now() - sessionStart.getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        setSessionDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setSessionDuration("00:00:00");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [captureActive, sessionStart]);

  const toggleCapture = () => {
    const newState = !captureActive;
    setCaptureActive(newState);
    
    if (newState) {
      setSessionStart(new Date());
    } else {
      setSessionStart(null);
    }
    
    updateSettingsMutation.mutate({ captureActive: newState });
  };

  // Simulate click capture when active
  useEffect(() => {
    if (!captureActive) return;

    const simulateClick = () => {
      // Simulate random click events
      const sampleElements = [
        { text: "View My Profile", selector: "#profile-link", section: "profile" },
        { text: "Employee Directory", selector: "#directory-link", section: "directory" },
        { text: "Learning Center", selector: "#learning-link", section: "learning" },
        { text: "Performance Goals", selector: "#goals-link", section: "goals" },
        { text: "Time Off", selector: "#timeoff-link", section: "timeoff" },
      ];

      const randomElement = sampleElements[Math.floor(Math.random() * sampleElements.length)];
      
      // Create capture
      apiRequest("POST", "/api/captures", {
        elementSelector: randomElement.selector,
        elementText: randomElement.text,
        pageUrl: `https://successfactors.com/${randomElement.section}`,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      });
    };

    // Simulate clicks every 30-60 seconds
    const interval = setInterval(simulateClick, 30000 + Math.random() * 30000);
    
    return () => clearInterval(interval);
  }, [captureActive, queryClient]);

  return {
    captureActive,
    toggleCapture,
    sessionDuration,
  };
}
