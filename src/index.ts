import AnimationTester from "./AnimationTester";
import { makeElement } from "./dom";
import { kapplerAnimator } from "./Kappler";
import ResourceManager from "./lib/ResourceManager";
import { woodyAnimator } from "./Woody";

const rm = new ResourceManager();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).rm = rm;

function startAnimationTester() {
  const t = new AnimationTester(document.body, rm, [
    woodyAnimator,
    kapplerAnimator,
  ]);
  t.run();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).t = t;

  return t.destroy.bind(t);
}

function initialiseUi() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let cleanup = () => {};

  const menu = makeElement("menu", document.body);
  makeElement(
    "button",
    menu,
    { innerText: "Animation Tester" },
    {},
    {
      click: () => {
        cleanup();
        cleanup = startAnimationTester();
      },
    },
  );
}

window.addEventListener("load", initialiseUi);
