import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/StatsCard';
import { TicketCard } from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getTodayTickets, 
  mockDashboardStats 
} from '@/lib/mockData';
import { generateWhatsAppMessage } from '@/lib/formatters';
import { getSettings, isDueSoon as checkIsDueSoon } from '@/hooks/useSettings';
import { Ticket } from '@/types/ticket';
import { 
  Ticket as TicketIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Percent,
  Plus,
  Filter,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const todayTickets = getTodayTickets();
  const stats = mockDashboardStats;
  const settings = getSettings();

  const handleRefresh = () => {
    setIsRefreshing(true); 
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Data diperbarui", description: "Dashboard telah di-refresh" });
    }, 1000);
  };

  // Sort: overdue first, then by remaining TTR
  const sortedTickets = [...todayTickets].sort((a, b) => {
    if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
    if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
    return a.sisaTtrHours - b.sisaTtrHours;
  });

  const overdueTickets = todayTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
  const dueSoonTickets = todayTickets.filter(t => 
    checkIsDueSoon(t.sisaTtrHours, settings.ttrThresholds) && t.status !== 'CLOSED'
  );
  const unassignedTickets = todayTickets.filter(t => !t.assignedTo && t.status === 'OPEN');

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: `Pesan untuk ${ticket.siteCode} sudah disalin ke clipboard`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tiket hari ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw 
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              Refresh
            </Button>
            {user?.role !== 'admin' && user?.role !== 'guest' && (
              <Link to="/import">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Import Tiket
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            title="Total Hari Ini"
            value={stats.totalToday}
            icon={TicketIcon}
            variant="primary"
          />
          <StatsCard
            title="Open/Unassigned"
            value={stats.openTickets}
            subtitle={unassignedTickets.length > 0 ? `${unassignedTickets.length} belum assign` : undefined}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueTickets}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            title="Closed Hari Ini"
            value={stats.closedToday}
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <StatsCard
            title="Rata-rata Respon"
            value={`${stats.avgResponseTime}m`}
            subtitle="Waktu respon pertama TA"
            icon={TrendingUp}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${stats.complianceRate}%`}
            subtitle="Target: 90%"
            icon={Percent}
            variant={stats.complianceRate >= 90 ? 'success' : stats.complianceRate >= 70 ? 'warning' : 'danger'}
          />
        </div>

        {/* Alerts */}
        {(overdueTickets.length > 0 || dueSoonTickets.length > 0 || unassignedTickets.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {overdueTickets.length > 0 && (
              <Badge variant="critical" className="gap-1.5 py-1.5 px-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueTickets.length} tiket overdue
              </Badge>
            )}
            {dueSoonTickets.length > 0 && (
              <Badge variant="warning" className="gap-1.5 py-1.5 px-3">
                <Clock className="w-3.5 h-3.5" />
                {dueSoonTickets.length} tiket hampir due
              </Badge>
            )}
            {unassignedTickets.length > 0 && (
              <Badge variant="info" className="gap-1.5 py-1.5 px-3">
                <TicketIcon className="w-3.5 h-3.5" />
                {unassignedTickets.length} belum assign
              </Badge>
            )}
          </div>
        )}

        {/* Ticket List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tiket Hari Ini</h2>
            <Link to="/tickets">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {sortedTickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada tiket hari ini</p>
              </div>
            ) : (
              sortedTickets.map((ticket, index) => (
                <div 
                  key={ticket.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TicketCard 
                    ticket={ticket} 
                    onCopyWhatsApp={handleCopyWhatsApp}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
