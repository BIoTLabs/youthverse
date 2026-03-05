import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Briefcase, TreePine, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateWalletFromUserId, shortenAddress } from '@/lib/blockchain';

const StatCard = ({ icon: Icon, label, value, color, to }: any) => (
  <Link to={to}>
    <Card className="group cursor-pointer border-border transition-all hover:shadow-card hover:-translate-y-0.5">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-display">{value}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </CardContent>
    </Card>
  </Link>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ skills: 0, gigs: 0, trees: 0 });
  const walletAddress = user ? generateWalletFromUserId(user.id).address : '';

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [skills, gigs, trees] = await Promise.all([
        supabase.from('skill_completions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('verified', true),
        supabase.from('gig_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tree_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'verified'),
      ]);
      setStats({
        skills: skills.count || 0,
        gigs: gigs.count || 0,
        trees: trees.count || 0,
      });
    };
    fetchStats();
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome hero */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 gradient-hero">
          <CardContent className="p-6">
            <p className="text-sm text-primary-foreground/80">Welcome back,</p>
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              {profile?.full_name || 'Youth Champion'} 👋
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 backdrop-blur-sm">
                <Wallet className="h-4 w-4 text-secondary" />
                <span className="font-display text-lg font-bold text-primary-foreground">
                  {profile?.zlto_balance || 0}
                </span>
                <span className="text-xs text-primary-foreground/80">ZLTO</span>
              </div>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 text-[10px]">
                {shortenAddress(walletAddress)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <StatCard
          icon={BookOpen}
          label="Verified Skills"
          value={stats.skills}
          color="bg-primary/10 text-primary"
          to="/skills"
        />
        <StatCard
          icon={Briefcase}
          label="Gig Applications"
          value={stats.gigs}
          color="bg-accent/10 text-accent"
          to="/work"
        />
        <StatCard
          icon={TreePine}
          label="Trees Verified"
          value={stats.trees}
          color="bg-primary/10 text-primary"
          to="/green"
        />
        <StatCard
          icon={TrendingUp}
          label="Zlto Earned"
          value={profile?.zlto_balance || 0}
          color="gradient-gold text-secondary-foreground"
          to="/wallet"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <h2 className="mb-3 font-display text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/skills" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Submit Skill</span>
          </Link>
          <Link to="/work" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted">
            <Briefcase className="h-6 w-6 text-accent" />
            <span className="text-xs font-medium">Find Gigs</span>
          </Link>
          <Link to="/green" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted">
            <TreePine className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Plant Tree</span>
          </Link>
        </div>
      </motion.div>

      {/* Reputation */}
      <motion.div variants={item}>
        <h2 className="mb-3 font-display text-lg font-semibold">On-Chain Reputation</h2>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full gradient-hero transition-all"
                  style={{ width: `${Math.min(((stats.skills * 30 + stats.gigs * 40 + stats.trees * 10) / 300) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {stats.skills * 30 + stats.gigs * 40 + stats.trees * 10} / 300 pts
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Complete skills, gigs, and plant trees to build your verified blockchain reputation.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
