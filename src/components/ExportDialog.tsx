import { useState } from 'react';
import { ExportColorSpace, ExportFormat } from '../types';
import { Download, X } from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (colorSpace: ExportColorSpace, format: ExportFormat) => void;
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [colorSpace, setColorSpace] = useState<ExportColorSpace>('RGB');

  if (!isOpen) return null;

  const handleExport = (format: ExportFormat) => {
    onExport(colorSpace, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Export Map</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Color Space</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="RGB"
                  checked={colorSpace === 'RGB'}
                  onChange={(e) => setColorSpace(e.target.value as ExportColorSpace)}
                  className="w-4 h-4"
                />
                <span className="text-sm">RGB (Digital/Screen)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="CMYK"
                  checked={colorSpace === 'CMYK'}
                  onChange={(e) => setColorSpace(e.target.value as ExportColorSpace)}
                  className="w-4 h-4"
                />
                <span className="text-sm">CMYK (Print)</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Export Format</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleExport('PNG')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm font-semibold">PNG</span>
              </button>
              <button
                onClick={() => handleExport('JPEG')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm font-semibold">JPEG</span>
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm font-semibold">PDF</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
