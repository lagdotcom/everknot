type AttributesOf<T extends keyof HTMLElementTagNameMap> = Partial<
  HTMLElementTagNameMap[T]
>;

type EventsOf<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementEventMap]?: (
    this: HTMLElementTagNameMap[T],
    ev: HTMLElementEventMap[K],
  ) => unknown;
};

export default function makeElement<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  parent: HTMLElement,
  attributes: AttributesOf<T> = {},
  style: Partial<CSSStyleDeclaration> = {},
  events: EventsOf<T> = {},
) {
  const element = document.createElement(tagName);

  Object.assign(element, attributes);
  Object.assign(element.style, style);

  for (const [name, handler] of Object.entries(events)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.addEventListener(name, handler as any);
  }

  parent.append(element);
  return element;
}
