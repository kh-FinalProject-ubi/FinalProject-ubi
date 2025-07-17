import {
  TileImage_default,
  createXYZ,
  extentFromProjection
} from "./chunk-UX7LV6KP.js";
import "./chunk-Z54VUISL.js";
import "./chunk-VLTZGDTC.js";
import "./chunk-N3TI4B3Y.js";
import "./chunk-FMNGDYBL.js";
import "./chunk-ZU6T3ENF.js";
import "./chunk-X5GCNXLM.js";
import "./chunk-USSRBFZV.js";
import "./chunk-4NB3WFBM.js";
import "./chunk-YNGFQH43.js";
import "./chunk-DC5AMYBS.js";

// node_modules/ol/source/XYZ.js
var XYZ = class extends TileImage_default {
  /**
   * @param {Options} [options] XYZ options.
   */
  constructor(options) {
    options = options || {};
    const projection = options.projection !== void 0 ? options.projection : "EPSG:3857";
    const tileGrid = options.tileGrid !== void 0 ? options.tileGrid : createXYZ({
      extent: extentFromProjection(projection),
      maxResolution: options.maxResolution,
      maxZoom: options.maxZoom,
      minZoom: options.minZoom,
      tileSize: options.tileSize
    });
    super({
      attributions: options.attributions,
      cacheSize: options.cacheSize,
      crossOrigin: options.crossOrigin,
      interpolate: options.interpolate,
      projection,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileGrid,
      tileLoadFunction: options.tileLoadFunction,
      tilePixelRatio: options.tilePixelRatio,
      tileUrlFunction: options.tileUrlFunction,
      url: options.url,
      urls: options.urls,
      wrapX: options.wrapX !== void 0 ? options.wrapX : true,
      transition: options.transition,
      attributionsCollapsible: options.attributionsCollapsible,
      zDirection: options.zDirection
    });
    this.gutter_ = options.gutter !== void 0 ? options.gutter : 0;
  }
  /**
   * @return {number} Gutter.
   * @override
   */
  getGutter() {
    return this.gutter_;
  }
};
var XYZ_default = XYZ;
export {
  XYZ_default as default
};
//# sourceMappingURL=ol_source_XYZ.js.map
