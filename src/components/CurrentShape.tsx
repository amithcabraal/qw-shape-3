import { useDrag } from 'react-dnd';
import { useRef } from 'react';
import type { Shape } from '../lib/types';

type CurrentShapeProps = {
  shape: Shape;
  isDraggable?: boolean;
};

export function CurrentShape({ shape, isDraggable = true }: CurrentShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'shape',
    item: (monitor) => {
      const element = shapeRef.current;
      if (!element) return { shape, offset: { x: 0, y: 0 } };

      const rect = element.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return { shape, offset: { x: 0, y: 0 } };

      const cellSize = 42; // 40px + 2px margin
      const offsetX = Math.floor((clientOffset.x - rect.left) / cellSize);
      const offsetY = Math.floor((clientOffset.y - rect.top) / cellSize);

      // Find the first filled cell in the clicked column
      let firstFilledY = 0;
      for (let y = 0; y < shape.grid.length; y++) {
        if (shape.grid[y][offsetX]) {
          firstFilledY = y;
          break;
        }
      }

      return {
        shape,
        offset: { 
          x: offsetX, 
          y: offsetY - firstFilledY
        }
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [shape]);

  const element = (
    <div 
      ref={shapeRef}
      className={`
        inline-block p-1 touch-none select-none
        ${isDraggable ? 'cursor-move' : ''}
        ${isDragging ? 'opacity-30' : ''}
      `}
      role={isDraggable ? "button" : "presentation"}
      aria-label={isDraggable ? "Current shape - drag to place on grid" : undefined}
      style={{ touchAction: 'none' }}
    >
      {shape.grid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`
                shape-cell
                ${cell ? 'filled' : 'invisible'}
              `}
              style={{
                backgroundColor: cell ? shape.color : 'transparent'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return isDraggable ? drag(element) : element;
}