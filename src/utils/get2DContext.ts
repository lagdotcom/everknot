export default function get2DContext(
  canvas: HTMLCanvasElement,
  settings?: CanvasRenderingContext2DSettings,
) {
  const ctx = canvas.getContext("2d", settings);
  if (!ctx) throw new Error(`Could not get 2d context`);
  return ctx;
}
