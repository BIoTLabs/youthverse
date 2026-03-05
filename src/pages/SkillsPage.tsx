import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BookOpen, Award, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createCredentialHash } from '@/lib/blockchain';

const SkillsPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [completionCode, setCompletionCode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!user || !selectedCourse) return;
    setSubmitting(true);
    try {
      const existing = completions.find(c => c.course_id === selectedCourse.id);
      if (existing) {
        toast.error('You already submitted this course.');
        return;
      }
      const credHash = createCredentialHash(user.id, selectedCourse.id, Date.now());

      const { error } = await supabase.from('skill_completions').insert({
        user_id: user.id,
        course_id: selectedCourse.id,
        completion_code: completionCode,
      });
      if (error) throw error;

      toast.success(`Course submitted! Pending admin verification.`);
      setCompletionCode('');
      setSelectedCourse(null);
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
            {completions.map(c => (
              <Card key={c.id} className="border-border">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.verified ? 'bg-primary/10' : 'bg-muted'}`}>
                    {c.verified ? <CheckCircle className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.courses?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.verified ? `+${c.zlto_awarded} SIGMA earned` : 'Pending verification'}
                    </p>
                  </div>
                  <Badge variant={c.verified ? 'default' : 'secondary'} className="text-[10px]">
                    {c.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Available Courses</h2>
        <div className="space-y-3">
          {courses.map(course => {
            const completed = completions.some(c => c.course_id === course.id);
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
                  {!completed && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Submit Completion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Course Completion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Enter your completion code for <strong>{course.title}</strong> to earn{' '}
                            <strong>{course.zlto_reward} SIGMA</strong>.
                          </p>
                          <div className="space-y-2">
                            <Label>Completion Code</Label>
                            <Input
                              placeholder="e.g. NIYA-DL-2025-001"
                              value={completionCode}
                              onChange={e => setCompletionCode(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit for Verification
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {completed && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Completed</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {courses.length === 0 && (
            <Card className="border-dashed border-border">
              <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No courses available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SkillsPage;
