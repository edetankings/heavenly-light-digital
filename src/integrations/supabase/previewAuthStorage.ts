// Neutralized preview auth storage — no Lovable origins or postMessage brokering
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
