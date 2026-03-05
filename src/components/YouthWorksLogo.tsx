import { cn } from '@/lib/utils';

interface YouthWorksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const YouthWorksLogo = ({ className, size = 'md', showText = true }: YouthWorksLogoProps) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-2xl' },
    lg: { icon: 64, text: 'text-4xl' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background circle */}
        <circle cx="32" cy="32" r="32" className="fill-primary" />

        {/* Tree trunk */}
        <rect x="29" y="36" width="6" height="14" rx="2" className="fill-primary-foreground" opacity="0.9" />

        {/* Tree canopy - layered circles */}
        <circle cx="32" cy="26" r="11" className="fill-primary-foreground" opacity="0.95" />
        <circle cx="25" cy="30" r="7" className="fill-primary-foreground" opacity="0.85" />
        <circle cx="39" cy="30" r="7" className="fill-primary-foreground" opacity="0.85" />
        <circle cx="32" cy="20" r="7" className="fill-primary-foreground" opacity="0.9" />

        {/* Chain links - representing blockchain */}
        <g className="stroke-secondary" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <ellipse cx="16" cy="48" rx="5" ry="3.5" transform="rotate(-30 16 48)" />
          <ellipse cx="24" cy="44" rx="5" ry="3.5" transform="rotate(-30 24 44)" />
        </g>

        {/* Zlto sparkle */}
        <circle cx="48" cy="16" r="3" className="fill-secondary" />
        <line x1="48" y1="10" x2="48" y2="12" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="20" x2="48" y2="22" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="16" x2="44" y2="16" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="16" x2="54" y2="16" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={cn('font-display font-bold text-foreground', s.text)}>
          Youth<span className="text-primary">Works</span>
        </span>
      )}
    </div>
  );
};
