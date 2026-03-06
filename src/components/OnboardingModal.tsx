import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { NIGERIAN_STATES, AFFILIATIONS } from '@/lib/constants';

const OnboardingModal = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    state: '',
    lga: '',
    affiliations: [] as string[],
  });

  useEffect(() => {
    if (profile && !profile.state && user) {
      setForm(f => ({ ...f, full_name: profile.full_name || '' }));
      setOpen(true);
    }
  }, [profile, user]);

  const toggleAffiliation = (aff: string) => {
    setForm(f => ({
      ...f,
      affiliations: f.affiliations.includes(aff)
        ? f.affiliations.filter(a => a !== aff)
        : [...f.affiliations, aff],
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    // Create custodial wallet via edge function
    let walletAddress = profile?.wallet_address;
    if (!walletAddress) {
      try {
        const { data, error } = await supabase.functions.invoke('create-wallet', {
          body: { userId: user.id },
        });
        if (error) throw error;
        walletAddress = data?.address || null;
      } catch (err) {
        console.error('Wallet creation failed:', err);
      }
    }

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || profile?.full_name,
      phone: form.phone || null,
      state: form.state || null,
      lga: form.lga || null,
      affiliations: form.affiliations,
      wallet_address: walletAddress,
    }).eq('user_id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success('Welcome to YouthWorks! 🎉');
      setOpen(false);
    }
    setSaving(false);
  };

  const steps = [
    <div key="welcome" className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero">
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold">Welcome to YouthWorks!</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Let's set up your profile so you can start earning SIGMA through skills, gigs, and tree planting.
      </p>
      <Button onClick={() => setStep(1)} className="w-full">Let's Go!</Button>
    </div>,

    <div key="info" className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input placeholder="+234..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>State</Label>
          <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>LGA</Label>
          <Input placeholder="Local Govt" value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
        <Button onClick={() => setStep(2)} className="flex-1">Next</Button>
      </div>
    </div>,

    <div key="affiliations" className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Affiliations</Label>
        <p className="text-xs text-muted-foreground mb-3">Select all that apply to you.</p>
        <div className="flex flex-wrap gap-2">
          {AFFILIATIONS.map(aff => (
            <Badge
              key={aff}
              variant={form.affiliations.includes(aff) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => toggleAffiliation(aff)}
            >
              {aff}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
        <Button onClick={handleComplete} disabled={saving} className="flex-1">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Setup
        </Button>
      </div>
    </div>,
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 0 ? '' : step === 1 ? 'Your Details' : 'Almost Done!'}
          </DialogTitle>
        </DialogHeader>
        {steps[step]}
        <div className="flex justify-center gap-1.5 pt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
