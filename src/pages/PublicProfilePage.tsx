import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';
import { BookOpen, Briefcase, TreePine, Award, CheckCircle, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateWalletFromUserId, shortenAddress, CHAIN_CONFIG } from '@/lib/blockchain';

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ skills: 0, gigs: 0, trees: 0, zlto: 0 });
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    // Use security definer function to get public profile data (no PII)
    const { data: profData } = await supabase.rpc('get_public_profile', { _user_id: userId! });
    
    if (profData) {
      setProfile(profData);
      // Stats come from the public profile function
      setStats({
        skills: 0,
        gigs: 0,
        trees: 0,
        zlto: (profData as any)?.zlto_balance || 0,
      });
    }
    
    // Fetch verified credentials (these are the user's own public achievements)
    // Only authenticated users can view these via RLS
    const [skills, gigs, trees] = await Promise.all([
      supabase.from('skill_completions').select('*, courses(title, category)').eq('user_id', userId!).eq('verified', true),
      supabase.from('gig_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId!).eq('status', 'verified'),
      supabase.from('tree_submissions').select('id', { count: 'exact', head: true }).eq('user_id', userId!).in('status', ['verified', 'alive']),
    ]);

    setCredentials(skills.data || []);
    setStats(prev => ({
      ...prev,
      skills: skills.data?.length || 0,
      gigs: gigs.count || 0,
      trees: trees.count || 0,
    }));
    setLoading(false);
  };

  const walletAddress = userId ? generateWalletFromUserId(userId).address : '';
  const reputationScore = stats.skills * 30 + stats.gigs * 40 + stats.trees * 10;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <YouthWorksLogo size="md" className="mb-6" />
        <h1 className="font-display text-2xl font-bold">Profile Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">This profile doesn't exist or is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <YouthWorksLogo size="sm" />
          <Badge variant="outline" className="text-[10px]">Public Profile</Badge>
        </div>
      </header>

      <div className="container max-w-2xl py-6 space-y-6">
        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-0 gradient-hero">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
                <span className="font-display text-3xl font-bold text-primary-foreground">
                  {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-primary-foreground">{profile.full_name}</h1>
              {profile.state && (
                <p className="text-sm text-primary-foreground/70 mt-1">📍 {profile.lga ? `${profile.lga}, ` : ''}{profile.state}</p>
              )}
              {profile.bio && (
                <p className="text-xs text-primary-foreground/60 mt-2 max-w-md mx-auto">{profile.bio}</p>
              )}
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70 text-[10px] font-mono">
                  {shortenAddress(walletAddress)}
                </Badge>
                <a href={`${CHAIN_CONFIG.blockExplorer}/address/${walletAddress}`} target="_blank" rel="noopener">
                  <ExternalLink className="h-3 w-3 text-primary-foreground/50" />
                </a>
              </div>
              {/* Affiliations */}
              {profile.affiliations && profile.affiliations.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {profile.affiliations.map((a: string) => (
                    <Badge key={a} variant="secondary" className="text-[10px] bg-primary-foreground/10 text-primary-foreground/80 border-0">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: BookOpen, label: 'Skills', value: stats.skills, color: 'bg-primary/10 text-primary' },
              { icon: Briefcase, label: 'Gigs', value: stats.gigs, color: 'bg-accent/10 text-accent' },
              { icon: TreePine, label: 'Trees', value: stats.trees, color: 'bg-primary/10 text-primary' },
              { icon: Award, label: 'ZLTO', value: stats.zlto, color: 'gradient-gold text-secondary-foreground' },
            ].map(s => (
              <Card key={s.label} className="border-border">
                <CardContent className="p-3 text-center">
                  <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Reputation Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">On-Chain Reputation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-hero transition-all"
                    style={{ width: `${Math.min((reputationScore / 300) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{reputationScore} / 300 pts</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verified Credentials */}
        {credentials.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display text-lg font-semibold mb-3">Verified Credentials</h2>
            <div className="space-y-2">
              {credentials.map(c => (
                <Card key={c.id} className="border-border">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{c.courses?.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{c.courses?.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Verified {c.verified_at ? new Date(c.verified_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-zlto">+{c.zlto_awarded} ZLTO</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Verified on YouthWorks • Base Sepolia Testnet
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
