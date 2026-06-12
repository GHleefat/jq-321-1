import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LyricLine, PlayState, UserSettings, AppState, Direction } from '@/types';
import { parseLyrics, getLineHeight } from '@/utils/lyricParser';
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

function findLineIndexByOffset(offsets: number[], scrollTop: number): number {
  if (offsets.length === 0) return 0;
  if (scrollTop <= offsets[0]) return 0;
  for (let i = offsets.length - 1; i >= 0; i--) {
    if (scrollTop >= offsets[i]) return i;
  }
  return 0;
}

interface LyricStore extends AppState {
  setRawLyrics: (text: string) => void;
  setPlayState: (state: Partial<PlayState>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  togglePlay: () => void;
  jumpToLine: (index: number) => void;
  jumpLine: (direction: Direction) => void;
  resetPlay: () => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setLineOffsets: (offsets: number[]) => void;
  updateScrollTop: (
    scrollTop: number,
    viewportHeight: number,
    fontSize: number,
    lineHeight: number
  ) => void;
}

export const useLyricStore = create<LyricStore>()(
  persist(
    (set, get) => ({
      lyrics: [],
      rawLyrics: '',
      playState: defaultPlayState,
      settings: defaultSettings,
      isFullscreen: false,
      lineOffsets: [],

      setRawLyrics: (text: string) => {
        const lyrics = parseLyrics(text);
        set({ rawLyrics: text, lyrics, lineOffsets: [] });
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

      setLineOffsets: (offsets: number[]) => {
        set({ lineOffsets: offsets });
      },

      jumpToLine: (index: number) => {
        const { lyrics, lineOffsets } = get();
        if (lyrics.length === 0) return;
        const clampedIndex = clamp(index, 0, lyrics.length - 1);

        let scrollTop: number;
        if (lineOffsets.length === lyrics.length) {
          scrollTop = lineOffsets[clampedIndex];
        } else {
          const { settings } = get();
          const lineH = settings.fontSize * settings.lineHeight;
          scrollTop = clampedIndex * lineH;
        }

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
        const { lyrics, lineOffsets } = get();
        if (lyrics.length === 0) return;

        const centerOffset = viewportHeight / 2;
        const adjustedScroll = scrollTop;

        let currentLineIndex: number;
        let totalHeight: number;

        if (lineOffsets.length === lyrics.length) {
          currentLineIndex = findLineIndexByOffset(lineOffsets, adjustedScroll + centerOffset);
          currentLineIndex = clamp(currentLineIndex, 0, lyrics.length - 1);
          totalHeight =
            lineOffsets[lineOffsets.length - 1] + getLineHeight(fontSize, lineHeightRatio);
        } else {
          const lineHeight = fontSize * lineHeightRatio;
          currentLineIndex = Math.max(
            0,
            Math.min(lyrics.length - 1, Math.floor((adjustedScroll + centerOffset) / lineHeight))
          );
          totalHeight = lyrics.length * lineHeight;
        }

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
