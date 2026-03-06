import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, UserPlus, Trash2, Loader2 } from 'lucide-react';

const ROLES = ['youth', 'admin', 'employer', 'partner', 'national_admin'] as const;

const UserManagementTab = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [addRoleUser, setAddRoleUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap: Record<string, string[]> = {};
    (roles || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });
    setProfiles(profs || []);
    setUserRoles(roleMap);
    setLoading(false);
  };

  const addRole = async (userId: string, role: string) => {
    setProcessing(userId);
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: role as any });
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'User already has this role' : error.message);
    } else {
      toast.success(`Role "${role}" assigned.`);
      await fetchUsers();
    }
    setAddRoleUser(null);
    setSelectedRole('');
    setProcessing(null);
  };

  const removeRole = async (userId: string, role: string) => {
    if (role === 'youth') { toast.error('Cannot remove base youth role.'); return; }
    setProcessing(userId);
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role as any);
    if (error) toast.error(error.message);
    else { toast.success(`Role "${role}" removed.`); await fetchUsers(); }
    setProcessing(null);
  };

  const filtered = profiles.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.state?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">User Management ({profiles.length} users)</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or state..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Sigma Balance</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name || '—'}</TableCell>
                <TableCell className="text-xs">{p.email || '—'}</TableCell>
                <TableCell className="text-xs">{p.state || '—'}</TableCell>
                <TableCell>{p.zlto_balance || 0}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(userRoles[p.user_id] || ['youth']).map(r => (
                      <Badge key={r} variant={r === 'admin' || r === 'national_admin' ? 'default' : 'secondary'} className="text-[10px] gap-1">
                        {r}
                        {r !== 'youth' && (
                          <button onClick={() => removeRole(p.user_id, r)} className="ml-0.5 hover:text-destructive" disabled={processing === p.user_id}>
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {addRoleUser === p.user_id ? (
                    <div className="flex gap-1 items-center">
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                        <SelectContent>
                          {ROLES.filter(r => !(userRoles[p.user_id] || []).includes(r)).map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-7 text-xs" disabled={!selectedRole || processing === p.user_id} onClick={() => addRole(p.user_id, selectedRole)}>
                        {processing === p.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddRoleUser(null); setSelectedRole(''); }}>✕</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAddRoleUser(p.user_id)}>
                      <UserPlus className="h-3 w-3" /> Role
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagementTab;
