import AnimationTester from "./AnimationTester";
import { kapplerAnimator } from "./Kappler";
import ResourceManager from "./lib/ResourceManager";
import { woodyAnimator } from "./Woody";

async function startAnimationTester() {
  const t = new AnimationTester(new ResourceManager(), [
    woodyAnimator,
    kapplerAnimator,
  ]);
  t.run();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).t = t;
}

window.addEventListener("load", startAnimationTester);
