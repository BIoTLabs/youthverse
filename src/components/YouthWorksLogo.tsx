import { cn } from '@/lib/utils';

interface YouthWorksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const YouthWorksLogo = ({ className, size = 'md', showText = true }: YouthWorksLogoProps) => {
  const sizes = {
    sm: { icon: 28, text: 'text-base', gap: 'gap-2' },
    md: { icon: 40, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 56, text: 'text-3xl', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Rounded square bg */}
        <rect width="56" height="56" rx="14" className="fill-primary" />
        
        {/* Abstract Y mark */}
        <path
          d="M18 16L28 30L38 16"
          className="stroke-primary-foreground"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="28" y1="30" x2="28" y2="42"
          className="stroke-primary-foreground"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        
        {/* Electric accent dot */}
        <circle cx="44" cy="12" r="4" fill="hsl(145 90% 55%)" opacity="0.9" />
        
        {/* Chain link accent */}
        <g className="stroke-primary-foreground" strokeWidth="2" fill="none" opacity="0.4">
          <rect x="10" y="40" width="8" height="5" rx="2.5" transform="rotate(-20 14 42.5)" />
          <rect x="16" y="38" width="8" height="5" rx="2.5" transform="rotate(-20 20 40.5)" />
        </g>
      </svg>
      {showText && (
        <span className={cn('font-display font-bold tracking-tight text-foreground', s.text)}>
          Youth<span className="text-primary">Works</span>
        </span>
      )}
    </div>
  );
};
