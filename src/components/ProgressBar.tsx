import { useLyricStore } from '@/store/useLyricStore';
import { formatProgress } from '@/utils/speedCalculator';

export function ProgressBar() {
  const { playState, lyrics, jumpToLine } = useLyricStore();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lyrics.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const targetIndex = Math.round(percentage * (lyrics.length - 1));
    jumpToLine(targetIndex);
  };

  const progressPercentage = lyrics.length > 0
    ? (playState.currentLineIndex / (lyrics.length - 1)) * 100
    : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>第 {playState.currentLineIndex + 1} / {lyrics.length} 句</span>
        <span>{formatProgress(playState.currentLineIndex + 1, lyrics.length)}</span>
      </div>
      <div
        className="h-1.5 bg-gray-800 rounded-full cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
