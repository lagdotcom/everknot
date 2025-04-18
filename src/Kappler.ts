import Animator, { AnimationData } from "./lib/Animator";
import { Milliseconds, Pixels } from "./lib/flavours";
import Rect from "./lib/Rect";
import SpriteGrid from "./lib/SpriteGrid";
import XY from "./lib/XY";
import kapplerUrl from "./res/e_kappler.png";

const spritesheet = new SpriteGrid(kapplerUrl, 224, 224, [
  ["happy1", "happy2", "happy3", "happy4", "happy5", "happy6"],
  ["flip1", "flip2", "flip3", "flip4", "flip5", "flip6"],
  ["conf1", "conf2", "conf3", "conf4", "conf5", "conf6"],
  ["nope1", "nope2", "nope3", "nope4", "nope5", "nope6"],
  ["sad1", "sad2", "sad3", "sad4", "sad5", "sad6"],
  ["relief1", "relief2", "relief3", "relief4", "relief5", "relief6"],
  ["mad1", "mad2", "mad3", "mad4", "mad5", "mad6"],
  ["silly1", "silly2", "silly3", "silly4", "silly5", "silly6"],
  ["despair1", "despair2", "despair3", "despair4", "despair5", "despair6"],
  ["shock1", "shock2", "shock3", "shock4", "shock5", "shock6"],
  ["cry1", "cry2", "cry3", "cry4", "cry5", "cry6"],
  ["clown1", "clown2", "clown3", "clown4", "clown5", "clown6"],
] as const);

const time: Milliseconds = 75;

type Animation =
  | "happy"
  | "flip"
  | "conf"
  | "nope"
  | "sad"
  | "relief"
  | "mad"
  | "silly"
  | "despair"
  | "shock"
  | "cry"
  | "clown";
type Sprite = typeof spritesheet extends SpriteGrid<infer T> ? T : never;

const animationData: AnimationData<Animation, Sprite, never, never> = {
  happy: {
    loop: 3,
    frames: [
      { sprite: "happy1", time },
      { sprite: "happy2", time },
      { sprite: "happy3", time },
      { sprite: "happy4", time },
      { sprite: "happy5", time },
      { sprite: "happy6", time },
    ],
  },
  flip: {
    loop: 3,
    frames: [
      { sprite: "flip1", time },
      { sprite: "flip2", time },
      { sprite: "flip3", time },
      { sprite: "flip4", time },
      { sprite: "flip5", time },
      { sprite: "flip6", time },
    ],
  },
  conf: {
    loop: 3,
    frames: [
      { sprite: "conf1", time },
      { sprite: "conf2", time },
      { sprite: "conf3", time },
      { sprite: "conf4", time },
      { sprite: "conf5", time },
      { sprite: "conf6", time },
    ],
  },
  nope: {
    loop: 3,
    frames: [
      { sprite: "nope1", time },
      { sprite: "nope2", time },
      { sprite: "nope3", time },
      { sprite: "nope4", time },
      { sprite: "nope5", time },
      { sprite: "nope6", time },
    ],
  },
  sad: {
    loop: 3,
    frames: [
      { sprite: "sad1", time },
      { sprite: "sad2", time },
      { sprite: "sad3", time },
      { sprite: "sad4", time },
      { sprite: "sad5", time },
      { sprite: "sad6", time },
    ],
  },
  relief: {
    loop: 3,
    frames: [
      { sprite: "relief1", time },
      { sprite: "relief2", time },
      { sprite: "relief3", time },
      { sprite: "relief4", time },
      { sprite: "relief5", time },
      { sprite: "relief6", time },
    ],
  },
  mad: {
    loop: 3,
    frames: [
      { sprite: "mad1", time },
      { sprite: "mad2", time },
      { sprite: "mad3", time },
      { sprite: "mad4", time },
      { sprite: "mad5", time },
      { sprite: "mad6", time },
    ],
  },
  silly: {
    loop: 3,
    frames: [
      { sprite: "silly1", time },
      { sprite: "silly2", time },
      { sprite: "silly3", time },
      { sprite: "silly4", time },
      { sprite: "silly5", time },
      { sprite: "silly6", time },
    ],
  },
  despair: {
    loop: 3,
    frames: [
      { sprite: "despair1", time },
      { sprite: "despair2", time },
      { sprite: "despair3", time },
      { sprite: "despair4", time },
      { sprite: "despair5", time },
      { sprite: "despair6", time },
    ],
  },
  shock: {
    loop: 3,
    frames: [
      { sprite: "shock1", time },
      { sprite: "shock2", time },
      { sprite: "shock3", time },
      { sprite: "shock4", time },
      { sprite: "shock5", time },
      { sprite: "shock6", time },
    ],
  },
  cry: {
    loop: 3,
    frames: [
      { sprite: "cry1", time },
      { sprite: "cry2", time },
      { sprite: "cry3", time },
      { sprite: "cry4", time },
      { sprite: "cry5", time },
      { sprite: "cry6", time },
    ],
  },
  clown: {
    loop: 3,
    frames: [
      { sprite: "clown1", time },
      { sprite: "clown2", time },
      { sprite: "clown3", time },
      { sprite: "clown4", time },
      { sprite: "clown5", time },
      { sprite: "clown6", time },
    ],
  },
};

export const kapplerAnimator = new Animator<Animation, Sprite, never, never>(
  "Kappler",
  spritesheet,
  "happy",
  new XY<Pixels>(112, 112),
  new Rect<Pixels>(70, 70, 84, 86),
  animationData,
);
