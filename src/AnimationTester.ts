import Animator from "./lib/Animator";
import ResourceManager from "./lib/ResourceManager";
import get2DContext from "./utils/get2DContext";

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

  constructor(public animator: Animator<string, unknown, unknown, unknown>) {
    this.element = document.createElement("div");
    this.element.style.display = "flex";
    this.element.style.flexDirection = "column";

    const label = document.createElement("div");
    label.innerText = "Origin";
    this.element.append(label);

    this.inputX = makeNumberInput(
      this.element,
      "X: ",
      animator.origin.x,
      (value) => (animator.origin.x = value),
    );
    this.inputY = makeNumberInput(
      this.element,
      "Y: ",
      animator.origin.y,
      (value) => (animator.origin.y = value),
    );
  }
}

class HitboxChanger {
  element: HTMLDivElement;
  inputX: HTMLInputElement;
  inputY: HTMLInputElement;
  inputW: HTMLInputElement;
  inputH: HTMLInputElement;

  constructor(public animator: Animator<string, unknown, unknown, unknown>) {
    this.element = document.createElement("div");
    this.element.style.display = "flex";
    this.element.style.flexDirection = "column";

    const label = document.createElement("div");
    label.innerText = "Hitbox";
    this.element.append(label);

    this.inputX = makeNumberInput(
      this.element,
      "X: ",
      animator.hitbox.x,
      (value) => (animator.hitbox.x = value),
    );
    this.inputY = makeNumberInput(
      this.element,
      "Y: ",
      animator.hitbox.y,
      (value) => (animator.hitbox.y = value),
    );
    this.inputW = makeNumberInput(
      this.element,
      "W: ",
      animator.hitbox.w,
      (value) => (animator.hitbox.w = value),
    );
    this.inputH = makeNumberInput(
      this.element,
      "H: ",
      animator.hitbox.h,
      (value) => (animator.hitbox.h = value),
    );
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

export default class AnimationTester<A extends string, S, E extends string, F> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rm: ResourceManager;
  img!: HTMLImageElement;
  time: DOMHighResTimeStamp;
  panel: HTMLDivElement;
  animationSelector: AnimationSelector<A>;
  horizontalFlipper: Flipper;
  originChanger: OriginChanger;
  hitboxChanger: HitboxChanger;
  eventShower: EventShower<E>;
  frameName: HTMLSpanElement;
  frameFlags: HTMLSpanElement;

  constructor(public animator: Animator<A, S, E, F>) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = animator.spritesheet.spriteWidth + 100;
    this.canvas.height = animator.spritesheet.spriteHeight + 100;
    this.ctx = get2DContext(this.canvas);
    document.body.append(this.canvas);

    this.rm = new ResourceManager();

    this.panel = document.createElement("div");
    this.panel.style.display = "flex";
    this.panel.style.flexDirection = "column";
    this.panel.style.rowGap = "4px";
    document.body.append(this.panel);

    this.animationSelector = new AnimationSelector(animator);
    this.panel.append(this.animationSelector.element);

    this.horizontalFlipper = new Flipper("Flip Horizontally?");
    this.panel.append(this.horizontalFlipper.element);

    this.originChanger = new OriginChanger(animator);
    this.panel.append(this.originChanger.element);

    this.hitboxChanger = new HitboxChanger(animator);
    this.panel.append(this.hitboxChanger.element);

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
    const { width, height } = canvas;
    const diff = newTime - time; // TODO cap this
    animator.advance(diff);
    eventShower.advance(diff);
    this.time = newTime;

    const { frame, hitbox, spritesheet } = animator;
    frameName.innerText = `Frame: ${frame.sprite}`;
    frameFlags.innerText = `Flags: ${(frame.flags ?? []).join(" ")}`;

    ctx.clearRect(0, 0, width, height);

    const rect = spritesheet.rects.get(frame.sprite);
    if (rect) {
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

    requestAnimationFrame(this.tick);
  };
}
