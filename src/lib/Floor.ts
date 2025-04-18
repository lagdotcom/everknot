import { Pixels, Radians } from "./flavours";

export default class Floor {
  constructor(
    public bottom: Pixels,
    public top: Pixels,
    public left: Radians,
    public right: Radians,
    public passThrough = false,
  ) {}
}
