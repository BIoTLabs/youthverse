import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Leaf, TrendingUp, DollarSign, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CO2_ESTIMATES } from '@/lib/constants';

const CarbonCreditsTab = () => {
  const { user, roles } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [treeStats, setTreeStats] = useState({ total: 0, co2Tons: 0, byState: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newBatch, setNewBatch] = useState({ title: '', description: '', state: '' });
  const isNationalAdmin = roles.includes('national_admin');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [batchRes, treeRes] = await Promise.all([
      supabase.from('carbon_credit_batches').select('*').order('created_at', { ascending: false }),
      supabase.from('tree_submissions').select('tree_species, status, green_projects!tree_submissions_project_id_fkey(state)')
        .in('status', ['verified', 'alive']),
    ]);

    setBatches(batchRes.data || []);

    // Calculate CO2 from verified/alive trees
    const trees = treeRes.data || [];
    let totalCO2 = 0;
    const stateMap: Record<string, { trees: number; co2: number }> = {};

    trees.forEach((t: any) => {
      const species = t.tree_species || 'Other';
      const co2PerYear = (CO2_ESTIMATES[species] || 20) / 1000; // Convert kg to tons
      totalCO2 += co2PerYear;
      const state = t.green_projects?.state || 'Unknown';
      if (!stateMap[state]) stateMap[state] = { trees: 0, co2: 0 };
      stateMap[state].trees++;
      stateMap[state].co2 += co2PerYear;
    });

    setTreeStats({
      total: trees.length,
      co2Tons: Math.round(totalCO2 * 100) / 100,
      byState: Object.entries(stateMap).map(([state, data]) => ({ state, ...data }))
        .sort((a, b) => b.trees - a.trees),
    });
    setLoading(false);
  };

  const handleCreateBatch = async () => {
    if (!newBatch.title) return;
    setCreating(true);
    try {
      // Count verified trees for the state filter
      const query = supabase.from('tree_submissions')
        .select('tree_species, green_projects!tree_submissions_project_id_fkey(state)', { count: 'exact' })
        .in('status', ['verified', 'alive']);

      const { data: trees, count } = await query;

      let co2 = 0;
      (trees || []).forEach((t: any) => {
        co2 += (CO2_ESTIMATES[t.tree_species || 'Other'] || 20) / 1000;
      });

      const { error } = await supabase.from('carbon_credit_batches').insert({
        title: newBatch.title,
        description: newBatch.description,
        state: newBatch.state || null,
        tree_count: count || 0,
        estimated_co2_tons: Math.round(co2 * 100) / 100,
        created_by: user?.id,
        status: 'draft',
      });

      if (error) throw error;
      toast.success('Carbon credit batch created!');
      setNewBatch({ title: '', description: '', state: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      pending_verification: 'bg-secondary/20 text-secondary-foreground',
      verified: 'bg-primary/10 text-primary',
      sold: 'bg-accent/10 text-accent',
    };
    return map[s] || '';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 mt-4">
      {/* CO2 Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Leaf className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-display text-2xl font-bold">{treeStats.total}</p>
            <p className="text-[10px] text-muted-foreground">Verified Trees</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-display text-2xl font-bold">{treeStats.co2Tons}</p>
            <p className="text-[10px] text-muted-foreground">Est. CO₂ Tons/Year</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto mb-2 h-6 w-6 text-accent" />
            <p className="font-display text-2xl font-bold">{batches.filter(b => b.status === 'sold').length}</p>
            <p className="text-[10px] text-muted-foreground">Credits Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* State Breakdown */}
      {treeStats.byState.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CO₂ Sequestration by State</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {treeStats.byState.map(s => (
                <div key={s.state} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.state}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.trees} trees</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {(s.co2).toFixed(2)} t CO₂/yr
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batches */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Credit Batches</h3>
        {isNationalAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />New Batch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Carbon Credit Batch</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Q1 2026 Lagos Credits"
                    value={newBatch.title}
                    onChange={e => setNewBatch(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Batch details..."
                    value={newBatch.description}
                    onChange={e => setNewBatch(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State Filter (optional)</Label>
                  <Input
                    placeholder="e.g. Lagos"
                    value={newBatch.state}
                    onChange={e => setNewBatch(p => ({ ...p, state: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateBatch} disabled={creating} className="w-full">
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {batches.map(b => (
          <Card key={b.id} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.tree_count} trees • {b.estimated_co2_tons} t CO₂ • {b.state || 'All states'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`text-[10px] ${statusColor(b.status)}`}>{b.status}</Badge>
                  {b.sale_price && (
                    <p className="text-xs font-bold mt-1">${Number(b.sale_price).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {batches.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No carbon credit batches yet.</p>
        )}
      </div>
    </div>
  );
};

export default CarbonCreditsTab;
