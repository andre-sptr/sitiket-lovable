import { Badge } from '@/components/ui/badge';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import { getStatusLabel } from '@/lib/formatters';
import { 
  Clock, 
  UserCheck, 
  Loader2, 
  Wrench, 
  Package, 
  Lock, 
  Users, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const statusVariantMap: Record<TicketStatus, 'open' | 'assigned' | 'onprogress' | 'temporary' | 'waiting' | 'closed'> = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  ONPROGRESS: 'onprogress',
  TEMPORARY: 'temporary',
  WAITING_MATERIAL: 'waiting',
  WAITING_ACCESS: 'waiting',
  WAITING_COORDINATION: 'waiting',
  CLOSED: 'closed',
};

const statusIconMap: Record<TicketStatus, React.ReactNode> = {
  OPEN: <Clock className="w-3 h-3" />,
  ASSIGNED: <UserCheck className="w-3 h-3" />,
  ONPROGRESS: <Loader2 className="w-3 h-3 animate-spin" />,
  TEMPORARY: <Wrench className="w-3 h-3" />,
  WAITING_MATERIAL: <Package className="w-3 h-3" />,
  WAITING_ACCESS: <Lock className="w-3 h-3" />,
  WAITING_COORDINATION: <Users className="w-3 h-3" />,
  CLOSED: <CheckCircle2 className="w-3 h-3" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, size = 'default' }) => {
  return (
    <Badge 
      variant={statusVariantMap[status]} 
      className={`gap-1 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}
    >
      {showIcon && statusIconMap[status]}
      {getStatusLabel(status)}
    </Badge>
  );
};

interface ComplianceBadgeProps {
  compliance: TTRCompliance;
  size?: 'sm' | 'default';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ compliance, size = 'default' }) => {
  return (
    <Badge 
      variant={compliance === 'COMPLY' ? 'comply' : 'notcomply'}
      className={`gap-1 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}
    >
      {compliance === 'COMPLY' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {compliance}
    </Badge>
  );
};

interface TTRBadgeProps {
  hours: number;
  size?: 'sm' | 'default';
}

export const TTRBadge: React.FC<TTRBadgeProps> = ({ hours, size = 'default' }) => {
  let variant: 'success' | 'warning' | 'critical' = 'success';
  
  if (hours <= 0) {
    variant = 'critical';
  } else if (hours <= 2) {
    variant = 'warning';
  }

  const formatHours = (h: number) => {
    const absH = Math.abs(h);
    const hrs = Math.floor(absH);
    const mins = Math.round((absH - hrs) * 60);
    const sign = h < 0 ? '-' : '';
    return `${sign}${hrs}j ${mins}m`;
  };

  return (
    <Badge 
      variant={variant}
      className={`font-mono gap-1 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}
    >
      <Clock className="w-3 h-3" />
      {formatHours(hours)}
    </Badge>
  );
};
