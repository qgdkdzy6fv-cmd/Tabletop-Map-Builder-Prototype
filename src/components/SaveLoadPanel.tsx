import { useState } from 'react';
import { Map } from '../types';
import { Save, FolderOpen, Trash2, X } from 'lucide-react';

interface SaveLoadPanelProps {
  maps: Map[];
  currentMapId: string | null;
  currentMapName: string;
  onSave: (name: string) => void;
  onLoad: (mapId: string) => void;
  onDelete: (mapId: string) => void;
  onNewMap: () => void;
}

export function SaveLoadPanel({
  maps,
  currentMapId,
  currentMapName,
  onSave,
  onLoad,
  onDelete,
  onNewMap,
}: SaveLoadPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [mapName, setMapName] = useState(currentMapName);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSave = () => {
    if (mapName.trim()) {
      onSave(mapName.trim());
      setSaveDialogOpen(false);
    }
  };

  const handleDelete = (mapId: string) => {
    if (deleteConfirmId === mapId) {
      onDelete(mapId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(mapId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setSaveDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Map
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          Load Map
        </button>
        <button
          onClick={onNewMap}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          New Map
        </button>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Save Map</h2>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter map name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!mapName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Load Map</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {maps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved maps yet</p>
              ) : (
                <div className="space-y-2">
                  {maps.map((map) => (
                    <div
                      key={map.id}
                      className={`flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors ${
                        currentMapId === map.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{map.name}</h3>
                        <p className="text-sm text-gray-500">
                          {map.grid_width} × {map.grid_height} | Updated:{' '}
                          {new Date(map.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onLoad(map.id);
                            setIsOpen(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(map.id)}
                          className={`px-3 py-1 rounded transition-colors text-sm ${
                            deleteConfirmId === map.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {deleteConfirmId === map.id ? (
                            'Confirm?'
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
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
