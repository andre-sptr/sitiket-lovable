import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    bg: 'bg-muted/50',
    icon: 'text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    value: 'text-primary',
  },
  success: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-600',
    value: 'text-emerald-600',
  },
  warning: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-600',
    value: 'text-amber-600',
  },
  danger: {
    bg: 'bg-destructive/10',
    icon: 'text-destructive',
    value: 'text-destructive',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {title}
            </p>
            <p className={`text-2xl md:text-3xl font-bold ${styles.value}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${styles.bg}`}>
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
