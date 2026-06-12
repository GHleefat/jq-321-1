export interface LyricLine {
  id: string;
  text: string;
  index: number;
}

export interface PlayState {
  isPlaying: boolean;
  currentLineIndex: number;
  progress: number;
  scrollTop: number;
}

export interface UserSettings {
  scrollSpeed: number;
  fontSize: number;
  lineHeight: number;
  highlightColor: string;
  textColor: string;
  backgroundColor: string;
}

export interface AppState {
  lyrics: LyricLine[];
  rawLyrics: string;
  playState: PlayState;
  settings: UserSettings;
  isFullscreen: boolean;
  lineOffsets: number[];
}

export type Direction = "prev" | "next";
