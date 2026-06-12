import { useLyricStore } from '@/store/useLyricStore';
import { calculateScrollSpeed } from '@/utils/speedCalculator';

export function SettingsPanel() {
  const { settings, updateSettings } = useLyricStore();

  const actualSpeed = calculateScrollSpeed(settings.scrollSpeed).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-medium text-gray-200">显示设置</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">滚动速度</label>
            <span className="text-sm text-yellow-400 font-mono">
              {settings.scrollSpeed} ({actualSpeed}x)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={settings.scrollSpeed}
            onChange={(e) => updateSettings({ scrollSpeed: Number(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>慢</span>
            <span>快</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">字体大小</label>
            <span className="text-sm text-yellow-400 font-mono">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="24"
            max="96"
            step="2"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>小</span>
            <span>大</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">行间距</label>
            <span className="text-sm text-yellow-400 font-mono">{settings.lineHeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.2"
            max="2.5"
            step="0.1"
            value={settings.lineHeight}
            onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>紧凑</span>
            <span>宽松</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">高亮颜色</label>
            <div className="flex gap-2">
              {['#FFD700', '#00FF88', '#FF6B6B', '#4ECDC4', '#FFFFFF'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ highlightColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    settings.highlightColor === color
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`高亮颜色 ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">文字颜色</label>
            <div className="flex gap-2">
              {['#E0E0E0', '#A0A0A0', '#808080', '#C0C0C0', '#FFFFFF'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ textColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    settings.textColor === color
                      ? 'border-yellow-500 scale-110'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`文字颜色 ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
