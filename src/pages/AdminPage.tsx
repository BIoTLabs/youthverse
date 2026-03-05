import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TreePine, BookOpen, Briefcase, CheckCircle, XCircle, Award, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { simulateTransaction } from '@/lib/blockchain';

const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, trees: 0, skills: 0, gigs: 0, zltoIssued: 0 });
  const [pendingSkills, setPendingSkills] = useState<any[]>([]);
  const [pendingTrees, setPendingTrees] = useState<any[]>([]);
  const [pendingGigs, setPendingGigs] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [users, trees, skills, gigs, txs] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tree_submissions').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
      supabase.from('skill_completions').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('gig_applications').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
      supabase.from('zlto_transactions').select('amount'),
    ]);
    const totalZlto = (txs.data || []).reduce((sum: number, t: any) => sum + (t.amount > 0 ? t.amount : 0), 0);
    setStats({ users: users.count || 0, trees: trees.count || 0, skills: skills.count || 0, gigs: gigs.count || 0, zltoIssued: totalZlto });

    const [ps, pt, pg] = await Promise.all([
      supabase.from('skill_completions').select('*, profiles!skill_completions_user_id_fkey(full_name), courses(title, zlto_reward)').eq('verified', false),
      supabase.from('tree_submissions').select('*, profiles!tree_submissions_user_id_fkey(full_name), green_projects(title, zlto_per_tree)').eq('status', 'submitted'),
      supabase.from('gig_applications').select('*, profiles!gig_applications_user_id_fkey(full_name), gigs(title, zlto_reward, budget)').eq('status', 'completed'),
    ]);
    setPendingSkills(ps.data || []);
    setPendingTrees(pt.data || []);
    setPendingGigs(pg.data || []);
  };

  const verifySkill = async (completion: any, approve: boolean) => {
    setProcessing(completion.id);
    try {
      const zlto = approve ? (completion.courses?.zlto_reward || 50) : 0;
      if (approve) {
        const txHash = await simulateTransaction('skill_verify', { completionId: completion.id });
        await supabase.from('skill_completions').update({
          verified: true, verified_by: user?.id, zlto_awarded: zlto, verified_at: new Date().toISOString(),
        }).eq('id', completion.id);
        await supabase.from('zlto_transactions').insert({
          user_id: completion.user_id, amount: zlto, tx_type: 'skill_reward',
          reference_id: completion.id, tx_hash: txHash, description: `Skill: ${completion.courses?.title}`,
        });
        await supabase.from('profiles').update({
          zlto_balance: supabase.rpc ? zlto : zlto, // simplified
        }).eq('user_id', completion.user_id);
        // Update balance via raw increment
        const { data: prof } = await supabase.from('profiles').select('zlto_balance').eq('user_id', completion.user_id).single();
        await supabase.from('profiles').update({ zlto_balance: (prof?.zlto_balance || 0) + zlto }).eq('user_id', completion.user_id);
      }
      toast.success(approve ? `Verified! ${zlto} ZLTO issued.` : 'Rejected.');
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const verifyTree = async (tree: any, approve: boolean) => {
    setProcessing(tree.id);
    try {
      const zlto = approve ? (tree.green_projects?.zlto_per_tree || 10) : 0;
      const newStatus = approve ? 'verified' : 'rejected';
      if (approve) {
        const txHash = await simulateTransaction('tree_verify', { treeId: tree.id });
        await supabase.from('tree_submissions').update({
          status: newStatus, verified_by: user?.id, zlto_awarded: zlto, verified_at: new Date().toISOString(), tx_hash: txHash,
        }).eq('id', tree.id);
        await supabase.from('zlto_transactions').insert({
          user_id: tree.user_id, amount: zlto, tx_type: 'tree_reward',
          reference_id: tree.id, tx_hash: txHash, description: `Tree: ${tree.green_projects?.title}`,
        });
        const { data: prof } = await supabase.from('profiles').select('zlto_balance').eq('user_id', tree.user_id).single();
        await supabase.from('profiles').update({ zlto_balance: (prof?.zlto_balance || 0) + zlto }).eq('user_id', tree.user_id);
      } else {
        await supabase.from('tree_submissions').update({ status: newStatus, verified_by: user?.id }).eq('id', tree.id);
      }
      toast.success(approve ? `Tree verified! ${zlto} ZLTO issued.` : 'Tree rejected.');
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const verifyGig = async (app: any, approve: boolean) => {
    setProcessing(app.id);
    try {
      const zlto = approve ? (app.gigs?.zlto_reward || 100) : 0;
      if (approve) {
        const txHash = await simulateTransaction('gig_verify', { appId: app.id });
        await supabase.from('gig_applications').update({
          status: 'verified', verified_by: user?.id, zlto_awarded: zlto, tx_hash: txHash,
        }).eq('id', app.id);
        await supabase.from('zlto_transactions').insert({
          user_id: app.user_id, amount: zlto, tx_type: 'gig_reward',
          reference_id: app.id, tx_hash: txHash, description: `Gig: ${app.gigs?.title}`,
        });
        const { data: prof } = await supabase.from('profiles').select('zlto_balance').eq('user_id', app.user_id).single();
        await supabase.from('profiles').update({ zlto_balance: (prof?.zlto_balance || 0) + zlto }).eq('user_id', app.user_id);
      } else {
        await supabase.from('gig_applications').update({ status: 'disputed', verified_by: user?.id }).eq('id', app.id);
      }
      toast.success(approve ? `Gig verified! ${zlto} ZLTO issued.` : 'Gig disputed.');
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage verifications, view impact data, and issue Zlto rewards.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { icon: Users, label: 'Youth Enrolled', value: stats.users, color: 'bg-accent/10 text-accent' },
          { icon: BookOpen, label: 'Skills Verified', value: stats.skills, color: 'bg-primary/10 text-primary' },
          { icon: Briefcase, label: 'Gigs Verified', value: stats.gigs, color: 'bg-accent/10 text-accent' },
          { icon: TreePine, label: 'Trees Verified', value: stats.trees, color: 'bg-primary/10 text-primary' },
          { icon: Award, label: 'Zlto Issued', value: stats.zltoIssued, color: 'gradient-gold text-secondary-foreground' },
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-3 text-center">
              <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="font-display text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Tabs */}
      <Tabs defaultValue="skills">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills ({pendingSkills.length})</TabsTrigger>
          <TabsTrigger value="trees">Trees ({pendingTrees.length})</TabsTrigger>
          <TabsTrigger value="gigs">Gigs ({pendingGigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-2 mt-4">
          {pendingSkills.map(s => (
            <Card key={s.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.courses?.title} • Code: {s.completion_code}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={processing === s.id} onClick={() => verifySkill(s, true)}>
                    {processing === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={processing === s.id} onClick={() => verifySkill(s, false)}>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingSkills.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending skill verifications.</p>}
        </TabsContent>

        <TabsContent value="trees" className="space-y-2 mt-4">
          {pendingTrees.map(t => (
            <Card key={t.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                {t.photo_url && <img src={t.photo_url} alt="Tree" className="h-14 w-14 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{t.green_projects?.title} • {t.tree_species}</p>
                  <p className="text-xs text-muted-foreground">📍 {t.latitude?.toFixed(4)}, {t.longitude?.toFixed(4)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={processing === t.id} onClick={() => verifyTree(t, true)}>
                    {processing === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={processing === t.id} onClick={() => verifyTree(t, false)}>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingTrees.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending tree verifications.</p>}
        </TabsContent>

        <TabsContent value="gigs" className="space-y-2 mt-4">
          {pendingGigs.map(g => (
            <Card key={g.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{g.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{g.gigs?.title} • ₦{Number(g.gigs?.budget || 0).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={processing === g.id} onClick={() => verifyGig(g, true)}>
                    {processing === g.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={processing === g.id} onClick={() => verifyGig(g, false)}>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingGigs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending gig verifications.</p>}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminPage;
