import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, TreePine, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SurvivalChecksTab = () => {
  const { user } = useAuth();
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tree_submissions')
      .select('*, profiles!tree_submissions_user_id_fkey(full_name), green_projects!tree_submissions_project_id_fkey(title, survival_bonus_zlto)')
      .eq('status', 'verified')
      .order('verified_at', { ascending: true });

    setTrees(data || []);
    setLoading(false);
  };

  const handleSurvivalCheck = async (tree: any, alive: boolean) => {
    setProcessing(tree.id);
    try {
      const checks = Array.isArray(tree.survival_checks) ? tree.survival_checks : [];
      const newCheck = {
        date: new Date().toISOString(),
        alive,
        checked_by: user?.id,
      };

      const newStatus = alive ? 'alive' : 'dead';
      const bonus = alive ? (tree.green_projects?.survival_bonus_zlto || 5) : 0;

      await supabase.from('tree_submissions').update({
        status: newStatus,
        survival_checks: [...checks, newCheck],
      }).eq('id', tree.id);

      if (alive && bonus > 0) {
        // Mint real tokens via edge function
        const { data: mintData, error: mintErr } = await supabase.functions.invoke('sigma-mint', {
          body: { userId: tree.user_id, amount: bonus, referenceId: tree.id, txType: 'tree_survival_bonus' },
        });
        const txHash = mintData?.txHash || null;

        await supabase.from('zlto_transactions').insert({
          user_id: tree.user_id,
          amount: bonus,
          tx_type: 'tree_survival_bonus',
          reference_id: tree.id,
          tx_hash: txHash,
          description: `Survival bonus: ${tree.green_projects?.title}`,
        });
        const { data: prof } = await supabase.from('profiles').select('zlto_balance').eq('user_id', tree.user_id).single();
        await supabase.from('profiles').update({ zlto_balance: (prof?.zlto_balance || 0) + bonus }).eq('user_id', tree.user_id);
        toast.success(`Tree alive! ${bonus} SIGMA survival bonus minted on-chain.`);
      } else if (!alive) {
        toast.info('Tree marked as dead.');
      }

      fetchTrees();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Survival Spot-Checks</h3>
          <p className="text-xs text-muted-foreground">Verify verified trees are still alive. Confirm to issue survival bonus Sigma.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchTrees}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh
        </Button>
      </div>

      {trees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <TreePine className="mx-auto mb-2 h-8 w-8" />
            No verified trees eligible for survival checks.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trees.map(tree => {
            const checkCount = Array.isArray(tree.survival_checks) ? tree.survival_checks.length : 0;
            return (
              <Card key={tree.id} className="border-border">
                <CardContent className="flex items-center gap-3 p-3">
                  {tree.photo_url && (
                    <img src={tree.photo_url} alt="Tree" className="h-14 w-14 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{tree.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tree.green_projects?.title} • {tree.tree_species}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {checkCount} prior check{checkCount !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Bonus: {tree.green_projects?.survival_bonus_zlto || 5} SIGMA
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={processing === tree.id}
                      onClick={() => handleSurvivalCheck(tree, true)}
                      title="Alive"
                    >
                      {processing === tree.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={processing === tree.id}
                      onClick={() => handleSurvivalCheck(tree, false)}
                      title="Dead"
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurvivalChecksTab;
