import { useState } from 'react';
import { MapNote } from '../types';
import { NotesEditor } from './NotesEditor';
import { Save, FolderOpen, X, FileText } from 'lucide-react';

interface NotesPanelProps {
  notes: MapNote[];
  currentNote: MapNote | null;
  onSaveNote: (name: string, content: MapNote['content'], mapId?: string) => void;
  onLoadNote: (noteId: string) => void;
  onNewNote: () => void;
}

export function NotesPanel({
  notes,
  currentNote,
  onSaveNote,
  onLoadNote,
  onNewNote,
}: NotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [noteName, setNoteName] = useState(currentNote?.name || '');
  const [noteContent, setNoteContent] = useState(currentNote?.content || []);
  const [saveWithMap, setSaveWithMap] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const handleSave = () => {
    if (noteName.trim()) {
      onSaveNote(noteName.trim(), noteContent, saveWithMap ? undefined : undefined);
      setSaveDialogOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Notes
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Notes Editor</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSaveDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
              <button
                onClick={() => setLoadDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                Load Note
              </button>
              <button
                onClick={onNewNote}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
              >
                New Note
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4">
              <NotesEditor content={noteContent} onChange={setNoteContent} />
            </div>
          </div>
        </div>
      )}

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Save Note</h2>
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="Enter note name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
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
              <label htmlFor="saveWithMap" className="text-sm text-gray-700">
                Link with current map
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!noteName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Load Note</h2>
              <button
                onClick={() => setLoadDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved notes yet</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{note.name}</h3>
                        <p className="text-sm text-gray-500">
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
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
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
    </>
  );
}
