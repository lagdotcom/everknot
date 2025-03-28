import { Pixels, URLString } from "./flavours";
import Rect from "./Rect";

export type SpriteColumnData<TSprite> = TSprite[][];

export default class Spritesheet<TSprite> {
  rects: Map<TSprite, Rect<Pixels>>;

  constructor(
    public url: URLString,
    public spriteWidth: Pixels,
    public spriteHeight: Pixels,
    spriteColumns: SpriteColumnData<TSprite>,
  ) {
    this.rects = new Map();

    let x: Pixels = 0;
    for (const column of spriteColumns) {
      let y: Pixels = 0;

      for (const sprite of column) {
        this.rects.set(sprite, new Rect(x, y, spriteWidth, spriteHeight));
        y += spriteHeight;
      }

      x += spriteWidth;
    }
  }
}
