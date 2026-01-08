import { Ticket } from '@/types/ticket';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
import { formatDateShort, generateGoogleMapsLink } from '@/lib/formatters';
import { getSettings, getTTRStatus, isDueSoon as checkIsDueSoon } from '@/hooks/useSettings';
import { 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  Copy, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketCardProps {
  ticket: Ticket;
  onCopyWhatsApp?: (ticket: Ticket) => void;
  compact?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onCopyWhatsApp, compact = false }) => {
  const navigate = useNavigate();
  const settings = getSettings();
  const ttrStatus = getTTRStatus(ticket.sisaTtrHours, settings.ttrThresholds);
  const isOverdue = ttrStatus === 'overdue' && ticket.status !== 'CLOSED';
  const isDueSoon = checkIsDueSoon(ticket.sisaTtrHours, settings.ttrThresholds) && ticket.status !== 'CLOSED';
  const isUnassigned = !ticket.assignedTo && ticket.status === 'OPEN';

  const handleClick = () => {
    navigate(`/ticket/${ticket.id}`);
  };

  return (
    <Card 
      hover
      className={`relative overflow-hidden ${isOverdue ? 'ring-2 ring-destructive/50 animate-pulse-glow' : ''} ${isDueSoon ? 'ring-2 ring-amber-400/50' : ''}`}
      onClick={handleClick}
    >
      {/* Priority indicator strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isOverdue ? 'bg-destructive' : 
        isDueSoon ? 'bg-amber-500' : 
        ticket.status === 'CLOSED' ? 'bg-emerald-500' : 
        'bg-primary'
      }`} />

      <CardContent className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-muted-foreground">
                {ticket.incNumbers[0]}
              </span>
              {ticket.incNumbers.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{ticket.incNumbers.length - 1}
                </span>
              )}
              {isUnassigned && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3" />
                  Belum assign
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm md:text-base truncate">
              {ticket.siteCode} - {ticket.siteName}
            </h3>
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded mt-1">
              {ticket.kategori}
            </span>
          </div>
          <StatusBadge status={ticket.status} size="sm" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{ticket.lokasiText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatDateShort(ticket.jamOpen)}</span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{ticket.teknisiList?.join(', ') || 'TA Assigned'}</span>
            </div>
          )}
        </div>

        {/* TTR & Compliance */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <TTRBadge hours={ticket.sisaTtrHours} size="sm" />
            <ComplianceBadge compliance={ticket.ttrCompliance} size="sm" />
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {ticket.latitude && ticket.longitude && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={generateGoogleMapsLink(ticket.latitude, ticket.longitude)} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4" />
                </a>
              </Button>
            )}
            {onCopyWhatsApp && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyWhatsApp(ticket);
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
