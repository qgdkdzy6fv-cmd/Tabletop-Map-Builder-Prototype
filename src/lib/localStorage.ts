import { Map, MapElement, MapNote, ColorHistoryEntry } from '../types';

const STORAGE_KEYS = {
  MAPS: 'tabletop_maps',
  ELEMENTS: 'tabletop_elements',
  NOTES: 'tabletop_notes',
  COLOR_HISTORY: 'tabletop_color_history',
  PREFERENCES: 'tabletop_preferences',
};

export const localStorageService = {
  getMaps(): Map[] {
    const data = localStorage.getItem(STORAGE_KEYS.MAPS);
    return data ? JSON.parse(data) : [];
  },

  saveMap(map: Map): void {
    const maps = this.getMaps();
    const existingIndex = maps.findIndex((m) => m.id === map.id);

    if (existingIndex !== -1) {
      maps[existingIndex] = map;
    } else {
      maps.push(map);
    }

    localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(maps));
  },

  deleteMap(mapId: string): void {
    const maps = this.getMaps().filter((m) => m.id !== mapId);
    localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(maps));

    const allElements = this.getAllElements();
    const filteredElements = allElements.filter((e) => e.map_id !== mapId);
    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(filteredElements));
  },

  getAllElements(): MapElement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ELEMENTS);
    return data ? JSON.parse(data) : [];
  },

  getMapElements(mapId: string): MapElement[] {
    return this.getAllElements().filter((e) => e.map_id === mapId);
  },

  saveElement(element: MapElement): void {
    const elements = this.getAllElements();
    const existingIndex = elements.findIndex((e) => e.id === element.id);

    if (existingIndex !== -1) {
      elements[existingIndex] = element;
    } else {
      elements.push(element);
    }

    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
  },

  deleteElement(elementId: string): void {
    const elements = this.getAllElements().filter((e) => e.id !== elementId);
    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
  },

  updateElement(elementId: string, updates: Partial<MapElement>): void {
    const elements = this.getAllElements();
    const index = elements.findIndex((e) => e.id === elementId);

    if (index !== -1) {
      elements[index] = { ...elements[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
    }
  },

  getNotes(): MapNote[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  },

  saveNote(note: MapNote): void {
    const notes = this.getNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);

    if (existingIndex !== -1) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getColorHistory(): ColorHistoryEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.COLOR_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveColorHistory(history: ColorHistoryEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.COLOR_HISTORY, JSON.stringify(history));
  },

  addOrUpdateColor(color: string): ColorHistoryEntry {
    const history = this.getColorHistory();
    const existing = history.find((h) => h.color === color);

    if (existing) {
      existing.last_used_at = new Date().toISOString();
      this.saveColorHistory(history);
      return existing;
    } else {
      const newEntry: ColorHistoryEntry = {
        id: crypto.randomUUID(),
        user_id: 'guest',
        color,
        is_favorited: false,
        last_used_at: new Date().toISOString(),
      };

      const nonFavorited = history.filter((h) => !h.is_favorited);
      if (nonFavorited.length >= 15) {
        nonFavorited.sort((a, b) =>
          new Date(a.last_used_at).getTime() - new Date(b.last_used_at).getTime()
        );
        const toRemove = nonFavorited[0];
        const filtered = history.filter((h) => h.id !== toRemove.id);
        filtered.push(newEntry);
        this.saveColorHistory(filtered);
      } else {
        history.push(newEntry);
        this.saveColorHistory(history);
      }

      return newEntry;
    }
  },

  toggleFavoriteColor(colorId: string, isFavorited: boolean): void {
    const history = this.getColorHistory();
    const color = history.find((h) => h.id === colorId);

    if (color) {
      color.is_favorited = isFavorited;
      this.saveColorHistory(history);
    }
  },

  getPreferences(): any {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : null;
  },

  savePreferences(preferences: any): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  },
};
