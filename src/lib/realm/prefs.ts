/**
 * Persisted visitor preferences (Release + reduce-motion) live in localStorage under one key,
 * written by the zustand persist middleware. The same key is read by the inline boot script
 * before first paint so a returning visitor never sees the wrong realm flash.
 */
export const PREFS_STORAGE_KEY = "eclipse:prefs";
export const PREFS_VERSION = 1;

/** Session flag: the preloader has played in this tab. */
export const PRELOADED_SESSION_KEY = "eclipse:preloaded";

export type MotionPreference = "system" | "reduce";

export interface PersistedPrefs {
  release: boolean;
  motionPreference: MotionPreference;
}

/**
 * Runs synchronously in <head> before any bundle loads (so: dependency-free, ES5-safe):
 * - restores Release (`data-release`, `--realm: 1`) and reduce-motion (`data-motion`),
 * - marks first visits of the session with `data-loading`, which reveals the preloader.
 *   Reduced-motion visitors and visitors without storage never get the preloader.
 * - `?static=1` sets `data-static`: time-frozen, motion-free rendering for visual tests.
 */
export const bootInlineScript = `(function(){var r=document.documentElement;try{var raw=localStorage.getItem(${JSON.stringify(
  PREFS_STORAGE_KEY,
)});var s=raw?((JSON.parse(raw)||{}).state||{}):{};if(s.release===true){r.setAttribute("data-release","true");r.style.setProperty("--realm","1")}var calm=s.motionPreference==="reduce";if(calm){r.setAttribute("data-motion","reduce")}if(/[?&]static=1(&|$)/.test(location.search)){r.setAttribute("data-static","");calm=true}if(!calm&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){calm=true}if(!calm&&!sessionStorage.getItem(${JSON.stringify(
  PRELOADED_SESSION_KEY,
)})){r.setAttribute("data-loading","")}}catch(e){}})()`;

/** Runtime equivalent of the persisted part of the boot script, used when preferences change. */
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
