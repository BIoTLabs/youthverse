import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight, ArrowDownLeft, Award, ShoppingBag, Copy, ExternalLink, Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { shortenAddress, shortenTxHash, CHAIN_CONFIG } from '@/lib/blockchain';
import YouthInvestmentFund from '@/components/wallet/YouthInvestmentFund';

const WalletPage = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [tab, setTab] = useState<'history' | 'redeem' | 'fund'>('history');

  const walletAddress = profile?.wallet_address || '';

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [tx, mp] = await Promise.all([
        supabase.from('zlto_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('marketplace_items').select('*').eq('available', true),
      ]);
      setTransactions(tx.data || []);
      setMarketplace(mp.data || []);
    };
    fetch();
  }, [user]);

  const handleRedeem = async (item: any) => {
    if (!user || !profile) return;
    if ((profile.zlto_balance || 0) < item.zlto_cost) {
      toast.error('Insufficient Sigma balance');
      return;
    }
    setRedeeming(item.id);
    try {
      const voucherCode = `YW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const { error } = await supabase.from('redemptions').insert({
        user_id: user.id, item_id: item.id, zlto_spent: item.zlto_cost, voucher_code: voucherCode,
      });
      if (error) throw error;
      await supabase.from('zlto_transactions').insert({
        user_id: user.id, amount: -item.zlto_cost, tx_type: 'redemption', description: `Redeemed: ${item.title}`,
      });
      await supabase.from('profiles').update({
        zlto_balance: (profile.zlto_balance || 0) - item.zlto_cost,
      }).eq('user_id', user.id);
      toast.success(`Redeemed! Your voucher: ${voucherCode}`);
      const { data } = await supabase.from('zlto_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTransactions(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRedeeming(null);
    }
  };

  const txIcon = (type: string) => {
    if (type === 'redemption') return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    return <ArrowDownLeft className="h-4 w-4 text-primary" />;
  };

  const txLabel = (type: string) => {
    const map: Record<string, string> = {
      skill_reward: 'Skill Reward', gig_reward: 'Gig Reward', tree_reward: 'Tree Reward',
      tree_survival_bonus: 'Survival Bonus', redemption: 'Redemption',
      carbon_credit_distribution: 'Carbon Credit', escrow_deposit: 'Escrow', escrow_release: 'Escrow Release',
    };
    return map[type] || type;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Wallet Card */}
      <Card className="overflow-hidden border-0 gradient-navy">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-secondary" />
            <span className="text-sm text-sidebar-foreground/80">Sigma Wallet</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display text-4xl font-bold text-sidebar-foreground">
              {profile?.zlto_balance || 0}
            </span>
            <span className="text-sm text-sidebar-foreground/60">SIGMA</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-sidebar-foreground/20 text-sidebar-foreground/70 text-[10px] font-mono">
              {shortenAddress(walletAddress)}
            </Badge>
            {walletAddress && (
              <>
                <button onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Copied!'); }}>
                  <Copy className="h-3 w-3 text-sidebar-foreground/50" />
                </button>
                <a href={`${CHAIN_CONFIG.blockExplorer}/address/${walletAddress}`} target="_blank" rel="noopener" className="ml-auto">
                  <ExternalLink className="h-3 w-3 text-sidebar-foreground/50" />
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button variant={tab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setTab('history')}>History</Button>
        <Button variant={tab === 'redeem' ? 'default' : 'outline'} size="sm" onClick={() => setTab('redeem')}>
          <ShoppingBag className="mr-1 h-3.5 w-3.5" />Marketplace
        </Button>
        <Button variant={tab === 'fund' ? 'default' : 'outline'} size="sm" onClick={() => setTab('fund')}>
          <Rocket className="mr-1 h-3.5 w-3.5" />Investment Fund
        </Button>
      </div>

      {tab === 'fund' && <YouthInvestmentFund />}

      {tab === 'history' && (
        <div className="space-y-2">
          {transactions.map(tx => (
            <Card key={tx.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {txIcon(tx.tx_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{txLabel(tx.tx_type)}</p>
                  <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  {tx.tx_hash && (
                    <a href={`${CHAIN_CONFIG.blockExplorer}/tx/${tx.tx_hash}`} target="_blank" rel="noopener" className="text-[10px] text-muted-foreground font-mono hover:underline">
                      {shortenTxHash(tx.tx_hash)}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
            <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">No transactions yet. Start earning Sigma!</CardContent></Card>
          )}
        </div>
      )}

      {tab === 'redeem' && (
        <div className="space-y-3">
          {marketplace.map(item => (
            <Card key={item.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-gold">
                    <ShoppingBag className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.partner}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-sigma">{item.zlto_cost}</p>
                    <p className="text-[10px] text-muted-foreground">SIGMA</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  disabled={redeeming === item.id || (profile?.zlto_balance || 0) < item.zlto_cost}
                  onClick={() => handleRedeem(item)}
                >
                  {redeeming === item.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {(profile?.zlto_balance || 0) < item.zlto_cost ? 'Insufficient Sigma' : 'Redeem'}
                </Button>
              </CardContent>
            </Card>
          ))}
          {marketplace.length === 0 && (
            <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">Marketplace items coming soon!</CardContent></Card>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WalletPage;
