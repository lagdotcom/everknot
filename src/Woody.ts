import Animator, { AnimationData } from "./lib/Animator";
import AR from "./lib/AR";
import Entity from "./lib/Entity";
import { Milliseconds, Pixels, Radians } from "./lib/flavours";
import Rect from "./lib/Rect";
import SpriteGrid from "./lib/SpriteGrid";
import XY from "./lib/XY";
import woodyUrl from "./res/pc_woody.png";

/*
Cell order, left to right:
- Idle
- Turn frames (top to bottom is on ground turn, in air single jump turn, in air double jump turn, in air background leap turn, and in air foreground leap turn)
- Run
- Jump (loop last 4 frames only)
- Double Jump (loop last 4 frames only)
- Landing frames (play when landing jump, double jump, foreground and background leap)
- Background leap (loop last 4 frames only)
- Foreground leap (loop last 4 frames only)
- Default swing animation (there might be a lot more of these later)
- Foreground facing ward stance
- Same lane facing ward stance (left/right)
- Background ward stance
- Dodge (loop frames 3, 4, 5, and 6 til player hits ground, then play rest of animation, final two frames have a tiny bit of skid to them physic wise)
- Hurt (loop last 4 frames only, briefly)
- Death (on death, play hurt animation once fully, then death animation after)
*/

const spritesheet = new SpriteGrid(woodyUrl, 224, 224, [
  ["idle"],
  ["turn", "turn_jump", "turn_djump", "turn_bleap", "turn_fleap"],
  [
    "run1",
    "run2",
    "run3",
    "run4",
    "run5",
    "run6",
    "run7",
    "run8",
    "run9",
    "run10",
    "run11",
    "run12",
  ],
  ["jump1", "jump2", "jump3", "jump4", "jump5", "jump6"],
  ["djump1", "djump2", "djump3", "djump4", "djump5", "djump6"],
  ["land1", "land2"],
  ["bleap1", "bleap2", "bleap3", "bleap4", "bleap5", "bleap6"],
  ["fleap1", "fleap2", "fleap3", "fleap4", "fleap5", "fleap6"],
  [
    "swing1",
    "swing2",
    "swing3",
    "swing4",
    "swing5",
    "swing6",
    "swing7",
    "swing8",
    "swing9",
    "swing10",
  ],
  ["wardf1", "wardf2", "wardf3", "wardf4"],
  ["ward1", "ward2", "ward3", "ward4"],
  ["wardb1", "wardb2", "wardb3", "wardb4"],
  [
    "dodge1",
    "dodge2",
    "dodge3",
    "dodge4",
    "dodge5",
    "dodge6",
    "dodge7",
    "dodge8",
    "dodge9",
    "dodge10",
  ],
  ["hurt1", "hurt2", "hurt3", "hurt4", "hurt5", "hurt6"],
  [
    "death1",
    "death2",
    "death3",
    "death4",
    "death5",
    "death6",
    "death7",
    "death8",
    "death9",
    "death10",
    "death11",
    "death12",
    "death13",
    "death14",
    "death15",
    "death16",
  ],
] as const);

const turnTime: Milliseconds = 80;

type Animation =
  | "idle"
  | "turn"
  | "turn_jump"
  | "turn_djump"
  | "turn_bleap"
  | "turn_fleap"
  | "run"
  | "jump"
  | "djump"
  | "land"
  | "bleap"
  | "fleap"
  | "swing"
  | "ward"
  | "wardb"
  | "wardf"
  | "dodge"
  | "dodge_end"
  | "hurt"
  | "death";
type Sprite = typeof spritesheet extends SpriteGrid<infer T> ? T : never;

type Event = "turn" | "land" | "swing" | "dodge" | "hurt" | "death";

type Flag = "Ward" | "WardB" | "WardF" | "NoControl" | "Midair";
const nc: Flag = "NoControl";

