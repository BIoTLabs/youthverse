import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';

const emptyProject = { title: '', description: '', state: '', lga: '', program: '', target_trees: '1000', zlto_per_tree: '10', survival_bonus_zlto: '5', start_date: '', end_date: '' };

const GreenProjectsTab = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('green_projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditId(null); setForm(emptyProject); setOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      title: p.title, description: p.description || '', state: p.state || '', lga: p.lga || '',
      program: p.program || '', target_trees: p.target_trees?.toString() || '1000',
      zlto_per_tree: p.zlto_per_tree?.toString() || '10', survival_bonus_zlto: p.survival_bonus_zlto?.toString() || '5',
      start_date: p.start_date || '', end_date: p.end_date || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, state: form.state || null, lga: form.lga || null,
      program: form.program || null, target_trees: form.target_trees ? parseInt(form.target_trees) : 1000,
      zlto_per_tree: form.zlto_per_tree ? parseFloat(form.zlto_per_tree) : 10,
      survival_bonus_zlto: form.survival_bonus_zlto ? parseFloat(form.survival_bonus_zlto) : 5,
      start_date: form.start_date || null, end_date: form.end_date || null,
      ...(editId ? {} : { created_by: user?.id }),
    };
    const { error } = editId
      ? await supabase.from('green_projects').update(payload).eq('id', editId)
      : await supabase.from('green_projects').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editId ? 'Project updated' : 'Project created'); setOpen(false); fetchProjects(); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Green Projects ({projects.length})</CardTitle>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={openNew}><Plus className="h-3 w-3" /> Add Project</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>State</TableHead>
              <TableHead>LGA</TableHead>
              <TableHead>Target Trees</TableHead>
              <TableHead>Σ/Tree</TableHead>
              <TableHead>Survival Bonus</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-xs">{p.state || '—'}</TableCell>
                <TableCell className="text-xs">{p.lga || '—'}</TableCell>
                <TableCell>{p.target_trees || 0}</TableCell>
                <TableCell>{p.zlto_per_tree || 0}</TableCell>
                <TableCell>{p.survival_bonus_zlto || 0}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No projects yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Project' : 'Add Green Project'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>State</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div><Label>LGA</Label><Input value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value }))} /></div>
            </div>
            <div><Label>Program</Label><Input value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Target Trees</Label><Input type="number" value={form.target_trees} onChange={e => setForm(f => ({ ...f, target_trees: e.target.value }))} /></div>
              <div><Label>Σ/Tree</Label><Input type="number" value={form.zlto_per_tree} onChange={e => setForm(f => ({ ...f, zlto_per_tree: e.target.value }))} /></div>
              <div><Label>Survival Bonus</Label><Input type="number" value={form.survival_bonus_zlto} onChange={e => setForm(f => ({ ...f, survival_bonus_zlto: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GreenProjectsTab;
