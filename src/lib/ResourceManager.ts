import { URLString } from "./flavours";

export default class ResourceManager {
  images: Record<URLString, HTMLImageElement>;
  imagePromises: Map<URLString, Promise<HTMLImageElement>>;

  constructor() {
    this.images = {};
    this.imagePromises = new Map();
  }

  image(url: URLString) {
    return this.imagePromises.get(url) ?? this.getImagePromise(url);
  }

  private getImagePromise(url: URLString) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");
      img.addEventListener("load", () => {
        this.images[url] = img;
        resolve(img);
      });
      img.addEventListener("error", reject);
      img.src = url;
    });
  }
}
