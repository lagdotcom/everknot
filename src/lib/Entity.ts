import Animator from "./Animator";
import AR from "./AR";
import { Milliseconds } from "./flavours";
import Floor from "./Floor";

export default class Entity<
  TAnimation extends string = string,
  TSprite = string,
  TEvent = string,
  TFlag = string,
> {
  flip: boolean;
  gravity: boolean;
  floor?: Floor;

  constructor(
    public animator: Animator<TAnimation, TSprite, TEvent, TFlag>,
    public position: AR,
    public velocity = new AR(0, 0),
  ) {
    this.flip = false;
    this.gravity = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}

  update(time: Milliseconds) {
    this.animator.advance(time);
  }
}
