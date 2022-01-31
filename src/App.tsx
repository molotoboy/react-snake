import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useInterval } from './hooks/useInterval';
import {
  CANVAS_SIZE,
  APPLE_START,
  DIRECTIONS,
  SCALE,
  SNAKE_START,
  INITIAL_SPEED,
  DIRECTION_START,
  MAX_POINTS,
} from './constants';

export type Coords = {
  x: number;
  y: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasFinishedGame, setHasFinishedGame] = useState<boolean>(false);
  const [apple, setApple] = useState<Coords>(APPLE_START);
  const [lastSpeed, setLastSpeed] = useState<number | null>(200);
  const [speed, setSpeed] = useState<number | null>(null);
  const [snake, setSnake] = useState<Array<Coords>>(SNAKE_START);

  const [direction, setDirection] = useState<Coords>(DIRECTION_START);

  // Start Reset
  const startGame = () => {
    setHasFinishedGame(false);
    setPoints(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDirection(DIRECTION_START);
    setSpeed(INITIAL_SPEED);
    setLastSpeed(INITIAL_SPEED);
    controlRef.current?.focus();
  };

  // End
  const endGame = () => {
    setSpeed(null);
    setIsPlaying(false);
    setIsGameOver(true);
  };

  const moveSnake = (event: React.KeyboardEvent) => {
    event.preventDefault();

    // console.log(event.code);
    const { code } = event;
    if (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight'
    ) {
      if (direction.x + DIRECTIONS[code].x && direction.y + DIRECTIONS[code].y)
        setDirection(DIRECTIONS[code]);
    }
    if (code === 'Space') startGame();
  };

  const checkAppleCollision = (head: Coords) => {
    return head.x === apple.x && head.y === apple.y;
  };

  const checkCollision = (head: Coords, body: Coords[] = snake) => {
    if (
      head.x * SCALE >= CANVAS_SIZE.x - SCALE ||
      head.x <= 0 ||
      head.y * SCALE >= CANVAS_SIZE.y - SCALE ||
      head.y <= 0
    )
      return true;
    for (const segment of body) {
      if (head.x === segment.x && head.y === segment.y) return true;
    }
    return false;
  };

  const createApple = () => {
    return {
      x: Math.floor((Math.random() * CANVAS_SIZE.x) / SCALE),
      y: Math.floor((Math.random() * CANVAS_SIZE.y) / SCALE),
    };
  };

  // Update
  const gameUpdate = () => {
    const head = { ...snake[0] };
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // console.log('newHead ', newHead);
    if (checkCollision(newHead)) endGame();
    const newSnake = [newHead, ...snake];
    if (checkAppleCollision(newHead)) {
      setPoints(points + 1);
      if (points === MAX_POINTS) {
        setHasFinishedGame(true);
        endGame();
      }
      let newApple;
      do {
        newApple = createApple();
      } while (checkCollision(newApple, newSnake));

      setApple(newApple);
      setSpeed(Math.floor(speed! * 0.9));
    } else {
      newSnake.splice(-1);
    }
    setSnake(newSnake);
  };

  useEffect(() => {
    if (speed) {
      setLastSpeed(speed);
      console.log('speed ', speed);
    }
  }, [speed]);

  // Draw
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) throw new Error('Could not get context');
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);

    context.fillStyle = 'green';
    snake.forEach(({ x, y }) => context.fillRect(x, y, 1, 1));

    context.fillStyle = 'red';
    context.fillRect(apple.x, apple.y, 1, 1);
  }, [snake, apple]);

  // Next Update
  useInterval(() => gameUpdate(), speed);

  return (
    <div className="wrapper">
      <div
        ref={controlRef}
        tabIndex={0}
        className="controls"
        role="button"
        onKeyDown={(event: React.KeyboardEvent) => moveSnake(event)}
      >
        <canvas
          style={
            isGameOver
              ? { border: '1px solid black', opacity: 0.5 }
              : { border: '1px solid black' }
          }
          ref={canvasRef}
          width={CANVAS_SIZE.x}
          height={CANVAS_SIZE.y}
        />
        {isGameOver && <div className="game-over">Game Over</div>}
        {hasFinishedGame && (
          <div className="finished-game">Congratulations!!</div>
        )}
        {!isPlaying && (
          <button className="start" onClick={startGame}>
            Start
          </button>
        )}
        <div className="points">
          {points} ({lastSpeed})
        </div>
      </div>
    </div>
  );
}

export default App;
