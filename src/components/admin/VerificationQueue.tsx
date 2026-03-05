import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VerificationQueueProps {
  type: 'skills' | 'trees' | 'gigs';
  items: any[];
  processing: string | null;
  onVerify: (item: any, approve: boolean) => void;
}

const VerificationQueue = ({ type, items, processing, onVerify }: VerificationQueueProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No pending {type} verifications.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <Card key={item.id} className="border-border">
          <CardContent className="flex items-center gap-3 p-3">
            {type === 'trees' && item.photo_url && (
              <img src={item.photo_url} alt="Tree" className="h-14 w-14 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.profiles?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {type === 'skills' && `${item.courses?.title} • Code: ${item.completion_code}`}
                {type === 'trees' && `${item.green_projects?.title} • ${item.tree_species}`}
                {type === 'gigs' && `${item.gigs?.title} • ₦${Number(item.gigs?.budget || 0).toLocaleString()}`}
              </p>
              {type === 'trees' && item.latitude && (
                <p className="text-xs text-muted-foreground">📍 {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={processing === item.id} onClick={() => onVerify(item, true)}>
                {processing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
              </Button>
              <Button size="sm" variant="ghost" disabled={processing === item.id} onClick={() => onVerify(item, false)}>
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VerificationQueue;
