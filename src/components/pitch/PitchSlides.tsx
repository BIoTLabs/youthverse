import { BookOpen, Briefcase, TreePine, Wallet, Shield, Zap, Globe, Target, Users, TrendingUp, CheckCircle, Clock, ArrowRight, Cpu, Link2, Lock, Leaf, DollarSign, BarChart3 } from 'lucide-react';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
};

const SlideContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`slide-content w-[1920px] h-[1080px] flex flex-col justify-center px-[120px] py-[80px] ${className}`}>
    {children}
  </div>
);

// Slide 1: Title
export const TitleSlide = () => (
  <SlideContainer className="items-center text-center bg-gradient-to-br from-[hsl(220,25%,8%)] via-[hsl(220,18%,12%)] to-[hsl(220,25%,6%)] relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(145,80%,42%,0.12),transparent_70%)]" />
    <div className="absolute top-[80px] right-[120px] w-[300px] h-[300px] rounded-full bg-[hsl(145,80%,42%,0.05)] blur-[100px]" />
    <div className="relative z-10 flex flex-col items-center gap-[48px]">
      <YouthWorksLogo size="lg" />
      <motion.h1
        initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[72px] font-display font-bold leading-[1.1] text-[hsl(0,0%,95%)]"
      >
        Blockchain-Powered Youth
        <br />
        <span className="text-[hsl(145,80%,48%)]">Employment & Climate Action</span>
      </motion.h1>
      <motion.p
        initial="hidden" animate="visible" custom={1} variants={fadeUp}
        className="text-[28px] text-[hsl(210,10%,55%)] font-body max-w-[900px]"
      >
        UNICEF Venture Fund — Cohort 2026
      </motion.p>
      <motion.div
        initial="hidden" animate="visible" custom={2} variants={fadeUp}
        className="flex items-center gap-[16px] mt-[24px]"
      >
        <span className="px-[24px] py-[12px] rounded-full border border-[hsl(145,80%,42%,0.3)] text-[20px] text-[hsl(145,80%,48%)] font-semibold">
          🇳🇬 Lagos, Ogun & Ondo, Nigeria
        </span>
        <span className="px-[24px] py-[12px] rounded-full border border-[hsl(42,90%,54%,0.3)] text-[20px] text-[hsl(42,90%,54%)] font-semibold">
          Base L2 • ERC-20
        </span>
      </motion.div>
    </div>
  </SlideContainer>
);

