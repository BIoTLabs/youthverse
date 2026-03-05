import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Clock, Award, Loader2, DollarSign, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { simulateTransaction } from '@/lib/blockchain';
import EmployerGigForm from '@/components/employer/EmployerGigForm';
import EmployerGigManager from '@/components/employer/EmployerGigManager';

const WorkPage = () => {
  const { user, roles } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'browse' | 'my' | 'employer'>('browse');
  const isEmployer = roles.includes('employer') || roles.includes('admin') || roles.includes('national_admin');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [g, a] = await Promise.all([
      supabase.from('gigs').select('*').order('created_at', { ascending: false }),
      user ? supabase.from('gig_applications').select('*, gigs(title, budget, zlto_reward)').eq('user_id', user.id) : { data: [] },
    ]);
    setGigs(g.data || []);
    setMyApps(a.data || []);
  };

  const handleApply = async () => {
    if (!user || !selectedGig) return;
    setSubmitting(true);
    try {
      if (selectedGig.is_escrow) {
        await simulateTransaction('escrow_deposit', { gigId: selectedGig.id, amount: selectedGig.budget });
      }
      const { error } = await supabase.from('gig_applications').insert({
        gig_id: selectedGig.id,
        user_id: user.id,
        cover_letter: coverLetter,
      });
      if (error) throw error;
      toast.success('Application submitted!');
      setCoverLetter('');
      setSelectedGig(null);
      const { data } = await supabase.from('gig_applications').select('*, gigs(title, budget, zlto_reward)').eq('user_id', user.id);
      setMyApps(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Work Pillar</h1>
          <p className="text-sm text-muted-foreground">Find gigs, complete work, earn Zlto and build your on-chain work history.</p>
        </div>
        {isEmployer && tab === 'employer' && <EmployerGigForm onCreated={fetchData} />}
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'browse' ? 'default' : 'outline'} size="sm" onClick={() => setTab('browse')}>Browse Gigs</Button>
        <Button variant={tab === 'my' ? 'default' : 'outline'} size="sm" onClick={() => setTab('my')}>
          My Applications ({myApps.length})
        </Button>
        {isEmployer && (
          <Button variant={tab === 'employer' ? 'default' : 'outline'} size="sm" onClick={() => setTab('employer')}>
            My Posted Gigs
          </Button>
        )}
      </div>

      {tab === 'employer' && isEmployer && <EmployerGigManager />}

      {tab === 'my' && (
        <div className="space-y-3">
          {myApps.map(app => (
            <Card key={app.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{app.gigs?.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={`text-[10px] ${statusColor(app.status)}`}>{app.status}</Badge>
                      {app.zlto_awarded > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zlto">
                          <Award className="h-3 w-3" />+{app.zlto_awarded} ZLTO
                        </span>
                      )}
                    </div>
                  </div>
                  {app.gigs?.budget && (
                    <span className="text-sm font-bold">₦{Number(app.gigs.budget).toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {myApps.length === 0 && (
            <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">No applications yet.</CardContent></Card>
          )}
        </div>
      )}

      {tab === 'browse' && (
        <div className="space-y-3">
          {gigs.map(gig => {
            const applied = myApps.some(a => a.gig_id === gig.id);
            return (
              <Card key={gig.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{gig.title}</h3>
                        {gig.is_escrow && <Badge variant="outline" className="text-[10px] border-secondary text-secondary">Escrow</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{gig.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {gig.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />{gig.location}
                          </span>
                        )}
                        {gig.budget && (
                          <span className="flex items-center gap-1 text-xs font-medium">
                            <DollarSign className="h-3 w-3" />₦{Number(gig.budget).toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-zlto">
                          <Award className="h-3 w-3" />{gig.zlto_reward} ZLTO
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{gig.category}</Badge>
                      </div>

                      {/* Escrow Milestones Preview */}
                      {gig.is_escrow && gig.escrow_milestones && Array.isArray(gig.escrow_milestones) && gig.escrow_milestones.length > 0 && (
                        <div className="mt-2 rounded-lg border border-border/50 p-2 space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground">Escrow Milestones:</p>
                          {(gig.escrow_milestones as any[]).map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="flex items-center gap-1">
                                {m.status === 'completed' ? (
                                  <CheckCircle className="h-2.5 w-2.5 text-primary" />
                                ) : (
                                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                )}
                                {m.title}
                              </span>
                              <span className="font-medium">₦{Number(m.amount || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!applied ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="mt-3 w-full" onClick={() => setSelectedGig(gig)}>Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Apply for: {gig.title}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{gig.description}</p>
                          <div className="space-y-2">
                            <Label>Cover Letter</Label>
                            <Textarea
                              placeholder="Tell the employer why you're a great fit..."
                              value={coverLetter}
                              onChange={e => setCoverLetter(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button onClick={handleApply} disabled={submitting} className="w-full">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitting ? (gig.is_escrow ? 'Creating escrow contract...' : 'Submitting...') : 'Submit Application'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="mt-3 rounded-lg bg-accent/5 px-3 py-2 text-center text-xs font-medium text-accent">
                      ✓ Already Applied
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {gigs.length === 0 && (
            <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No gigs available yet.</p>
            </CardContent></Card>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WorkPage;
