import { createEffect, on, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

export function useResizeObserver(element: () => HTMLElement | undefined) {
  const [dimensions, setDimensions] = createStore({width: 0, height: 0})
  createEffect(on(element, (el) => {
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      })
    });
    resizeObserver.observe(el);

    onCleanup(() => {
      resizeObserver.disconnect();
    })
  }))
  return [() => dimensions.width, () => dimensions.height]
}