import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Save, Loader2, Shield, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { NIGERIAN_STATES, AFFILIATIONS } from '@/lib/constants';
import { shortenAddress } from '@/lib/blockchain';

const ProfilePage = () => {
  const { user, profile, roles } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    state: profile?.state || '',
    lga: profile?.lga || '',
    bio: profile?.bio || '',
    affiliations: profile?.affiliations || [],
  });

  const walletAddress = profile?.wallet_address || '';

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      state: form.state,
      lga: form.lga,
      bio: form.bio,
      affiliations: form.affiliations,
    }).eq('user_id', user.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated!');
    setSaving(false);
  };

  const toggleAffiliation = (aff: string) => {
    setForm(f => ({
      ...f,
      affiliations: f.affiliations.includes(aff)
        ? f.affiliations.filter((a: string) => a !== aff)
        : [...f.affiliations, aff],
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your YouthWorks identity and on-chain profile.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium">{profile?.full_name || 'Set your name'}</p>
              <p className="text-xs text-muted-foreground font-mono">{shortenAddress(walletAddress)}</p>
              <div className="flex gap-1 mt-1">
                {roles.map(r => (
                  <Badge key={r} variant="secondary" className="text-[10px]">
                    <Shield className="mr-1 h-2.5 w-2.5" />{r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+234..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>LGA</Label>
              <Input placeholder="Local Government Area" value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Affiliations</Label>
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

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const url = `${window.location.origin}/reputation/${user?.id}`;
              navigator.clipboard.writeText(url);
              toast.success('Public profile link copied!');
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Public Profile
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfilePage;
