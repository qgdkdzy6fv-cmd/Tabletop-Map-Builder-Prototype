import { useState } from 'react';
import { NoteBlock } from '../types';
import { Type, Heading1, Heading2, List, Trash2 } from 'lucide-react';

interface NotesEditorProps {
  content: NoteBlock[];
  onChange: (content: NoteBlock[]) => void;
  darkMode?: boolean;
}

export function NotesEditor({ content, onChange, darkMode = false }: NotesEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const addBlock = (type: NoteBlock['type']) => {
    const newBlock: NoteBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      fontFamily: 'Arial',
      color: darkMode ? '#ffffff' : '#000000',
    };
    onChange([...content, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<NoteBlock>) => {
    onChange(
      content.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const deleteBlock = (id: string) => {
    onChange(content.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = content.findIndex((block) => block.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === content.length - 1)
    ) {
      return;
    }

    const newContent = [...content];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    onChange(newContent);
  };

  const getBlockStyle = (block: NoteBlock): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: block.fontFamily || 'Arial',
      color: block.color || '#000000',
    };

    switch (block.type) {
      case 'title':
        return { ...baseStyle, fontSize: '2rem', fontWeight: 'bold' };
      case 'header':
        return { ...baseStyle, fontSize: '1.5rem', fontWeight: '600' };
      case 'body':
        return { ...baseStyle, fontSize: '1rem' };
      case 'bullet':
        return { ...baseStyle, fontSize: '1rem' };
      default:
        return baseStyle;
    }
  };

  const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => addBlock('title')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Heading1 className="w-4 h-4" />
          Title
        </button>
        <button
          onClick={() => addBlock('header')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Heading2 className="w-4 h-4" />
          Header
        </button>
        <button
          onClick={() => addBlock('body')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Type className="w-4 h-4" />
          Body
        </button>
        <button
          onClick={() => addBlock('bullet')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          Bullet
        </button>
      </div>

      <div className="space-y-3">
        {content.map((block) => (
          <div
            key={block.id}
            className={`border rounded-lg p-3 transition-colors ${
              selectedBlockId === block.id
                ? darkMode
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-blue-500 bg-blue-50'
                : darkMode
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-300'
            }`}
            onClick={() => setSelectedBlockId(block.id)}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                {block.type === 'bullet' ? (
                  <div className="flex items-start gap-2">
                    <span className="mt-2">•</span>
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="Enter text..."
                      className={`flex-1 px-2 py-1 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                          : 'border-gray-300'
                      }`}
                      rows={2}
                      style={getBlockStyle(block)}
                    />
                  </div>
                ) : (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Enter text..."
                    className={`w-full px-2 py-1 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                        : 'border-gray-300'
                    }`}
                    rows={block.type === 'title' ? 1 : 2}
                    style={getBlockStyle(block)}
                  />
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'up');
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'down');
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(block.id);
                  }}
                  className={`px-2 py-1 rounded ${
                    darkMode
                      ? 'bg-red-900/50 hover:bg-red-900/70 text-red-400'
                      : 'bg-red-100 hover:bg-red-200 text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedBlockId === block.id && (
              <div className={`flex gap-2 items-center pt-2 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <select
                  value={block.fontFamily || 'Arial'}
                  onChange={(e) => updateBlock(block.id, { fontFamily: e.target.value })}
                  className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'border-gray-300'
                  }`}
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
                <input
                  type="color"
                  value={block.color || '#000000'}
                  onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                  className={`w-8 h-8 border rounded cursor-pointer ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {content.length === 0 && (
        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Click a button above to add text blocks to your notes
        </p>
      )}
    </div>
  );
}
