import get2DContext from "../utils/get2DContext";
import makeElement from "../utils/makeElement";
import { Woody } from "../Woody";
import AR from "./AR";
import Entity from "./Entity";
import { Milliseconds, Pixels, Radians } from "./flavours";
import Floor from "./Floor";
import Rect from "./Rect";
import ResourceManager from "./ResourceManager";
import Runnable from "./Runnable";

const circle: Radians = Math.PI * 2;
const halfCircle = circle / 2;
const quarterCircle = circle / 4;

const GravityAcceleration: Pixels = 0.003;
const FrictionCoefficient = 0.8;
const VelocityEpsilon = 0.001;

export default class Game extends Runnable {
  floors: Floor[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: Woody;
  entities: Entity[];
  keys: Set<string>;

  constructor(
    public parent: HTMLElement,
    public rm: ResourceManager,
  ) {
    super();

    this.canvas = makeElement("canvas", parent, { width: 1024, height: 768 });
    this.ctx = get2DContext(this.canvas);
    this.keys = new Set();

    const f = 100;
    const t = 20;
    this.floors = [
      new Floor(f, f + t, 0, circle),
      // new Floor(f + 80, f + 80 + t, 1, 1.5),
      // new Floor(f + 100, f + 100 + t, 2, 2.5),
    ];

    this.player = new Woody(new AR(-quarterCircle, f + 50));
    void rm.image(this.player.animator.spritesheet.url);
    this.entities = [this.player];

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key);
  };

  onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
  };

  destroy() {
    super.destroy();
    this.stop();
    this.canvas.remove();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);

    for (const e of this.entities) e.destroy();
  }

  advance(time: Milliseconds) {
    if (this.keys.has("ArrowLeft")) this.player.walk(-1);
    else if (this.keys.has("ArrowRight")) this.player.walk(1);

    if (this.keys.has("ArrowUp")) this.player.jump();

    for (const e of this.entities) {
      if (e.gravity) this.gravity(e, time);
      this.physics(e, time);
      e.update(time);
    }

    this.draw();
  }

  private gravity(e: Entity, time: Milliseconds) {
    e.velocity.r -= GravityAcceleration * time;
  }

  private physics(e: Entity, time: Milliseconds) {
    let { a, r } = e.position;
    let { a: va, r: vr } = e.velocity;

    a += ((va * circle) / r) * time;
    r += vr * time;

    e.floor = undefined;
    if (vr <= 0) {
      const floor = this.getFloor(new AR(a, r), e.animator.hitbox);
      if (floor) {
        e.floor = floor;
        r = floor.top;
        va *= FrictionCoefficient;
        vr = 0;
      }
    }

    if (r < 0) {
      r = -r;
      a += halfCircle;
      vr *= -1;
    }

    e.position.a = a;
    e.position.r = r;
    e.velocity.a = Math.abs(va) < VelocityEpsilon ? 0 : va;
    e.velocity.r = Math.abs(vr) < VelocityEpsilon ? 0 : vr;
  }

  getFloor(ar: AR, hitbox: Rect<Pixels>) {
    for (const f of this.floors) {
      if (ar.r > f.top || ar.r + hitbox.h < f.bottom) continue;

      // TODO angle check
      return f;
    }
  }

  draw() {
    const { canvas, ctx, entities, floors, rm } = this;
    const { width: w, height: h } = canvas;

    ctx.reset();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    // move camera to centre
    ctx.translate(w / 2, h / 2);

    for (const f of floors) {
      ctx.strokeStyle = "silver";

      ctx.beginPath();
      ctx.arc(0, 0, f.top, f.left, f.right);
      ctx.arc(0, 0, f.bottom, f.right, f.left, true);
      ctx.lineTo(Math.cos(f.left) * f.top, Math.sin(f.left) * f.top);
      ctx.stroke();
    }

    for (const e of entities) {
      ctx.save();

      const { frame, hitbox, origin, spritesheet } = e.animator;
      const img = rm.images[spritesheet.url];
      const rect = spritesheet.rects.get(frame.sprite);
      const xy = e.position.cartesian();
      const { x: ox, y: oy } = origin;

      if (img && rect) {
        ctx.translate(xy.x, xy.y);
        ctx.rotate(e.position.a + quarterCircle);

        if (e.flip) {
          ctx.translate(ox, -oy);
          ctx.scale(-1, 1);
        } else {
          ctx.translate(-ox, -oy);
        }

        ctx.drawImage(
          img,
          rect.x,
          rect.y,
          rect.w,
          rect.h,
          0,
          0,
          rect.w,
          rect.h,
        );

        // ctx.strokeStyle = "silver";
        // ctx.beginPath();
        // ctx.rect(-1, -1, rect.w + 2, rect.h + 2);
        // ctx.stroke();
      }

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

      ctx.restore();
    }
  }
}
