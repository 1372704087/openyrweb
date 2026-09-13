/**
 * Minimal ambient declarations for Node runtime globals used as fallbacks in
 * otherwise browser-targeted code. Only declare what is actually referenced;
 * do not pull in full @types/node for this browser-first codebase.
 */

declare const Buffer: {
  from(input: string, encoding: string): { toString(encoding: string): string };
};
