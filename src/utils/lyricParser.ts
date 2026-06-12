import type { LyricLine } from '@/types';

export function parseLyrics(rawText: string): LyricLine[] {
  if (!rawText.trim()) {
    return [];
  }

  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((text, index) => ({
    id: `line-${index}-${Date.now()}`,
    text,
    index,
  }));
}

export function getLineHeight(fontSize: number, lineHeightRatio: number): number {
  return fontSize * lineHeightRatio;
}

export function calculateTotalScrollHeight(
  lineCount: number,
  fontSize: number,
  lineHeightRatio: number
): number {
  const lineHeight = getLineHeight(fontSize, lineHeightRatio);
  return lineCount * lineHeight;
}

export function calculateCurrentLineIndex(
  scrollTop: number,
  fontSize: number,
  lineHeightRatio: number,
  viewportHeight: number
): number {
  const lineHeight = getLineHeight(fontSize, lineHeightRatio);
  const centerOffset = viewportHeight / 2;
  const adjustedScroll = scrollTop + centerOffset;
  return Math.max(0, Math.floor(adjustedScroll / lineHeight));
}
