
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Files, HardDrive, TrendingUp } from "lucide-react";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { useAuth } from "@/contexts/AuthContext";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const KPICards = () => {
  const { kpiData } = useRealtimeKPIs();
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'Admin' || profile?.role === 'Director' || profile?.role === 'SuperOrg';

  const cards = [
    {
      title: isAdmin ? "Total Files" : "My Files",
      value: kpiData.loading ? "..." : kpiData.totalFiles.toString(),
      description: isAdmin ? "Files in your organization" : "Files you've uploaded",
      icon: Files,
      color: "text-blue-600"
    },
    {
      title: isAdmin ? "Organization Storage" : "My Storage Used",
      value: kpiData.loading ? "..." : formatFileSize(kpiData.totalSize),
      description: isAdmin ? "Total storage consumed" : "Your storage usage",
      icon: HardDrive,
      color: "text-green-600"
    },
    {
      title: "Recent Activity",
      value: kpiData.loading ? "..." : kpiData.recentFiles.toString(),
      description: isAdmin ? "Files added this week" : "Your files added this week",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;
