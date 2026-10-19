import { useEffect, useRef } from "react";
import { useDragLayer } from "react-dnd";

// Pointer distance (px) from a scroll container's edge where auto-scroll kicks in.
const EDGE_ZONE = 70;
// Scroll speed in px per animation frame: ramps from MIN at the zone rim to MAX at the edge.
const MIN_SPEED = 3;
const MAX_SPEED = 18;

const axisProps = (axis) =>
  axis === "y"
    ? { overflow: "overflowY", scrollSize: "scrollHeight", clientSize: "clientHeight", coord: "y", start: "top", end: "bottom" }
    : { overflow: "overflowX", scrollSize: "scrollWidth", clientSize: "clientWidth", coord: "x", start: "left", end: "right" };

// Nearest ancestor that can actually scroll on this axis, or "window" as a fallback.
const findScroller = (el, axis) => {
  const { overflow, scrollSize, clientSize } = axisProps(axis);
  let node = el ? el.parentElement : null;
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    if ((style[overflow] === "auto" || style[overflow] === "scroll") && node[scrollSize] > node[clientSize] + 1) {
      return node;
    }
    node = node.parentElement;
  }
  const doc = document.documentElement;
  return doc[scrollSize] > doc[clientSize] + 1 ? "window" : null;
};

const scrollStep = (scroller, pointer, axis) => {
  if (!scroller || !pointer) return;
  const { coord, start, end } = axisProps(axis);
  const rect =
    scroller === "window"
      ? { [start]: 0, [end]: axis === "y" ? window.innerHeight : window.innerWidth }
      : scroller.getBoundingClientRect();
  const p = pointer[coord];
  let delta = 0;
  if (p >= rect[start] && p < rect[start] + EDGE_ZONE) {
    const depth = 1 - (p - rect[start]) / EDGE_ZONE;
    delta = -(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * depth);
  } else if (p <= rect[end] && p > rect[end] - EDGE_ZONE) {
    const depth = 1 - (rect[end] - p) / EDGE_ZONE;
    delta = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * depth;
  }
  if (!delta) return;
  if (scroller === "window") {
    window.scrollBy(axis === "y" ? 0 : delta, axis === "y" ? delta : 0);
  } else if (axis === "y") {
    scroller.scrollTop += delta;
  } else {
    scroller.scrollLeft += delta;
  }
};

// Auto-scrolls the drop target's scroll container while a field is dragged near
// its top/bottom (or left/right) edge, so controls can be dropped anywhere on
// tall documents. Reads the react-dnd monitor only — no drag preview layer is
// added — so it works with both the mouse and touch backends. Drop coordinates
// are still computed from the rendered image rect at drop time, so scrolling
// mid-drag stays accurate.
const useDragAutoScroll = (dropRef) => {
  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));
  const offsetRef = useRef(clientOffset);
  offsetRef.current = clientOffset;
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isDragging) return;
    const tick = () => {
      const el = dropRef && dropRef.current;
      const pointer = offsetRef.current;
      if (el && pointer) {
        scrollStep(findScroller(el, "y"), pointer, "y");
        scrollStep(findScroller(el, "x"), pointer, "x");
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isDragging, dropRef]);
};

export default useDragAutoScroll;
