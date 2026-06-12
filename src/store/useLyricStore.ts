import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LyricLine, PlayState, UserSettings, AppState, Direction } from '@/types';
import { parseLyrics } from '@/utils/lyricParser';
import { clamp } from '@/utils/speedCalculator';

const defaultSettings: UserSettings = {
  scrollSpeed: 5,
  fontSize: 48,
  lineHeight: 1.8,
  highlightColor: '#FFD700',
  textColor: '#E0E0E0',
  backgroundColor: '#000000',
};

const defaultPlayState: PlayState = {
  isPlaying: false,
  currentLineIndex: 0,
  progress: 0,
  scrollTop: 0,
};

interface LyricStore extends AppState {
  setRawLyrics: (text: string) => void;
  setPlayState: (state: Partial<PlayState>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  togglePlay: () => void;
  jumpToLine: (index: number) => void;
  jumpLine: (direction: Direction) => void;
  resetPlay: () => void;
  setFullscreen: (isFullscreen: boolean) => void;
  updateScrollTop: (scrollTop: number, viewportHeight: number, fontSize: number, lineHeight: number) => void;
}

export const useLyricStore = create<LyricStore>()(
  persist(
    (set, get) => ({
      lyrics: [],
      rawLyrics: '',
      playState: defaultPlayState,
      settings: defaultSettings,
      isFullscreen: false,

      setRawLyrics: (text: string) => {
        const lyrics = parseLyrics(text);
        set({ rawLyrics: text, lyrics });
      },

      setPlayState: (state: Partial<PlayState>) => {
        set((prev) => ({
          playState: { ...prev.playState, ...state },
        }));
      },

      updateSettings: (settings: Partial<UserSettings>) => {
        set((prev) => ({
          settings: { ...prev.settings, ...settings },
        }));
      },

      togglePlay: () => {
        const { lyrics, playState } = get();
        if (lyrics.length === 0) return;
        set((prev) => ({
          playState: {
            ...prev.playState,
            isPlaying: !prev.playState.isPlaying,
          },
        }));
      },

      jumpToLine: (index: number) => {
        const { lyrics, settings } = get();
        if (lyrics.length === 0) return;
        const clampedIndex = clamp(index, 0, lyrics.length - 1);
        const lineHeight = settings.fontSize * settings.lineHeight;
        const scrollTop = clampedIndex * lineHeight;
        const progress = lyrics.length > 0 ? clampedIndex / lyrics.length : 0;

        set((prev) => ({
          playState: {
            ...prev.playState,
            currentLineIndex: clampedIndex,
            scrollTop,
            progress,
          },
        }));
      },

      jumpLine: (direction: Direction) => {
        const { playState } = get();
        const delta = direction === 'next' ? 1 : -1;
        get().jumpToLine(playState.currentLineIndex + delta);
      },

      resetPlay: () => {
        set({
          playState: { ...defaultPlayState },
        });
      },

      setFullscreen: (isFullscreen: boolean) => {
        set({ isFullscreen });
      },

      updateScrollTop: (
        scrollTop: number,
        viewportHeight: number,
        fontSize: number,
        lineHeightRatio: number
      ) => {
        const { lyrics } = get();
        if (lyrics.length === 0) return;

        const lineHeight = fontSize * lineHeightRatio;
        const centerOffset = viewportHeight / 2;
        const adjustedScroll = scrollTop + centerOffset;
        const currentLineIndex = Math.max(
          0,
          Math.min(lyrics.length - 1, Math.floor(adjustedScroll / lineHeight))
        );
        const totalHeight = lyrics.length * lineHeight;
        const progress = totalHeight > 0 ? scrollTop / totalHeight : 0;

        set((prev) => ({
          playState: {
            ...prev.playState,
            scrollTop,
            currentLineIndex,
            progress: clamp(progress, 0, 1),
          },
        }));
      },
    }),
    {
      name: 'lyric-prompter-storage',
      partialize: (state) => ({
        settings: state.settings,
        rawLyrics: state.rawLyrics,
      }),
    }
  )
);
