import { Pixels, Radians } from "./flavours";
import XY from "./XY";

export default class AR {
  constructor(
    public a: Radians,
    public r: Pixels,
  ) {}

  cartesian(): XY<Pixels> {
    return new XY(Math.cos(this.a) * this.r, Math.sin(this.a) * this.r);
  }
}
