import { MousePointer, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  captureActive: boolean;
  toggleCapture: () => void;
}

export default function Header({ captureActive, toggleCapture }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <MousePointer className="text-sap-blue text-2xl h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SuccessFactors Click Capture</h1>
                <p className="text-sm text-sap-neutral">Automated Task Generation System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleCapture}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                captureActive
                  ? "bg-sap-error hover:bg-red-700 text-white"
                  : "bg-sap-blue hover:bg-sap-blue-dark text-white"
              }`}
            >
              {captureActive ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{captureActive ? "Stop Capture" : "Start Capture"}</span>
            </Button>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-sap-success rounded-full animate-pulse"></div>
              <span className="text-sap-neutral">Connected to SAP SF</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
