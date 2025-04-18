import AnimationTester from "./AnimationTester";
import { kapplerAnimator } from "./Kappler";
import Game from "./lib/Game";
import ResourceManager from "./lib/ResourceManager";
import makeElement from "./utils/makeElement";
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

function startGame() {
  const g = new Game(document.body, rm);
  g.run();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).g = g;

  return g.destroy.bind(g);
}

function initialiseUi() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let cleanup = () => {};

  const menuHandler = (fn: () => () => void) => () => {
    cleanup();
    cleanup = fn();
  };

  const menu = makeElement("menu", document.body);
  makeElement(
    "button",
    menu,
    { innerText: "Game" },
    {},
    { click: menuHandler(startGame) },
  );
  makeElement(
    "button",
    menu,
    { innerText: "Animation Tester" },
    {},
    { click: menuHandler(startAnimationTester) },
  );
}

window.addEventListener("load", initialiseUi);
