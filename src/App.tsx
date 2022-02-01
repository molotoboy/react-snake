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
  SNAKE_SKIN_START,
  SNAKE_BEST_SCORE,
} from './constants';

export type Coords = {
  x: number;
  y: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(loadBestScore());
  const [isBestScore, setIsBestScore] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const [apple, setApple] = useState<Coords | null>(null);
  const [lastDelay, setLastDelay] = useState<number | null>(DELAY_START);
  const [delay, setDelay] = useState<number | null>(null);
  const [snake, setSnake] = useState<Array<Coords>>([]);
  const [direction, setDirection] = useState<Coords>(DIRECTION_START);

  const [appleScore, setAppleScore] = useState<number | null>(null);
  const [snakeSkin, setSnakeSkin] = useState<Array<number>>([]);

  // Start Reset
  function startGame() {
    setScore(0);
    setIsBestScore(false);
    setIsPlaying(true);
    setIsGameOver(false);
    setSnake(SNAKE_START);
    createApple(snake);
    setDirection(DIRECTION_START);
    setDelay(DELAY_START);
    setLastDelay(DELAY_START);
    setSnakeSkin(SNAKE_SKIN_START);
    controlRef.current?.focus();
  }

  // End
  function endGame() {
    setDelay(null);
    setIsPlaying(false);
    setIsGameOver(true);

    if (score > bestScore) {
      setBestScore(score);
      saveBestScore(score);
      setIsBestScore(true);
    }
  }

  function loadBestScore() {
    return parseInt(localStorage.getItem(SNAKE_BEST_SCORE) || '0');
  }

  function saveBestScore(score: number) {
    localStorage.setItem(SNAKE_BEST_SCORE, score.toString());
  }

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
      setScore(score + appleScore!);
      setSnakeSkin([appleScore!, ...snakeSkin]);

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
      const c = snakeSkin[i];

      context.fillStyle = 'rgb(0,' + Math.floor((255 / 100) * c) + ',0)';
      context.fillRect(x, y, 1, 1);
    }

    if (appleScore) {
      context.fillStyle =
        'rgb(' + Math.floor((255 / 100) * appleScore) + ',0,0)';
      context.fillRect(apple!.x, apple!.y, 1, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snake]);

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
        <div className="points">
          <div>Best:{bestScore}</div>
          <div>
            {score}({lastDelay})
          </div>
        </div>
        <canvas
          style={
            isGameOver
              ? { border: '5px solid black', opacity: 0.3 }
              : { border: '5px solid black' }
          }
          ref={canvasRef}
          width={CANVAS_SIZE.x}
          height={CANVAS_SIZE.y}
        />
        {isGameOver && <div className="game-over">Game Over</div>}
        {isBestScore && <div className="finished-game">New Best Score!</div>}
        {!isPlaying && (
          <button className="start" onClick={startGame}>
            Start
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
