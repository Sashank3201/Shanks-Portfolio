import { MAX_FLAMES, type FlameAnchor } from "./scene-signal";

/**
 * Rendered `[data-flame-anchor]` elements as flame anchors in document coordinates (CSS px), in
 * document order. Hidden anchors (zero size) are skipped and the list is capped at MAX_FLAMES.
 */
export function measureFlames(scroll: number, root: ParentNode = document): FlameAnchor[] {
  const flames: FlameAnchor[] = [];
  for (const element of root.querySelectorAll("[data-flame-anchor]")) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0) continue;
    flames.push({
      docX: rect.left + rect.width / 2,
      docY: rect.top + rect.height / 2 + scroll,
      radius: rect.width / 2,
    });
    if (flames.length === MAX_FLAMES) break;
  }
  return flames;
}
