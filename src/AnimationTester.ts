import Animator from "./lib/Animator";
import { Milliseconds } from "./lib/flavours";
import ResourceManager from "./lib/ResourceManager";
import Runnable from "./lib/Runnable";
import get2DContext from "./utils/get2DContext";
import makeElement from "./utils/makeElement";

class AnimationSelector {
  element: HTMLLabelElement;
  select: HTMLSelectElement;

  constructor(tester: AnimationTester) {
    this.element = makeElement("label", tester.panel, {
      innerText: "Animation: ",
    });
    this.select = makeElement(
      "select",
      this.element,
      { name: "animation" },
      {},
      {
        change: () => {
          const anim = this.select.value;
          tester.animator.changeAnimation(anim);
        },
      },
    );
  }

  use(animator: Animator) {
    this.select.innerHTML = "";

    for (const [name] of animator.animations)
      makeElement("option", this.select, {
        selected: name === animator.currentAnimation,
        textContent: name,
        value: name,
      });
  }
}

class Flipper {
  element: HTMLLabelElement;
  box: HTMLInputElement;

  constructor(parent: HTMLElement, label: string) {
    this.element = makeElement("label", parent, { innerText: label });
    this.box = makeElement("input", this.element, {
      name: label,
      type: "checkbox",
    });
  }
}

const makeNumberInput = (
  parent: HTMLElement,
  labelText: string,
  value: number,
  onChange?: (value: number) => unknown,
) => {
  const label = makeElement("label", parent, { innerText: labelText });
  const input = makeElement("input", label, {
    type: "number",
    name: labelText,
    valueAsNumber: value,
  });

  if (onChange)
    input.addEventListener("change", () => onChange(input.valueAsNumber));

  return input;
};

class OriginChanger {
  element: HTMLDivElement;
  inputX: HTMLInputElement;
  inputY: HTMLInputElement;

  constructor(private tester: AnimationTester) {
    this.element = makeElement(
      "div",
      tester.panel,
      {},
      { display: "flex", flexDirection: "column" },
    );

    makeElement("div", this.element, { innerText: "Origin" });

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
    this.element = makeElement(
      "div",
      tester.panel,
      {},
      { display: "flex", flexDirection: "column" },
    );

    makeElement("div", this.element, { innerText: "Hitbox" });

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
    this.element = makeElement(
      "div",
      tester.panel,
      { innerText: "hello" },
      { opacity: "0" },
    );
    this.opacity = 0;
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
    this.element = makeElement(
      "select",
      tester.panel,
      { name: "animator" },
      {},
      { change: () => tester.change(this.element.selectedIndex) },
    );

    for (const animator of tester.animators)
      makeElement("option", this.element, { innerText: animator.name });
  }
}

export default class AnimationTester extends Runnable {
  element: HTMLElement;
  animatorIndex!: number;
  animatorSelector: AnimatorSelector;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  panel: HTMLDivElement;
  animationSelector: AnimationSelector;
  horizontalFlipper: Flipper;
  originChanger: OriginChanger;
  hitboxChanger: HitboxChanger;
  eventShower: EventShower;
  frameName: HTMLSpanElement;
  frameFlags: HTMLSpanElement;

  constructor(
    public parent: HTMLElement,
    public rm: ResourceManager,
    public animators: Animator[],
  ) {
    super();

    this.element = makeElement("div", parent);
    this.canvas = makeElement("canvas", this.element);
    this.ctx = get2DContext(this.canvas);

    this.panel = makeElement(
      "div",
      this.element,
      {},
      { display: "flex", flexDirection: "column", rowGap: "4px" },
    );

    this.animatorSelector = new AnimatorSelector(this);
    this.animationSelector = new AnimationSelector(this);
    this.horizontalFlipper = new Flipper(this.panel, "Flip Horizontally?");
    this.originChanger = new OriginChanger(this);
    this.hitboxChanger = new HitboxChanger(this);
    this.eventShower = new EventShower(this);

    this.frameName = makeElement("span", this.panel, {
      innerText: "Frame: ...",
    });

    this.frameFlags = makeElement("span", this.panel, { innerText: "Flags: " });
    this.change(0);
  }

  destroy() {
    super.destroy();
    this.stop();
    this.element.remove();
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

  advance(diff: Milliseconds) {
    const {
      animator,
      canvas,
      ctx,
      horizontalFlipper,
      eventShower,
      frameName,
      frameFlags,
    } = this;
    const { width, height } = canvas;
    animator.advance(diff);
    eventShower.advance(diff);

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
  }
}
