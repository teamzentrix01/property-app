// Preserve the layout boundary while using native browser scrolling. Native
// scroll is reliable across Windows wheels, touch devices and browser zoom.
export default function SmoothScroll({ children }) {
  return children;
}
