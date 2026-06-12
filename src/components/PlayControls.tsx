import { Play, Pause, SkipBack, SkipForward, Maximize, RotateCcw } from 'lucide-react';
import { useLyricStore } from '@/store/useLyricStore';
import { useFullscreen } from '@/hooks/useFullscreen';

interface PlayControlsProps {
  variant?: 'default' | 'fullscreen';
}

export function PlayControls({ variant = 'default' }: PlayControlsProps) {
  const { lyrics, playState, togglePlay, jumpLine, resetPlay } = useLyricStore();
  const { enterFullscreen } = useFullscreen();

  const hasLyrics = lyrics.length > 0;
  const isAtStart = playState.currentLineIndex === 0;
  const isAtEnd = playState.currentLineIndex >= lyrics.length - 1;

  const handleStartFullscreen = () => {
    if (!playState.isPlaying && hasLyrics) {
      togglePlay();
    }
    enterFullscreen();
  };

  if (variant === 'fullscreen') {
    return (
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => jumpLine('prev')}
          disabled={isAtStart}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="上一句"
        >
          <SkipBack className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={togglePlay}
          disabled={!hasLyrics}
          className="p-5 rounded-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30"
          aria-label={playState.isPlaying ? '暂停' : '播放'}
        >
          {playState.isPlaying ? (
            <Pause className="w-8 h-8 text-black" />
          ) : (
            <Play className="w-8 h-8 text-black ml-0.5" />
          )}
        </button>

        <button
          onClick={() => jumpLine('next')}
          disabled={isAtEnd}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="下一句"
        >
          <SkipForward className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-gray-200">播放控制</h2>

      <div className="flex items-center justify-center gap-3 py-4">
        <button
          onClick={() => jumpLine('prev')}
          disabled={!hasLyrics || isAtStart}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="上一句"
        >
          <SkipBack className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={togglePlay}
          disabled={!hasLyrics}
          className="p-4 rounded-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={playState.isPlaying ? '暂停' : '播放'}
        >
          {playState.isPlaying ? (
            <Pause className="w-6 h-6 text-black" />
          ) : (
            <Play className="w-6 h-6 text-black ml-0.5" />
          )}
        </button>

        <button
          onClick={() => jumpLine('next')}
          disabled={!hasLyrics || isAtEnd}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="下一句"
        >
          <SkipForward className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={resetPlay}
          disabled={!hasLyrics}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="重置"
        >
          <RotateCcw className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <button
        onClick={handleStartFullscreen}
        disabled={!hasLyrics}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
      >
        <Maximize className="w-5 h-5" />
        全屏播放
      </button>

      <div className="text-xs text-gray-500 text-center space-y-1 pt-2">
        <p>快捷键：空格 播放/暂停</p>
        <p>← → 或 ↑ ↓ 切换句子</p>
        <p>[ ] 调节速度，R 重置</p>
      </div>
    </div>
  );
}