const animationData: AnimationData<Animation, Sprite, Event, Flag> = {
  idle: { frames: [{ sprite: "idle", time: Infinity }] },
  turn: { finishEvent: "turn", frames: [{ sprite: "turn", time: turnTime }] },
  turn_jump: {
    finishEvent: "turn",
    frames: [{ sprite: "turn_jump", time: turnTime, flags: ["Midair"] }],
  },
  turn_djump: {
    finishEvent: "turn",
    frames: [{ sprite: "turn_djump", time: turnTime, flags: ["Midair"] }],
  },
  turn_bleap: {
    finishEvent: "turn",
    frames: [{ sprite: "turn_bleap", time: turnTime, flags: ["Midair"] }],
  },
  turn_fleap: {
    finishEvent: "turn",
    frames: [{ sprite: "turn_fleap", time: turnTime, flags: ["Midair"] }],
  },
  run: {
    loop: 1,
    frames: [
      { sprite: "run1", time: 80 },
      { sprite: "run2", time: 80 },
      { sprite: "run3", time: 80 },
      { sprite: "run4", time: 80 },
      { sprite: "run5", time: 80 },
      { sprite: "run6", time: 80 },
      { sprite: "run7", time: 80 },
      { sprite: "run8", time: 80 },
      { sprite: "run9", time: 80 },
      { sprite: "run10", time: 80 },
      { sprite: "run11", time: 80 },
      { sprite: "run12", time: 80 },
    ],
  },
  jump: {
    loop: 3,
    frames: [
      { sprite: "jump1", time: 80, flags: ["Midair"] },
      { sprite: "jump2", time: 80, flags: ["Midair"] },
      { sprite: "jump3", time: 80, flags: ["Midair"] },
      { sprite: "jump4", time: 80, flags: ["Midair"] },
      { sprite: "jump5", time: 80, flags: ["Midair"] },
      { sprite: "jump6", time: 80, flags: ["Midair"] },
    ],
  },
  djump: {
    loop: 3,
    frames: [
      { sprite: "djump1", time: 80, flags: ["Midair"] },
      { sprite: "djump2", time: 80, flags: ["Midair"] },
      { sprite: "djump3", time: 80, flags: ["Midair"] },
      { sprite: "djump4", time: 80, flags: ["Midair"] },
      { sprite: "djump5", time: 80, flags: ["Midair"] },
      { sprite: "djump6", time: 80, flags: ["Midair"] },
    ],
  },
  land: {
    finishEvent: "land",
    frames: [
      { sprite: "land1", time: 80 },
      { sprite: "land2", time: 80 },
    ],
  },
  bleap: {
    loop: 3,
    frames: [
      { sprite: "bleap1", time: 80, flags: ["Midair"] },
      { sprite: "bleap2", time: 80, flags: ["Midair"] },
      { sprite: "bleap3", time: 80, flags: ["Midair"] },
      { sprite: "bleap4", time: 80, flags: ["Midair"] },
      { sprite: "bleap5", time: 80, flags: ["Midair"] },
      { sprite: "bleap6", time: 80, flags: ["Midair"] },
    ],
  },
  fleap: {
    loop: 3,
    frames: [
      { sprite: "fleap1", time: 80, flags: ["Midair"] },
      { sprite: "fleap2", time: 80, flags: ["Midair"] },
      { sprite: "fleap3", time: 80, flags: ["Midair"] },
      { sprite: "fleap4", time: 80, flags: ["Midair"] },
      { sprite: "fleap5", time: 80, flags: ["Midair"] },
      { sprite: "fleap6", time: 80, flags: ["Midair"] },
    ],
  },
  swing: {
    finishEvent: "swing",
    frames: [
      { sprite: "swing1", time: 80 },
      { sprite: "swing2", time: 80 },
      { sprite: "swing3", time: 80 },
      { sprite: "swing4", time: 80 },
      { sprite: "swing5", time: 80 },
      { sprite: "swing6", time: 80 },
      { sprite: "swing7", time: 80 },
      { sprite: "swing8", time: 80 },
      { sprite: "swing9", time: 80 },
      { sprite: "swing10", time: 80 },
    ],
  },
  wardf: {
    loop: 1,
    frames: [
      { sprite: "wardf1", time: 80, flags: ["WardF"] },
      { sprite: "wardf2", time: 80, flags: ["WardF"] },
      { sprite: "wardf3", time: 80, flags: ["WardF"] },
      { sprite: "wardf4", time: 80, flags: ["WardF"] },
    ],
  },
  ward: {
    loop: 1,
    frames: [
      { sprite: "ward1", time: 80, flags: ["Ward"] },
      { sprite: "ward2", time: 80, flags: ["Ward"] },
      { sprite: "ward3", time: 80, flags: ["Ward"] },
      { sprite: "ward4", time: 80, flags: ["Ward"] },
    ],
  },
  wardb: {
    loop: 1,
    frames: [
      { sprite: "wardb1", time: 80, flags: ["WardB"] },
      { sprite: "wardb2", time: 80, flags: ["WardB"] },
      { sprite: "wardb3", time: 80, flags: ["WardB"] },
      { sprite: "wardb4", time: 80, flags: ["WardB"] },
    ],
  },
  dodge: {
    loop: 3,
    frames: [
      { sprite: "dodge1", time: 80, flags: [nc] },
      { sprite: "dodge2", time: 80, flags: [nc] },
      { sprite: "dodge3", time: 80, flags: [nc] },
      { sprite: "dodge4", time: 80, flags: [nc] },
      { sprite: "dodge5", time: 80, flags: [nc] },
    ],
  },
  dodge_end: {
    finishEvent: "dodge",
    frames: [
      { sprite: "dodge6", time: 80, flags: [nc] },
      { sprite: "dodge7", time: 80, flags: [nc] },
      { sprite: "dodge8", time: 80, flags: [nc] },
      { sprite: "dodge9", time: 80, flags: [nc] },
      { sprite: "dodge10", time: 80, flags: [nc] },
    ],
  },
  hurt: {
    finishEvent: "hurt",
    frames: [
      { sprite: "hurt1", time: 80, flags: [nc] },
      { sprite: "hurt2", time: 80, flags: [nc] },
      { sprite: "hurt3", time: 80, flags: [nc] },
      { sprite: "hurt4", time: 80, flags: [nc] },
      { sprite: "hurt5", time: 80, flags: [nc] },
      { sprite: "hurt6", time: 80, flags: [nc] },
    ],
  },
  death: {
    finishEvent: "death",
    frames: [
      { sprite: "death1", time: 80, flags: [nc] },
      { sprite: "death2", time: 80, flags: [nc] },
      { sprite: "death3", time: 80, flags: [nc] },
      { sprite: "death4", time: 80, flags: [nc] },
      { sprite: "death5", time: 80, flags: [nc] },
      { sprite: "death6", time: 80, flags: [nc] },
      { sprite: "death7", time: 80, flags: [nc] },
      { sprite: "death8", time: 80, flags: [nc] },
      { sprite: "death9", time: 80, flags: [nc] },
      { sprite: "death10", time: 80, flags: [nc] },
      { sprite: "death11", time: 80, flags: [nc] },
      { sprite: "death12", time: 80, flags: [nc] },
      { sprite: "death13", time: 80, flags: [nc] },
      { sprite: "death14", time: 80, flags: [nc] },
      { sprite: "death15", time: 80, flags: [nc] },
      { sprite: "death16", time: 80, flags: [nc] },
    ],
  },
};

