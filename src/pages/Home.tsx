import { Music } from "lucide-react";
import { LyricInput } from "@/components/LyricInput";
import { PlayControls } from "@/components/PlayControls";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ProgressBar } from "@/components/ProgressBar";
import { FullscreenPlayer } from "@/components/FullscreenPlayer";
import { useLyricStore } from "@/store/useLyricStore";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useKeyboard } from "@/hooks/useKeyboard";

export default function Home() {
  const { lyrics, settings, playState } = useLyricStore();
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
              <p className="text-xs text-gray-500">
                全屏滚动 · 可调速 · 护眼黑底
              </p>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">
                    歌词预览
                  </h3>
                  <span className="text-xs text-gray-600 font-mono">
                    {settings.fontSize}px · {settings.lineHeight}行高 ·{" "}
                    {lyrics.length}句
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar space-y-0">
                  {lyrics.map((line, index) => {
                    const isCurrent = index === playState.currentLineIndex;
                    const distance = Math.abs(
                      index - playState.currentLineIndex,
                    );
                    const previewOpacity = isCurrent
                      ? 1
                      : Math.max(0.35, 1 - distance * 0.08);
                    const previewFontSize = Math.min(
                      settings.fontSize * 0.32,
                      18,
                    );
                    const verticalPad = previewFontSize * 0.55;

                    return (
                      <div
                        key={line.id}
                        onClick={() => {
                          if (lyrics.length > 0) {
                            const store = useLyricStore.getState();
                            store.jumpToLine(index);
                          }
                        }}
                        className={`px-3 rounded-lg transition-all duration-200 cursor-pointer break-words whitespace-normal ${
                          isCurrent ? "bg-yellow-500/8" : "hover:bg-gray-900/70"
                        }`}
                        style={{
                          fontSize: `${previewFontSize}px`,
                          lineHeight: settings.lineHeight,
                          paddingTop: `${verticalPad * 0.45}px`,
                          paddingBottom: `${verticalPad * 0.45}px`,
                          marginBottom: `${verticalPad * 0.25}px`,
                          color: isCurrent
                            ? settings.highlightColor
                            : settings.textColor,
                          fontWeight: isCurrent ? 600 : 400,
                          opacity: previewOpacity,
                          textShadow: isCurrent
                            ? `0 0 8px ${settings.highlightColor}40`
                            : "none",
                        }}
                      >
                        <span
                          className="mr-3 font-mono inline-block align-middle"
                          style={{
                            opacity: 0.4,
                            fontSize: `${Math.max(previewFontSize * 0.55, 10)}px`,
                            color: "#555555",
                            width: `${String(lyrics.length).length + 1}ch`,
                            userSelect: "none",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {line.text}
                      </div>
                    );
                  })}
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
              快捷键：
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">
                空格
              </kbd>{" "}
              播放/暂停 ·{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">←</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-xs">→</kbd>{" "}
              切换句子
            </p>
          </div>
        </div>
      </footer>

      <FullscreenPlayer />
    </div>
  );
}
