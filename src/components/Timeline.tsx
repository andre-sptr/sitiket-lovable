import { ProgressUpdate } from '@/types/ticket';
import { formatDateShort, formatTimeOnly } from '@/lib/formatters';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Bot, Settings, Image as ImageIcon } from 'lucide-react';

interface TimelineProps {
  updates: ProgressUpdate[];
}

export const Timeline: React.FC<TimelineProps> = ({ updates }) => {
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getSourceIcon = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return <Bot className="w-4 h-4" />;
      case 'SYSTEM':
        return <Settings className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return 'bg-purple-500';
      case 'SYSTEM':
        return 'bg-gray-400';
    }
  };

  const getSourceLabel = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return 'Admin';
      case 'SYSTEM':
        return 'Sistem';
    }
  };

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada update</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedUpdates.map((update, index) => (
        <div 
          key={update.id} 
          className="relative pl-8 pb-4 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Timeline line */}
          {index < sortedUpdates.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
          )}
          
          {/* Timeline dot */}
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${getSourceColor(update.source)} flex items-center justify-center text-white shadow-md`}>
            {getSourceIcon(update.source)}
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {getSourceLabel(update.source)}
                </span>
                {update.statusAfterUpdate && (
                  <StatusBadge status={update.statusAfterUpdate} size="sm" showIcon={false} />
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {formatDateShort(new Date(update.timestamp))}
              </span>
            </div>
            
            <p className="text-sm whitespace-pre-wrap">{update.message}</p>

            {update.attachments && update.attachments.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="w-3 h-3" />
                <span>{update.attachments.length} lampiran</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