export const woodyAnimator = new Animator<Animation, Sprite, Event, Flag>(
  "Woody",
  spritesheet,
  "idle",
  new XY<Pixels>(110, 175),
  new Rect<Pixels>(62, 80, 102, 90),
  animationData,
);

type Facing = -1 | 1;

const walkSpeed: Radians = 0.05;
const jumpStrength: Pixels = 0.7;

export class Woody extends Entity<Animation, Sprite, Event, Flag> {
  facing: Facing;
  flippingTo?: Facing;
  doubleJump: boolean;
  landing: boolean;

  constructor(position: AR) {
    super(woodyAnimator, position);
    this.facing = 1;
    this.doubleJump = false;
    this.gravity = true;
    this.landing = false;

    this.animator.on("land", this.onLand);
    this.animator.on("turn", this.onTurn);
  }

  destroy() {
    this.animator.off("land", this.onLand);
    this.animator.off("turn", this.onTurn);
  }

  onLand = () => {
    this.landing = false;
  };

  onTurn = () => {
    this.facing = this.flippingTo ?? 1;
    this.flippingTo = undefined;
    this.flip = this.facing === -1;
  };

  update(time: Milliseconds) {
    const { animator, doubleJump, flippingTo, floor, landing, velocity } = this;

    if (flippingTo) {
      if (!floor)
        animator.continueAnimation(doubleJump ? "turn_jump" : "turn_djump");
      else animator.continueAnimation("turn");
    } else if (floor) {
      if (animator.frame.flags?.includes("Midair") || landing) {
        animator.continueAnimation("land");
        this.doubleJump = true;
        this.landing = true;
      } else if (velocity.a) animator.continueAnimation("run");
      else animator.continueAnimation("idle");
    } else {
      animator.continueAnimation(doubleJump ? "jump" : "djump");
    }

    animator.advance(time);
  }

  face(direction: Facing) {
    if (this.facing === direction) return;
    this.flippingTo = direction;
  }

  walk(direction: Facing) {
    this.velocity.a = direction * walkSpeed;
    this.face(direction);
  }

  get canJump() {
    return !!this.floor || this.doubleJump;
  }

  jump() {
    if (this.velocity.r > 0 || !this.canJump) return;

    this.velocity.r = jumpStrength;
    if (this.doubleJump && !this.floor) this.doubleJump = false;
  }
}
