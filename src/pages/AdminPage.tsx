import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Rocket, Loader2 } from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import VerificationQueue from '@/components/admin/VerificationQueue';
import CarbonCreditsTab from '@/components/admin/CarbonCreditsTab';
import SurvivalChecksTab from '@/components/admin/SurvivalChecksTab';
import NationalDashboard from '@/components/admin/NationalDashboard';
import ImpactReportsTab from '@/components/admin/ImpactReportsTab';
import UserManagementTab from '@/components/admin/UserManagementTab';
import CourseManagementTab from '@/components/admin/CourseManagementTab';
import GreenProjectsTab from '@/components/admin/GreenProjectsTab';
import MarketplaceTab from '@/components/admin/MarketplaceTab';
import GigManagementTab from '@/components/admin/GigManagementTab';

const AdminPage = () => {
  const { user, roles } = useAuth();
  const [stats, setStats] = useState({ users: 0, trees: 0, skills: 0, gigs: 0, zltoIssued: 0 });
  const [pendingSkills, setPendingSkills] = useState<any[]>([]);
  const [pendingTrees, setPendingTrees] = useState<any[]>([]);
  const [pendingGigs, setPendingGigs] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const isNationalAdmin = roles.includes('national_admin');

  useEffect(() => { fetchAll(); fetchContract(); }, []);

  const fetchContract = async () => {
    const { data } = await supabase.from('platform_config').select('value').eq('key', 'sigma_contract_address').single();
    if (data) setContractAddress(data.value);
  };

  const deployContract = async () => {
    setDeploying(true);
    try {
      const { data, error } = await supabase.functions.invoke('deploy-sigma-token');
      if (error) throw new Error(error.message);
      setContractAddress(data?.contractAddress || null);
      toast.success('Sigma token contract deployed!');
    } catch (err: any) { toast.error(err.message); }
    finally { setDeploying(false); }
  };

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
      supabase.from('skill_completions').select('*, profiles!skill_completions_user_id_fkey(full_name), courses(title, zlto_reward)').eq('verified', false).neq('status', 'rejected' as any),
      supabase.from('tree_submissions').select('*, profiles!tree_submissions_user_id_fkey(full_name), green_projects(title, zlto_per_tree)').eq('status', 'submitted'),
      supabase.from('gig_applications').select('*, profiles!gig_applications_user_id_fkey(full_name), gigs(title, zlto_reward, budget)').eq('status', 'completed'),
    ]);
    setPendingSkills(ps.data || []);
    setPendingTrees(pt.data || []);
    setPendingGigs(pg.data || []);
  };

  const mintSigma = async (userId: string, amount: number, referenceId: string, txType: string) => {
    const { data, error } = await supabase.functions.invoke('sigma-mint', {
      body: { userId, amount, referenceId, txType },
    });
    if (error) throw new Error(error.message || 'Minting failed');
    return data?.txHash || null;
  };

  const verifySkill = async (completion: any, approve: boolean) => {
    setProcessing(completion.id);
    try {
      const zlto = approve ? (completion.courses?.zlto_reward || 50) : 0;
      if (approve) {
        const txHash = await mintSigma(completion.user_id, zlto, completion.id, 'skill_reward');
        await supabase.from('skill_completions').update({
          verified: true, verified_by: user?.id, zlto_awarded: zlto, verified_at: new Date().toISOString(), tx_hash: txHash, status: 'verified',
        } as any).eq('id', completion.id);
        await supabase.from('zlto_transactions').insert({
          user_id: completion.user_id, amount: zlto, tx_type: 'skill_reward',
          reference_id: completion.id, tx_hash: txHash, description: `Skill: ${completion.courses?.title}`,
        });
        const { data: prof } = await supabase.from('profiles').select('zlto_balance').eq('user_id', completion.user_id).single();
        await supabase.from('profiles').update({ zlto_balance: (prof?.zlto_balance || 0) + zlto }).eq('user_id', completion.user_id);
      } else {
        await supabase.from('skill_completions').update({ status: 'rejected', verified_by: user?.id } as any).eq('id', completion.id);
      }
      toast.success(approve ? `Verified! ${zlto} SIGMA minted on-chain.` : 'Rejected.');
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setProcessing(null); }
  };

  const verifyTree = async (tree: any, approve: boolean) => {
    setProcessing(tree.id);
    try {
      const zlto = approve ? (tree.green_projects?.zlto_per_tree || 10) : 0;
      const newStatus = approve ? 'verified' : 'rejected';
      if (approve) {
        const txHash = await mintSigma(tree.user_id, zlto, tree.id, 'tree_reward');
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
      toast.success(approve ? `Tree verified! ${zlto} SIGMA minted on-chain.` : 'Tree rejected.');
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setProcessing(null); }
  };

  const verifyGig = async (app: any, approve: boolean) => {
    setProcessing(app.id);
    try {
      const zlto = approve ? (app.gigs?.zlto_reward || 100) : 0;
      if (approve) {
        const txHash = await mintSigma(app.user_id, zlto, app.id, 'gig_reward');
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
      toast.success(approve ? `Gig verified! ${zlto} SIGMA minted on-chain.` : 'Gig disputed.');
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setProcessing(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {isNationalAdmin ? 'National Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNationalAdmin
              ? 'National overview with charts, verifications, carbon credits, and impact data.'
              : 'Manage verifications, carbon credits, and issue Sigma rewards.'}
          </p>
        </div>
        {isNationalAdmin && (
          <div className="text-right">
            {contractAddress ? (
              <p className="text-xs text-muted-foreground">Contract: <span className="font-mono text-[10px]">{contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span></p>
            ) : (
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={deployContract} disabled={deploying}>
                {deploying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
                Deploy Sigma Contract
              </Button>
            )}
          </div>
        )}
      </div>

      <AdminStats stats={stats} />

      <Tabs defaultValue={isNationalAdmin ? 'national' : 'skills'}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full">
            {isNationalAdmin && <TabsTrigger value="national">National</TabsTrigger>}
            <TabsTrigger value="skills">Skills ({pendingSkills.length})</TabsTrigger>
            <TabsTrigger value="trees">Trees ({pendingTrees.length})</TabsTrigger>
            <TabsTrigger value="gigs">Gigs ({pendingGigs.length})</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="manage-gigs">Manage Gigs</TabsTrigger>
            <TabsTrigger value="survival">Survival</TabsTrigger>
            <TabsTrigger value="carbon">Carbon</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>

        {isNationalAdmin && (
          <TabsContent value="national">
            <NationalDashboard />
          </TabsContent>
        )}
        <TabsContent value="skills">
          <VerificationQueue type="skills" items={pendingSkills} processing={processing} onVerify={verifySkill} />
        </TabsContent>
        <TabsContent value="trees">
          <VerificationQueue type="trees" items={pendingTrees} processing={processing} onVerify={verifyTree} />
        </TabsContent>
        <TabsContent value="gigs">
          <VerificationQueue type="gigs" items={pendingGigs} processing={processing} onVerify={verifyGig} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        <TabsContent value="courses">
          <CourseManagementTab />
        </TabsContent>
        <TabsContent value="projects">
          <GreenProjectsTab />
        </TabsContent>
        <TabsContent value="marketplace">
          <MarketplaceTab />
        </TabsContent>
        <TabsContent value="manage-gigs">
          <GigManagementTab />
        </TabsContent>
        <TabsContent value="survival">
          <SurvivalChecksTab />
        </TabsContent>
        <TabsContent value="carbon">
          <CarbonCreditsTab />
        </TabsContent>
        <TabsContent value="reports">
          <ImpactReportsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminPage;
