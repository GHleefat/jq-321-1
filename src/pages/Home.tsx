import { Music } from 'lucide-react';
import { LyricInput } from '@/components/LyricInput';
import { PlayControls } from '@/components/PlayControls';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ProgressBar } from '@/components/ProgressBar';
import { FullscreenPlayer } from '@/components/FullscreenPlayer';
import { useLyricStore } from '@/store/useLyricStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useKeyboard } from '@/hooks/useKeyboard';

export default function Home() {
  const { lyrics } = useLyricStore();
  const { isFullscreen } = useFullscreen();

  useKeyboard({ enabled: !isFullscreen && lyrics.length > 0 });

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Music className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">歌词提词器</h1>
              <p className="text-xs text-gray-500">全屏滚动 · 可调速 · 护眼黑底</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <LyricInput />

            {lyrics.length > 0 && (
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">歌词预览</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {lyrics.map((line, index) => (
                    <div
                      key={line.id}
                      className="text-sm text-gray-400 py-1 px-3 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
                    >
                      <span className="text-gray-600 mr-3 font-mono text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
              <PlayControls />
            </div>

            {lyrics.length > 0 && (
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                <ProgressBar />
              </div>
            )}

            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© 2024 歌词提词器 · 专为歌手和音乐爱好者设计</p>
            <p>
              快捷键：<kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">空格</kbd> 播放/暂停 ·{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">→</kbd> 切换句子
            </p>
          </div>
        </div>
      </footer>

      <FullscreenPlayer />
    </div>
  );
}
