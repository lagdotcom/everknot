export default class MapSet<TKey, TValue> {
  data: Map<TKey, Set<TValue>>;

  constructor() {
    this.data = new Map();
  }

  add(key: TKey, value: TValue) {
    const set = this.data.get(key);
    if (set) set.add(value);
    else this.data.set(key, new Set([value]));
  }

  delete(key: TKey, value: TValue) {
    return this.data.get(key)?.delete(value) ?? false;
  }

  get(key: TKey) {
    return this.data.get(key) ?? new Set();
  }
}
