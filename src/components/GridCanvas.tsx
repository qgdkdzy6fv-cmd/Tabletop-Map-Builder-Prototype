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
  selectedElementIds: string[];
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
  onMoveElements: (elementIds: string[], deltaX: number, deltaY: number) => void;
  onSelectElements: (elementIds: string[]) => void;
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
  selectedElementIds,
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
  onMoveElements,
  onSelectElements,
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
  const [lastCell, setLastCell] = useState<{ x: number; y: number; subX?: number; subY?: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isMenuMinimized, setIsMenuMinimized] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{ x: number; y: number } | null>(null);

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

    const sizeDef = sizeDefinitions[selectedSize];
    const isTinyMode = sizeDef.gridSquares === 0.5;

    if (hoveredCell && (currentTool === 'place' || currentTool === 'text')) {
      const hx = hoveredCell.x * cellSize;
      const hy = hoveredCell.y * cellSize;
      const gridSquares = sizeDef.gridSquares;

      if (isTinyMode) {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(hx + cellSize / 2, hy);
        ctx.lineTo(hx + cellSize / 2, hy + cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hx, hy + cellSize / 2);
        ctx.lineTo(hx + cellSize, hy + cellSize / 2);
        ctx.stroke();

        const tinyElements = elements.filter(
          e => e.grid_x === hoveredCell.x && e.grid_y === hoveredCell.y && e.width === 0.5
        );

        for (let subY = 0; subY < 2; subY++) {
          for (let subX = 0; subX < 2; subX++) {
            const isOccupied = tinyElements.some(e => e.sub_x === subX && e.sub_y === subY);
            if (!isOccupied) {
              ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
              ctx.fillRect(
                hx + subX * (cellSize / 2),
                hy + subY * (cellSize / 2),
                cellSize / 2,
                cellSize / 2
              );
            }
          }
        }
      } else {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;

        const highlightWidth = gridSquares * cellSize;
        const highlightHeight = gridSquares * cellSize;

        ctx.fillRect(hx, hy, highlightWidth, highlightHeight);
        ctx.strokeRect(hx, hy, highlightWidth, highlightHeight);
      }
    }

    const tinyElementsBySquare = new Map<string, MapElement[]>();
    elements.forEach((element) => {
      if (element.width === 0.5) {
        const key = `${element.grid_x},${element.grid_y}`;
        if (!tinyElementsBySquare.has(key)) {
          tinyElementsBySquare.set(key, []);
        }
        tinyElementsBySquare.get(key)!.push(element);
      }
    });

    elements.forEach((element) => {
      let x = element.grid_x * cellSize;
      let y = element.grid_y * cellSize;

      if (element.sub_x !== undefined && element.sub_y !== undefined) {
        x += element.sub_x * (cellSize / 2);
        y += element.sub_y * (cellSize / 2);
      }

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

        if (element.width === 0.5) {
          fontSize = (cellSize / 2) * 0.5;
        }

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text_content, x + w / 2, y + h / 2);
      }

      if (selectedElementIds.includes(element.id)) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        ctx.setLineDash([]);
      }
    });
  }, [width, height, cellSize, elements, selectedSize, hoveredCell, currentTool, selectedElementIds]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const getSubCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>, cell: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) - (cell.x * cellSize);
    const offsetY = (e.clientY - rect.top) - (cell.y * cellSize);

    const subX = offsetX < cellSize / 2 ? 0 : 1;
    const subY = offsetY < cellSize / 2 ? 0 : 1;

    return { subX, subY };
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

    if (currentTool === 'select') {
      const clickedElement = elements.find(
        (el) => el.grid_x === cell.x && el.grid_y === cell.y
      );

      if (clickedElement) {
        const isMultiSelect = e.ctrlKey || e.metaKey;

        if (isMultiSelect) {
          if (selectedElementIds.includes(clickedElement.id)) {
            onSelectElements(selectedElementIds.filter((id) => id !== clickedElement.id));
          } else {
            onSelectElements([...selectedElementIds, clickedElement.id]);
          }
        } else {
          if (!selectedElementIds.includes(clickedElement.id)) {
            onSelectElements([clickedElement.id]);
          }
          setIsDraggingSelection(true);
          setDragStartCell(cell);
        }
      } else {
        if (!e.ctrlKey && !e.metaKey) {
          onSelectElements([]);
        }
      }
      return;
    }

    setIsDragging(true);
    setLastCell(cell);

    if (e.button === 0) {
      if (currentTool === 'erase') {
        onRemoveElement(cell.x, cell.y);
        return;
      }

      if (currentTool === 'place' && selectedShape) {
        const shapeDef = getShapeDefinition(selectedShape);
        const sizeDef = sizeDefinitions[selectedSize];
        if (shapeDef && sizeDef) {
          const isTiny = sizeDef.gridSquares === 0.5;

          if (isTiny) {
            const tinyElements = elements.filter(
              el => el.grid_x === cell.x && el.grid_y === cell.y && el.width === 0.5
            );

            if (tinyElements.length >= 4) {
              return;
            }

            if (tinyElements.length > 0) {
              const firstType = tinyElements[0].element_type === 'shape'
                ? tinyElements[0].shape_type
                : tinyElements[0].text_content;
              if (firstType !== selectedShape) {
                return;
              }
            }

            const subCell = getSubCellFromEvent(e, cell);
            if (!subCell) return;

            const isOccupied = tinyElements.some(
              el => el.sub_x === subCell.subX && el.sub_y === subCell.subY
            );
            if (isOccupied) return;

            onAddElement({
              element_type: 'shape',
              grid_x: cell.x,
              grid_y: cell.y,
              sub_x: subCell.subX,
              sub_y: subCell.subY,
              shape_type: selectedShape,
              color: selectedColor,
              width: sizeDef.gridSquares,
              height: sizeDef.gridSquares,
            });
          } else {
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
        }
      } else if (currentTool === 'text' && selectedText) {
        const sizeDef = sizeDefinitions[selectedSize];
        const isTiny = sizeDef.gridSquares === 0.5;

        if (isTiny) {
          const tinyElements = elements.filter(
            el => el.grid_x === cell.x && el.grid_y === cell.y && el.width === 0.5
          );

          if (tinyElements.length >= 4) {
            return;
          }

          if (tinyElements.length > 0) {
            const firstType = tinyElements[0].element_type === 'text'
              ? tinyElements[0].text_content
              : tinyElements[0].shape_type;
            if (firstType !== selectedText) {
              return;
            }
          }

          const subCell = getSubCellFromEvent(e, cell);
          if (!subCell) return;

          const isOccupied = tinyElements.some(
            el => el.sub_x === subCell.subX && el.sub_y === subCell.subY
          );
          if (isOccupied) return;

          onAddElement({
            element_type: 'text',
            grid_x: cell.x,
            grid_y: cell.y,
            sub_x: subCell.subX,
            sub_y: subCell.subY,
            text_content: selectedText,
            color: selectedColor,
            width: sizeDef.gridSquares,
            height: sizeDef.gridSquares,
          });
        } else {
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
      }
    } else if (e.button === 2) {
      onRemoveElement(cell.x, cell.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (cell) {
      setHoveredCell(cell);
    }

    if (isPanning && panStart && containerRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;

      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDraggingSelection && dragStartCell && cell && selectedElementIds.length > 0) {
      const deltaX = cell.x - dragStartCell.x;
      const deltaY = cell.y - dragStartCell.y;

      if (deltaX !== 0 || deltaY !== 0) {
        onMoveElements(selectedElementIds, deltaX, deltaY);
        setDragStartCell(cell);
      }
      return;
    }

    if (!isDragging) return;

    const sizeDef = sizeDefinitions[selectedSize];
    const isTiny = sizeDef.gridSquares === 0.5;

    if (isTiny) {
      const subCell = getSubCellFromEvent(e, cell);
      if (!subCell) return;

      if (lastCell && cell.x === lastCell.x && cell.y === lastCell.y &&
          lastCell.subX === subCell.subX && lastCell.subY === subCell.subY) {
        return;
      }

      setLastCell({ x: cell.x, y: cell.y, subX: subCell.subX, subY: subCell.subY });
    } else {
      if (!cell || (lastCell && cell.x === lastCell.x && cell.y === lastCell.y)) return;
      setLastCell(cell);
    }

    if (e.buttons === 1) {
      if (currentTool === 'erase') {
        onRemoveElement(cell.x, cell.y);
        return;
      }

      if (currentTool === 'place' && selectedShape) {
        if (isTiny) {
          const tinyElements = elements.filter(
            el => el.grid_x === cell.x && el.grid_y === cell.y && el.width === 0.5
          );

          if (tinyElements.length >= 4) {
            return;
          }

          if (tinyElements.length > 0) {
            const firstType = tinyElements[0].element_type === 'shape'
              ? tinyElements[0].shape_type
              : tinyElements[0].text_content;
            if (firstType !== selectedShape) {
              return;
            }
          }

          const subCell = getSubCellFromEvent(e, cell);
          if (!subCell) return;

          const isOccupied = tinyElements.some(
            el => el.sub_x === subCell.subX && el.sub_y === subCell.subY
          );
          if (isOccupied) return;

          onAddElement({
            element_type: 'shape',
            grid_x: cell.x,
            grid_y: cell.y,
            sub_x: subCell.subX,
            sub_y: subCell.subY,
            shape_type: selectedShape,
            color: selectedColor,
            width: sizeDef.gridSquares,
            height: sizeDef.gridSquares,
          });
        } else {
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
        if (isTiny) {
          const tinyElements = elements.filter(
            el => el.grid_x === cell.x && el.grid_y === cell.y && el.width === 0.5
          );

          if (tinyElements.length >= 4) {
            return;
          }

          if (tinyElements.length > 0) {
            const firstType = tinyElements[0].element_type === 'text'
              ? tinyElements[0].text_content
              : tinyElements[0].shape_type;
            if (firstType !== selectedText) {
              return;
            }
          }

          const subCell = getSubCellFromEvent(e, cell);
          if (!subCell) return;

          const isOccupied = tinyElements.some(
            el => el.sub_x === subCell.subX && el.sub_y === subCell.subY
          );
          if (isOccupied) return;

          onAddElement({
            element_type: 'text',
            grid_x: cell.x,
            grid_y: cell.y,
            sub_x: subCell.subX,
            sub_y: subCell.subY,
            text_content: selectedText,
            color: selectedColor,
            width: sizeDef.gridSquares,
            height: sizeDef.gridSquares,
          });
        } else {
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
    setIsDraggingSelection(false);
    setDragStartCell(null);
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
        onMouseLeave={(e) => {
          setHoveredCell(null);
          handleMouseUp(e);
        }}
        onContextMenu={handleContextMenu}
        style={{
          cursor: isPanning
            ? 'grabbing'
            : currentTool === 'select'
            ? isDraggingSelection
              ? 'grabbing'
              : 'pointer'
            : currentTool === 'erase'
            ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21\'/%3E%3Cpath d=\'M22 21H7\'/%3E%3Cpath d=\'m5 11 9 9\'/%3E%3C/svg%3E") 4 20, auto'
            : 'crosshair'
        }}
        className={`border ${
          darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}
      />
    </div>
  );
}
