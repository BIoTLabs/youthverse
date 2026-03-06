import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NIGERIAN_STATES, GIG_CATEGORIES } from '@/lib/constants';

interface EmployerGigFormProps {
  onCreated: () => void;
}

const EmployerGigForm = ({ onCreated }: EmployerGigFormProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    zlto_reward: '100',
    location: '',
    state: '',
    deadline: '',
    is_escrow: false,
    skills_required: '',
    milestones: [{ title: '', amount: '' }],
  });

  const updateField = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const addMilestone = () => {
    setForm(f => ({ ...f, milestones: [...f.milestones, { title: '', amount: '' }] }));
  };

  const updateMilestone = (i: number, field: string, value: string) => {
    setForm(f => {
      const milestones = [...f.milestones];
      milestones[i] = { ...milestones[i], [field]: value };
      return { ...f, milestones };
    });
  };

  const removeMilestone = (i: number) => {
    setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    if (!user || !form.title || !form.description || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      const escrowMilestones = form.is_escrow
        ? form.milestones
            .filter(m => m.title && m.amount)
            .map((m, i) => ({ order: i + 1, title: m.title, amount: Number(m.amount), status: 'pending' }))
        : [];

      const { error } = await supabase.from('gigs').insert({
        title: form.title,
        description: form.description,
        category: form.category,
        budget: form.budget ? Number(form.budget) : null,
        zlto_reward: Number(form.zlto_reward) || 100,
        location: form.location || null,
        state: form.state || null,
        deadline: form.deadline || null,
        is_escrow: form.is_escrow,
        escrow_milestones: escrowMilestones,
        skills_required: form.skills_required ? form.skills_required.split(',').map(s => s.trim()) : [],
        employer_id: user.id,
        status: 'open',
      });
      if (error) throw error;

      toast.success('Gig posted successfully!');
      setOpen(false);
      setForm({
        title: '', description: '', category: '', budget: '', zlto_reward: '100',
        location: '', state: '', deadline: '', is_escrow: false, skills_required: '',
        milestones: [{ title: '', amount: '' }],
      });
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" />Post a Gig
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Gig</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Community Data Collection" value={form.title} onChange={e => updateField('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea placeholder="Describe the work, requirements, and deliverables..." value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => updateField('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {GIG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget (₦)</Label>
              <Input type="number" placeholder="25000" value={form.budget} onChange={e => updateField('budget', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Sigma Reward</Label>
              <Input type="number" value={form.zlto_reward} onChange={e => updateField('zlto_reward', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={e => updateField('deadline', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Ikeja, Lagos" value={form.location} onChange={e => updateField('location', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={form.state} onValueChange={v => updateField('state', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Required Skills (comma-separated)</Label>
            <Input placeholder="e.g. Data Entry, Communication" value={form.skills_required} onChange={e => updateField('skills_required', e.target.value)} />
          </div>

          {/* Escrow Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Enable Escrow</p>
              <p className="text-xs text-muted-foreground">Protect payments with on-chain escrow milestones.</p>
            </div>
            <Switch checked={form.is_escrow} onCheckedChange={v => updateField('is_escrow', v)} />
          </div>

          {/* Milestones */}
          {form.is_escrow && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Escrow Milestones</p>
              {form.milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Milestone {i + 1}</Label>
                    <Input placeholder="Deliverable" value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Amount (₦)</Label>
                    <Input type="number" placeholder="0" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)} />
                  </div>
                  {form.milestones.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeMilestone(i)} className="text-destructive">×</Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMilestone}>+ Add Milestone</Button>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={creating} className="w-full">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Gig
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployerGigForm;
