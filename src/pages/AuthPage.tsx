import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';
import {
  TreePine, Briefcase, BookOpen, Loader2, Coins,
  ArrowRight, CheckCircle2, Shield, Users, Globe, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' },
  }),
};

const stats = [
  { label: 'Youth Enrolled', value: '12,400+', icon: Users },
  { label: 'Trees Planted', value: '48,000+', icon: TreePine },
  { label: 'Zlto Earned', value: '₦2.1M+', icon: Coins },
];

const pillars = [
  {
    icon: BookOpen,
    title: 'Skills Development',
    description: 'Complete verified courses from NiYA Academy, Google, and local partners. Earn blockchain-verified credentials and Zlto tokens for every skill mastered.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Briefcase,
    title: 'Gig Marketplace',
    description: 'Find paid micro-gigs with smart contract escrow protection. Employers fund tasks upfront — you get paid automatically upon verified completion.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: TreePine,
    title: 'Green Impact',
    description: 'Plant and monitor trees across Nigeria. Submit geo-tagged proof, earn Zlto per verified tree, and unlock survival bonuses at 6 and 12 months.',
    color: 'text-primary',
    bg: 'bg-green-light',
  },
];

const steps = [
  { step: '01', title: 'Sign Up', description: 'Create your account and get a blockchain wallet automatically generated.' },
  { step: '02', title: 'Build Skills', description: 'Complete courses and submit completion codes for verified credentials.' },
  { step: '03', title: 'Find Work', description: 'Apply for gigs with escrow-protected payments on-chain.' },
  { step: '04', title: 'Plant Trees', description: 'Join green projects and submit geo-tagged proof of planting.' },
  { step: '05', title: 'Earn & Redeem', description: 'Accumulate Zlto tokens and redeem for airtime, data, and more.' },
];

const partners = [
  { name: 'NiYA Academy', role: 'Skills Provider' },
  { name: 'NYSC', role: 'Youth Service' },
  { name: 'Green Schools', role: 'Climate Partner' },
  { name: 'Base Network', role: 'Blockchain Infrastructure' },
];

const AuthPage = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '' });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const scrollToAuth = () => {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    if (error) toast.error(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    if (error) toast.error(error.message);
    else {
      toast.success('Account created! Check your email to verify.');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <YouthWorksLogo size="sm" />
          <Button onClick={scrollToAuth} size="sm">
            Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden gradient-navy py-20 sm:py-28">
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6 flex justify-center">
              <YouthWorksLogo size="lg" className="[&_span]:text-primary-foreground" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance"
            >
              Build Your Verified Reputation.{' '}
              <span className="text-secondary">Earn Zlto.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-lg text-primary-foreground/70 sm:text-xl"
            >
              Nigeria's blockchain-powered platform connecting youth to skills,
              work opportunities, and climate action — all rewarded with Zlto tokens.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={scrollToAuth} className="px-8 text-base">
                Join YouthWorks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base">
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-14 grid grid-cols-3 gap-4"
            >
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 px-4 py-5 backdrop-blur-sm">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-secondary" />
                  <p className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">{value}</p>
                  <p className="mt-1 text-xs text-primary-foreground/60">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Three Pillars ─── */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary">
              How We Empower Youth
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Three Pillars of Impact
            </motion.h2>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description, color, bg }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-border shadow-card hover:shadow-elevated transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary">
              Your Journey
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="relative mt-12 grid gap-6 sm:grid-cols-5">
            {steps.map(({ step, title, description }, i) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full gradient-hero">
                  <span className="font-display text-sm font-bold text-primary-foreground">{step}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features / Trust ─── */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: 'Smart Contract Security', desc: 'All payments protected by on-chain escrow on Base.' },
              { icon: Globe, title: '36 States + FCT', desc: 'Active projects across all Nigerian states.' },
              { icon: Zap, title: 'Instant Rewards', desc: 'Zlto tokens credited immediately upon verification.' },
              { icon: CheckCircle2, title: 'Verified Credentials', desc: 'Blockchain-stamped certificates that employers trust.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partners ─── */}
      <section className="border-t border-border py-14">
        <div className="container text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted Partners & Infrastructure
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {partners.map(({ name, role }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <span className="font-display text-sm font-semibold text-foreground">{name}</span>
                <span className="text-[10px] text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Auth Section ─── */}
      <section id="auth-section" className="gradient-navy py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-md"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-primary-foreground">
                Ready to Start?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/60">
                Join thousands of Nigerian youth building their verified reputation.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <Card className="border-border shadow-elevated">
                <CardHeader className="pb-2" />
                <CardContent>
                  <Tabs defaultValue="signin">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={signInData.email}
                            onChange={e => setSignInData(p => ({ ...p, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={signInData.password}
                            onChange={e => setSignInData(p => ({ ...p, password: e.target.value }))}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sign In
                        </Button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!signInData.email) {
                              toast.error('Enter your email first');
                              return;
                            }
                            const { error } = await supabase.auth.resetPasswordForEmail(signInData.email, {
                              redirectTo: `${window.location.origin}/reset-password`,
                            });
                            if (error) toast.error(error.message);
                            else toast.success('Password reset link sent! Check your email.');
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Adaeze Okoro"
                            value={signUpData.fullName}
                            onChange={e => setSignUpData(p => ({ ...p, fullName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={signUpData.email}
                            onChange={e => setSignUpData(p => ({ ...p, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={signUpData.password}
                            onChange={e => setSignUpData(p => ({ ...p, password: e.target.value }))}
                            required
                            minLength={6}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <YouthWorksLogo size="sm" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} YouthWorks. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Powered by blockchain • Base Sepolia Testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
