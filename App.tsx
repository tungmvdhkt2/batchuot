
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState } from './types';
import type { Position, Velocity, CatchEffect } from './types';
import Mouse from './components/Mouse';
import CatchAnimation from './components/CatchAnimation';

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;
const MOUSE_SPEED = 4;
const CATCH_RADIUS = 30;
const SCARE_RADIUS = 100;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [mousePosition, setMousePosition] = useState<Position>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [mouseVelocity, setMouseVelocity] = useState<Velocity>({ dx: MOUSE_SPEED, dy: MOUSE_SPEED });
  const [catchCount, setCatchCount] = useState<number>(0);
  const [catchEffects, setCatchEffects] = useState<CatchEffect[]>([]);
  const [mouseRotation, setMouseRotation] = useState<number>(0);

  const animationFrameId = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    setGameState(GameState.Playing);
    setCatchCount(0);
    setMousePosition({ x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT });
    const angle = Math.random() * 2 * Math.PI;
    setMouseVelocity({ dx: Math.cos(angle) * MOUSE_SPEED, dy: Math.sin(angle) * MOUSE_SPEED });
    setCatchEffects([]);
  };

  const scareMouse = useCallback((clickPos: Position) => {
    const angle = Math.atan2(mousePosition.y - clickPos.y, mousePosition.x - clickPos.x);
    setMouseVelocity({
      dx: Math.cos(angle) * MOUSE_SPEED * 1.5,
      dy: Math.sin(angle) * MOUSE_SPEED * 1.5
    });
  }, [mousePosition]);

  const gameLoop = useCallback(() => {
    setMousePosition(prevPos => {
      let { x, y } = prevPos;
      let { dx, dy } = mouseVelocity;

      x += dx;
      y += dy;

      if (x <= 0 || x >= GAME_WIDTH) dx = -dx;
      if (y <= 0 || y >= GAME_HEIGHT) dy = -dy;
      
      // Randomly change direction slightly
      if (Math.random() < 0.02) {
          const angle = Math.random() * 2 * Math.PI;
          dx = Math.cos(angle) * MOUSE_SPEED;
          dy = Math.sin(angle) * MOUSE_SPEED;
      }

      setMouseVelocity({ dx, dy });
      setMouseRotation(Math.atan2(dy, dx) * (180 / Math.PI) + 90);
      return { x, y };
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [mouseVelocity]);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, gameLoop]);

  const handleGameAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== GameState.Playing || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickPos: Position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const distance = Math.sqrt(
      Math.pow(clickPos.x - mousePosition.x, 2) +
      Math.pow(clickPos.y - mousePosition.y, 2)
    );

    if (distance < CATCH_RADIUS) {
      const newCatchCount = catchCount + 1;
      setCatchCount(newCatchCount);
      setCatchEffects(prev => [...prev, { id: Date.now(), position: { ...mousePosition } }]);
      if (newCatchCount >= 3) {
        setGameState(GameState.Win);
      } else {
        // Teleport mouse to a new location to make it harder
        setMousePosition({ x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT });
      }
    } else if (distance < SCARE_RADIUS) {
      scareMouse(clickPos);
    }
  };

  const removeCatchEffect = (id: number) => {
    setCatchEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const renderGameState = () => {
    switch (gameState) {
      case GameState.Start:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
            <h1 className="text-4xl font-bold text-yellow-300 mb-2">Bắt Chuột</h1>
            <p className="text-center text-lg mb-6 max-w-xs">Con chuột rất nhanh. Chạm vào màn hình sẽ làm nó đổi hướng. Bạn phải bắt được nó 3 lần để thắng!</p>
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg text-2xl hover:bg-yellow-400 transition-colors"
            >
              Bắt đầu
            </button>
          </div>
        );
      case GameState.Win:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
            <h1 className="text-5xl font-bold text-green-400 mb-4">Bạn đã thắng!</h1>
            <p className="text-xl mb-6">Bạn đã bắt được con chuột tinh ranh!</p>
             <div className="text-7xl mb-6">🏆🐁🏆</div>
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-400 transition-colors"
            >
              Chơi lại
            </button>
          </div>
        );
      case GameState.Playing:
        return (
           <>
            <Mouse position={mousePosition} rotation={mouseRotation} catchCount={catchCount} />
            {catchEffects.map(effect => (
              <CatchAnimation 
                key={effect.id} 
                position={effect.position} 
                onComplete={() => removeCatchEffect(effect.id)} 
              />
            ))}
            <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold">Bắt được: {catchCount} / 3</span>
            </div>
           </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 p-4 text-white">
        <h1 className="text-3xl font-bold mb-4">Trò chơi bắt chuột</h1>
      <div
        ref={gameAreaRef}
        className="relative bg-gray-700 border-4 border-gray-500 rounded-2xl shadow-lg cursor-crosshair"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px`, touchAction: 'none', overflow: 'hidden' }}
        onClick={handleGameAreaClick}
      >
        {renderGameState()}
      </div>
      <p className="mt-4 text-gray-400 text-center">Tạo bởi một kỹ sư React đẳng cấp thế giới.</p>
    </div>
  );
};

export default App;
