import { ChevronLeft, ChevronRight, Maximize, Minimize, Download } from 'lucide-react';
import { slideLabels } from './PitchSlides';

interface PitchControlsProps {
  current: number;
  total: number;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
}

export const PitchControls = ({
  current, total, isFullscreen, onPrev, onNext, onGoTo, onToggleFullscreen, onDownload,
}: PitchControlsProps) => (
  <div className="pitch-controls fixed bottom-0 left-0 right-0 z-50 bg-[hsl(220,25%,8%,0.95)] backdrop-blur-xl border-t border-[hsl(220,18%,18%)] py-3 px-6 flex items-center justify-between print:hidden">
    <div className="flex items-center gap-2">
      {slideLabels.map((label, i) => (
        <button
          key={i}
          onClick={() => onGoTo(i)}
          className={`h-2 rounded-full transition-all ${
            i === current ? 'w-8 bg-[hsl(145,80%,48%)]' : 'w-2 bg-[hsl(220,18%,30%)] hover:bg-[hsl(220,18%,40%)]'
          }`}
          title={label}
        />
      ))}
    </div>
    <div className="flex items-center gap-4">
      <span className="text-sm text-[hsl(210,10%,55%)] font-mono">
        {current + 1} / {total}
      </span>
      <button onClick={onPrev} disabled={current === 0}
        className="p-2 rounded-lg text-[hsl(0,0%,90%)] hover:bg-[hsl(220,18%,16%)] disabled:opacity-30 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={onNext} disabled={current === total - 1}
        className="p-2 rounded-lg text-[hsl(0,0%,90%)] hover:bg-[hsl(220,18%,16%)] disabled:opacity-30 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
      <button onClick={onToggleFullscreen}
        className="p-2 rounded-lg text-[hsl(0,0%,90%)] hover:bg-[hsl(220,18%,16%)] transition-colors">
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
      <button onClick={onDownload}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(145,80%,42%)] text-[hsl(220,25%,6%)] font-semibold text-sm hover:bg-[hsl(145,80%,48%)] transition-colors">
        <Download className="w-4 h-4" /> PDF
      </button>
    </div>
  </div>
);
