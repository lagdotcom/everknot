export default class Rect<T extends number> {
  constructor(
    public x: T,
    public y: T,
    public w: T,
    public h: T,
  ) {}
}
