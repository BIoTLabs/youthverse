import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Camera, MapPin, CheckCircle, Clock, Loader2, Leaf, Award } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createTreeHash } from '@/lib/blockchain';
import { TREE_SPECIES } from '@/lib/constants';

const GreenPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [myTrees, setMyTrees] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [treeSpecies, setTreeSpecies] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [p, t] = await Promise.all([
        supabase.from('green_projects').select('*').order('created_at', { ascending: false }),
        user ? supabase.from('tree_submissions').select('*, green_projects(title)').eq('user_id', user.id).order('created_at', { ascending: false }) : { data: [] },
      ]);
      setProjects(p.data || []);
      setMyTrees(t.data || []);
    };
    fetchData();
  }, [user]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success('Location captured!');
        },
        () => toast.error('Unable to get location. Please enable GPS.')
      );
    }
  };

  const handleSubmitTree = async () => {
    if (!user || !selectedProject || !photoFile || !location) {
      toast.error('Please provide a photo and enable GPS.');
      return;
    }
    setSubmitting(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${photoFile.name}`;
      const { error: upErr } = await supabase.storage.from('tree-photos').upload(fileName, photoFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('tree-photos').getPublicUrl(fileName);

      const { error } = await supabase.from('tree_submissions').insert({
        project_id: selectedProject.id,
        user_id: user.id,
        photo_url: urlData.publicUrl,
        latitude: location.lat,
        longitude: location.lng,
        tree_species: treeSpecies,
      });
      if (error) throw error;

      toast.success('Tree submitted for verification! 🌱');
      setPhotoFile(null);
      setTreeSpecies('');
      setSelectedProject(null);
      setLocation(null);
      const { data } = await supabase.from('tree_submissions').select('*, green_projects(title)').eq('user_id', user.id).order('created_at', { ascending: false });
      setMyTrees(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (s: string) => {
    if (s === 'verified' || s === 'alive') return <CheckCircle className="h-4 w-4 text-primary" />;
    if (s === 'rejected' || s === 'dead') return <span className="text-destructive text-xs">✕</span>;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Green Pillar</h1>
        <p className="text-sm text-muted-foreground">Plant trees, submit proof, earn Sigma, and contribute to carbon credits.</p>
      </div>

      {/* My Trees */}
      {myTrees.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">My Trees ({myTrees.length})</h2>
          <div className="space-y-2">
            {myTrees.slice(0, 5).map(tree => (
              <Card key={tree.id} className="border-border">
                <CardContent className="flex items-center gap-3 p-3">
                  {tree.photo_url ? (
                    <img src={tree.photo_url} alt="Tree" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <TreePine className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{tree.green_projects?.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{tree.tree_species}</span>
                      {tree.zlto_awarded > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-sigma">
                          <Award className="h-3 w-3" />+{tree.zlto_awarded}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {statusIcon(tree.status)}
                    <Badge variant="secondary" className="text-[10px]">{tree.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Green Projects */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Active Projects</h2>
        <div className="space-y-3">
          {projects.map(project => (
            <Card key={project.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {project.state && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{project.state}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px]">{project.program}</Badge>
                      <span className="flex items-center gap-1 text-xs text-sigma">
                        <Award className="h-3 w-3" />{project.zlto_per_tree} SIGMA/tree
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Target: {project.target_trees} trees
                      </span>
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="mt-3 w-full" onClick={() => { setSelectedProject(project); getLocation(); }}>
                      <Camera className="mr-2 h-4 w-4" />
                      Submit Tree Planting Proof
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Tree Proof</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a geo-tagged photo of your planted tree for <strong>{project.title}</strong>.
                      </p>

                      <div className="space-y-2">
                        <Label>Tree Species</Label>
                        <Select value={treeSpecies} onValueChange={setTreeSpecies}>
                          <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                          <SelectContent>
                            {TREE_SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Photo Proof</Label>
                        <input
                          ref={fileInput}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInput.current?.click()}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          {photoFile ? photoFile.name : 'Take or Upload Photo'}
                        </Button>
                      </div>

                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs font-medium mb-1">GPS Location</p>
                        {location ? (
                          <p className="text-xs text-muted-foreground">
                            📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </p>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={getLocation} className="text-xs">
                            <MapPin className="mr-1 h-3 w-3" />Enable GPS
                          </Button>
                        )}
                      </div>

                      <Button onClick={handleSubmitTree} disabled={submitting || !photoFile || !location} className="w-full">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Proof
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <TreePine className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No active projects yet.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GreenPage;
