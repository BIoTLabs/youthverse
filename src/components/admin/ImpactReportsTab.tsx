import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Users, TreePine, Briefcase, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) { toast.error('No data to export'); return; }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.csv downloaded!`);
};

const ImpactReportsTab = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalYouth: 0, totalSkills: 0, totalGigs: 0, totalTrees: 0,
    totalSigma: 0, verifiedTrees: 0, aliveTrees: 0,
  });

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    const [profiles, skills, gigs, trees, txs] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('skill_completions').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('gig_applications').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
      supabase.from('tree_submissions').select('status'),
      supabase.from('zlto_transactions').select('amount'),
    ]);
    const treeData = trees.data || [];
    const totalSigma = (txs.data || []).reduce((s: number, t: any) => s + (t.amount > 0 ? t.amount : 0), 0);
    setSummary({
      totalYouth: profiles.count || 0, totalSkills: skills.count || 0, totalGigs: gigs.count || 0,
      totalTrees: treeData.length, totalSigma,
      verifiedTrees: treeData.filter((t: any) => t.status === 'verified').length,
      aliveTrees: treeData.filter((t: any) => t.status === 'alive').length,
    });
  };

  const exportTable = async (table: string) => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (table === 'profiles') {
        const { data: d } = await supabase.from('profiles').select('full_name, email, state, lga, phone, zlto_balance, affiliations, created_at');
        data = (d || []).map(r => ({ ...r, affiliations: (r.affiliations || []).join('; ') }));
      } else if (table === 'skill_completions') {
        const { data: d } = await supabase.from('skill_completions').select('user_id, completion_code, verified, zlto_awarded, created_at, verified_at, tx_hash, courses(title)');
        data = (d || []).map((r: any) => ({ course: r.courses?.title, ...r, courses: undefined }));
      } else if (table === 'tree_submissions') {
        const { data: d } = await supabase.from('tree_submissions').select('user_id, tree_species, status, zlto_awarded, latitude, longitude, created_at, verified_at, tx_hash, green_projects!tree_submissions_project_id_fkey(title)');
        data = (d || []).map((r: any) => ({ project: r.green_projects?.title, ...r, green_projects: undefined }));
      } else if (table === 'gig_applications') {
        const { data: d } = await supabase.from('gig_applications').select('user_id, status, zlto_awarded, created_at, tx_hash, gigs(title, budget)');
        data = (d || []).map((r: any) => ({ gig: r.gigs?.title, budget: r.gigs?.budget, ...r, gigs: undefined }));
      } else if (table === 'zlto_transactions') {
        const { data: d } = await supabase.from('zlto_transactions').select('user_id, amount, tx_type, description, tx_hash, created_at');
        data = d || [];
      }
      downloadCSV(data, table);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const reports = [
    { icon: Users, label: 'Youth Profiles', table: 'profiles', count: summary.totalYouth, color: 'bg-accent/10 text-accent' },
    { icon: Award, label: 'Skill Verifications', table: 'skill_completions', count: summary.totalSkills, color: 'bg-primary/10 text-primary' },
    { icon: Briefcase, label: 'Gig Completions', table: 'gig_applications', count: summary.totalGigs, color: 'bg-accent/10 text-accent' },
    { icon: TreePine, label: 'Tree Submissions', table: 'tree_submissions', count: summary.totalTrees, color: 'bg-primary/10 text-primary' },
    { icon: FileText, label: 'Sigma Transactions', table: 'zlto_transactions', count: summary.totalSigma, color: 'gradient-gold text-secondary-foreground' },
  ];

  return (
    <div className="space-y-6 mt-4">
      <Card className="overflow-hidden border-0 gradient-hero">
        <CardContent className="p-5 text-primary-foreground">
          <h3 className="font-display text-lg font-bold mb-3">Impact Summary</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><p className="text-2xl font-bold">{summary.totalYouth}</p><p className="text-[10px] text-primary-foreground/60">Youth Enrolled</p></div>
            <div><p className="text-2xl font-bold">{summary.totalSkills}</p><p className="text-[10px] text-primary-foreground/60">Skills Verified</p></div>
            <div><p className="text-2xl font-bold">{summary.verifiedTrees + summary.aliveTrees}</p><p className="text-[10px] text-primary-foreground/60">Trees Thriving</p></div>
            <div><p className="text-2xl font-bold">{summary.totalSigma}</p><p className="text-[10px] text-primary-foreground/60">SIGMA Issued</p></div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-semibold mb-3">Export Reports</h3>
        <div className="space-y-2">
          {reports.map(r => (
            <Card key={r.table} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r.color}`}>
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.count} records</p>
                </div>
                <Button size="sm" variant="outline" disabled={loading} onClick={() => exportTable(r.table)}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  <span className="ml-1 hidden sm:inline">CSV</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactReportsTab;
