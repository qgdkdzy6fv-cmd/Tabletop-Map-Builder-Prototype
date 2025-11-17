import { Tool, ShapeType, ColorHistoryEntry, SizeCategory } from '../types';
import { shapes } from '../lib/shapes';
import { MousePointer, Square, Eraser, Type, Star, X, DoorClosed, LockKeyhole } from 'lucide-react';
import { SizeSelector } from './SizeSelector';

interface ToolbarProps {
  currentTool: Tool;
  selectedShape: ShapeType | null;
  selectedColor: string;
  selectedText: string;
  selectedSize: SizeCategory;
  colorHistory: ColorHistoryEntry[];
  darkMode: boolean;
  onToolChange: (tool: Tool) => void;
  onShapeSelect: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onColorSelect: (color: string) => void;
  onTextChange: (text: string) => void;
  onSizeChange: (size: SizeCategory) => void;
  onToggleFavorite: (colorId: string, isFavorited: boolean) => void;
  onUnfavorite: (colorId: string) => void;
}

export function Toolbar({
  currentTool,
  selectedShape,
  selectedColor,
  selectedText,
  selectedSize,
  colorHistory,
  darkMode,
  onToolChange,
  onShapeSelect,
  onColorChange,
  onColorSelect,
  onTextChange,
  onSizeChange,
  onToggleFavorite,
  onUnfavorite,
}: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select' },
    { id: 'place' as Tool, icon: Square, label: 'Place Shape' },
    { id: 'text' as Tool, icon: Type, label: 'Place Text' },
    { id: 'erase' as Tool, icon: Eraser, label: 'Erase' },
  ];

  const sortedHistory = [...colorHistory].sort((a, b) => {
    if (a.is_favorited !== b.is_favorited) {
      return b.is_favorited ? 1 : -1;
    }
    return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
  });

  const favoritedColors = sortedHistory.filter((c) => c.is_favorited);
  const recentColors = sortedHistory.filter((c) => !c.is_favorited).slice(0, 15);

  return (
    <div className={`border rounded-lg p-4 space-y-4 transition-colors ${
      darkMode
        ? 'bg-gray-800 border-gray-600'
        : 'bg-white border-gray-300'
    }`}>
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                currentTool === tool.id
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-xs">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {currentTool === 'place' && (
        <>
          <div>
            <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Shapes</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {shapes.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => onShapeSelect(shape.type)}
                  className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${
                    selectedShape === shape.type
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {shape.type === 'door-closed' ? (
                    <DoorClosed className="w-6 h-6 mb-1" />
                  ) : shape.type === 'door-closed-locked' ? (
                    <LockKeyhole className="w-6 h-6 mb-1" />
                  ) : (
                    <span className="text-2xl mb-1">{shape.icon}</span>
                  )}
                  <span className="text-xs">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>

          <SizeSelector
            selectedSize={selectedSize}
            onSizeChange={onSizeChange}
            darkMode={darkMode}
          />
        </>
      )}

      {currentTool === 'text' && (
        <>
          <div>
            <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Text Content</h3>
            <input
              type="text"
              value={selectedText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter text or numbers"
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter letters (A-Z, a-z) and numbers (0-9)</p>
          </div>

          <SizeSelector
            selectedSize={selectedSize}
            onSizeChange={onSizeChange}
            darkMode={darkMode}
          />
        </>
      )}

      {(currentTool === 'place' || currentTool === 'text') && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Color</h3>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className={`w-12 h-12 border-2 rounded cursor-pointer ${
                darkMode ? 'border-gray-600' : 'border-gray-300'
              }`}
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                onColorChange(e.target.value);
              }}
              className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {(currentTool === 'place' || currentTool === 'text') && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Color History</h3>

          {favoritedColors.length > 0 && (
            <div className="mb-3">
              <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Favorites</h4>
              <div className={`flex flex-wrap gap-2 p-2 rounded border ${
                darkMode
                  ? 'bg-amber-900/20 border-amber-700'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                {favoritedColors.map((colorEntry) => (
                  <div
                    key={`fav-${colorEntry.color}-${colorEntry.id}`}
                    className="relative group"
                  >
                    <button
                      onClick={() => onColorSelect(colorEntry.color)}
                      className="w-10 h-10 rounded border-2 border-gray-300 hover:scale-110 hover:shadow-lg transition-all duration-200"
                      style={{ backgroundColor: colorEntry.color }}
                      title={colorEntry.color}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnfavorite(colorEntry.id);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove from favorites"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentColors.length > 0 && (
            <div>
              <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recent</h4>
              <div className={`flex flex-wrap gap-2 p-2 rounded border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {recentColors.map((colorEntry) => (
                  <div
                    key={`recent-${colorEntry.color}-${colorEntry.id}`}
                    className="relative group"
                  >
                    <button
                      onClick={() => onColorSelect(colorEntry.color)}
                      className="w-10 h-10 rounded border-2 border-gray-300 hover:scale-110 hover:shadow-lg transition-all duration-200"
                      style={{ backgroundColor: colorEntry.color }}
                      title={colorEntry.color}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(colorEntry.id, colorEntry.is_favorited);
                      }}
                      className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-600"
                      title="Add to favorites"
                    >
                      <Star className="w-3 h-3" fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {colorHistory.length === 0 && (
            <div className={`text-xs rounded p-3 text-center border ${
              darkMode
                ? 'text-gray-400 bg-gray-700 border-gray-600'
                : 'text-gray-500 bg-gray-50 border-gray-200'
            }`}>
              Select colors to build your history
            </div>
          )}
        </div>
      )}
    </div>
  );
}
