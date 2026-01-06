import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { Badge } from '@/components/ui/badge';
import { mockTickets, mockDashboardStats, mockUsers } from '@/lib/mockData';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';

const Reports = () => {
  const stats = mockDashboardStats;
  
  // Calculate TA performance
  const taUsers = mockUsers.filter(u => u.role === 'ta');
  const taPerformance = taUsers.map(ta => {
    const taTickets = mockTickets.filter(t => t.assignedTo === ta.id);
    const closedTickets = taTickets.filter(t => t.status === 'CLOSED');
    const overdueTickets = taTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
    
    return {
      ...ta,
      totalTickets: taTickets.length,
      closedTickets: closedTickets.length,
      overdueTickets: overdueTickets.length,
      complianceRate: taTickets.length > 0 
        ? Math.round((taTickets.filter(t => t.ttrCompliance === 'COMPLY').length / taTickets.length) * 100)
        : 0,
    };
  });

  // Calculate category breakdown
  const categoryBreakdown = mockTickets.reduce((acc, ticket) => {
    const cat = ticket.kategori;
    if (!acc[cat]) {
      acc[cat] = { total: 0, closed: 0, overdue: 0 };
    }
    acc[cat].total++;
    if (ticket.status === 'CLOSED') acc[cat].closed++;
    if (ticket.sisaTtrHours < 0 && ticket.status !== 'CLOSED') acc[cat].overdue++;
    return acc;
  }, {} as Record<string, { total: number; closed: number; overdue: number }>);

  const handleExport = (type: 'daily' | 'weekly' | 'ta') => {
    // Mock export - in real app would generate file
    const filename = `laporan-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    alert(`Export ${filename} (demo)`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Laporan</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ringkasan performa dan statistik tiket
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('daily')}>
              <FileSpreadsheet className="w-4 h-4" />
              Export Harian
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('weekly')}>
              <Calendar className="w-4 h-4" />
              Export Mingguan
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            title="Total Tiket"
            value={mockTickets.length}
            icon={BarChart3}
            variant="primary"
          />
          <StatsCard
            title="Rata-rata Respon"
            value={`${stats.avgResponseTime}m`}
            subtitle="Waktu respon pertama"
            icon={Clock}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${stats.complianceRate}%`}
            icon={TrendingUp}
            variant={stats.complianceRate >= 90 ? 'success' : 'warning'}
          />
          <StatsCard
            title="Total TA Aktif"
            value={taUsers.filter(t => t.isActive).length}
            icon={Users}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* TA Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Performa Teknisi
              </CardTitle>
              <CardDescription>
                Statistik per teknisi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taPerformance.map(ta => (
                  <div key={ta.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                        {ta.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{ta.name}</p>
                        <p className="text-xs text-muted-foreground">{ta.area}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{ta.totalTickets}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-emerald-600">{ta.closedTickets}</p>
                        <p className="text-xs text-muted-foreground">Closed</p>
                      </div>
                      {ta.overdueTickets > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-destructive">{ta.overdueTickets}</p>
                          <p className="text-xs text-muted-foreground">Overdue</p>
                        </div>
                      )}
                      <Badge 
                        variant={ta.complianceRate >= 90 ? 'comply' : ta.complianceRate >= 70 ? 'warning' : 'notcomply'}
                      >
                        {ta.complianceRate}%
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full gap-2" onClick={() => handleExport('ta')}>
                  <Download className="w-4 h-4" />
                  Export Laporan TA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Per Kategori
              </CardTitle>
              <CardDescription>
                Breakdown tiket berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{data.total} tiket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(data.closed / data.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {Math.round((data.closed / data.total) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        {data.closed} closed
                      </span>
                      {data.overdue > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          {data.overdue} overdue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {mockTickets.filter(t => t.status === 'CLOSED').length}
            </p>
            <p className="text-xs text-muted-foreground">Total Closed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {mockTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED').length}
            </p>
            <p className="text-xs text-muted-foreground">Total Overdue</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {mockTickets.filter(t => t.status.startsWith('WAITING')).length}
            </p>
            <p className="text-xs text-muted-foreground">Menunggu</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {mockTickets.filter(t => t.status === 'ONPROGRESS').length}
            </p>
            <p className="text-xs text-muted-foreground">On Progress</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
