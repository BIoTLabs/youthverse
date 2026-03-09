import { useState, useEffect, useCallback, useRef } from 'react';
import { slides } from '@/components/pitch/PitchSlides';
import { PitchControls } from '@/components/pitch/PitchControls';
import { AnimatePresence, motion } from 'framer-motion';

const PitchDeckPage = () => {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight - (isFullscreen ? 0 : 56);
    setScale(Math.min(w / 1920, h / 1080));
  }, [isFullscreen]);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen?.();
      if (e.key === 'f' || e.key === 'F5') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const handleDownload = () => {
    // Show all slides for print, then trigger print
    const style = document.createElement('style');
    style.id = 'pitch-print';
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        .pitch-print-container, .pitch-print-container * { visibility: visible !important; }
        .pitch-print-container { position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; }
        .pitch-print-slide { width: 1920px; height: 1080px; transform: scale(0.52); transform-origin: top left; page-break-after: always; overflow: hidden; }
        .pitch-controls { display: none !important; }
        @page { size: landscape; margin: 0; }
      }
    `;
    document.head.appendChild(style);

    // Create print container with all slides
    const printDiv = document.createElement('div');
    printDiv.className = 'pitch-print-container';
    printDiv.id = 'pitch-print-container';
    document.body.appendChild(printDiv);

    // Render to it using React
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(printDiv);
      const AllSlides = () => (
        <>
          {slides.map((Slide, i) => (
            <div key={i} className="pitch-print-slide"><Slide /></div>
          ))}
        </>
      );
      root.render(<AllSlides />);
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          root.unmount();
          printDiv.remove();
          style.remove();
        }, 500);
      }, 300);
    });
  };

  const CurrentSlide = slides[current];

  return (
    <div ref={containerRef}
      className="h-screen w-screen bg-[hsl(220,25%,6%)] overflow-hidden relative flex items-center justify-center">
      <div
        className="absolute"
        style={{
          width: 1920,
          height: 1080,
          left: '50%',
          top: '50%',
          marginLeft: -960,
          marginTop: isFullscreen ? -540 : -540 + 28,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentSlide />
          </motion.div>
        </AnimatePresence>
      </div>

      <PitchControls
        current={current}
        total={slides.length}
        isFullscreen={isFullscreen}
        onPrev={prev}
        onNext={next}
        onGoTo={setCurrent}
        onToggleFullscreen={toggleFullscreen}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default PitchDeckPage;
