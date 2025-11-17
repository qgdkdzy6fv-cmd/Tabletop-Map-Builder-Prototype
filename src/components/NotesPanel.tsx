import { useState, useEffect } from 'react';
import { MapNote } from '../types';
import { NotesEditor } from './NotesEditor';
import { Save, FolderOpen, X, FileText, ChevronRight } from 'lucide-react';

interface NotesPanelProps {
  notes: MapNote[];
  currentNote: MapNote | null;
  onSaveNote: (name: string, content: MapNote['content'], mapId?: string) => void;
  onLoadNote: (noteId: string) => void;
  onNewNote: () => void;
  darkMode?: boolean;
}

export function NotesPanel({
  notes,
  currentNote,
  onSaveNote,
  onLoadNote,
  onNewNote,
  darkMode = false,
}: NotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [noteName, setNoteName] = useState('');
  const [noteContent, setNoteContent] = useState(currentNote?.content || []);
  const [saveWithMap, setSaveWithMap] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  useEffect(() => {
    if (currentNote) {
      setNoteContent(currentNote.content);
      setNoteName(currentNote.name);
    }
  }, [currentNote]);

  const handleSave = () => {
    if (noteName.trim()) {
      onSaveNote(noteName.trim(), noteContent, saveWithMap ? undefined : undefined);
      setSaveDialogOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
          isOpen
            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
            : darkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Toggle notes panel"
      >
        <FileText className="w-4 h-4" />
        Notes
        {isOpen && <ChevronRight className="w-4 h-4 ml-1" />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-[400px] shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${darkMode ? 'bg-gray-900 border-l-2 border-gray-700' : 'bg-white border-l-2 border-gray-200'}`}
      >
        <div className="h-full flex flex-col">
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Notes Editor
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Close notes panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`flex gap-2 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setLoadDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </button>
            <button
              onClick={() => {
                onNewNote();
                setNoteContent([]);
                setNoteName('');
              }}
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {noteName && (
              <div className={`mb-3 pb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {noteName}
                </h3>
              </div>
            )}
            <NotesEditor content={noteContent} onChange={setNoteContent} darkMode={darkMode} />
          </div>
        </div>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-96 shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Save Note
            </h2>
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="Enter note name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            />
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="saveWithMap"
                checked={saveWithMap}
                onChange={(e) => setSaveWithMap(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="saveWithMap" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Link with current map
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!noteName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-[600px] max-h-[80vh] flex flex-col shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Load Note
              </h2>
              <button
                onClick={() => setLoadDialogOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notes.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No saved notes yet
                </p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        darkMode
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {note.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {note.content.length} blocks | Updated:{' '}
                          {new Date(note.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onLoadNote(note.id);
                          setNoteContent(note.content);
                          setNoteName(note.name);
                          setLoadDialogOpen(false);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}
    </>
  );
}
