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
  const { lyrics, settings, playState, updateSettings } = useLyricStore();
  const { exitFullscreen, isFullscreen } = useFullscreen();
  const [showControls, setShowControls] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useScroll({ enabled: isFullscreen, viewportHeight });
  useKeyboard({ enabled: isFullscreen });

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        Math.min(10, settings.scrollSpeed + delta * (currentSpeed > 5 ? -1 : 1))
      );
      updateSettings({ scrollSpeed: newSpeed });
    },
    [settings.scrollSpeed, updateSettings]
  );

  if (!isFullscreen) return null;

  const lineHeight = getLineHeight(settings.fontSize, settings.lineHeight);
  const topPadding = viewportHeight / 2;
  const bottomPadding = viewportHeight / 2;
  const totalHeight = lyrics.length * lineHeight + topPadding + bottomPadding;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden cursor-none"
      style={{ backgroundColor: settings.backgroundColor }}
      onWheel={handleWheel}
    >
      <div
        className="absolute w-full px-8 md:px-16 lg:px-32 transition-transform duration-75"
        style={{
          transform: `translateY(${-playState.scrollTop + topPadding}px)`,
          willChange: 'transform',
        }}
      >
        <div style={{ height: `${totalHeight}px` }}>
          {lyrics.map((line, index) => {
            const isCurrent = index === playState.currentLineIndex;
            const distance = Math.abs(index - playState.currentLineIndex);
            const opacity = isCurrent ? 1 : Math.max(0.3, 1 - distance * 0.15);

            return (
              <div
                key={line.id}
                className="text-center transition-all duration-300 select-none"
                style={{
                  height: `${lineHeight}px`,
                  lineHeight: `${lineHeight}px`,
                  fontSize: `${settings.fontSize}px`,
                  color: isCurrent ? settings.highlightColor : settings.textColor,
                  opacity,
                  fontWeight: isCurrent ? 700 : 400,
                  textShadow: isCurrent
                    ? `0 0 20px ${settings.highlightColor}40`
                    : 'none',
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
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
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
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
