
import React from 'react';
import type { Position } from '../types';

interface MouseProps {
  position: Position;
  rotation: number;
  catchCount: number;
}

const Mouse: React.FC<MouseProps> = ({ position, rotation, catchCount }) => {
  const isCaught = catchCount >= 3;

  const style: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity: isCaught ? 0 : 1,
  };
  
  const getMouseCharacter = () => {
    if (catchCount === 0) return '🐁';
    if (catchCount === 1) return '💨'; // First catch is a puff of smoke
    if (catchCount === 2) return '✨'; // Second catch is a sparkle
    return '🐁';
  };

  const shadowStyle = 'absolute text-4xl transition-opacity duration-500';

  return (
    <div style={style} className="absolute transition-transform duration-100 ease-linear">
      <span className={`${shadowStyle} ${catchCount === 0 ? 'opacity-100' : 'opacity-0'}`}>🐁</span>
      <span className={`${shadowStyle} ${catchCount === 1 ? 'opacity-100' : 'opacity-0'}`}>💨</span>
      <span className={`${shadowStyle} ${catchCount === 2 ? 'opacity-100' : 'opacity-0'}`}>✨</span>
    </div>
  );
};

export default Mouse;
