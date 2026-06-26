// Vitest setup: jest-dom matchers + jsdom polyfills.
// Author: Hasif Ahmed (www.hasif.info)

import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia (Mantine uses it for color scheme).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
