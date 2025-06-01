import { CheckCircle, Server, Shield } from "lucide-react";

export default function IntegrationStatus() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP SuccessFactors Integration</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-sap-success/5 rounded-lg border border-sap-success/20">
          <div className="w-10 h-10 bg-sap-success/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-sap-success h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Connection Status</div>
            <div className="text-sm text-sap-success">Connected</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-sap-blue/5 rounded-lg border border-sap-blue/20">
          <div className="w-10 h-10 bg-sap-blue/10 rounded-lg flex items-center justify-center">
            <Server className="text-sap-blue h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Environment</div>
            <div className="text-sm text-sap-blue">Production</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-sap-warning/5 rounded-lg border border-sap-warning/20">
          <div className="w-10 h-10 bg-sap-warning/10 rounded-lg flex items-center justify-center">
            <Shield className="text-sap-warning h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Security Level</div>
            <div className="text-sm text-sap-warning">High</div>
          </div>
        </div>
      </div>
    </div>
  );
}
