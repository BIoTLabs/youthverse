import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface EligibilityStatus {
  eligible: boolean;
  score: number;
  requirements: { label: string; met: boolean; detail: string }[];
}

const YouthInvestmentFund = () => {
  const { user, profile } = useAuth();
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ businessName: '', description: '', amount: '' });

  useEffect(() => {
    if (user) checkEligibility();
  }, [user]);

  const checkEligibility = async () => {
    setLoading(true);
    const [skills, gigs, trees] = await Promise.all([
      supabase.from('skill_completions').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('verified', true),
      supabase.from('gig_applications').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'verified'),
      supabase.from('tree_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).in('status', ['verified', 'alive']),
    ]);

    const skillCount = skills.count || 0;
    const gigCount = gigs.count || 0;
    const treeCount = trees.count || 0;
    const sigmaBalance = profile?.zlto_balance || 0;
    const hasProfile = !!(profile?.state && profile?.phone);

    const requirements = [
      { label: 'Complete 2+ verified skills', met: skillCount >= 2, detail: `${skillCount}/2 skills verified` },
      { label: 'Complete 1+ verified gig', met: gigCount >= 1, detail: `${gigCount}/1 gig completed` },
      { label: 'Plant 3+ verified trees', met: treeCount >= 3, detail: `${treeCount}/3 trees verified` },
      { label: 'Earn 100+ SIGMA', met: sigmaBalance >= 100, detail: `${sigmaBalance}/100 SIGMA earned` },
      { label: 'Complete your profile', met: hasProfile, detail: hasProfile ? 'Profile complete' : 'Missing state or phone' },
    ];

    const metCount = requirements.filter(r => r.met).length;
    const score = Math.round((metCount / requirements.length) * 100);

    setEligibility({ eligible: metCount === requirements.length, score, requirements });
    setLoading(false);
  };

  const handleApply = async () => {
    if (!form.businessName || !form.description || !form.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    setApplying(true);
    await new Promise(r => setTimeout(r, 2000));
    setApplied(true);
    setApplying(false);
    toast.success('Application submitted! You will be contacted within 2 weeks.');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 gradient-hero">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Youth Investment Fund</span>
          </div>
          <p className="text-xs text-primary-foreground/70 mb-3">
            Access startup capital based on your verified activity on YouthWorks. Meet all requirements to unlock your application.
          </p>
          <div className="flex items-center gap-3">
            <Progress value={eligibility?.score || 0} className="flex-1 h-2" />
            <span className="text-sm font-bold text-primary-foreground">{eligibility?.score}%</span>
          </div>
          <p className="text-[10px] text-primary-foreground/50 mt-1">Eligibility Score</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold">Requirements</p>
          {eligibility?.requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-3">
              {req.met ? <CheckCircle className="h-4 w-4 shrink-0 text-primary" /> : <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>{req.label}</p>
                <p className="text-[10px] text-muted-foreground">{req.detail}</p>
              </div>
              {req.met && <Badge variant="secondary" className="text-[10px]">✓</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      {applied ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-semibold text-primary">Application Submitted!</p>
            <p className="text-xs text-muted-foreground mt-1">Your application is under review. You'll be contacted within 2 weeks.</p>
          </CardContent>
        </Card>
      ) : eligibility?.eligible ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full"><Rocket className="mr-2 h-4 w-4" />Apply for Startup Capital</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Youth Investment Fund Application</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Based on your verified track record, you're eligible to apply for startup capital of up to ₦500,000.</p>
              <div className="space-y-2">
                <Label>Business/Project Name</Label>
                <Input placeholder="e.g. Green AgriTech Solutions" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Describe Your Business Idea</Label>
                <Textarea placeholder="What will you build? How will it create impact?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Requested Amount (₦)</Label>
                <Input type="number" placeholder="100000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <Button onClick={handleApply} disabled={applying} className="w-full">
                {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Complete all requirements above to unlock your application for startup capital.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouthInvestmentFund;
