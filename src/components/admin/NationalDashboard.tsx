import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TreePine, BookOpen, Briefcase, Award, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { NIGERIAN_STATES } from '@/lib/constants';

const COLORS = ['hsl(152,72%,28%)', 'hsl(42,92%,56%)', 'hsl(210,70%,45%)', 'hsl(0,72%,51%)', 'hsl(152,72%,20%)', 'hsl(32,90%,50%)'];

const NationalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('all');
  const [data, setData] = useState({
    totalUsers: 0,
    totalTrees: 0,
    totalSkills: 0,
    totalGigs: 0,
    totalZlto: 0,
    usersByState: [] as any[],
    treesByStatus: [] as any[],
    zltoByType: [] as any[],
    monthlyActivity: [] as any[],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const [profiles, trees, skills, gigs, txs] = await Promise.all([
      supabase.from('profiles').select('state'),
      supabase.from('tree_submissions').select('status, green_projects!tree_submissions_project_id_fkey(state)'),
      supabase.from('skill_completions').select('verified, created_at'),
      supabase.from('gig_applications').select('status, gigs(state)'),
      supabase.from('zlto_transactions').select('amount, tx_type, created_at'),
    ]);

    // Users by state
    const stateMap: Record<string, number> = {};
    (profiles.data || []).forEach((p: any) => {
      const s = p.state || 'Unspecified';
      stateMap[s] = (stateMap[s] || 0) + 1;
    });
    const usersByState = Object.entries(stateMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Trees by status
    const treeStatusMap: Record<string, number> = {};
    (trees.data || []).forEach((t: any) => {
      const s = t.status || 'unknown';
      treeStatusMap[s] = (treeStatusMap[s] || 0) + 1;
    });
    const treesByStatus = Object.entries(treeStatusMap).map(([name, value]) => ({ name, value }));

    // Zlto by type
    const zltoTypeMap: Record<string, number> = {};
    let totalZlto = 0;
    (txs.data || []).forEach((t: any) => {
      if (t.amount > 0) {
        totalZlto += t.amount;
        zltoTypeMap[t.tx_type] = (zltoTypeMap[t.tx_type] || 0) + t.amount;
      }
    });
    const zltoByType = Object.entries(zltoTypeMap).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    // Monthly activity (last 6 months)
    const months: Record<string, { skills: number; trees: number; gigs: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { skills: 0, trees: 0, gigs: 0 };
    }
    (skills.data || []).forEach((s: any) => {
      if (s.created_at) {
        const key = s.created_at.slice(0, 7);
        if (months[key]) months[key].skills++;
      }
    });
    (trees.data || []).forEach((t: any) => {
      // We don't have created_at here directly, skip for simplicity
    });
    (gigs.data || []).forEach((g: any) => {
      // Same
    });
    const monthlyActivity = Object.entries(months).map(([month, d]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      ...d,
    }));

    setData({
      totalUsers: profiles.data?.length || 0,
      totalTrees: trees.data?.length || 0,
      totalSkills: (skills.data || []).filter((s: any) => s.verified).length,
      totalGigs: (gigs.data || []).filter((g: any) => g.status === 'verified').length,
      totalZlto,
      usersByState,
      treesByStatus,
      zltoByType,
      monthlyActivity,
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { icon: Users, label: 'Total Youth', value: data.totalUsers, color: 'bg-accent/10 text-accent' },
          { icon: BookOpen, label: 'Skills Verified', value: data.totalSkills, color: 'bg-primary/10 text-primary' },
          { icon: Briefcase, label: 'Gigs Completed', value: data.totalGigs, color: 'bg-accent/10 text-accent' },
          { icon: TreePine, label: 'Trees Planted', value: data.totalTrees, color: 'bg-primary/10 text-primary' },
          { icon: Award, label: 'Total Zlto', value: data.totalZlto, color: 'gradient-gold text-secondary-foreground' },
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

      {/* Charts Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Youth by State */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Youth Enrolled by State</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {data.usersByState.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.usersByState} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,10%,88%)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="state" type="category" tick={{ fontSize: 10 }} width={55} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(152,72%,28%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No state data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Tree Status Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tree Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {data.treesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.treesByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.treesByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No tree data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zlto Flow */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Zlto Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {data.zltoByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.zltoByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,10%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(42,92%,56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No Zlto transactions yet.</p>
          )}
        </CardContent>
      </Card>

      {/* State Breakdown Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">State Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">State</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Youth</th>
                </tr>
              </thead>
              <tbody>
                {data.usersByState.map(s => (
                  <tr key={s.state} className="border-b border-border/50">
                    <td className="py-2 text-sm">{s.state}</td>
                    <td className="py-2 text-sm text-right font-medium">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NationalDashboard;
