import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';
import {
  TreePine, Briefcase, BookOpen, Loader2, Coins,
  ArrowRight, CheckCircle2, Shield, Users, Globe, Zap,
  ChevronRight, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { label: 'Youth Enrolled', value: '12,400+', icon: Users, accent: 'text-primary' },
  { label: 'Trees Planted', value: '48,000+', icon: TreePine, accent: 'text-primary' },
  { label: 'Sigma Earned', value: '₦2.1M+', icon: Coins, accent: 'text-secondary' },
];

const pillars = [
  {
    icon: BookOpen,
    title: 'Skills Development',
    description: 'Complete verified courses from NiYA Academy and local partners. Earn blockchain-verified credentials and Sigma tokens.',
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  {
    icon: Briefcase,
    title: 'Gig Marketplace',
    description: 'Find paid micro-gigs with smart contract escrow. Employers fund upfront — you get paid on verified completion.',
    gradient: 'from-accent/10 to-accent/5',
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent',
  },
  {
    icon: TreePine,
    title: 'Green Impact',
    description: 'Plant and monitor trees across Nigeria. Submit geo-tagged proof, earn Sigma per tree, unlock survival bonuses.',
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
];

const steps = [
  { step: '01', title: 'Sign Up', description: 'Create your account with an auto-generated blockchain wallet.' },
  { step: '02', title: 'Build Skills', description: 'Complete courses and earn verified credentials on-chain.' },
  { step: '03', title: 'Find Work', description: 'Apply for escrow-protected gigs with guaranteed pay.' },
  { step: '04', title: 'Plant Trees', description: 'Join green projects with geo-tagged proof of planting.' },
  { step: '05', title: 'Earn & Redeem', description: 'Accumulate Sigma and redeem for airtime, data, and more.' },
];

const partners = [
  { name: 'NiYA Academy', role: 'Skills Provider' },
  { name: 'NYSC', role: 'Youth Service' },
  { name: 'Green Schools', role: 'Climate Partner' },
  { name: 'Base Network', role: 'Blockchain Infra' },
];

const features = [
  { icon: Shield, title: 'Smart Contract Escrow', desc: 'All payments on-chain protected via Base.' },
  { icon: Globe, title: '36 States + FCT', desc: 'Active projects across all Nigerian states.' },
  { icon: Zap, title: 'Instant Rewards', desc: 'Sigma credited immediately upon verification.' },
  { icon: CheckCircle2, title: 'Verified Credentials', desc: 'Blockchain-stamped certificates employers trust.' },
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
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <YouthWorksLogo size="sm" />
          <Button onClick={scrollToAuth} size="sm" className="rounded-full px-5 font-semibold shadow-glow">
            Get Started <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Dark slate background */}
        <div className="absolute inset-0 gradient-hero" />
        {/* Green glow effect */}
        <div className="absolute inset-0 gradient-glow" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="container relative z-10 py-24 sm:py-32 lg:py-40">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Blockchain-powered youth empowerment
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl text-balance"
            >
              Build Your Verified
              <br />
              Reputation.{' '}
              <span className="text-electric bg-gradient-to-r from-primary to-electric-glow bg-clip-text text-transparent">
                Earn Sigma.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg text-white/55 sm:text-xl"
            >
              Nigeria's platform connecting youth to skills, work opportunities,
              and climate action — all rewarded with Sigma tokens on-chain.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={scrollToAuth} className="rounded-full px-8 text-base font-semibold shadow-glow">
                Join YouthWorks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToAuth} className="rounded-full border-white/15 text-white hover:bg-white/5 px-8 text-base">
                Learn More
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} custom={4} className="mt-16 grid grid-cols-3 gap-3 sm:gap-5">
              {stats.map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="group rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-white/[0.07]">
                  <Icon className={`mx-auto mb-2.5 h-5 w-5 ${accent} opacity-70`} />
                  <p className="font-display text-2xl font-bold text-white sm:text-3xl">{value}</p>
                  <p className="mt-1 text-xs text-white/40">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Three Pillars ─── */}
      <section className="py-24">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <motion.p variants={fadeUp} custom={0} className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              How We Empower Youth
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Three Pillars of Impact
            </motion.h2>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description, gradient, iconBg, iconColor }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className={`group h-full border-0 bg-gradient-to-br ${gradient} shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1`}>
                  <CardContent className="p-7">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
                      <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-y border-border bg-muted/40 py-24">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <motion.p variants={fadeUp} custom={0} className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Your Journey
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="relative mt-14 grid gap-8 sm:grid-cols-5">
            {/* Connection line */}
            <div className="absolute top-6 left-[10%] right-[10%] hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent sm:block" />
            {steps.map(({ step, title, description }, i) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                  <span className="font-display text-sm font-bold">{step}</span>
                </div>
                <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-24">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">{title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partners ─── */}
      <section className="border-t border-border py-16">
        <div className="container text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted Partners & Infrastructure
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
            {partners.map(({ name, role }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <span className="font-display text-sm font-bold text-foreground">{name}</span>
                <span className="text-[10px] text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Auth Section ─── */}
      <section id="auth-section" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 gradient-glow" />
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-md">
            <motion.div variants={fadeUp} custom={0} className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Ready to Start?
              </h2>
              <p className="mt-3 text-sm text-white/50">
                Join thousands of Nigerian youth building their verified reputation.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <Card className="border-white/10 bg-white/[0.06] shadow-elevated backdrop-blur-xl">
                <CardContent className="p-6">
                  <Tabs defaultValue="signin">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5">
                      <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-semibold">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-semibold">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4 pt-5">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white/70 text-xs font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={signInData.email}
                            onChange={e => setSignInData(p => ({ ...p, email: e.target.value }))}
                            required
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white/70 text-xs font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={signInData.password}
                            onChange={e => setSignInData(p => ({ ...p, password: e.target.value }))}
                            required
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                          />
                        </div>
                        <Button type="submit" className="w-full rounded-xl font-semibold shadow-glow" disabled={loading}>
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
                      <form onSubmit={handleSignUp} className="space-y-4 pt-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white/70 text-xs font-medium">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Adaeze Okoro"
                            value={signUpData.fullName}
                            onChange={e => setSignUpData(p => ({ ...p, fullName: e.target.value }))}
                            required
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-white/70 text-xs font-medium">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={signUpData.email}
                            onChange={e => setSignUpData(p => ({ ...p, email: e.target.value }))}
                            required
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-white/70 text-xs font-medium">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={signUpData.password}
                            onChange={e => setSignUpData(p => ({ ...p, password: e.target.value }))}
                            required
                            minLength={6}
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-primary"
                          />
                        </div>
                        <Button type="submit" className="w-full rounded-xl font-semibold shadow-glow" disabled={loading}>
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
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <YouthWorksLogo size="sm" />
            <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
              <span className="cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">Terms of Service</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">Contact</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} YouthWorks. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/50">
              Powered by blockchain • Base Sepolia Testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
