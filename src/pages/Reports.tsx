import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTickets, mockDashboardStats } from '@/lib/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  PieChart
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

const Reports = () => {
  const stats = mockDashboardStats;

  // Generate data per periode (7 hari terakhir)
  const periodData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      
      const ticketsOnDay = mockTickets.filter(ticket => {
        const ticketDate = new Date(ticket.jamOpen);
        return ticketDate.toDateString() === date.toDateString();
      });
      
      days.push({
        name: dateStr,
        open: ticketsOnDay.filter(t => t.status === 'OPEN').length,
        onprogress: ticketsOnDay.filter(t => t.status === 'ONPROGRESS').length,
        closed: ticketsOnDay.filter(t => t.status === 'CLOSED').length,
        total: ticketsOnDay.length,
      });
    }
    
    return days;
  }, []);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    mockTickets.forEach(t => {
      const cat = t.kategori || 'Lainnya';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      category: name,
    }));
  }, []);

  // Status breakdown data
  const statusData = useMemo(() => {
    return [
      { name: 'Open', value: mockTickets.filter(t => t.status === 'OPEN').length, status: 'open' },
      { name: 'On Progress', value: mockTickets.filter(t => t.status === 'ONPROGRESS').length, status: 'onprogress' },
      { name: 'Waiting', value: mockTickets.filter(t => t.status.startsWith('WAITING')).length, status: 'waiting' },
      { name: 'Temporary', value: mockTickets.filter(t => t.status === 'TEMPORARY').length, status: 'temporary' },
      { name: 'Closed', value: mockTickets.filter(t => t.status === 'CLOSED').length, status: 'closed' },
    ].filter(d => d.value > 0);
  }, []);

  // Chart configs
  const barChartConfig: ChartConfig = {
    open: { label: 'Open', color: 'hsl(var(--primary))' },
    onprogress: { label: 'On Progress', color: 'hsl(45 93% 47%)' },
    closed: { label: 'Closed', color: 'hsl(142 76% 36%)' },
  };

  const pieChartConfig: ChartConfig = categoryData.reduce((acc, cat, index) => {
    const colors = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(262 83% 58%)', 'hsl(174 72% 40%)', 'hsl(340 75% 55%)'];
    acc[cat.category] = { label: cat.name, color: colors[index % colors.length] };
    return acc;
  }, {} as ChartConfig);

  const statusChartConfig: ChartConfig = {
    open: { label: 'Open', color: 'hsl(var(--primary))' },
    onprogress: { label: 'On Progress', color: 'hsl(45 93% 47%)' },
    waiting: { label: 'Waiting', color: 'hsl(25 95% 53%)' },
    temporary: { label: 'Temporary', color: 'hsl(262 83% 58%)' },
    closed: { label: 'Closed', color: 'hsl(142 76% 36%)' },
  };

  const CATEGORY_COLORS = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(262 83% 58%)', 'hsl(174 72% 40%)', 'hsl(340 75% 55%)'];
  const STATUS_COLORS = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(25 95% 53%)', 'hsl(262 83% 58%)', 'hsl(142 76% 36%)'];

  const handleExport = (type: 'daily' | 'weekly') => {
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

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.totalToday}
            </p>
            <p className="text-xs text-muted-foreground">Total Hari Ini</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {stats.closedToday}
            </p>
            <p className="text-xs text-muted-foreground">Closed Hari Ini</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {stats.overdueTickets}
            </p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {stats.complianceRate}%
            </p>
            <p className="text-xs text-muted-foreground">Compliance Rate</p>
          </Card>
        </div>

        {/* Charts Row 1: Bar Chart - Tiket per Periode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tiket per Periode (7 Hari Terakhir)
            </CardTitle>
            <CardDescription>
              Jumlah tiket berdasarkan status per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <BarChart data={periodData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="open" fill="var(--color-open)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onprogress" fill="var(--color-onprogress)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" fill="var(--color-closed)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Charts Row 2: Pie Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Tiket per Kategori
              </CardTitle>
              <CardDescription>
                Distribusi tiket berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tiket per Status
              </CardTitle>
              <CardDescription>
                Distribusi tiket berdasarkan status penanganan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusChartConfig} className="h-[280px] w-full">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Detail per Kategori
            </CardTitle>
            <CardDescription>
              Breakdown tiket berdasarkan kategori dan status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((cat) => {
                const categoryTickets = mockTickets.filter(t => t.kategori === cat.category);
                const closed = categoryTickets.filter(t => t.status === 'CLOSED').length;
                const percentage = categoryTickets.length > 0 ? Math.round((closed / categoryTickets.length) * 100) : 0;
                
                return (
                  <div key={cat.category} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-sm text-muted-foreground">{cat.value} tiket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        {closed} closed
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        {categoryTickets.filter(t => t.status === 'ONPROGRESS').length} proses
                      </span>
                      {categoryTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED').length > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          {categoryTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED').length} overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
