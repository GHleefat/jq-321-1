import { useEffect, useRef, useCallback } from 'react';
import { useLyricStore } from '@/store/useLyricStore';
import { calculateScrollSpeed } from '@/utils/speedCalculator';
import { calculateTotalScrollHeight, getLineHeight } from '@/utils/lyricParser';

interface UseScrollOptions {
  enabled: boolean;
  viewportHeight: number;
}

export function useScroll({ enabled, viewportHeight }: UseScrollOptions) {
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const { lyrics, settings, playState, updateScrollTop, setPlayState, lineOffsets } = useLyricStore();

  const scrollContent = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const speed = calculateScrollSpeed(settings.scrollSpeed);
      const deltaScroll = speed * deltaTime * 60;

      let totalHeight: number;
      if (lineOffsets.length === lyrics.length && lyrics.length > 0) {
        const lastLineHeight = getLineHeight(settings.fontSize, settings.lineHeight) * 1.5;
        totalHeight = lineOffsets[lineOffsets.length - 1] + lastLineHeight;
      } else {
        totalHeight = calculateTotalScrollHeight(
          lyrics.length,
          settings.fontSize,
          settings.lineHeight
        );
      }
      const maxScroll = Math.max(0, totalHeight - viewportHeight / 2);

      let newScrollTop = playState.scrollTop + deltaScroll;

      if (newScrollTop >= maxScroll) {
        newScrollTop = maxScroll;
        setPlayState({ isPlaying: false });
      }

      updateScrollTop(newScrollTop, viewportHeight, settings.fontSize, settings.lineHeight);

      if (playState.isPlaying && enabled) {
        animationRef.current = requestAnimationFrame(scrollContent);
      }
    },
    [
      enabled,
      lyrics.length,
      lineOffsets,
      playState.isPlaying,
      playState.scrollTop,
      settings,
      updateScrollTop,
      setPlayState,
      viewportHeight,
    ]
  );

  useEffect(() => {
    if (enabled && playState.isPlaying && lyrics.length > 0) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(scrollContent);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [enabled, playState.isPlaying, lyrics.length, scrollContent]);

  const stopScroll = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  return { stopScroll };
}
