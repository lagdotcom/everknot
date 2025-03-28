declare module "*.png" {
  const url: import("./lib/flavours").URLString;
  export default url;
}
