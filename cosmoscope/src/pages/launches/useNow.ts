import { useEffect, useState } from "react";

// Single 1Hz tick shared across all countdown timers on the page.
const listeners = new Set<(now: number) => void>();
let intervalId: number | null = null;

function start() {
  if (intervalId !== null) return;
  intervalId = window.setInterval(() => {
    const t = Date.now();
    listeners.forEach((fn) => fn(t));
  }, 1000);
}

function stop() {
  if (intervalId !== null && listeners.size === 0) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

export function useNow(): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    listeners.add(setNow);
    start();
    return () => {
      listeners.delete(setNow);
      stop();
    };
  }, []);

  return now;
}
