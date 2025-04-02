export default class Rect<T extends number> {
  constructor(
    public x: T,
    public y: T,
    public w: T,
    public h: T,
  ) {}

  get ex() {
    return (this.x + this.w) as T;
  }

  get ey() {
    return (this.y + this.h) as T;
  }
}
