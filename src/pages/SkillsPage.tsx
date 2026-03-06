import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BookOpen, Award, CheckCircle, Clock, Loader2, ExternalLink, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createCredentialHash } from '@/lib/blockchain';

const SkillsPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const [c, s] = await Promise.all([
        supabase.from('courses').select('*').order('created_at'),
        user ? supabase.from('skill_completions').select('*, courses(title)').eq('user_id', user.id) : { data: [] },
      ]);
      setCourses(c.data || []);
      setCompletions(s.data || []);
    };
    fetch();
  }, [user]);

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  const filteredCourses = courses.filter(c => {
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCompletionStatus = (courseId: string) => {
    const comp = completions.find(c => c.course_id === courseId);
    if (!comp) return null;
    // Use status column if present, fallback to verified boolean
    if (comp.status === 'rejected') return 'rejected';
    if (comp.status === 'verified' || comp.verified) return 'verified';
    return 'pending';
  };

  const handleSubmit = async (course: any, completionCode: string, onClose: () => void) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const status = getCompletionStatus(course.id);
      if (status === 'pending' || status === 'verified') {
        toast.error('You already submitted this course.');
        return;
      }

      const credHash = createCredentialHash(user.id, course.id, Date.now());

      // If rejected, delete old and resubmit
      if (status === 'rejected') {
        const old = completions.find(c => c.course_id === course.id);
        if (old) {
          await supabase.from('skill_completions').delete().eq('id', old.id);
        }
      }

      const { error } = await supabase.from('skill_completions').insert({
        user_id: user.id,
        course_id: course.id,
        completion_code: completionCode,
        credential_hash: credHash,
        status: 'pending',
      } as any);
      if (error) throw error;

      toast.success('Course submitted! Pending admin verification.');
      onClose();
      const { data } = await supabase.from('skill_completions').select('*, courses(title)').eq('user_id', user.id);
      setCompletions(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Skills Pillar</h1>
        <p className="text-sm text-muted-foreground">Complete NiYA Academy courses to earn Sigma and verified credentials.</p>
      </div>

      {/* My Completions */}
      {completions.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">My Credentials</h2>
          <div className="space-y-2">
            {completions.map(c => {
              const status = c.status === 'rejected' ? 'rejected' : c.status === 'verified' || c.verified ? 'verified' : 'pending';
              return (
                <Card key={c.id} className="border-border">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      status === 'verified' ? 'bg-primary/10' : status === 'rejected' ? 'bg-destructive/10' : 'bg-muted'
                    }`}>
                      {status === 'verified' && <CheckCircle className="h-5 w-5 text-primary" />}
                      {status === 'pending' && <Clock className="h-5 w-5 text-muted-foreground" />}
                      {status === 'rejected' && <XCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.courses?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {status === 'verified' && `+${c.zlto_awarded} SIGMA earned`}
                        {status === 'pending' && 'Pending verification'}
                        {status === 'rejected' && 'Rejected — you may resubmit'}
                      </p>
                    </div>
                    <Badge
                      variant={status === 'verified' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Available Courses</h2>

        {/* Search + Category Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredCourses.map(course => {
            const status = getCompletionStatus(course.id);
            const canSubmit = !status || status === 'rejected';
            return (
              <Card key={course.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.description}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{course.provider}</Badge>
                        {course.category && <Badge variant="secondary" className="text-[10px]">{course.category}</Badge>}
                        <div className="flex items-center gap-1 text-xs">
                          <Award className="h-3 w-3 text-sigma" />
                          <span className="font-medium text-sigma">{course.zlto_reward} SIGMA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {course.url && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1" asChild>
                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" /> Start Course
                        </a>
                      </Button>
                    )}

                    {canSubmit && (
                      <CourseSubmitDialog
                        course={course}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        isResubmit={status === 'rejected'}
                      />
                    )}
                  </div>

                  {status === 'verified' && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Completed</span>
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Pending Verification</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredCourses.length === 0 && (
            <Card className="border-dashed border-border">
              <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {courses.length === 0 ? 'No courses available yet. Check back soon!' : 'No courses match your filter.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Extracted dialog component to fix stale state bug
const CourseSubmitDialog = ({ course, submitting, onSubmit, isResubmit }: {
  course: any; submitting: boolean; onSubmit: (course: any, code: string, close: () => void) => void; isResubmit: boolean;
}) => {
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setCode(''); }}>
      <DialogTrigger asChild>
        <Button size="sm" className={course.url ? 'flex-1' : 'w-full'}>
          {isResubmit ? 'Resubmit Completion' : 'Submit Completion'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isResubmit ? 'Resubmit' : 'Submit'} Course Completion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your completion code for <strong>{course.title}</strong> to earn{' '}
            <strong>{course.zlto_reward} SIGMA</strong>.
          </p>
          <div className="space-y-2">
            <Label>Completion Code</Label>
            <Input placeholder="e.g. NIYA-DL-2025-001" value={code} onChange={e => setCode(e.target.value)} />
          </div>
          <Button onClick={() => onSubmit(course, code, () => setOpen(false))} disabled={submitting || !code} className="w-full">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Verification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsPage;
