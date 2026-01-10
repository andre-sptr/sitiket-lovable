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
  Calendar as CalendarIcon,
  PieChart,
  X,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useMemo, useState } from 'react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const Reports = () => {
  const { toast } = useToast();
  const stats = mockDashboardStats;
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  // Filter tickets based on date range
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const ticketDate = new Date(ticket.jamOpen);
      return isWithinInterval(ticketDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    });
  }, [dateRange]);

  // Generate data per periode based on date range
  const periodData = useMemo(() => {
    const days = [];
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(dateRange.from);
      date.setDate(dateRange.from.getDate() + i);
      const dateStr = format(date, 'EEE, d', { locale: id });
      
      const ticketsOnDay = filteredTickets.filter(ticket => {
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
  }, [dateRange, filteredTickets]);

  // Category breakdown data based on filtered tickets
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const cat = t.kategori || 'Lainnya';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      category: name,
    }));
  }, [filteredTickets]);

  // Status breakdown data based on filtered tickets
  const statusData = useMemo(() => {
    return [
      { name: 'Open', value: filteredTickets.filter(t => t.status === 'OPEN').length, status: 'open' },
      { name: 'On Progress', value: filteredTickets.filter(t => t.status === 'ONPROGRESS').length, status: 'onprogress' },
      { name: 'Waiting', value: filteredTickets.filter(t => t.status.startsWith('WAITING')).length, status: 'waiting' },
      { name: 'Temporary', value: filteredTickets.filter(t => t.status === 'TEMPORARY').length, status: 'temporary' },
      { name: 'Closed', value: filteredTickets.filter(t => t.status === 'CLOSED').length, status: 'closed' },
    ].filter(d => d.value > 0);
  }, [filteredTickets]);

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

  // Export to CSV function
  const exportToCSV = (exportType: 'full' | 'summary') => {
    const dateFrom = format(dateRange.from, 'yyyy-MM-dd');
    const dateTo = format(dateRange.to, 'yyyy-MM-dd');
    
    let csvContent = '';
    let filename = '';

    if (exportType === 'full') {
      // Full ticket data export
      filename = `laporan-tiket-lengkap_${dateFrom}_${dateTo}.csv`;
      
      // CSV headers
      const headers = [
        'ID Tiket',
        'Provider',
        'No. INC',
        'Site Code',
        'Site Name',
        'Kategori',
        'Lokasi',
        'Status',
        'TTR Compliance',
        'Jam Open',
        'Max Jam Close',
        'Sisa TTR (Jam)',
        'TTR Real (Jam)',
        'Teknisi',
        'Penyebab',
        'Catatan Permanen'
      ];
      
      csvContent = headers.join(',') + '\n';
      
      // CSV rows
      filteredTickets.forEach(ticket => {
        const row = [
          ticket.id,
          ticket.provider || '',
          ticket.incNumbers?.join('; ') || '',
          ticket.siteCode || '',
          ticket.siteName || '',
          ticket.kategori || '',
          `"${ticket.lokasiText || ''}"`,
          ticket.status,
          ticket.ttrCompliance || '',
          format(new Date(ticket.jamOpen), 'yyyy-MM-dd HH:mm'),
          ticket.maxJamClose ? format(new Date(ticket.maxJamClose), 'yyyy-MM-dd HH:mm') : '',
          ticket.sisaTtrHours?.toString() || '',
          ticket.ttrRealHours?.toString() || '',
          `"${ticket.teknisiList?.join(', ') || ''}"`,
          `"${ticket.penyebab || ''}"`,
          `"${ticket.permanentNotes || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      // Summary export
      filename = `laporan-ringkasan_${dateFrom}_${dateTo}.csv`;
      
      // Summary by status
      csvContent = 'RINGKASAN LAPORAN TIKET\n';
      csvContent += `Periode: ${format(dateRange.from, 'dd MMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: id })}\n\n`;
      
      csvContent += 'STATUS,JUMLAH\n';
      statusData.forEach(s => {
        csvContent += `${s.name},${s.value}\n`;
      });
      
      csvContent += '\nKATEGORI,JUMLAH,CLOSED,PERSENTASE SELESAI\n';
      categoryData.forEach(cat => {
        const categoryTickets = filteredTickets.filter(t => t.kategori === cat.category);
        const closed = categoryTickets.filter(t => t.status === 'CLOSED').length;
        const percentage = categoryTickets.length > 0 ? Math.round((closed / categoryTickets.length) * 100) : 0;
        csvContent += `${cat.name},${cat.value},${closed},${percentage}%\n`;
      });
      
      csvContent += '\nSTATISTIK PER HARI\n';
      csvContent += 'TANGGAL,OPEN,ON PROGRESS,CLOSED,TOTAL\n';
      periodData.forEach(day => {
        csvContent += `${day.name},${day.open},${day.onprogress},${day.closed},${day.total}\n`;
      });
    }

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Berhasil",
      description: `File ${filename} berhasil diunduh`,
    });
  };

  // Preset date ranges
  const handlePresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    });
  };

  const handleResetFilter = () => {
    setDateRange({
      from: subDays(new Date(), 6),
      to: new Date(),
    });
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
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCSV('full')}>
              <FileSpreadsheet className="w-4 h-4" />
              Export Data Lengkap
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCSV('summary')}>
              <Download className="w-4 h-4" />
              Export Ringkasan
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm">Filter Periode:</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Preset buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange(7)}
                  className="text-xs"
                >
                  7 Hari
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange(14)}
                  className="text-xs"
                >
                  14 Hari
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange(30)}
                  className="text-xs"
                >
                  30 Hari
                </Button>
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              {/* Custom date range pickers */}
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal text-xs min-w-[120px]",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateRange.from ? format(dateRange.from, "dd MMM yyyy", { locale: id }) : "Dari"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      disabled={(date) => date > new Date() || date > dateRange.to}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-sm">-</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal text-xs min-w-[120px]",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateRange.to ? format(dateRange.to, "dd MMM yyyy", { locale: id }) : "Sampai"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      disabled={(date) => date > new Date() || date < dateRange.from}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilter}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Summary badge */}
            <div className="ml-auto">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {filteredTickets.length} tiket ditemukan
              </span>
            </div>
          </div>
        </Card>

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
              Tiket per Periode ({format(dateRange.from, "dd MMM", { locale: id })} - {format(dateRange.to, "dd MMM yyyy", { locale: id })})
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
                const categoryTickets = filteredTickets.filter(t => t.kategori === cat.category);
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
