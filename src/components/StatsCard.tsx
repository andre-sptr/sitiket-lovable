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
    bg: 'bg-muted/60',
    icon: 'text-muted-foreground',
    value: 'text-foreground',
    ring: '',
  },
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    value: 'text-primary',
    ring: 'ring-1 ring-primary/10',
  },
  success: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-1 ring-emerald-500/10',
  },
  warning: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-1 ring-amber-500/10',
  },
  danger: {
    bg: 'bg-destructive/10',
    icon: 'text-destructive',
    value: 'text-destructive',
    ring: 'ring-1 ring-destructive/10',
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
    <Card className={`overflow-hidden border-0 shadow-sm ${styles.ring} hover:shadow-md transition-shadow duration-300`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className={`text-2xl md:text-3xl font-bold ${styles.value} tracking-tight`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${styles.bg}`}>
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
