/**
 * Persisted visitor preferences (Release + reduce-motion) live in localStorage under one key,
 * written by the zustand persist middleware. The same key is read by an inline <head> script
 * before first paint so a returning visitor never sees the wrong realm flash.
 */
export const PREFS_STORAGE_KEY = "eclipse:prefs";
export const PREFS_VERSION = 1;

export type MotionPreference = "system" | "reduce";

export interface PersistedPrefs {
  release: boolean;
  motionPreference: MotionPreference;
}

/**
 * Applies stored preferences to <html> synchronously. Kept dependency-free and ES5-safe because
 * it runs before any bundle loads. Mirrors {@link applyPrefsToRoot}.
 */
export const prefsInlineScript = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  PREFS_STORAGE_KEY,
)});if(!raw)return;var s=(JSON.parse(raw)||{}).state||{};var r=document.documentElement;if(s.release===true){r.setAttribute("data-release","true");r.style.setProperty("--realm","1")}if(s.motionPreference==="reduce"){r.setAttribute("data-motion","reduce")}}catch(e){}})()`;

/** Runtime equivalent of the inline script, used when preferences change after load. */
export function applyPrefsToRoot(root: HTMLElement, prefs: PersistedPrefs): void {
  if (prefs.release) {
    root.setAttribute("data-release", "true");
  } else {
    root.removeAttribute("data-release");
  }

  if (prefs.motionPreference === "reduce") {
    root.setAttribute("data-motion", "reduce");
  } else {
    root.removeAttribute("data-motion");
  }
}
