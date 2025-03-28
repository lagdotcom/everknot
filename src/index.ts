import Animator from "./lib/Animator";
import ResourceManager from "./lib/ResourceManager";
import { animator as WoodyAnimator } from "./Woody";

function get2DContext(
  canvas: HTMLCanvasElement,
  settings?: CanvasRenderingContext2DSettings,
) {
  const ctx = canvas.getContext("2d", settings);
  if (!ctx) throw new Error(`Could not get 2d context`);
  return ctx;
}

class AnimationSelector<A extends string> {
  element: HTMLLabelElement;
  select: HTMLSelectElement;

  constructor(public animator: Animator<A, unknown, unknown, unknown>) {
    this.element = document.createElement("label");
    this.element.innerText = "Animation: ";

    this.select = document.createElement("select");
    this.element.append(this.select);

    for (const [name] of animator.animations) {
      const option = document.createElement("option");
      option.selected = name === animator.currentAnimation;
      option.value = name;
      option.textContent = name;

      this.select.append(option);
    }

    this.select.addEventListener("change", () => {
      const anim = this.select.value as A;
      animator.changeAnimation(anim);
    });
  }
}

class Flipper {
  element: HTMLLabelElement;
  box: HTMLInputElement;

  constructor(label: string) {
    this.element = document.createElement("label");
    this.element.innerText = label;

    this.box = document.createElement("input");
    this.box.type = "checkbox";
    this.element.append(this.box);
  }
}

class EventShower<E extends string> {
  element: HTMLDivElement;
  opacity: number;

  constructor(public animator: Animator<string, unknown, E, unknown>) {
    const events = new Set<E>();
    for (const anim of animator.animations.values()) {
      if (anim.finishEvent) events.add(anim.finishEvent);
      if (anim.loopEvent) events.add(anim.loopEvent);

      for (const frame of anim.frames)
        if (frame.startEvent) events.add(frame.startEvent);
    }

    for (const name of events) animator.on(name, this.show(name));

    this.element = document.createElement("div");
    this.element.innerText = "hello";
    this.opacity = 0;
    this.element.style.opacity = "0";
  }

  show = (name: E) => () => {
    this.element.innerText = `Event: ${name}`;
    this.opacity = 1;
  };

  advance(time: DOMHighResTimeStamp) {
    this.opacity -= time / 2000;
    this.element.style.opacity = this.opacity.toString();
  }
}

class AnimationTester<A extends string, S, E extends string, F> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rm: ResourceManager;
  img!: HTMLImageElement;
  time: DOMHighResTimeStamp;
  panel: HTMLDivElement;
  animationSelector: AnimationSelector<A>;
  horizontalFlipper: Flipper;
  eventShower: EventShower<E>;
  frameName: HTMLSpanElement;
  frameFlags: HTMLSpanElement;

  constructor(public animator: Animator<A, S, E, F>) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 320;
    this.canvas.height = 240;
    this.ctx = get2DContext(this.canvas);
    document.body.append(this.canvas);

    this.rm = new ResourceManager();

    this.panel = document.createElement("div");
    this.panel.style.display = "flex";
    this.panel.style.flexDirection = "column";
    document.body.append(this.panel);

    this.animationSelector = new AnimationSelector(animator);
    this.panel.append(this.animationSelector.element);

    this.horizontalFlipper = new Flipper("Flip Horizontally?");
    this.panel.append(this.horizontalFlipper.element);

    this.eventShower = new EventShower(animator);
    this.panel.append(this.eventShower.element);

    this.frameName = document.createElement("span");
    this.frameName.innerText = `Frame: ${animator.frame.sprite}`;
    this.panel.append(this.frameName);

    this.frameFlags = document.createElement("span");
    this.frameFlags.innerText = `Flags: `;
    this.panel.append(this.frameFlags);

    this.time = 0;
  }

  async load() {
    this.img = await this.rm.image(this.animator.spritesheet.url);
  }

  run() {
    this.time = performance.now();
    requestAnimationFrame(this.tick);
  }

  tick = (newTime: DOMHighResTimeStamp) => {
    const {
      animator,
      canvas,
      ctx,
      img,
      time,
      horizontalFlipper,
      eventShower,
      frameName,
      frameFlags,
    } = this;
    const diff = newTime - time; // TODO cap this
    animator.advance(diff);
    eventShower.advance(diff);
    this.time = newTime;

    const { frame, spritesheet } = animator;
    frameName.innerText = `Frame: ${frame.sprite}`;
    frameFlags.innerText = `Flags: ${(frame.flags ?? []).join(" ")}`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = spritesheet.rects.get(frame.sprite);
    if (rect) {
      const dx = (canvas.width - rect.w) / 2;
      const dy = (canvas.height - rect.h) / 2;

      if (horizontalFlipper.box.checked) {
        ctx.translate(dx + rect.w, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        img,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        dx,
        dy,
        rect.w,
        rect.h,
      );

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    requestAnimationFrame(this.tick);
  };
}

async function startAnimationTester() {
  const t = new AnimationTester(WoodyAnimator);
  await t.load();
  t.run();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).t = t;
}

window.addEventListener("load", startAnimationTester);
