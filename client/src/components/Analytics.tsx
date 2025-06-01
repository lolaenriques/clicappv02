import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics"],
    refetchInterval: 30000,
  });

  const { data: tasksBySection } = useQuery({
    queryKey: ["/api/analytics/by-section"],
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tasks by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksBySection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0073E6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Today's Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Clicks Captured</dt>
              <dd className="text-2xl font-bold">{stats?.todayClicks || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tasks Generated</dt>
              <dd className="text-2xl font-bold">{stats?.tasksGenerated || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
              <dd className="text-2xl font-bold text-sap-success">
                {stats?.successRate || 0}%
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}