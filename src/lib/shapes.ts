import { ShapeType } from '../types';

export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  render: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => void;
}

export const shapes: ShapeDefinition[] = [
  {
    type: 'wall',
    name: 'Wall',
    icon: '▬',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    },
  },
  {
    type: 'door',
    name: 'Door',
    icon: '⌂',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + width * 0.2, y + height * 0.2, Math.min(width, height) * 0.3, 0, Math.PI / 2);
      ctx.stroke();
    },
  },
  {
    type: 'window',
    name: 'Window',
    icon: '▢',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.6);
      ctx.beginPath();
      ctx.moveTo(x + width * 0.5, y + height * 0.2);
      ctx.lineTo(x + width * 0.5, y + height * 0.8);
      ctx.moveTo(x + width * 0.2, y + height * 0.5);
      ctx.lineTo(x + width * 0.8, y + height * 0.5);
      ctx.stroke();
    },
  },
  {
    type: 'table',
    name: 'Table',
    icon: '⊡',
    defaultWidth: 2,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.8);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.8);
    },
  },
  {
    type: 'chair',
    name: 'Chair',
    icon: '⊓',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.6);
      ctx.fillRect(x + width * 0.3, y + height * 0.1, width * 0.4, height * 0.2);
    },
  },
  {
    type: 'bed',
    name: 'Bed',
    icon: '▭',
    defaultWidth: 2,
    defaultHeight: 3,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + width * 0.1, y + height * 0.2, width * 0.8, height * 0.7);
      ctx.fillRect(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.15);
    },
  },
  {
    type: 'chest',
    name: 'Chest',
    icon: '▣',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + width * 0.15, y + height * 0.15, width * 0.7, height * 0.7);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + width * 0.15, y + height * 0.15, width * 0.7, height * 0.7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + width * 0.45, y + height * 0.4, width * 0.1, height * 0.2);
    },
  },
  {
    type: 'tree',
    name: 'Tree',
    icon: '♠',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + width * 0.5, y + height * 0.4, Math.min(width, height) * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + width * 0.4, y + height * 0.6, width * 0.2, height * 0.3);
    },
  },
  {
    type: 'rock',
    name: 'Rock',
    icon: '◆',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.5, y + height * 0.1);
      ctx.lineTo(x + width * 0.85, y + height * 0.4);
      ctx.lineTo(x + width * 0.7, y + height * 0.85);
      ctx.lineTo(x + width * 0.3, y + height * 0.85);
      ctx.lineTo(x + width * 0.15, y + height * 0.4);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    type: 'water',
    name: 'Water',
    icon: '≈',
    defaultWidth: 1,
    defaultHeight: 1,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const yPos = y + height * (0.25 + i * 0.25);
        ctx.moveTo(x, yPos);
        ctx.quadraticCurveTo(x + width * 0.25, yPos - height * 0.05, x + width * 0.5, yPos);
        ctx.quadraticCurveTo(x + width * 0.75, yPos + height * 0.05, x + width, yPos);
      }
      ctx.stroke();
    },
  },
  {
    type: 'stairs',
    name: 'Stairs',
    icon: '≡',
    defaultWidth: 2,
    defaultHeight: 2,
    render: (ctx, x, y, width, height, color) => {
      ctx.fillStyle = color;
      const steps = 5;
      const stepHeight = height / steps;
      for (let i = 0; i < steps; i++) {
        const stepY = y + i * stepHeight;
        ctx.fillRect(x, stepY, width, stepHeight * 0.8);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, stepY, width, stepHeight * 0.8);
      }
    },
  },
];

export const getShapeDefinition = (type: ShapeType): ShapeDefinition | undefined => {
  return shapes.find((s) => s.type === type);
};
