import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  onDone: () => void;
}

const COLORS = ['#C4F0E4', '#C9A96E', '#ffffff', '#a8f0d4', '#e8c585', '#d4faf0', '#f0dbb0'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export const Confetti: React.FC<ConfettiProps> = ({ onDone }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces: HTMLDivElement[] = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = randomBetween(5, 10);
      const startX = randomBetween(30, 70); // percent
      const dx = randomBetween(-140, 140);
      const dy = randomBetween(-200, -80);
      const rotation = randomBetween(0, 720);
      const duration = randomBetween(1000, 1600);
      const delay = randomBetween(0, 200);

      piece.style.cssText = `
        position: absolute;
        left: ${startX}%;
        bottom: 0;
        width: ${size}px;
        height: ${size * randomBetween(0.4, 1)}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        opacity: 1;
        transform: translate(0, 0) rotate(0deg);
        transition: transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
                    opacity ${duration * 0.6}ms ease ${delay + duration * 0.4}ms;
      `;

      container.appendChild(piece);
      pieces.push(piece);

      // trigger animation next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
          piece.style.opacity = '0';
        });
      });
    }

    const totalDuration = 1800;
    const timer = setTimeout(() => {
      onDone();
    }, totalDuration);

    return () => {
      clearTimeout(timer);
      pieces.forEach(p => p.remove());
    };
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 100,
      }}
    />
  );
};
