# YouthWorks

**Empowering African youth through verified skills, dignified work, and climate action — powered by blockchain.**

YouthWorks is a digital platform designed to address youth unemployment and climate resilience across Africa. It provides young people with a pathway to build verified, portable reputations through skills development, gig-based work, and environmental stewardship — all recorded on-chain via Sigma tokens.

---

## 🎯 Mission

To create an inclusive digital economy where young people can earn, learn, and contribute to climate action — with every achievement verifiably recorded on the blockchain.

Aligned with **UNICEF's Generation Unlimited** initiative and the **UN Sustainable Development Goals** (SDGs 4, 8, 13).

---

## 🏗 Core Pillars

| Pillar | Description |
|--------|-------------|
| **Skills** | Youth complete accredited courses and receive blockchain-verified credentials with Sigma token rewards |
| **Work** | Employers post gigs with escrow-backed payments; youth apply, complete, and get verified |
| **Green** | Tree-planting projects with GPS-verified submissions, survival checks, and carbon credit integration |
| **Wallet** | Custodial blockchain wallet for earning, spending, and redeeming Sigma tokens in the marketplace |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| Blockchain | Ethereum-compatible (ethers.js), Sigma Token (ERC-20) |
| Data Visualization | Recharts |
| PWA | vite-plugin-pwa with offline support |

---

## ✨ Key Features

- **Blockchain-verified credentials** — Every skill completion and work verification is hashed and recorded on-chain
- **Custodial wallets** — Automatic wallet creation for youth with no crypto experience required
- **Escrow-backed gigs** — Milestone-based payments with on-chain escrow for employer trust
- **Tree planting & survival tracking** — GPS-tagged submissions with admin verification and survival bonuses
- **Carbon credit batches** — Aggregated environmental impact converted to tradeable carbon credits
- **Marketplace** — Redeem Sigma tokens for airtime, data bundles, and partner rewards
- **Role-based access** — Youth, Employer, Partner, Admin, and National Admin roles with RLS-enforced security
- **National dashboard** — State-level analytics for program administrators and policy makers
- **PWA support** — Installable on mobile devices for offline-first access

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd youthworks

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## 📁 Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin dashboard tabs
│   │   ├── employer/     # Employer gig management
│   │   ├── ui/           # shadcn/ui primitives
│   │   └── wallet/       # Wallet & investment components
│   ├── contexts/         # React context providers (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Backend client & types
│   ├── lib/              # Utilities, blockchain helpers, constants
│   └── pages/            # Route-level page components
├── supabase/
│   ├── functions/        # Edge functions (wallet, token minting)
│   └── migrations/       # Database schema migrations
└── public/               # Static assets & PWA icons
```

---

## 🔐 Security

- **Row-Level Security (RLS)** enforced on all database tables
- **Role-based access control** via `user_roles` table with `has_role()` security definer function
- **Custodial wallet encryption** for private key storage
- **Edge functions** for sensitive blockchain operations (minting, deployment)

---

## 🌍 Deployment

The application frontend is deployed as a static site. Backend services (database, authentication, edge functions) are managed via the cloud platform and deploy automatically.

---

## 📄 License

This project is developed as part of a youth empowerment initiative. All rights reserved.

---

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.
