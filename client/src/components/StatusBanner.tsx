interface StatusBannerProps {
  captureActive: boolean;
  sessionDuration: string;
}

export default function StatusBanner({ captureActive, sessionDuration }: StatusBannerProps) {
  if (!captureActive) {
    return (
      <div className="mb-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Click Capture Inactive</h2>
            <p className="text-gray-100">Start capture to begin monitoring SAP SuccessFactors interactions</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-1">--:--:--</div>
            <div className="text-gray-100 text-sm">Session Duration</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: "0%" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-sap-blue to-sap-blue-dark text-white rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Click Capture Active</h2>
          <p className="text-blue-100">Monitoring SAP SuccessFactors Explorer screen for user interactions</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold mb-1">{sessionDuration}</div>
          <div className="text-blue-100 text-sm">Session Duration</div>
        </div>
      </div>
      <div className="mt-4 bg-white/20 rounded-full h-2">
        <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: "72%" }}></div>
      </div>
    </div>
  );
}