// Slide 2: The Problem
export const ProblemSlide = () => {
  const stats = [
    { value: '64M', label: 'Nigerian Youth\n(15-35 years)', icon: Users },
    { value: '53%', label: 'Youth\nUnemployment', icon: TrendingUp },
    { value: '0', label: 'Verifiable Digital\nCredentials', icon: Shield },
    { value: '60%', label: 'Financially\nExcluded', icon: Wallet },
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[24px]">
        The <span className="text-[hsl(0,70%,50%)]">Problem</span>
      </motion.h2>
      <motion.p initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
        className="text-[26px] text-[hsl(210,10%,55%)] mb-[64px] max-w-[1200px]">
        Africa's largest youth population faces systemic barriers to employment, skills validation, financial inclusion, and climate participation.
      </motion.p>
      <div className="grid grid-cols-4 gap-[40px]">
        {stats.map((s, i) => (
          <motion.div key={i} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}
            className="flex flex-col items-center text-center p-[40px] rounded-[24px] bg-[hsl(220,22%,10%)] border border-[hsl(220,18%,18%)]">
            <s.icon className="w-[48px] h-[48px] text-[hsl(0,70%,50%)] mb-[24px]" />
            <span className="text-[64px] font-display font-bold text-[hsl(0,0%,95%)]">{s.value}</span>
            <span className="text-[20px] text-[hsl(210,10%,55%)] whitespace-pre-line mt-[8px]">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </SlideContainer>
  );
};

// Slide 3: Our Solution
export const SolutionSlide = () => {
  const pillars = [
    { icon: BookOpen, title: 'Skills', desc: 'Accredited courses with blockchain-verified credentials', color: 'hsl(210,55%,55%)' },
    { icon: Briefcase, title: 'Work', desc: 'Escrow-backed gigs with on-chain payment guarantees', color: 'hsl(145,80%,48%)' },
    { icon: TreePine, title: 'Green', desc: 'GPS-verified tree planting earning carbon credits', color: 'hsl(120,60%,40%)' },
    { icon: Wallet, title: 'Wallet', desc: 'Sigma token economy with marketplace redemption', color: 'hsl(42,90%,54%)' },
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[16px]">
        Our <span className="text-[hsl(145,80%,48%)]">Solution</span>
      </motion.h2>
      <motion.p initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
        className="text-[26px] text-[hsl(210,10%,55%)] mb-[56px]">
        Four integrated pillars unified by the Sigma (Σ) token economy on Base L2.
      </motion.p>
      <div className="grid grid-cols-4 gap-[32px]">
        {pillars.map((p, i) => (
          <motion.div key={i} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}
            className="flex flex-col p-[40px] rounded-[24px] bg-[hsl(220,22%,10%)] border border-[hsl(220,18%,18%)] hover:border-[hsl(145,80%,42%,0.3)] transition-colors">
            <div className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center mb-[28px]"
              style={{ backgroundColor: `${p.color}20` }}>
              <p.icon className="w-[36px] h-[36px]" style={{ color: p.color }} />
            </div>
            <h3 className="text-[32px] font-display font-bold text-[hsl(0,0%,95%)] mb-[12px]">{p.title}</h3>
            <p className="text-[22px] text-[hsl(210,10%,55%)] leading-[1.4]">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </SlideContainer>
  );
};

// Slide 4: How It Works
export const HowItWorksSlide = () => {
  const steps = [
    { icon: BookOpen, label: 'Enroll in\nCourse', color: 'hsl(210,55%,55%)' },
    { icon: CheckCircle, label: 'Earn Credential\nHash', color: 'hsl(145,80%,48%)' },
    { icon: Briefcase, label: 'Get Escrow\nGig', color: 'hsl(42,90%,54%)' },
    { icon: DollarSign, label: 'Escrow\nPayment', color: 'hsl(145,80%,48%)' },
    { icon: TreePine, label: 'Plant & Verify\nTree', color: 'hsl(120,60%,40%)' },
    { icon: Zap, label: 'Earn Sigma\nTokens', color: 'hsl(42,90%,54%)' },
    { icon: Globe, label: 'Spend in\nMarketplace', color: 'hsl(210,55%,55%)' },
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[16px]">
        How It <span className="text-[hsl(145,80%,48%)]">Works</span>
      </motion.h2>
      <motion.p initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
        className="text-[26px] text-[hsl(210,10%,55%)] mb-[72px]">
        A complete youth empowerment journey — from skills to earnings to climate impact.
      </motion.p>
      <div className="flex items-center justify-between gap-[8px]">
        {steps.map((s, i) => (
          <motion.div key={i} initial="hidden" animate="visible" custom={i * 0.5 + 1} variants={fadeUp}
            className="flex items-center gap-[8px]">
            <div className="flex flex-col items-center text-center w-[180px]">
              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center mb-[16px]"
                style={{ backgroundColor: `${s.color}15`, border: `2px solid ${s.color}40` }}>
                <s.icon className="w-[36px] h-[36px]" style={{ color: s.color }} />
              </div>
              <span className="text-[20px] font-display font-semibold text-[hsl(0,0%,95%)] whitespace-pre-line">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-[28px] h-[28px] text-[hsl(220,18%,30%)] shrink-0" />}
          </motion.div>
        ))}
      </div>
    </SlideContainer>
  );
};

// Slide 5: Blockchain Architecture
export const BlockchainSlide = () => {
  const onChain = [
    { icon: Lock, label: 'Credential Hashes (SHA-256)' },
    { icon: Zap, label: 'Sigma ERC-20 Token (Base L2)' },
    { icon: Link2, label: 'Trustless Escrow Contracts' },
    { icon: Leaf, label: 'Carbon Credit Provenance' },
  ];
  const offChain = [
    { icon: Cpu, label: 'Custodial Wallet (AES-GCM)' },
    { icon: Users, label: 'User Profiles & KYC' },
    { icon: BarChart3, label: 'Analytics & Reporting' },
    { icon: Globe, label: 'Course Content & Media' },
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[16px]">
        Blockchain <span className="text-[hsl(145,80%,48%)]">Architecture</span>
      </motion.h2>
      <motion.p initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
        className="text-[26px] text-[hsl(210,10%,55%)] mb-[56px]">
        Purpose-driven blockchain — only what needs trust goes on-chain.
      </motion.p>
      <div className="grid grid-cols-2 gap-[48px]">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="p-[40px] rounded-[24px] bg-[hsl(145,80%,42%,0.06)] border border-[hsl(145,80%,42%,0.2)]">
          <h3 className="text-[32px] font-display font-bold text-[hsl(145,80%,48%)] mb-[32px]">⛓ On-Chain</h3>
          <div className="flex flex-col gap-[24px]">
            {onChain.map((item, i) => (
              <div key={i} className="flex items-center gap-[20px]">
                <item.icon className="w-[32px] h-[32px] text-[hsl(145,80%,48%)]" />
                <span className="text-[24px] text-[hsl(0,0%,90%)]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}
          className="p-[40px] rounded-[24px] bg-[hsl(210,55%,55%,0.06)] border border-[hsl(210,55%,55%,0.2)]">
          <h3 className="text-[32px] font-display font-bold text-[hsl(210,55%,55%)] mb-[32px]">☁ Off-Chain</h3>
          <div className="flex flex-col gap-[24px]">
            {offChain.map((item, i) => (
              <div key={i} className="flex items-center gap-[20px]">
                <item.icon className="w-[32px] h-[32px] text-[hsl(210,55%,55%)]" />
                <span className="text-[24px] text-[hsl(0,0%,90%)]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
};

// Slide 6: Current Status
export const StatusSlide = () => {
  const built = [
    'Progressive Web App (PWA)',
    'Custodial wallet provisioning (AES-GCM)',
    'Credential hashing (SHA-256)',
    'Full database schema & RLS policies',
    'Edge Functions for minting & deployment',
    'Skills, Work, Green, Wallet modules',
  ];
  const next = [
    'Deploy Sigma ERC-20 to Base Sepolia',
    'Activate escrow smart contracts',
    'Migrate to Base mainnet',
    'Carbon credit tokenization',
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[56px]">
        Current <span className="text-[hsl(145,80%,48%)]">Status</span>
      </motion.h2>
      <div className="grid grid-cols-2 gap-[48px]">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="p-[40px] rounded-[24px] bg-[hsl(145,80%,42%,0.06)] border border-[hsl(145,80%,42%,0.2)]">
          <h3 className="text-[28px] font-display font-bold text-[hsl(145,80%,48%)] mb-[28px] flex items-center gap-[12px]">
            <CheckCircle className="w-[28px] h-[28px]" /> Built & Working
          </h3>
          <div className="flex flex-col gap-[20px]">
            {built.map((item, i) => (
              <div key={i} className="flex items-center gap-[16px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[hsl(145,80%,48%)]" />
                <span className="text-[22px] text-[hsl(0,0%,90%)]">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}
          className="p-[40px] rounded-[24px] bg-[hsl(42,90%,54%,0.06)] border border-[hsl(42,90%,54%,0.2)]">
          <h3 className="text-[28px] font-display font-bold text-[hsl(42,90%,54%)] mb-[28px] flex items-center gap-[12px]">
            <Clock className="w-[28px] h-[28px]" /> Next Steps
          </h3>
          <div className="flex flex-col gap-[20px]">
            {next.map((item, i) => (
              <div key={i} className="flex items-center gap-[16px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[hsl(42,90%,54%)]" />
                <span className="text-[22px] text-[hsl(0,0%,90%)]">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
};

// Slide 7: 12-Month Pilot
export const PilotSlide = () => {
  const phases = [
    {
      phase: 'Phase 1', months: 'Months 1-3', color: 'hsl(210,55%,55%)',
      items: ['Deploy Sigma token on Base Sepolia', 'Onboard 2,500 youth across Lagos, Ogun & Ondo', 'Launch 10 accredited courses', 'Auto-provision custodial wallets'],
    },
    {
      phase: 'Phase 2', months: 'Months 4-8', color: 'hsl(145,80%,48%)',
      items: ['100 employer partners with escrow gigs', 'GPS-verified tree planting in 6 communities', '5,000 active users • 10,000 trees', 'Migrate to Base mainnet'],
    },
    {
      phase: 'Phase 3', months: 'Months 9-12', color: 'hsl(42,90%,54%)',
      items: ['Tokenized carbon credit batches', 'Marketplace: airtime & data bundles', 'National Dashboard for impact', '10,000 users • First carbon credit sale'],
    },
  ];
  return (
    <SlideContainer className="bg-gradient-to-br from-[hsl(220,25%,8%)] to-[hsl(220,18%,14%)]">
      <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)] mb-[56px]">
        12-Month <span className="text-[hsl(145,80%,48%)]">Pilot Plan</span>
      </motion.h2>
      <div className="grid grid-cols-3 gap-[36px]">
        {phases.map((p, i) => (
          <motion.div key={i} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}
            className="p-[36px] rounded-[24px] bg-[hsl(220,22%,10%)] border border-[hsl(220,18%,18%)]">
            <div className="text-[18px] font-semibold mb-[8px]" style={{ color: p.color }}>{p.months}</div>
            <h3 className="text-[30px] font-display font-bold text-[hsl(0,0%,95%)] mb-[24px]">{p.phase}</h3>
            <div className="flex flex-col gap-[16px]">
              {p.items.map((item, j) => (
                <div key={j} className="flex items-start gap-[12px]">
                  <div className="w-[8px] h-[8px] rounded-full mt-[10px] shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[20px] text-[hsl(0,0%,85%)] leading-[1.4]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SlideContainer>
  );
};

// Slide 8: Ask & Impact
export const AskSlide = () => {
  const metrics = [
    { value: '10,000', label: 'Youth Onboarded' },
    { value: '25,000+', label: 'Sigma Transactions' },
    { value: '10,000', label: 'Trees Planted' },
    { value: '60%+', label: 'User Retention' },
  ];
  return (
    <SlideContainer className="items-center text-center bg-gradient-to-br from-[hsl(220,25%,8%)] via-[hsl(220,18%,12%)] to-[hsl(220,25%,6%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,hsl(145,80%,42%,0.08),transparent_60%)]" />
      <div className="relative z-10 flex flex-col items-center gap-[40px]">
        <motion.h2 initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="text-[56px] font-display font-bold text-[hsl(0,0%,95%)]">
          The <span className="text-[hsl(42,90%,54%)]">Ask</span>
        </motion.h2>
        <motion.div initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
          className="px-[48px] py-[24px] rounded-[20px] bg-[hsl(42,90%,54%,0.1)] border border-[hsl(42,90%,54%,0.3)]">
          <span className="text-[36px] font-display font-bold text-[hsl(42,90%,54%)]">$85,000 USD</span>
          <span className="text-[24px] text-[hsl(210,10%,55%)] ml-[16px]">Seed Funding</span>
        </motion.div>
        <motion.p initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="text-[24px] text-[hsl(210,10%,55%)] max-w-[800px]">
          12-month pilot across Lagos, Ogun & Ondo states targeting measurable impact across employment, skills, and climate action.
        </motion.p>
        <div className="grid grid-cols-4 gap-[40px] mt-[24px]">
          {metrics.map((m, i) => (
            <motion.div key={i} initial="hidden" animate="visible" custom={i + 1.5} variants={fadeUp}
              className="flex flex-col items-center">
              <span className="text-[48px] font-display font-bold text-[hsl(145,80%,48%)]">{m.value}</span>
              <span className="text-[20px] text-[hsl(210,10%,55%)]">{m.label}</span>
            </motion.div>
          ))}
        </div>
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
          className="mt-[32px] flex flex-col items-center gap-[16px]">
          <YouthWorksLogo size="sm" />
          <span className="text-[20px] text-[hsl(210,10%,45%)]">youthworks.ng • hello@youthworks.ng</span>
        </motion.div>
      </div>
    </SlideContainer>
  );
};

export const slides = [
  TitleSlide,
  ProblemSlide,
  SolutionSlide,
  HowItWorksSlide,
  BlockchainSlide,
  StatusSlide,
  PilotSlide,
  AskSlide,
];

export const slideLabels = [
  'Title',
  'The Problem',
  'Our Solution',
  'How It Works',
  'Blockchain',
  'Current Status',
  '12-Month Pilot',
  'Ask & Impact',
];
