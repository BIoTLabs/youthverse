import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2, Briefcase } from 'lucide-react';

const emptyGig = {
  title: '', description: '', category: '', location: '', state: '',
  budget: '', zlto_reward: '100', deadline: '', skills_required: '',
  is_escrow: false,
};

const statusColors: Record<string, string> = {
  open: 'bg-primary/10 text-primary',
  applied: 'bg-accent/10 text-accent-foreground',
  in_progress: 'bg-secondary/20 text-secondary-foreground',
  completed: 'bg-primary/10 text-primary',
  verified: 'bg-primary text-primary-foreground',
  disputed: 'bg-destructive/10 text-destructive',
};

const GigManagementTab = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyGig);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchGigs(); }, []);

  const fetchGigs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gigs')
      .select('*, profiles!gigs_employer_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    setGigs(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditId(null); setForm(emptyGig); setOpen(true); };

  const openEdit = (gig: any) => {
    setEditId(gig.id);
    setForm({
      title: gig.title,
      description: gig.description || '',
      category: gig.category || '',
      location: gig.location || '',
      state: gig.state || '',
      budget: gig.budget?.toString() || '',
      zlto_reward: gig.zlto_reward?.toString() || '100',
      deadline: gig.deadline ? new Date(gig.deadline).toISOString().slice(0, 10) : '',
      skills_required: (gig.skills_required || []).join(', '),
      is_escrow: gig.is_escrow || false,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload: any = {
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      location: form.location || null,
      state: form.state || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      zlto_reward: form.zlto_reward ? parseFloat(form.zlto_reward) : 100,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      skills_required: form.skills_required ? form.skills_required.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_escrow: form.is_escrow,
    };
    if (!editId) {
      payload.employer_id = user?.id;
      payload.status = 'open';
    }
    const { error } = editId
      ? await supabase.from('gigs').update(payload).eq('id', editId)
      : await supabase.from('gigs').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editId ? 'Gig updated' : 'Gig created'); setOpen(false); fetchGigs(); }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('gigs').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`Status updated to ${status}`); fetchGigs(); }
  };

  const filtered = filter === 'all' ? gigs : gigs.filter(g => g.status === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> All Gigs ({filtered.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={openNew}>
            <Plus className="h-3 w-3" /> Create Gig
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Sigma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Escrow</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(gig => (
              <TableRow key={gig.id}>
                <TableCell className="font-medium text-xs max-w-[160px] truncate">{gig.title}</TableCell>
                <TableCell className="text-xs">{gig.profiles?.full_name || '—'}</TableCell>
                <TableCell className="text-xs">{gig.location || gig.state || '—'}</TableCell>
                <TableCell className="text-xs">₦{Number(gig.budget || 0).toLocaleString()}</TableCell>
                <TableCell className="text-xs">{gig.zlto_reward}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${statusColors[gig.status] || ''}`}>{gig.status}</Badge>
                </TableCell>
                <TableCell>
                  {gig.is_escrow ? <Badge variant="outline" className="text-[10px] border-secondary text-secondary-foreground">Yes</Badge> : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(gig)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {gig.status === 'open' && (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-destructive" onClick={() => updateStatus(gig.id, 'disputed')}>
                        Close
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No gigs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Gig' : 'Create Gig'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Design, Tech" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Lagos" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>State</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Budget (₦)</Label><Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
              <div><Label>Sigma Reward</Label><Input type="number" value={form.zlto_reward} onChange={e => setForm(f => ({ ...f, zlto_reward: e.target.value }))} /></div>
            </div>
            <div><Label>Skills (comma-separated)</Label><Input value={form.skills_required} onChange={e => setForm(f => ({ ...f, skills_required: e.target.value }))} placeholder="React, Design, Writing" /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_escrow} onCheckedChange={v => setForm(f => ({ ...f, is_escrow: v }))} />
              <Label>Escrow Gig</Label>
            </div>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? 'Update Gig' : 'Create Gig'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GigManagementTab;
