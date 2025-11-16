import { SizeCategory, SizeDefinition } from '../types';

interface SizeSelectorProps {
  selectedSize: SizeCategory;
  onSizeChange: (size: SizeCategory) => void;
  darkMode: boolean;
}

export const sizeDefinitions: Record<SizeCategory, SizeDefinition> = {
  tiny: {
    name: 'Tiny',
    feet: '2.5 x 2.5 ft',
    gridSquares: 0.5,
    description: '0.5x0.5 grid (4 per square)',
  },
  small: {
    name: 'Small',
    feet: '5 x 5 ft',
    gridSquares: 1,
    description: '1x1 grid square',
  },
  medium: {
    name: 'Medium',
    feet: '5 x 5 ft',
    gridSquares: 1,
    description: '1x1 grid square',
  },
  large: {
    name: 'Large',
    feet: '10 x 10 ft',
    gridSquares: 2,
    description: '2x2 grid (4 squares)',
  },
  huge: {
    name: 'Huge',
    feet: '15 x 15 ft',
    gridSquares: 3,
    description: '3x3 grid (9 squares)',
  },
  gargantuan: {
    name: 'Gargantuan',
    feet: '20 x 20 ft',
    gridSquares: 4,
    description: '4x4 grid (16 squares)',
  },
};

export function SizeSelector({ selectedSize, onSizeChange, darkMode }: SizeSelectorProps) {
  const sizes: SizeCategory[] = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];

  return (
    <div>
      <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Size
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {sizes.map((size) => {
          const def = sizeDefinitions[size];
          return (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`px-3 py-2 rounded transition-all text-left ${
                selectedSize === size
                  ? 'bg-blue-600 text-white shadow-md'
                  : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`${def.feet} - ${def.description}`}
            >
              <div className="font-semibold text-sm">{def.name}</div>
              <div
                className={`text-xs mt-0.5 ${
                  selectedSize === size
                    ? 'text-blue-100'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                {def.feet}
              </div>
            </button>
          );
        })}
      </div>
      <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {sizeDefinitions[selectedSize].description}
      </p>
    </div>
  );
}
