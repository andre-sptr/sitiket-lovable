import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TicketCard } from '@/components/TicketCard';
import { TicketCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getTicketsAssignedTo } from '@/lib/mockData';
import { generateWhatsAppMessage } from '@/lib/formatters';
import { Ticket } from '@/types/ticket';
import { Ticket as TicketIcon, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const myTickets = user ? getTicketsAssignedTo(user.id) : [];

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Sort: overdue first, then by remaining TTR, closed last
  const sortedTickets = [...myTickets].sort((a, b) => {
    if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
    if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
    return a.sisaTtrHours - b.sisaTtrHours;
  });

  const overdueTickets = myTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
  const dueSoonTickets = myTickets.filter(t => t.sisaTtrHours > 0 && t.sisaTtrHours <= 2 && t.status !== 'CLOSED');
  const activeTickets = myTickets.filter(t => t.status !== 'CLOSED');

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('update', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Template Disalin",
      description: "Template update progress sudah disalin ke clipboard",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Tiket Saya</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTickets.length} tiket aktif dari {myTickets.length} total
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Alerts */}
        {(overdueTickets.length > 0 || dueSoonTickets.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {overdueTickets.length > 0 && (
              <Badge variant="critical" className="gap-1.5 py-1.5 px-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueTickets.length} tiket overdue - Segera update!
              </Badge>
            )}
            {dueSoonTickets.length > 0 && (
              <Badge variant="warning" className="gap-1.5 py-1.5 px-3">
                <Clock className="w-3.5 h-3.5" />
                {dueSoonTickets.length} tiket hampir due
              </Badge>
            )}
          </div>
        )}

        {/* Ticket List */}
        <div className="space-y-3">
          {isLoading ? (
            <TicketCardSkeleton count={3} />
          ) : sortedTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Tidak ada tiket</p>
              <p className="text-sm">Anda belum memiliki tiket yang di-assign</p>
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
    </Layout>
  );
};

export default MyTickets;
