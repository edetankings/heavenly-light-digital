// Use browser storage when available, including during SSR.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
