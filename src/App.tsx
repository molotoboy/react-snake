import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useInterval } from './hooks/useInterval';
import {
  CANVAS_SIZE,
  DIRECTIONS,
  SCALE,
  SNAKE_START,
  DELAY_START,
  DIRECTION_START,
  SNAKE_BODY_START,
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
  const [apple, setApple] = useState<Coords | null>(null);
  const [lastDelay, setLastDelay] = useState<number | null>(200);
  const [delay, setDelay] = useState<number | null>(null);
  const [snake, setSnake] = useState<Array<Coords>>([]);
  const [direction, setDirection] = useState<Coords>(DIRECTION_START);

  const [appleScore, setAppleScore] = useState<number | null>(null);
  const [snakeBody, setSnakeBody] = useState<Array<number>>([]);

  // Start Reset
  const startGame = () => {
    setHasFinishedGame(false);
    setPoints(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setSnake(SNAKE_START);
    createApple(snake);
    setDirection(DIRECTION_START);
    setDelay(DELAY_START);
    setLastDelay(DELAY_START);
    setSnakeBody(SNAKE_BODY_START);
    controlRef.current?.focus();
  };

  // End
  const endGame = () => {
    setDelay(null);
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
    return head.x === apple!.x && head.y === apple!.y;
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

  const generateApple = () => {
    return {
      x: Math.floor((Math.random() * CANVAS_SIZE.x) / SCALE),
      y: Math.floor((Math.random() * CANVAS_SIZE.y) / SCALE),
    };
  };

  const createApple = (snake: Coords[]) => {
    let newApple;
    do {
      newApple = generateApple();
    } while (checkCollision(newApple, snake));
    setApple(newApple);
    setAppleScore(100);
  };

  // Update
  const updateGame = () => {
    const head = { ...snake[0] };
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };
    // console.log('newHead ', newHead);
    if (checkCollision(newHead)) endGame();

    const newSnake = [newHead, ...snake];
    if (checkAppleCollision(newHead)) {
      setPoints(points + appleScore!);
      setSnakeBody([appleScore!, ...snakeBody]);

      if (appleScore! > 50) {
        setDelay(Math.floor(delay! * 0.95));
        console.log('fresh apple -', appleScore);
      } else {
        setDelay(Math.floor(delay! * 1.05));
        console.log('rotten apple -', appleScore);
      }
      createApple(newSnake);
    } else {
      newSnake.splice(-1);
      if (appleScore! > 5) {
        setAppleScore(appleScore! - 2);
      } else {
        createApple(newSnake);
      }
    }
    setSnake(newSnake);
  };

  useEffect(() => {
    if (delay) {
      setLastDelay(delay);
      console.log('delay ', delay);
    }
  }, [delay]);

  // Draw
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) throw new Error('Could not get context');
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);

    for (let i = 0; i < snake.length; ++i) {
      const { x, y } = snake[i];
      const c = snakeBody[i];

      context.fillStyle = 'rgb(0,' + Math.floor((255 / 100) * c) + ',0)';
      context.fillRect(x, y, 1, 1);
    }

    if (appleScore) {
      context.fillStyle =
        'rgb(' + Math.floor((255 / 100) * appleScore) + ',0,0)';
      context.fillRect(apple!.x, apple!.y, 1, 1);
    }
  }, [snake, apple, appleScore, snakeBody]);

  // Next Update
  useInterval(() => updateGame(), delay);

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
              ? { border: '5px solid black', opacity: 0.5 }
              : { border: '5px solid black' }
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
          {points} ({lastDelay})
        </div>
      </div>
    </div>
  );
}

export default App;
