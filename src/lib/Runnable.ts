import { Milliseconds } from "./flavours";

export default abstract class Runnable {
  request: number;
  running: boolean;
  time: Milliseconds;

  constructor(private maxTimeStep: Milliseconds = 1000 / 60) {
    this.running = false;
    this.request = NaN;
    this.time = 0;

    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  destroy() {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

  onVisibilityChange = () => {
    if (document.hidden) this.stop();
    else this.run();
  };

  run() {
    this.running = true;
    this.time = performance.now();
    this.schedule();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.request);
  }

  schedule() {
    this.request = requestAnimationFrame(this.tick);
  }

  tick = (newTime: Milliseconds) => {
    const diff = Math.min(newTime - this.time, this.maxTimeStep);
    this.time = newTime;

    this.advance(diff);
    if (this.running) this.schedule();
  };

  abstract advance(diff: Milliseconds): void;
}
