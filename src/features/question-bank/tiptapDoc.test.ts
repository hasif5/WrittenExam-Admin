// Tests for the mandatory-solution emptiness check + plain-text extraction.
// Author: Hasif Ahmed (www.hasif.info)

import { describe, expect, it } from "vitest";
import { docToPlainText, isDocEmpty, EMPTY_DOC } from "./tiptapDoc";

describe("tiptapDoc", () => {
  it("treats a blank document as empty (mandatory solution rule)", () => {
    expect(isDocEmpty(EMPTY_DOC)).toBe(true);
    expect(isDocEmpty(null)).toBe(true);
  });

  it("treats text content as non-empty", () => {
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Answer: 42" }] }],
    };
    expect(isDocEmpty(doc)).toBe(false);
    expect(docToPlainText(doc)).toBe("Answer: 42");
  });

  it("includes inline math LaTeX in plain text and counts as content", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "inlineMath", attrs: { latex: "x^2" } }] },
      ],
    };
    expect(isDocEmpty(doc)).toBe(false);
    expect(docToPlainText(doc)).toBe("x^2");
  });

  it("treats image-only documents as non-empty", () => {
    const doc = { type: "doc", content: [{ type: "image", attrs: { src: "x" } }] };
    expect(isDocEmpty(doc)).toBe(false);
  });
});
