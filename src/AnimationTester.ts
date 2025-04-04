import Animator from "./lib/Animator";
import ResourceManager from "./lib/ResourceManager";
import get2DContext from "./utils/get2DContext";

class AnimationSelector {
  element: HTMLLabelElement;
  select: HTMLSelectElement;

  constructor(tester: AnimationTester) {
    this.element = document.createElement("label");
    this.element.innerText = "Animation: ";

    this.select = document.createElement("select");
    this.element.append(this.select);

    this.select.addEventListener("change", () => {
      const anim = this.select.value;
      tester.animator.changeAnimation(anim);
    });
  }

  use(animator: Animator) {
    this.select.innerHTML = "";

    for (const [name] of animator.animations) {
      const option = document.createElement("option");
      option.selected = name === animator.currentAnimation;
      option.value = name;
      option.textContent = name;

      this.select.append(option);
    }
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

const makeNumberInput = (
  parent: HTMLElement,
  labelText: string,
  value: number,
  onChange?: (value: number) => unknown,
) => {
  const label = document.createElement("label");
  label.innerText = labelText;
  parent.append(label);

  const input = document.createElement("input");
  input.type = "number";
  input.valueAsNumber = value;
  label.append(input);

  if (onChange)
    input.addEventListener("change", () => onChange(input.valueAsNumber));

  return input;
};

class OriginChanger {
  element: HTMLDivElement;
  inputX: HTMLInputElement;
  inputY: HTMLInputElement;

  constructor(private tester: AnimationTester) {
    this.element = document.createElement("div");
    this.element.style.display = "flex";
    this.element.style.flexDirection = "column";

    const label = document.createElement("div");
    label.innerText = "Origin";
    this.element.append(label);

    this.inputX = makeNumberInput(
      this.element,
      "X: ",
      0,
      (value) => (tester.animator.origin.x = value),
    );
    this.inputY = makeNumberInput(
      this.element,
      "Y: ",
      0,
      (value) => (tester.animator.origin.y = value),
    );
  }

  use(animator: Animator) {
    this.inputX.valueAsNumber = animator.origin.x;
    this.inputY.valueAsNumber = animator.origin.y;
  }
}

class HitboxChanger {
  element: HTMLDivElement;
  inputX: HTMLInputElement;
  inputY: HTMLInputElement;
  inputW: HTMLInputElement;
  inputH: HTMLInputElement;

  constructor(tester: AnimationTester) {
    this.element = document.createElement("div");
    this.element.style.display = "flex";
    this.element.style.flexDirection = "column";

    const label = document.createElement("div");
    label.innerText = "Hitbox";
    this.element.append(label);

    this.inputX = makeNumberInput(
      this.element,
      "X: ",
      0,
      (value) => (tester.animator.hitbox.x = value),
    );
    this.inputY = makeNumberInput(
      this.element,
      "Y: ",
      0,
      (value) => (tester.animator.hitbox.y = value),
    );
    this.inputW = makeNumberInput(
      this.element,
      "W: ",
      0,
      (value) => (tester.animator.hitbox.w = value),
    );
    this.inputH = makeNumberInput(
      this.element,
      "H: ",
      0,
      (value) => (tester.animator.hitbox.h = value),
    );
  }

  use(animator: Animator) {
    this.inputX.valueAsNumber = animator.hitbox.x;
    this.inputY.valueAsNumber = animator.hitbox.y;
    this.inputW.valueAsNumber = animator.hitbox.w;
    this.inputH.valueAsNumber = animator.hitbox.h;
  }
}

class EventShower {
  attached: Set<Animator>;
  element: HTMLDivElement;
  opacity: number;

  constructor(private tester: AnimationTester) {
    this.attached = new Set();

    this.element = document.createElement("div");
    this.element.innerText = "hello";
    this.opacity = 0;
    this.element.style.opacity = "0";
  }

  show = (name: string) => () => {
    this.element.innerText = `Event: ${name}`;
    this.opacity = 1;
  };

  advance(time: DOMHighResTimeStamp) {
    this.opacity -= time / 2000;
    this.element.style.opacity = this.opacity.toString();
  }

  use(animator: Animator) {
    if (this.attached.has(animator)) return;
    this.attached.add(animator);

    const events = new Set<string>();
    for (const anim of animator.animations.values()) {
      if (anim.finishEvent) events.add(anim.finishEvent);
      if (anim.loopEvent) events.add(anim.loopEvent);

      for (const frame of anim.frames)
        if (frame.startEvent) events.add(frame.startEvent);
    }

    for (const name of events) animator.on(name, this.show(name));
  }
}

class AnimatorSelector {
  element: HTMLSelectElement;

  constructor(tester: AnimationTester) {
    this.element = document.createElement("select");

    for (const animator of tester.animators) {
      const option = document.createElement("option");
      option.innerText = animator.name;
      this.element.append(option);
    }

    this.element.addEventListener("change", () =>
      tester.change(this.element.selectedIndex),
    );
  }
}

export default class AnimationTester {
  animatorIndex!: number;
  animatorSelector: AnimatorSelector;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  time: DOMHighResTimeStamp;
  paused: boolean;
  request!: number;
  panel: HTMLDivElement;
  animationSelector: AnimationSelector;
  horizontalFlipper: Flipper;
  originChanger: OriginChanger;
  hitboxChanger: HitboxChanger;
  eventShower: EventShower;
  frameName: HTMLSpanElement;
  frameFlags: HTMLSpanElement;

  constructor(
    public rm: ResourceManager,
    public animators: Animator[],
  ) {
    this.canvas = document.createElement("canvas");
    this.ctx = get2DContext(this.canvas);
    document.body.append(this.canvas);

    this.panel = document.createElement("div");
    this.panel.style.display = "flex";
    this.panel.style.flexDirection = "column";
    this.panel.style.rowGap = "4px";
    document.body.append(this.panel);

    this.animatorSelector = new AnimatorSelector(this);
    this.panel.append(this.animatorSelector.element);

    this.animationSelector = new AnimationSelector(this);
    this.panel.append(this.animationSelector.element);

    this.horizontalFlipper = new Flipper("Flip Horizontally?");
    this.panel.append(this.horizontalFlipper.element);

    this.originChanger = new OriginChanger(this);
    this.panel.append(this.originChanger.element);

    this.hitboxChanger = new HitboxChanger(this);
    this.panel.append(this.hitboxChanger.element);

    this.eventShower = new EventShower(this);
    this.panel.append(this.eventShower.element);

    this.frameName = document.createElement("span");
    this.frameName.innerText = `Frame: ...`;
    this.panel.append(this.frameName);

    this.frameFlags = document.createElement("span");
    this.frameFlags.innerText = `Flags: `;
    this.panel.append(this.frameFlags);

    this.time = 0;
    this.paused = false;
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.change(0);
  }

  get animator() {
    return this.animators[this.animatorIndex];
  }

  change(index: number) {
    this.animatorIndex = index;

    const animator = this.animator;

    this.canvas.width = Math.max(
      this.canvas.width,
      animator.spritesheet.spriteWidth + 100,
    );
    this.canvas.height = Math.max(
      this.canvas.height,
      animator.spritesheet.spriteHeight + 100,
    );

    this.animationSelector.use(animator);
    this.originChanger.use(animator);
    this.hitboxChanger.use(animator);
    this.eventShower.use(animator);

    void this.rm.image(animator.spritesheet.url);
  }

  run() {
    this.time = performance.now();
    this.schedule();
  }

  schedule() {
    this.request = requestAnimationFrame(this.tick);
  }

  onVisibilityChange = () => {
    if (document.hidden) {
      this.paused = true;
      cancelAnimationFrame(this.request);
    } else {
      this.paused = false;
      this.run();
    }
  };

  tick = (newTime: DOMHighResTimeStamp) => {
    const {
      animator,
      canvas,
      ctx,
      time,
      horizontalFlipper,
      eventShower,
      frameName,
      frameFlags,
    } = this;
    const { width, height } = canvas;
    const diff = newTime - time; // TODO cap this
    animator.advance(diff);
    eventShower.advance(diff);
    this.time = newTime;

    const { frame, hitbox, spritesheet } = animator;
    frameName.innerText = `Frame: ${frame.sprite}`;
    frameFlags.innerText = `Flags: ${(frame.flags ?? []).join(" ")}`;

    ctx.clearRect(0, 0, width, height);

    const img = this.rm.images[spritesheet.url];
    const rect = spritesheet.rects.get(frame.sprite);
    if (img && rect) {
      const mx = width / 2;
      const my = (height / 4) * 3;
      const { x: ox, y: oy } = animator.origin;

      if (horizontalFlipper.box.checked) {
        ctx.translate(ox + mx, my - oy);
        ctx.scale(-1, 1);
      } else ctx.translate(mx - ox, my - oy);

      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

      // draw frame bounds
      ctx.strokeStyle = "silver";
      ctx.beginPath();
      ctx.rect(-1, -1, rect.w + 2, rect.h + 2);
      ctx.stroke();

      // draw origin point
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.moveTo(ox - 5, oy - 5);
      ctx.lineTo(ox + 5, oy + 5);
      ctx.moveTo(ox - 5, oy + 5);
      ctx.lineTo(ox + 5, oy - 5);
      ctx.stroke();

      // draw hitbox
      ctx.strokeStyle = "rgba(255,0,0,100)";
      ctx.beginPath();
      ctx.moveTo(hitbox.x, hitbox.y);
      ctx.lineTo(hitbox.ex, hitbox.y);
      ctx.lineTo(hitbox.ex, hitbox.ey);
      ctx.lineTo(hitbox.x, hitbox.ey);
      ctx.lineTo(hitbox.x, hitbox.y);
      ctx.stroke();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (!this.paused) this.schedule();
  };
}
