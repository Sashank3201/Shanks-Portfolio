/**
 * Things the preloader should wait for before the eclipse completes (e.g. the WebGL stage
 * compiling its shaders). Register as early as possible; the preloader also enforces a ceiling,
 * so a slow or failed task can never trap the visitor.
 */
const tasks = new Set<Promise<unknown>>();

export function holdBoot(task: Promise<unknown>): void {
  tasks.add(task);
}

/** Resolves once every registered task has settled (fulfilled or rejected). */
export async function bootTasksSettled(): Promise<void> {
  // Give components mounted in the same commit a chance to register.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.allSettled([...tasks]);
}

export function fontsReady(): Promise<unknown> {
  return document.fonts.ready;
}

export function pageLoaded(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener(
      "load",
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
