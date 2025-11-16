import { useEffect, useRef, useState } from 'react';
import { MapElement, Tool, ShapeType, SizeCategory } from '../types';
import { getShapeDefinition } from '../lib/shapes';
import { sizeDefinitions } from './SizeSelector';
import { Clock, ZoomIn, ZoomOut, Grid3x3, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface GridCanvasProps {
  width: number;
  height: number;
  cellSize: number;
  elements: MapElement[];
  currentTool: Tool;
  selectedShape: ShapeType | null;
  selectedColor: string;
  selectedText: string;
  selectedSize: SizeCategory;
  timeOfDay: string;
  customTime: string;
  amPm: 'AM' | 'PM';
  darkMode: boolean;
  onAddElement: (element: Omit<MapElement, 'id' | 'map_id' | 'created_at'>) => void;
  onRemoveElement: (x: number, y: number) => void;
  onTimeOfDayChange: (value: string) => void;
  onCustomTimeChange: (time: string, period: 'AM' | 'PM') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGridWidthChange: (width: number) => void;
  onGridHeightChange: (height: number) => void;
}

export function GridCanvas({
  width,
  height,
  cellSize,
  elements,
  currentTool,
  selectedShape,
  selectedColor,
  selectedText,
  selectedSize,
  timeOfDay,
  customTime,
  amPm,
  darkMode,
  onAddElement,
  onRemoveElement,
  onTimeOfDayChange,
  onCustomTimeChange,
  onZoomIn,
  onZoomOut,
  onGridWidthChange,
  onGridHeightChange,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastCell, setLastCell] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isMenuMinimized, setIsMenuMinimized] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
      ctx.stroke();
    }

    elements.forEach((element) => {
      const x = element.grid_x * cellSize;
      const y = element.grid_y * cellSize;
      const w = element.width * cellSize;
      const h = element.height * cellSize;

      if (element.element_type === 'shape' && element.shape_type) {
        const shapeDef = getShapeDefinition(element.shape_type);
        if (shapeDef) {
          shapeDef.render(ctx, x, y, w, h, element.color);
        }
      } else if (element.element_type === 'text' && element.text_content) {
        ctx.fillStyle = element.color;

        const textLength = element.text_content.length;
        let fontSize = cellSize * 0.6;

        if (textLength > 1) {
          fontSize = Math.max(cellSize * 0.4, cellSize * 0.6 / Math.sqrt(textLength));
        }

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text_content, x + cellSize / 2, y + cellSize / 2);
      }
    });
  }, [width, height, cellSize, elements]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const cell = getCellFromEvent(e);
    if (!cell) return;

    setIsDragging(true);
    setLastCell(cell);

    if (e.button === 0) {
      if (currentTool === 'place' && selectedShape) {
        const shapeDef = getShapeDefinition(selectedShape);
        const sizeDef = sizeDefinitions[selectedSize];
        if (shapeDef && sizeDef) {
          onAddElement({
            element_type: 'shape',
            grid_x: cell.x,
            grid_y: cell.y,
            shape_type: selectedShape,
            color: selectedColor,
            width: sizeDef.gridSquares,
            height: sizeDef.gridSquares,
          });
        }
      } else if (currentTool === 'text' && selectedText) {
        const sizeDef = sizeDefinitions[selectedSize];
        onAddElement({
          element_type: 'text',
          grid_x: cell.x,
          grid_y: cell.y,
          text_content: selectedText,
          color: selectedColor,
          width: sizeDef.gridSquares,
          height: sizeDef.gridSquares,
        });
      }
    } else if (e.button === 2) {
      onRemoveElement(cell.x, cell.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && panStart && containerRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;

      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDragging) return;

    const cell = getCellFromEvent(e);
    if (!cell || (lastCell && cell.x === lastCell.x && cell.y === lastCell.y)) return;

    setLastCell(cell);

    if (e.buttons === 1) {
      if (currentTool === 'place' && selectedShape) {
        const shapeDef = getShapeDefinition(selectedShape);
        if (shapeDef) {
          onAddElement({
            element_type: 'shape',
            grid_x: cell.x,
            grid_y: cell.y,
            shape_type: selectedShape,
            color: selectedColor,
            width: shapeDef.defaultWidth,
            height: shapeDef.defaultHeight,
          });
        }
      }
    } else if (e.buttons === 2) {
      onRemoveElement(cell.x, cell.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastCell(null);
    setIsPanning(false);
    setPanStart(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const timeOptions = ['Midnight', 'Early Morning', 'Mid Morning', 'Noon', 'Afternoon', 'Night'];

  return (
    <div ref={containerRef} className="relative inline-block overflow-auto max-w-full max-h-[calc(100vh-200px)]">
      <div className={`absolute top-4 left-4 z-10 flex flex-col gap-3`}>
        <div className={`rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } border-2`}>
          <div className="p-2 flex gap-2 items-center">
            <button
              onClick={onZoomIn}
              className={`p-1.5 rounded hover:bg-opacity-80 transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={onZoomOut}
              className={`p-1.5 rounded hover:bg-opacity-80 transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <div className={`w-px h-6 mx-1 ${
              darkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`} />
            <button
              onClick={() => setIsMenuMinimized(!isMenuMinimized)}
              className={`p-1.5 rounded hover:bg-opacity-80 transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={isMenuMinimized ? 'Expand Menu' : 'Minimize Menu'}
              aria-label={isMenuMinimized ? 'Expand Menu' : 'Minimize Menu'}
            >
              {isMenuMinimized ? (
                <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              ) : (
                <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              )}
            </button>
          </div>
          {!isMenuMinimized && (
            <>
              <div className={`border-t ${
                darkMode ? 'border-gray-600' : 'border-gray-300'
              }`} />
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Grid3x3 className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Grid Size
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                      Width
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => onGridWidthChange(Math.max(5, Math.min(100, parseInt(e.target.value) || width)))}
                      min="5"
                      max="100"
                      className={`w-full px-2 py-1 text-sm border rounded ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                      aria-label="Grid Width"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                      Height
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => onGridHeightChange(Math.max(5, Math.min(100, parseInt(e.target.value) || height)))}
                      min="5"
                      max="100"
                      className={`w-full px-2 py-1 text-sm border rounded ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                      aria-label="Grid Height"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Time of Day
                  </span>
                </div>
                <select
                  value={timeOfDay}
                  onChange={(e) => onTimeOfDayChange(e.target.value)}
                  className={`w-full px-2 py-1 text-sm border rounded mb-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  aria-label="Time of Day"
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => onCustomTimeChange(e.target.value, amPm)}
                  className={`w-full px-2 py-1 text-sm border rounded ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  aria-label="Custom Time"
                />
              </div>
            </>
          )}
        </div>
        {isMenuMinimized && (
          <div className={`rounded-lg shadow-lg p-2 ${
            darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          } border-2`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {timeOfDay}
              </span>
            </div>
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={width * cellSize}
        height={height * cellSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        className={`border ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'} ${
          darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}
      />
    </div>
  );
}
