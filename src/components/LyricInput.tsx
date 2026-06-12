import { useLyricStore } from '@/store/useLyricStore';

const DEMO_LYRICS = `夜空中最亮的星
能否听清
那仰望的人
心底的孤独和叹息

夜空中最亮的星
能否记起
曾与我同行
消失在风里的身影

我祈祷拥有一颗透明的心灵
和会流泪的眼睛
给我再去相信的勇气
越过谎言去拥抱你

每当我找不到存在的意义
每当我迷失在黑夜里
夜空中最亮的星
请指引我靠近你`;

export function LyricInput() {
  const { rawLyrics, setRawLyrics, lyrics, resetPlay } = useLyricStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawLyrics(e.target.value);
    resetPlay();
  };

  const handleClear = () => {
    setRawLyrics('');
    resetPlay();
  };

  const handleLoadDemo = () => {
    setRawLyrics(DEMO_LYRICS);
    resetPlay();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawLyrics(text);
        resetPlay();
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-200">歌词输入</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePaste}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            粘贴
          </button>
          <button
            onClick={handleLoadDemo}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            示例
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      <textarea
        value={rawLyrics}
        onChange={handleChange}
        placeholder="在此粘贴或输入歌词...&#10;&#10;提示：&#10;- 每行一句歌词&#10;- 空行作为段落分隔&#10;- 支持手动换行"
        className="w-full h-64 p-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-yellow-500/50 transition-colors font-mono text-sm leading-relaxed"
        spellCheck={false}
      />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          共 {lyrics.length} 句歌词
        </span>
        <span>
          {rawLyrics.length} 字符
        </span>
      </div>
    </div>
  );
}
