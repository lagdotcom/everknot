import { FrameIndex, Milliseconds, Pixels } from "./flavours";
import MapSet from "./MapSet";
import Rect from "./Rect";
import SpriteGrid from "./SpriteGrid";
import XY from "./XY";

interface Frame<TSprite, TEvent, TFlag> {
  sprite: TSprite;
  time: Milliseconds;
  startEvent?: TEvent;
  flags?: TFlag[];
}

interface Animation<TSprite, TEvent, TFlag> {
  loop?: FrameIndex;
  loopEvent?: TEvent;
  finishEvent?: TEvent;
  frames: Frame<TSprite, TEvent, TFlag>[];
}

type AnimationEventListener = () => void;

export type AnimationData<
  TAnimation extends string,
  TSprite,
  TEvent,
  TFlag,
> = Record<TAnimation, Animation<TSprite, TEvent, TFlag>>;

export default class Animator<
  TAnimation extends string = string,
  TSprite = string,
  TEvent = string,
  TFlag = string,
> {
  animations: Map<TAnimation, Animation<TSprite, TEvent, TFlag>>;
  frameIndex: FrameIndex;
  frameProgress: Milliseconds;
  listeners: MapSet<TEvent, AnimationEventListener>;

  constructor(
    public name: string,
    public spritesheet: SpriteGrid<TSprite>,
    public currentAnimation: TAnimation,
    public origin: XY<Pixels>,
    public hitbox: Rect<Pixels>,
    animations: AnimationData<TAnimation, TSprite, TEvent, TFlag>,
  ) {
    this.frameIndex = 1;
    this.frameProgress = 0;
    this.animations = new Map();
    this.listeners = new MapSet();

    for (const [name, data] of Object.entries(animations))
      this.animations.set(
        name as TAnimation,
        data as Animation<TSprite, TEvent, TFlag>,
      );
  }

  get anim() {
    const animation = this.animations.get(this.currentAnimation);
    if (!animation)
      throw new Error(`Invalid animation name: ${this.currentAnimation}`);
    return animation;
  }

  get frame() {
    return this.anim.frames[this.frameIndex - 1];
  }

  advance(time: Milliseconds) {
    const { anim, frame, frameIndex } = this;
    this.frameProgress += time;

    if (this.frameProgress >= frame.time) {
      this.frameProgress -= frame.time;

      if (frameIndex >= anim.frames.length) {
        const { finishEvent, loop, loopEvent } = anim;

        if (typeof loop === "number") {
          if (loopEvent) this.fire(loopEvent);
          this.changeIndex(loop);
        } else if (finishEvent) this.fire(finishEvent);
      } else {
        this.changeIndex(frameIndex + 1);
      }
    }
  }

  on(event: TEvent, listener: AnimationEventListener) {
    return this.listeners.add(event, listener);
  }

  off(event: TEvent, listener: AnimationEventListener) {
    return this.listeners.delete(event, listener);
  }

  changeAnimation(name: TAnimation) {
    const anim = this.animations.get(name);
    if (!anim) throw new Error(`Invalid animation name: ${name}`);

    this.currentAnimation = name;
    this.frameProgress = 0;
    this.changeIndex(1);
  }

  continueAnimation(name: TAnimation) {
    if (this.currentAnimation === name) return;
    return this.changeAnimation(name);
  }

  private changeIndex(index: FrameIndex) {
    const anim = this.anim;
    if (index < 1 || index > anim.frames.length)
      throw new Error(
        `Invalid frame index: ${index} in ${this.currentAnimation}`,
      );

    this.frameIndex = index;
    const frame = this.frame;
    if (frame.startEvent) this.fire(frame.startEvent);
  }

  private fire(name: TEvent) {
    for (const listener of this.listeners.get(name)) listener();
  }
}
