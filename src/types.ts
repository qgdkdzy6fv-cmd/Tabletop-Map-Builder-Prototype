export type ElementType = 'shape' | 'text';

export type ShapeType =
  | 'wall'
  | 'door'
  | 'window'
  | 'table'
  | 'chair'
  | 'bed'
  | 'chest'
  | 'tree'
  | 'rock'
  | 'water'
  | 'stairs';

export interface MapElement {
  id: string;
  map_id: string;
  element_type: ElementType;
  grid_x: number;
  grid_y: number;
  sub_x?: number;
  sub_y?: number;
  shape_type?: ShapeType;
  text_content?: string;
  color: string;
  width: number;
  height: number;
}

export interface Map {
  id: string;
  user_id: string;
  name: string;
  grid_width: number;
  grid_height: number;
  cell_size: number;
  created_at: string;
  updated_at: string;
}

export interface NoteBlock {
  id: string;
  type: 'title' | 'header' | 'body' | 'bullet';
  content: string;
  fontFamily?: string;
  color?: string;
}

export interface MapNote {
  id: string;
  map_id?: string;
  user_id: string;
  name: string;
  content: NoteBlock[];
  created_at: string;
  updated_at: string;
}

export type Tool = 'select' | 'place' | 'erase' | 'text';

export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export interface SizeDefinition {
  name: string;
  feet: string;
  gridSquares: number;
  description: string;
}

export interface EditorState {
  currentTool: Tool;
  selectedShape: ShapeType | null;
  selectedColor: string;
  selectedText: string;
  selectedSize: SizeCategory;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
}

export type ExportColorSpace = 'RGB' | 'CMYK';
export type ExportFormat = 'PNG' | 'JPEG' | 'PDF';

export interface ColorHistoryEntry {
  id: string;
  user_id: string;
  color: string;
  is_favorited: boolean;
  last_used_at: string;
  created_at: string;
}
