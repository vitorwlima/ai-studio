// Convex's runtime lacks a few newer web APIs that @ai-sdk/mcp relies on.
// Importing this module (for its side effect) installs the missing pieces.

const urlCtor = URL as unknown as {
  canParse?: (url: string, base?: string) => boolean;
};

if (typeof urlCtor.canParse !== "function") {
  urlCtor.canParse = (url, base) => {
    try {
      // eslint-disable-next-line no-new
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

export {};
