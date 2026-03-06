import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const emptyCourse = { title: '', description: '', category: '', provider: 'NiYA Academy', duration_hours: '', zlto_reward: '50', completion_code: '' };

const CourseManagementTab = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditId(null); setForm(emptyCourse); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({ title: c.title, description: c.description || '', category: c.category || '', provider: c.provider || '', duration_hours: c.duration_hours?.toString() || '', zlto_reward: c.zlto_reward?.toString() || '50', completion_code: c.completion_code || '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, category: form.category || null,
      provider: form.provider || null, duration_hours: form.duration_hours ? parseInt(form.duration_hours) : null,
      zlto_reward: form.zlto_reward ? parseFloat(form.zlto_reward) : 50, completion_code: form.completion_code || null,
    };
    const { error } = editId
      ? await supabase.from('courses').update(payload).eq('id', editId)
      : await supabase.from('courses').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editId ? 'Course updated' : 'Course created'); setOpen(false); fetchCourses(); }
    setSaving(false);
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Course deleted'); fetchCourses(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Course Management ({courses.length})</CardTitle>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={openNew}><Plus className="h-3 w-3" /> Add Course</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sigma Reward</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell className="text-xs">{c.category || '—'}</TableCell>
                <TableCell className="text-xs">{c.provider || '—'}</TableCell>
                <TableCell className="text-xs">{c.duration_hours ? `${c.duration_hours}h` : '—'}</TableCell>
                <TableCell>{c.zlto_reward || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteCourse(c.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No courses yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Course' : 'Add Course'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Duration (hrs)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} /></div>
              <div><Label>Sigma Reward</Label><Input type="number" value={form.zlto_reward} onChange={e => setForm(f => ({ ...f, zlto_reward: e.target.value }))} /></div>
              <div><Label>Code</Label><Input value={form.completion_code} onChange={e => setForm(f => ({ ...f, completion_code: e.target.value }))} /></div>
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

export default CourseManagementTab;
