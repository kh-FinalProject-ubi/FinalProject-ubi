// node_modules/ol/easing.js
function easeIn(t) {
  return Math.pow(t, 3);
}
function easeOut(t) {
  return 1 - easeIn(1 - t);
}
function inAndOut(t) {
  return 3 * t * t - 2 * t * t * t;
}
function linear(t) {
  return t;
}

// node_modules/ol/tilegrid/common.js
var DEFAULT_MAX_ZOOM = 42;
var DEFAULT_TILE_SIZE = 256;

export {
  easeIn,
  easeOut,
  inAndOut,
  linear,
  DEFAULT_MAX_ZOOM,
  DEFAULT_TILE_SIZE
};
//# sourceMappingURL=chunk-FMNGDYBL.js.map
