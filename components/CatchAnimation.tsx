
import React, { useEffect, useState } from 'react';
import type { Position } from '../types';

interface CatchAnimationProps {
  position: Position;
  onComplete: () => void;
}

const CatchAnimation: React.FC<CatchAnimationProps> = ({ position, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) {
    return null;
  }

  const style: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <div
      style={style}
      className="absolute flex items-center justify-center w-16 h-16 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping bg-yellow-400 opacity-75"
    >
    </div>
  );
};

export default CatchAnimation;
