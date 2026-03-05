import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EmployerGigManager = () => {
  const { user } = useAuth();
  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [applications, setApplications] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedGig, setExpandedGig] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchMyGigs();
  }, [user]);

  const fetchMyGigs = async () => {
    setLoading(true);
    const { data: gigs } = await supabase.from('gigs').select('*').eq('employer_id', user!.id).order('created_at', { ascending: false });
    setMyGigs(gigs || []);

    // Fetch applications for all gigs
    if (gigs && gigs.length > 0) {
      const gigIds = gigs.map(g => g.id);
      const { data: apps } = await supabase
        .from('gig_applications')
        .select('*, profiles!gig_applications_user_id_fkey(full_name)')
        .in('gig_id', gigIds);

      const appMap: Record<string, any[]> = {};
      (apps || []).forEach(a => {
        if (!appMap[a.gig_id]) appMap[a.gig_id] = [];
        appMap[a.gig_id].push(a);
      });
      setApplications(appMap);
    }
    setLoading(false);
  };

  const updateAppStatus = async (appId: string, gigId: string, newStatus: string) => {
    setProcessing(appId);
    try {
      const { error } = await supabase.from('gig_applications').update({ status: newStatus }).eq('id', appId);
      if (error) throw error;
      toast.success(`Application marked as ${newStatus}`);
      fetchMyGigs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      open: 'bg-primary/10 text-primary', applied: 'bg-accent/10 text-accent',
      in_progress: 'bg-secondary/20 text-secondary-foreground', completed: 'bg-primary/10 text-primary',
      verified: 'bg-primary text-primary-foreground', disputed: 'bg-destructive/10 text-destructive',
    };
    return map[s] || '';
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (myGigs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          <Briefcase className="mx-auto mb-2 h-8 w-8" />
          You haven't posted any gigs yet. Click "Post a Gig" above to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {myGigs.map(gig => {
        const apps = applications[gig.id] || [];
        const isExpanded = expandedGig === gig.id;
        return (
          <Card key={gig.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{gig.title}</h3>
                    <Badge className={`text-[10px] ${statusColor(gig.status)}`}>{gig.status}</Badge>
                    {gig.is_escrow && <Badge variant="outline" className="text-[10px] border-secondary text-secondary">Escrow</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{gig.location} • ₦{Number(gig.budget || 0).toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedGig(isExpanded ? null : gig.id)}
                >
                  <Users className="mr-1 h-3.5 w-3.5" />
                  {apps.length} applicant{apps.length !== 1 ? 's' : ''}
                </Button>
              </div>

              {/* Escrow milestones */}
              {gig.is_escrow && gig.escrow_milestones && Array.isArray(gig.escrow_milestones) && gig.escrow_milestones.length > 0 && (
                <div className="mt-3 rounded-lg border border-border p-2 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Escrow Milestones</p>
                  {(gig.escrow_milestones as any[]).map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        {m.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-primary" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                        {m.title}
                      </span>
                      <span className="font-medium">₦{Number(m.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Applications */}
              {isExpanded && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {apps.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No applications yet.</p>
                  ) : (
                    apps.map(app => (
                      <div key={app.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <div>
                          <p className="text-sm font-medium">{app.profiles?.full_name}</p>
                          <Badge className={`text-[10px] ${statusColor(app.status)}`}>{app.status}</Badge>
                        </div>
                        <div className="flex gap-1">
                          {app.status === 'applied' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processing === app.id}
                              onClick={() => updateAppStatus(app.id, gig.id, 'in_progress')}
                            >
                              {processing === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Accept'}
                            </Button>
                          )}
                          {app.status === 'in_progress' && (
                            <Button
                              size="sm"
                              disabled={processing === app.id}
                              onClick={() => updateAppStatus(app.id, gig.id, 'completed')}
                            >
                              {processing === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Mark Complete'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmployerGigManager;
