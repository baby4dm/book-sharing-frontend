import "@testing-library/jest-dom/vitest";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const current = (globalThis as Record<string, unknown>)[name] as
    | Storage
    | undefined;
  if (
    !current ||
    typeof current.setItem !== "function" ||
    typeof current.clear !== "function"
  ) {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: storage,
    });
    if (typeof window !== "undefined" && window !== globalThis) {
      Object.defineProperty(window, name, {
        configurable: true,
        value: storage,
      });
    }
  }
}
const NativeRequest = globalThis.Request;
if (NativeRequest) {
  class CompatibleRequest extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      try {
        super(input, init);
      } catch (error) {
        if (!init?.signal) throw error;
        const { signal: _signal, ...rest } = init;
        void _signal;
        super(input, rest);
      }
    }
  }
  globalThis.Request = CompatibleRequest as typeof Request;
}
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
import { vi } from "vitest";

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
if (!("IntersectionObserver" in window))
  vi.stubGlobal("IntersectionObserver", ObserverStub);
if (!("ResizeObserver" in window))
  vi.stubGlobal("ResizeObserver", ObserverStub);
if (!window.matchMedia) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
}
window.scrollTo = (() => undefined) as typeof window.scrollTo;
Element.prototype.scrollIntoView = function () {};
Element.prototype.scrollTo = function () {} as never;
if (!URL.createObjectURL) URL.createObjectURL = () => "blob:preview";
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => undefined;
