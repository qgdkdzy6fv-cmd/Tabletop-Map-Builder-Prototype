import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { GridCanvas } from './components/GridCanvas';
import { Toolbar } from './components/Toolbar';
import { SaveLoadPanel } from './components/SaveLoadPanel';
import { NotesPanel } from './components/NotesPanel';
import { ExportDialog } from './components/ExportDialog';
import {
  MapElement,
  Map,
  MapNote,
  Tool,
  ShapeType,
  ExportColorSpace,
  ExportFormat,
  NoteBlock,
  ColorHistoryEntry,
} from './types';
import { Download, RotateCcw, LogOut, Moon, Sun, ZoomIn, ZoomOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentTool, setCurrentTool] = useState<Tool>('place');
  const [selectedShape, setSelectedShape] = useState<ShapeType>('wall');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedText, setSelectedText] = useState('');

  const [gridWidth, setGridWidth] = useState(30);
  const [gridHeight, setGridHeight] = useState(20);
  const [cellSize, setCellSize] = useState(40);

  const [elements, setElements] = useState<MapElement[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [currentMapName, setCurrentMapName] = useState('Untitled Map');
  const [maps, setMaps] = useState<Map[]>([]);

  const [notes, setNotes] = useState<MapNote[]>([]);
  const [currentNote, setCurrentNote] = useState<MapNote | null>(null);

  const [colorHistory, setColorHistory] = useState<ColorHistoryEntry[]>([]);
  const colorHistoryTimeout = useRef<NodeJS.Timeout | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<string>('Mid Morning');
  const [customTime, setCustomTime] = useState<string>('09:00');
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [newMapConfirmOpen, setNewMapConfirmOpen] = useState(false);
  const [newMapSaveName, setNewMapSaveName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadMaps();
      loadNotes();
      loadColorHistory();
      loadUserPreferences();
    }
  }, [user]);

  const loadMaps = async () => {
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setMaps(data);
    }
  };

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('map_notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  const loadColorHistory = async () => {
    const { data, error } = await supabase
      .from('color_history')
      .select('*')
      .order('is_favorited', { ascending: false })
      .order('last_used_at', { ascending: false });

    if (!error && data) {
      setColorHistory(data);
    }
  };

  const loadMapElements = async (mapId: string) => {
    const { data, error } = await supabase
      .from('map_elements')
      .select('*')
      .eq('map_id', mapId);

    if (!error && data) {
      setElements(data);
    }
  };

  const handleAddElement = async (
    element: Omit<MapElement, 'id' | 'map_id' | 'created_at'>
  ) => {
    const existingIndex = elements.findIndex(
      (e) => e.grid_x === element.grid_x && e.grid_y === element.grid_y
    );

    if (existingIndex !== -1) {
      const existingElement = elements[existingIndex];
      await supabase.from('map_elements').delete().eq('id', existingElement.id);
    }

    if (currentMapId) {
      const { data, error } = await supabase
        .from('map_elements')
        .insert({ ...element, map_id: currentMapId })
        .select()
        .single();

      if (!error && data) {
        setElements((prev) => {
          const filtered = prev.filter(
            (e) => !(e.grid_x === element.grid_x && e.grid_y === element.grid_y)
          );
          return [...filtered, data];
        });
      }
    } else {
      const tempElement: MapElement = {
        id: crypto.randomUUID(),
        map_id: 'temp',
        created_at: new Date().toISOString(),
        ...element,
      };
      setElements((prev) => {
        const filtered = prev.filter(
          (e) => !(e.grid_x === element.grid_x && e.grid_y === element.grid_y)
        );
        return [...filtered, tempElement];
      });
    }
  };

  const handleRemoveElement = async (x: number, y: number) => {
    const element = elements.find((e) => e.grid_x === x && e.grid_y === y);
    if (element) {
      if (currentMapId && element.map_id !== 'temp') {
        await supabase.from('map_elements').delete().eq('id', element.id);
      }
      setElements((prev) => prev.filter((e) => e.id !== element.id));
    }
  };

  const handleSaveMap = async (name: string) => {
    setCurrentMapName(name);

    if (currentMapId) {
      await supabase
        .from('maps')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', currentMapId);
    } else {
      const { data, error } = await supabase
        .from('maps')
        .insert({
          name,
          grid_width: gridWidth,
          grid_height: gridHeight,
          cell_size: cellSize,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        setCurrentMapId(data.id);

        for (const element of elements) {
          await supabase.from('map_elements').insert({
            map_id: data.id,
            element_type: element.element_type,
            grid_x: element.grid_x,
            grid_y: element.grid_y,
            shape_type: element.shape_type,
            text_content: element.text_content,
            color: element.color,
            width: element.width,
            height: element.height,
          });
        }

        await loadMapElements(data.id);
      }
    }

    loadMaps();
  };

  const handleLoadMap = async (mapId: string) => {
    const map = maps.find((m) => m.id === mapId);
    if (map) {
      setCurrentMapId(map.id);
      setCurrentMapName(map.name);
      setGridWidth(map.grid_width);
      setGridHeight(map.grid_height);
      await loadMapElements(map.id);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    await supabase.from('maps').delete().eq('id', mapId);
    if (currentMapId === mapId) {
      handleNewMap();
    }
    loadMaps();
  };

  const handleNewMap = () => {
    if (elements.length > 0) {
      setNewMapSaveName(currentMapName);
      setNewMapConfirmOpen(true);
    } else {
      createNewMap();
    }
  };

  const createNewMap = () => {
    setCurrentMapId(null);
    setCurrentMapName('Untitled Map');
    setElements([]);
    setGridWidth(30);
    setGridHeight(20);
  };

  const handleNewMapSaveAndCreate = async () => {
    if (newMapSaveName.trim()) {
      await handleSaveMap(newMapSaveName.trim());
    }
    setNewMapConfirmOpen(false);
    setNewMapSaveName('');
    createNewMap();
  };

  const handleNewMapDontSave = () => {
    setNewMapConfirmOpen(false);
    setNewMapSaveName('');
    createNewMap();
  };

  const handleResetConfirm = () => {
    setResetConfirmOpen(false);
    setElements([]);
  };

  const handleSaveNote = async (
    name: string,
    content: NoteBlock[],
    mapId?: string
  ) => {
    const { data, error } = await supabase
      .from('map_notes')
      .insert({
        name,
        content,
        map_id: mapId || currentMapId,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentNote(data);
      loadNotes();
    }
  };

  const handleLoadNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setCurrentNote(note);
    }
  };

  const handleNewNote = () => {
    setCurrentNote(null);
  };

  const handleExport = async (colorSpace: ExportColorSpace, format: ExportFormat) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (format === 'PNG' || format === 'JPEG') {
      const dataUrl = canvas.toDataURL(
        format === 'PNG' ? 'image/png' : 'image/jpeg',
        0.95
      );
      const link = document.createElement('a');
      link.download = `${currentMapName}.${format.toLowerCase()}`;
      link.href = dataUrl;
      link.click();
    } else if (format === 'PDF') {
      alert(
        'PDF export will convert the canvas to an image. For best results, use PNG format and convert to PDF using external tools.'
      );
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${currentMapName}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setDarkMode(data.dark_mode);
      setTimeOfDay(data.time_of_day);
      setCustomTime(data.custom_time);
      setAmPm(data.am_pm as 'AM' | 'PM');
    }
  };

  const saveUserPreferences = async (prefs: {
    dark_mode?: boolean;
    time_of_day?: string;
    custom_time?: string;
    am_pm?: 'AM' | 'PM';
  }) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_preferences')
        .update({ ...prefs, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          ...prefs,
        });
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveUserPreferences({ dark_mode: newDarkMode });
  };

  const handleTimeOfDayChange = (value: string) => {
    setTimeOfDay(value);

    // Update time based on selection
    let newTime = '09:00';
    let newAmPm: 'AM' | 'PM' = 'AM';

    switch (value) {
      case 'Midnight':
        newTime = '00:00';
        newAmPm = 'AM';
        break;
      case 'Early Morning':
        newTime = '06:00';
        newAmPm = 'AM';
        break;
      case 'Mid Morning':
        newTime = '09:00';
        newAmPm = 'AM';
        break;
      case 'Noon':
        newTime = '12:00';
        newAmPm = 'PM';
        break;
      case 'Afternoon':
        newTime = '15:00';
        newAmPm = 'PM';
        break;
      case 'Night':
        newTime = '21:00';
        newAmPm = 'PM';
        break;
    }

    setCustomTime(newTime);
    setAmPm(newAmPm);
    saveUserPreferences({ time_of_day: value, custom_time: newTime, am_pm: newAmPm });
  };

  const handleCustomTimeChange = (time: string, period: 'AM' | 'PM') => {
    setCustomTime(time);
    setAmPm(period);
    saveUserPreferences({ custom_time: time, am_pm: period });
  };

  const handleZoomIn = () => {
    setCellSize((prev) => Math.min(prev + 10, 100));
  };

  const handleZoomOut = () => {
    setCellSize((prev) => Math.max(prev - 10, 20));
  };

  const handleGridWidthChange = (newWidth: number) => {
    setGridWidth(newWidth);
  };

  const handleGridHeightChange = (newHeight: number) => {
    setGridHeight(newHeight);
  };

  const updateColorHistory = async (color: string) => {
    if (!user) return;

    const { data: existingColor } = await supabase
      .from('color_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('color', color)
      .maybeSingle();

    if (existingColor) {
      const newTimestamp = new Date().toISOString();
      await supabase
        .from('color_history')
        .update({ last_used_at: newTimestamp })
        .eq('id', existingColor.id);

      setColorHistory((prev) =>
        prev.map((entry) =>
          entry.id === existingColor.id
            ? { ...entry, last_used_at: newTimestamp }
            : entry
        )
      );
    } else {
      const { data: newColor, error } = await supabase
        .from('color_history')
        .insert({
          user_id: user.id,
          color,
          is_favorited: false,
          last_used_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && newColor) {
        const { data: nonFavoritedColors } = await supabase
          .from('color_history')
          .select('id, last_used_at')
          .eq('user_id', user.id)
          .eq('is_favorited', false)
          .order('last_used_at', { ascending: true });

        if (nonFavoritedColors && nonFavoritedColors.length > 15) {
          const toDelete = nonFavoritedColors.slice(0, nonFavoritedColors.length - 15);
          const idsToDelete = toDelete.map((c) => c.id);
          await supabase
            .from('color_history')
            .delete()
            .in('id', idsToDelete);
        }

        await loadColorHistory();
      }
    }
  };

  const toggleFavoriteColor = async (colorId: string, currentFavorited: boolean) => {
    await supabase
      .from('color_history')
      .update({ is_favorited: !currentFavorited })
      .eq('id', colorId);

    await loadColorHistory();
  };

  const unfavoriteAndDeleteColor = async (colorId: string) => {
    await supabase
      .from('color_history')
      .update({
        is_favorited: false,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', colorId);

    await loadColorHistory();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => setLoading(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-slate-50 to-gray-100'
    }`}>
      <div className="container mx-auto p-6">
        <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Tabletop Map Builder
              </h1>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{currentMapName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleSignOut}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <SaveLoadPanel
              maps={maps}
              currentMapId={currentMapId}
              currentMapName={currentMapName}
              onSave={handleSaveMap}
              onLoad={handleLoadMap}
              onDelete={handleDeleteMap}
              onNewMap={handleNewMap}
            />
            <NotesPanel
              notes={notes}
              currentNote={currentNote}
              onSaveNote={handleSaveNote}
              onLoadNote={handleLoadNote}
              onNewNote={handleNewNote}
            />
            <button
              onClick={() => setExportDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Grid
            </button>
          </div>

          <div className={`text-sm mb-4 rounded p-3 transition-colors ${
            darkMode
              ? 'bg-gray-800 border border-gray-700 text-white'
              : 'bg-blue-50 border border-blue-200 text-gray-600'
          }`}>
            <p className="font-semibold mb-1">Quick Guide:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Left-click to place objects, right-click to erase</li>
              <li>Each grid cell represents 5ft × 5ft in-game</li>
              <li>Select shapes or text from the toolbar, customize colors</li>
              <li>Save your maps and notes for later use</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <div>
            <Toolbar
              currentTool={currentTool}
              selectedShape={selectedShape}
              selectedColor={selectedColor}
              selectedText={selectedText}
              colorHistory={colorHistory}
              darkMode={darkMode}
              onToolChange={setCurrentTool}
              onShapeSelect={setSelectedShape}
              onColorChange={(color) => {
                setSelectedColor(color);
                if (colorHistoryTimeout.current) {
                  clearTimeout(colorHistoryTimeout.current);
                }
                colorHistoryTimeout.current = setTimeout(() => {
                  updateColorHistory(color);
                }, 500);
              }}
              onColorSelect={(color) => {
                setSelectedColor(color);
                updateColorHistory(color);
              }}
              onTextChange={setSelectedText}
              onToggleFavorite={toggleFavoriteColor}
              onUnfavorite={unfavoriteAndDeleteColor}
            />
          </div>

          <div className={`rounded-lg shadow-lg p-6 overflow-auto transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <GridCanvas
              width={gridWidth}
              height={gridHeight}
              cellSize={cellSize}
              elements={elements}
              currentTool={currentTool}
              selectedShape={selectedShape}
              selectedColor={selectedColor}
              selectedText={selectedText}
              timeOfDay={timeOfDay}
              customTime={customTime}
              amPm={amPm}
              darkMode={darkMode}
              onAddElement={handleAddElement}
              onRemoveElement={handleRemoveElement}
              onTimeOfDayChange={handleTimeOfDayChange}
              onCustomTimeChange={handleCustomTimeChange}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onGridWidthChange={handleGridWidthChange}
              onGridHeightChange={handleGridHeightChange}
            />
          </div>
        </div>
      </div>

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />

      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Reset Grid?</h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This will clear all elements from the current grid. This action cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className={`px-4 py-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {newMapConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Save Current Map?</h2>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Would you like to save your current map before creating a new one?
            </p>
            <input
              type="text"
              value={newMapSaveName}
              onChange={(e) => setNewMapSaveName(e.target.value)}
              placeholder="Enter map name"
              className={`w-full px-3 py-2 border rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleNewMapDontSave}
                className={`px-4 py-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Don't Save
              </button>
              <button
                onClick={handleNewMapSaveAndCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save & New Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
