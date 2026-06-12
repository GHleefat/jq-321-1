import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Minimize } from 'lucide-react';
import { useLyricStore } from '@/store/useLyricStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useScroll } from '@/hooks/useScroll';
import { useKeyboard } from '@/hooks/useKeyboard';
import { PlayControls } from './PlayControls';
import { ProgressBar } from './ProgressBar';
import { getLineHeight } from '@/utils/lyricParser';
import { calculateScrollSpeed } from '@/utils/speedCalculator';

export function FullscreenPlayer() {
  const { lyrics, settings, playState, updateSettings, lineOffsets, setLineOffsets } =
    useLyricStore();
  const { exitFullscreen, isFullscreen } = useFullscreen();
  const [showControls, setShowControls] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useScroll({ enabled: isFullscreen, viewportHeight });
  useKeyboard({ enabled: isFullscreen });

  const measureLineOffsets = useCallback(() => {
    if (!isFullscreen || lyrics.length === 0) return;

    const offsets: number[] = [];
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < lyrics.length; i++) {
      const el = lineRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        offsets.push(rect.top - containerRect.top);
      } else {
        const singleLineH = getLineHeight(settings.fontSize, settings.lineHeight);
        const spacing = singleLineH * 1.6;
        offsets.push(i * spacing);
      }
    }

    if (offsets.length === lyrics.length) {
      setLineOffsets(offsets);
    }
  }, [isFullscreen, lyrics.length, settings.fontSize, settings.lineHeight, setLineOffsets]);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isFullscreen && lyrics.length > 0) {
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
      }
      measureTimerRef.current = setTimeout(() => {
        measureLineOffsets();
      }, 100);
    }
    return () => {
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
      }
    };
  }, [isFullscreen, lyrics.length, viewportWidth, settings.fontSize, settings.lineHeight, lyrics.map(l => l.text).join('||'), measureLineOffsets]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      if (playState.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [playState.isPlaying]);

  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove);
      handleMouseMove();
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isFullscreen, handleMouseMove]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      const currentSpeed = calculateScrollSpeed(settings.scrollSpeed);
      const newSpeed = Math.max(
        1,
        Math.min(10, settings.scrollSpeed + delta * (currentSpeed > 5 ? -1 : 1)),
      );
      updateSettings({ scrollSpeed: newSpeed });
    },
    [settings.scrollSpeed, updateSettings],
  );

  if (!isFullscreen) return null;

  const topPadding = viewportHeight / 2;
  const bottomPadding = viewportHeight / 2;
  const verticalPadPerLine = settings.fontSize * 0.6;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden cursor-none"
      style={{ backgroundColor: settings.backgroundColor }}
      onWheel={handleWheel}
    >
      <div
        ref={containerRef}
        className="absolute w-full px-8 md:px-16 lg:px-32 transition-transform duration-75"
        style={{
          transform: `translateY(${-playState.scrollTop + topPadding}px)`,
          willChange: 'transform',
        }}
      >
        <div style={{ paddingTop: `${topPadding}px`, paddingBottom: `${bottomPadding}px` }}>
          {lyrics.map((line, index) => {
            const isCurrent = index === playState.currentLineIndex;
            const distance = Math.abs(index - playState.currentLineIndex);
            const opacity = isCurrent ? 1 : Math.max(0.25, 1 - distance * 0.12);

            return (
              <div
                key={line.id}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                id={`lyric-line-${index}`}
                className="text-center transition-all duration-300 select-none break-words whitespace-normal"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                  paddingTop: `${verticalPadPerLine * 0.5}px`,
                  paddingBottom: `${verticalPadPerLine * 0.5}px`,
                  marginBottom: `${verticalPadPerLine * 0.3}px`,
                  color: isCurrent ? settings.highlightColor : settings.textColor,
                  opacity,
                  fontWeight: isCurrent ? 700 : 400,
                  textShadow: isCurrent
                    ? `0 0 24px ${settings.highlightColor}50`
                    : 'none',
                  transform: isCurrent ? 'scale(1.01)' : 'scale(1)',
                  letterSpacing: isCurrent ? '0.02em' : 'normal',
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
        }}
      >
        <div className="p-6 space-y-4 cursor-auto">
          <div className="max-w-4xl mx-auto">
            <ProgressBar />
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-sm text-white/60 font-mono">
              速度: {settings.scrollSpeed}
            </div>

            <PlayControls variant="fullscreen" />

            <button
              onClick={exitFullscreen}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              aria-label="退出全屏"
            >
              <Minimize className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="text-center text-xs text-white/40">
            空格 播放/暂停 · ← → 切换 · [ ] 调速 · ESC 退出 · 滚轮 调节速度
          </div>
        </div>
      </div>

      <button
        onClick={exitFullscreen}
        className={`absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="关闭"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div
        className={`absolute top-6 left-6 text-sm text-white/40 font-mono transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {playState.currentLineIndex + 1} / {lyrics.length}
      </div>
    </div>
  );
}
