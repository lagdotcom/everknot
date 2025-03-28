import AnimationTester from "./AnimationTester";
import { animator as WoodyAnimator } from "./Woody";

async function startAnimationTester() {
  const t = new AnimationTester(WoodyAnimator);
  await t.load();
  t.run();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).t = t;
}

window.addEventListener("load", startAnimationTester);
