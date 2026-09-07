// mock globals for node script runs
if (typeof global !== 'undefined') {
  if (!global.document) {
    global.document = {
      createElement: () => ({ getContext: () => ({}) }),
      getElementsByTagName: () => [],
    };
  }
  if (!global.window) {
    global.window = global;
  }
  if (!global.DOMMatrix) {
    class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor() {}
      scale() { return this; }
      translate() { return this; }
      transformPoint(p) { return p; }
    }
    global.DOMMatrix = DOMMatrix;
  }
  if (!global.Path2D) {
    global.Path2D = class {};
  }
  if (!global.ImageData) {
    global.ImageData = class {};
  }
}

