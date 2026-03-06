import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';

const emptyItem = { title: '', description: '', category: '', zlto_cost: '', partner: '', image_url: '' };

const MarketplaceTab = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('marketplace_items').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditId(null); setForm(emptyItem); setOpen(true); };
  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description || '', category: item.category || '', zlto_cost: item.zlto_cost?.toString() || '', partner: item.partner || '', image_url: item.image_url || '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.zlto_cost) { toast.error('Title and Sigma cost required'); return; }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, category: form.category || null,
      zlto_cost: parseFloat(form.zlto_cost), partner: form.partner || null, image_url: form.image_url || null,
    };
    const { error } = editId
      ? await supabase.from('marketplace_items').update(payload).eq('id', editId)
      : await supabase.from('marketplace_items').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editId ? 'Item updated' : 'Item created'); setOpen(false); fetchItems(); }
    setSaving(false);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    const { error } = await supabase.from('marketplace_items').update({ available: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else fetchItems();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Marketplace Items ({items.length})</CardTitle>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={openNew}><Plus className="h-3 w-3" /> Add Item</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Sigma Cost</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-xs">{item.category || '—'}</TableCell>
                <TableCell className="text-xs">{item.partner || '—'}</TableCell>
                <TableCell>{item.zlto_cost}</TableCell>
                <TableCell>
                  <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id, item.available)} />
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No marketplace items yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Item' : 'Add Marketplace Item'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div><Label>Sigma Cost *</Label><Input type="number" value={form.zlto_cost} onChange={e => setForm(f => ({ ...f, zlto_cost: e.target.value }))} /></div>
            </div>
            <div><Label>Partner</Label><Input value={form.partner} onChange={e => setForm(f => ({ ...f, partner: e.target.value }))} /></div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MarketplaceTab;
