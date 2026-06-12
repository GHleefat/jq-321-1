import { useEffect, useCallback } from 'react';
import { useLyricStore } from '@/store/useLyricStore';
import { useFullscreen } from './useFullscreen';

interface UseKeyboardOptions {
  enabled: boolean;
}

export function useKeyboard({ enabled }: UseKeyboardOptions) {
  const { togglePlay, jumpLine, resetPlay, settings, updateSettings } = useLyricStore();
  const { exitFullscreen, isFullscreen } = useFullscreen();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          jumpLine('prev');
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          jumpLine('next');
          break;

        case 'Escape':
          event.preventDefault();
          if (isFullscreen) {
            exitFullscreen();
          }
          break;

        case 'KeyR':
          event.preventDefault();
          resetPlay();
          break;

        case 'BracketLeft':
          event.preventDefault();
          updateSettings({
            scrollSpeed: Math.max(1, settings.scrollSpeed - 1),
          });
          break;

        case 'BracketRight':
          event.preventDefault();
          updateSettings({
            scrollSpeed: Math.min(10, settings.scrollSpeed + 1),
          });
          break;

        default:
          break;
      }
    },
    [enabled, togglePlay, jumpLine, resetPlay, exitFullscreen, isFullscreen, settings.scrollSpeed, updateSettings]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
