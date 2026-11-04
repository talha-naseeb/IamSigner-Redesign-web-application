import ReactDOM from "react-dom";

// React 19 removed ReactDOM.findDOMNode.
// Provide a safe fallback polyfill for legacy libraries (such as react-draggable)
// that may invoke ReactDOM.findDOMNode.
if (typeof window !== "undefined" && !ReactDOM.findDOMNode) {
  const safeFindDOMNode = function (componentOrElement) {
    if (!componentOrElement) return null;
    if (componentOrElement instanceof Element) return componentOrElement;
    if (componentOrElement.nodeRef && componentOrElement.nodeRef.current) {
      return componentOrElement.nodeRef.current;
    }
    if (componentOrElement.ref && componentOrElement.ref.current) {
      return componentOrElement.ref.current;
    }
    if (componentOrElement._reactInternals) {
      let fiber = componentOrElement._reactInternals;
      while (fiber) {
        if (fiber.stateNode instanceof Element) {
          return fiber.stateNode;
        }
        fiber = fiber.child;
      }
    }
    return null;
  };

  try {
    Object.defineProperty(ReactDOM, "findDOMNode", {
      value: safeFindDOMNode,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    try {
      ReactDOM.findDOMNode = safeFindDOMNode;
    } catch (_) {}
  }
}
