export const INTRO_SESSION_KEY = "rpgm-intro-seen-v1";
export const INTRO_DEADLINE_MS = 4500;

type IntroStorage = Pick<Storage, "getItem" | "setItem">;

export function createIntroSession(getStorage: () => IntroStorage) {
  let claimed = false;
  return {
    claim() {
      if (claimed) return false;
      claimed = true;
      try {
        const storage = getStorage();
        if (storage.getItem(INTRO_SESSION_KEY)) return false;
        storage.setItem(INTRO_SESSION_KEY, "seen");
      } catch {
        // Retain the in-memory claim when browser privacy settings block storage.
      }
      return true;
    },
  };
}

// Browser storage is accessed only when claimed by a mounted client effect.
export const introSession = createIntroSession(() => window.sessionStorage);
