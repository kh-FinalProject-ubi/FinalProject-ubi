import {
  TileState_default
} from "./chunk-VLTZGDTC.js";
import {
  createCanvasContext2D,
  listenImage,
  releaseCanvas
} from "./chunk-N3TI4B3Y.js";
import {
  easeIn
} from "./chunk-FMNGDYBL.js";
import {
  apply
} from "./chunk-X5GCNXLM.js";
import {
  boundingExtent,
  containsCoordinate,
  createEmpty,
  createTransformFromCoordinateTransform,
  extend,
  extendCoordinate,
  forEachCorner,
  getArea,
  getBottomLeft,
  getBottomRight,
  getCenter,
  getHeight,
  getIntersection,
  getPointResolution,
  getTopLeft,
  getTopRight,
  getTransform,
  getWidth,
  intersects,
  transform,
  wrapAndSliceX
} from "./chunk-USSRBFZV.js";
import {
  EventType_default,
  Target_default,
  abstract,
  listen,
  unlistenByKey
} from "./chunk-4NB3WFBM.js";
import {
  clamp,
  modulo,
  solveLinearSystem
} from "./chunk-YNGFQH43.js";

// node_modules/ol/reproj.js
var brokenDiagonalRendering_;
var canvasPool = [];
function drawTestTriangle(ctx, u1, v1, u2, v2) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(u1, v1);
  ctx.lineTo(u2, v2);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.fillRect(0, 0, Math.max(u1, u2) + 1, Math.max(v1, v2));
  ctx.restore();
}
function verifyBrokenDiagonalRendering(data, offset) {
  return Math.abs(data[offset * 4] - 210) > 2 || Math.abs(data[offset * 4 + 3] - 0.75 * 255) > 2;
}
function isBrokenDiagonalRendering() {
  if (brokenDiagonalRendering_ === void 0) {
    const ctx = createCanvasContext2D(6, 6, canvasPool);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(210, 0, 0, 0.75)";
    drawTestTriangle(ctx, 4, 5, 4, 0);
    drawTestTriangle(ctx, 4, 5, 0, 5);
    const data = ctx.getImageData(0, 0, 3, 3).data;
    brokenDiagonalRendering_ = verifyBrokenDiagonalRendering(data, 0) || verifyBrokenDiagonalRendering(data, 4) || verifyBrokenDiagonalRendering(data, 8);
    releaseCanvas(ctx);
    canvasPool.push(ctx.canvas);
  }
  return brokenDiagonalRendering_;
}
function calculateSourceResolution(sourceProj, targetProj, targetCenter, targetResolution) {
  const sourceCenter = transform(targetCenter, targetProj, sourceProj);
  let sourceResolution = getPointResolution(
    targetProj,
    targetResolution,
    targetCenter
  );
  const targetMetersPerUnit = targetProj.getMetersPerUnit();
  if (targetMetersPerUnit !== void 0) {
    sourceResolution *= targetMetersPerUnit;
  }
  const sourceMetersPerUnit = sourceProj.getMetersPerUnit();
  if (sourceMetersPerUnit !== void 0) {
    sourceResolution /= sourceMetersPerUnit;
  }
  const sourceExtent = sourceProj.getExtent();
  if (!sourceExtent || containsCoordinate(sourceExtent, sourceCenter)) {
    const compensationFactor = getPointResolution(sourceProj, sourceResolution, sourceCenter) / sourceResolution;
    if (isFinite(compensationFactor) && compensationFactor > 0) {
      sourceResolution /= compensationFactor;
    }
  }
  return sourceResolution;
}
function calculateSourceExtentResolution(sourceProj, targetProj, targetExtent, targetResolution) {
  const targetCenter = getCenter(targetExtent);
  let sourceResolution = calculateSourceResolution(
    sourceProj,
    targetProj,
    targetCenter,
    targetResolution
  );
  if (!isFinite(sourceResolution) || sourceResolution <= 0) {
    forEachCorner(targetExtent, function(corner) {
      sourceResolution = calculateSourceResolution(
        sourceProj,
        targetProj,
        corner,
        targetResolution
      );
      return isFinite(sourceResolution) && sourceResolution > 0;
    });
  }
  return sourceResolution;
}
function render(width, height, pixelRatio, sourceResolution, sourceExtent, targetResolution, targetExtent, triangulation, sources, gutter, renderEdges, interpolate, drawSingle, clipExtent) {
  const context = createCanvasContext2D(
    Math.round(pixelRatio * width),
    Math.round(pixelRatio * height),
    canvasPool
  );
  if (!interpolate) {
    context.imageSmoothingEnabled = false;
  }
  if (sources.length === 0) {
    return context.canvas;
  }
  context.scale(pixelRatio, pixelRatio);
  function pixelRound(value) {
    return Math.round(value * pixelRatio) / pixelRatio;
  }
  context.globalCompositeOperation = "lighter";
  const sourceDataExtent = createEmpty();
  sources.forEach(function(src, i, arr) {
    extend(sourceDataExtent, src.extent);
  });
  let stitchContext;
  const stitchScale = pixelRatio / sourceResolution;
  const inverseScale = (interpolate ? 1 : 1 + Math.pow(2, -24)) / stitchScale;
  if (!drawSingle || sources.length !== 1 || gutter !== 0) {
    stitchContext = createCanvasContext2D(
      Math.round(getWidth(sourceDataExtent) * stitchScale),
      Math.round(getHeight(sourceDataExtent) * stitchScale),
      canvasPool
    );
    if (!interpolate) {
      stitchContext.imageSmoothingEnabled = false;
    }
    if (sourceExtent && clipExtent) {
      const xPos = (sourceExtent[0] - sourceDataExtent[0]) * stitchScale;
      const yPos = -(sourceExtent[3] - sourceDataExtent[3]) * stitchScale;
      const width2 = getWidth(sourceExtent) * stitchScale;
      const height2 = getHeight(sourceExtent) * stitchScale;
      stitchContext.rect(xPos, yPos, width2, height2);
      stitchContext.clip();
    }
    sources.forEach(function(src, i, arr) {
      if (src.image.width > 0 && src.image.height > 0) {
        if (src.clipExtent) {
          stitchContext.save();
          const xPos2 = (src.clipExtent[0] - sourceDataExtent[0]) * stitchScale;
          const yPos2 = -(src.clipExtent[3] - sourceDataExtent[3]) * stitchScale;
          const width2 = getWidth(src.clipExtent) * stitchScale;
          const height2 = getHeight(src.clipExtent) * stitchScale;
          stitchContext.rect(
            interpolate ? xPos2 : Math.round(xPos2),
            interpolate ? yPos2 : Math.round(yPos2),
            interpolate ? width2 : Math.round(xPos2 + width2) - Math.round(xPos2),
            interpolate ? height2 : Math.round(yPos2 + height2) - Math.round(yPos2)
          );
          stitchContext.clip();
        }
        const xPos = (src.extent[0] - sourceDataExtent[0]) * stitchScale;
        const yPos = -(src.extent[3] - sourceDataExtent[3]) * stitchScale;
        const srcWidth = getWidth(src.extent) * stitchScale;
        const srcHeight = getHeight(src.extent) * stitchScale;
        stitchContext.drawImage(
          src.image,
          gutter,
          gutter,
          src.image.width - 2 * gutter,
          src.image.height - 2 * gutter,
          interpolate ? xPos : Math.round(xPos),
          interpolate ? yPos : Math.round(yPos),
          interpolate ? srcWidth : Math.round(xPos + srcWidth) - Math.round(xPos),
          interpolate ? srcHeight : Math.round(yPos + srcHeight) - Math.round(yPos)
        );
        if (src.clipExtent) {
          stitchContext.restore();
        }
      }
    });
  }
  const targetTopLeft = getTopLeft(targetExtent);
  triangulation.getTriangles().forEach(function(triangle, i, arr) {
    const source = triangle.source;
    const target = triangle.target;
    let x0 = source[0][0], y0 = source[0][1];
    let x1 = source[1][0], y1 = source[1][1];
    let x2 = source[2][0], y2 = source[2][1];
    const u0 = pixelRound((target[0][0] - targetTopLeft[0]) / targetResolution);
    const v0 = pixelRound(
      -(target[0][1] - targetTopLeft[1]) / targetResolution
    );
    const u1 = pixelRound((target[1][0] - targetTopLeft[0]) / targetResolution);
    const v1 = pixelRound(
      -(target[1][1] - targetTopLeft[1]) / targetResolution
    );
    const u2 = pixelRound((target[2][0] - targetTopLeft[0]) / targetResolution);
    const v2 = pixelRound(
      -(target[2][1] - targetTopLeft[1]) / targetResolution
    );
    const sourceNumericalShiftX = x0;
    const sourceNumericalShiftY = y0;
    x0 = 0;
    y0 = 0;
    x1 -= sourceNumericalShiftX;
    y1 -= sourceNumericalShiftY;
    x2 -= sourceNumericalShiftX;
    y2 -= sourceNumericalShiftY;
    const augmentedMatrix = [
      [x1, y1, 0, 0, u1 - u0],
      [x2, y2, 0, 0, u2 - u0],
      [0, 0, x1, y1, v1 - v0],
      [0, 0, x2, y2, v2 - v0]
    ];
    const affineCoefs = solveLinearSystem(augmentedMatrix);
    if (!affineCoefs) {
      return;
    }
    context.save();
    context.beginPath();
    if (isBrokenDiagonalRendering() || !interpolate) {
      context.moveTo(u1, v1);
      const steps = 4;
      const ud = u0 - u1;
      const vd = v0 - v1;
      for (let step = 0; step < steps; step++) {
        context.lineTo(
          u1 + pixelRound((step + 1) * ud / steps),
          v1 + pixelRound(step * vd / (steps - 1))
        );
        if (step != steps - 1) {
          context.lineTo(
            u1 + pixelRound((step + 1) * ud / steps),
            v1 + pixelRound((step + 1) * vd / (steps - 1))
          );
        }
      }
      context.lineTo(u2, v2);
    } else {
      context.moveTo(u1, v1);
      context.lineTo(u0, v0);
      context.lineTo(u2, v2);
    }
    context.clip();
    context.transform(
      affineCoefs[0],
      affineCoefs[2],
      affineCoefs[1],
      affineCoefs[3],
      u0,
      v0
    );
    context.translate(
      sourceDataExtent[0] - sourceNumericalShiftX,
      sourceDataExtent[3] - sourceNumericalShiftY
    );
    let image;
    if (stitchContext) {
      image = stitchContext.canvas;
      context.scale(inverseScale, -inverseScale);
    } else {
      const source2 = sources[0];
      const extent = source2.extent;
      image = source2.image;
      context.scale(
        getWidth(extent) / image.width,
        -getHeight(extent) / image.height
      );
    }
    context.drawImage(image, 0, 0);
    context.restore();
  });
  if (stitchContext) {
    releaseCanvas(stitchContext);
    canvasPool.push(stitchContext.canvas);
  }
  if (renderEdges) {
    context.save();
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = "black";
    context.lineWidth = 1;
    triangulation.getTriangles().forEach(function(triangle, i, arr) {
      const target = triangle.target;
      const u0 = (target[0][0] - targetTopLeft[0]) / targetResolution;
      const v0 = -(target[0][1] - targetTopLeft[1]) / targetResolution;
      const u1 = (target[1][0] - targetTopLeft[0]) / targetResolution;
      const v1 = -(target[1][1] - targetTopLeft[1]) / targetResolution;
      const u2 = (target[2][0] - targetTopLeft[0]) / targetResolution;
      const v2 = -(target[2][1] - targetTopLeft[1]) / targetResolution;
      context.beginPath();
      context.moveTo(u1, v1);
      context.lineTo(u0, v0);
      context.lineTo(u2, v2);
      context.closePath();
      context.stroke();
    });
    context.restore();
  }
  return context.canvas;
}

// node_modules/ol/tilecoord.js
function createOrUpdate(z, x, y, tileCoord) {
  if (tileCoord !== void 0) {
    tileCoord[0] = z;
    tileCoord[1] = x;
    tileCoord[2] = y;
    return tileCoord;
  }
  return [z, x, y];
}
function getKeyZXY(z, x, y) {
  return z + "/" + x + "/" + y;
}
function hash(tileCoord) {
  return hashZXY(tileCoord[0], tileCoord[1], tileCoord[2]);
}
function hashZXY(z, x, y) {
  return (x << z) + y;
}
function withinExtentAndZ(tileCoord, tileGrid) {
  const z = tileCoord[0];
  const x = tileCoord[1];
  const y = tileCoord[2];
  if (tileGrid.getMinZoom() > z || z > tileGrid.getMaxZoom()) {
    return false;
  }
  const tileRange = tileGrid.getFullTileRange(z);
  if (!tileRange) {
    return true;
  }
  return tileRange.containsXY(x, y);
}

// node_modules/ol/Tile.js
var Tile = class extends Target_default {
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("./TileState.js").default} state State.
   * @param {Options} [options] Tile options.
   */
  constructor(tileCoord, state, options) {
    super();
    options = options ? options : {};
    this.tileCoord = tileCoord;
    this.state = state;
    this.key = "";
    this.transition_ = options.transition === void 0 ? 250 : options.transition;
    this.transitionStarts_ = {};
    this.interpolate = !!options.interpolate;
  }
  /**
   * @protected
   */
  changed() {
    this.dispatchEvent(EventType_default.CHANGE);
  }
  /**
   * Called by the tile cache when the tile is removed from the cache due to expiry
   */
  release() {
    this.setState(TileState_default.EMPTY);
  }
  /**
   * @return {string} Key.
   */
  getKey() {
    return this.key + "/" + this.tileCoord;
  }
  /**
   * Get the tile coordinate for this tile.
   * @return {import("./tilecoord.js").TileCoord} The tile coordinate.
   * @api
   */
  getTileCoord() {
    return this.tileCoord;
  }
  /**
   * @return {import("./TileState.js").default} State.
   */
  getState() {
    return this.state;
  }
  /**
   * Sets the state of this tile. If you write your own {@link module:ol/Tile~LoadFunction tileLoadFunction} ,
   * it is important to set the state correctly to {@link module:ol/TileState~ERROR}
   * when the tile cannot be loaded. Otherwise the tile cannot be removed from
   * the tile queue and will block other requests.
   * @param {import("./TileState.js").default} state State.
   * @api
   */
  setState(state) {
    if (this.state === TileState_default.EMPTY) {
      return;
    }
    if (this.state !== TileState_default.ERROR && this.state > state) {
      throw new Error("Tile load sequence violation");
    }
    this.state = state;
    this.changed();
  }
  /**
   * Load the image or retry if loading previously failed.
   * Loading is taken care of by the tile queue, and calling this method is
   * only needed for preloading or for reloading in case of an error.
   * @abstract
   * @api
   */
  load() {
    abstract();
  }
  /**
   * Get the alpha value for rendering.
   * @param {string} id An id for the renderer.
   * @param {number} time The render frame time.
   * @return {number} A number between 0 and 1.
   */
  getAlpha(id, time) {
    if (!this.transition_) {
      return 1;
    }
    let start = this.transitionStarts_[id];
    if (!start) {
      start = time;
      this.transitionStarts_[id] = start;
    } else if (start === -1) {
      return 1;
    }
    const delta = time - start + 1e3 / 60;
    if (delta >= this.transition_) {
      return 1;
    }
    return easeIn(delta / this.transition_);
  }
  /**
   * Determine if a tile is in an alpha transition.  A tile is considered in
   * transition if tile.getAlpha() has not yet been called or has been called
   * and returned 1.
   * @param {string} id An id for the renderer.
   * @return {boolean} The tile is in transition.
   */
  inTransition(id) {
    if (!this.transition_) {
      return false;
    }
    return this.transitionStarts_[id] !== -1;
  }
  /**
   * Mark a transition as complete.
   * @param {string} id An id for the renderer.
   */
  endTransition(id) {
    if (this.transition_) {
      this.transitionStarts_[id] = -1;
    }
  }
  /**
   * @override
   */
  disposeInternal() {
    this.release();
    super.disposeInternal();
  }
};
var Tile_default = Tile;

// node_modules/ol/ImageTile.js
var ImageTile = class extends Tile_default {
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("./TileState.js").default} state State.
   * @param {string} src Image source URI.
   * @param {?string} crossOrigin Cross origin.
   * @param {import("./Tile.js").LoadFunction} tileLoadFunction Tile load function.
   * @param {import("./Tile.js").Options} [options] Tile options.
   */
  constructor(tileCoord, state, src, crossOrigin, tileLoadFunction, options) {
    super(tileCoord, state, options);
    this.crossOrigin_ = crossOrigin;
    this.src_ = src;
    this.key = src;
    this.image_ = new Image();
    if (crossOrigin !== null) {
      this.image_.crossOrigin = crossOrigin;
    }
    this.unlisten_ = null;
    this.tileLoadFunction_ = tileLoadFunction;
  }
  /**
   * Get the HTML image element for this tile (may be a Canvas, Image, or Video).
   * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
   * @api
   */
  getImage() {
    return this.image_;
  }
  /**
   * Sets an HTML image element for this tile (may be a Canvas or preloaded Image).
   * @param {HTMLCanvasElement|HTMLImageElement} element Element.
   */
  setImage(element) {
    this.image_ = element;
    this.state = TileState_default.LOADED;
    this.unlistenImage_();
    this.changed();
  }
  /**
   * Tracks loading or read errors.
   *
   * @private
   */
  handleImageError_() {
    this.state = TileState_default.ERROR;
    this.unlistenImage_();
    this.image_ = getBlankImage();
    this.changed();
  }
  /**
   * Tracks successful image load.
   *
   * @private
   */
  handleImageLoad_() {
    const image = (
      /** @type {HTMLImageElement} */
      this.image_
    );
    if (image.naturalWidth && image.naturalHeight) {
      this.state = TileState_default.LOADED;
    } else {
      this.state = TileState_default.EMPTY;
    }
    this.unlistenImage_();
    this.changed();
  }
  /**
   * Load the image or retry if loading previously failed.
   * Loading is taken care of by the tile queue, and calling this method is
   * only needed for preloading or for reloading in case of an error.
   *
   * To retry loading tiles on failed requests, use a custom `tileLoadFunction`
   * that checks for error status codes and reloads only when the status code is
   * 408, 429, 500, 502, 503 and 504, and only when not too many retries have been
   * made already:
   *
   * ```js
   * const retryCodes = [408, 429, 500, 502, 503, 504];
   * const retries = {};
   * source.setTileLoadFunction((tile, src) => {
   *   const image = tile.getImage();
   *   fetch(src)
   *     .then((response) => {
   *       if (retryCodes.includes(response.status)) {
   *         retries[src] = (retries[src] || 0) + 1;
   *         if (retries[src] <= 3) {
   *           setTimeout(() => tile.load(), retries[src] * 1000);
   *         }
   *         return Promise.reject();
   *       }
   *       return response.blob();
   *     })
   *     .then((blob) => {
   *       const imageUrl = URL.createObjectURL(blob);
   *       image.src = imageUrl;
   *       setTimeout(() => URL.revokeObjectURL(imageUrl), 5000);
   *     })
   *     .catch(() => tile.setState(3)); // error
   * });
   * ```
   * @api
   * @override
   */
  load() {
    if (this.state == TileState_default.ERROR) {
      this.state = TileState_default.IDLE;
      this.image_ = new Image();
      if (this.crossOrigin_ !== null) {
        this.image_.crossOrigin = this.crossOrigin_;
      }
    }
    if (this.state == TileState_default.IDLE) {
      this.state = TileState_default.LOADING;
      this.changed();
      this.tileLoadFunction_(this, this.src_);
      this.unlisten_ = listenImage(
        this.image_,
        this.handleImageLoad_.bind(this),
        this.handleImageError_.bind(this)
      );
    }
  }
  /**
   * Discards event handlers which listen for load completion or errors.
   *
   * @private
   */
  unlistenImage_() {
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
    }
  }
  /**
   * @override
   */
  disposeInternal() {
    this.unlistenImage_();
    this.image_ = null;
    super.disposeInternal();
  }
};
function getBlankImage() {
  const ctx = createCanvasContext2D(1, 1);
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 1, 1);
  return ctx.canvas;
}
var ImageTile_default = ImageTile;

// node_modules/ol/TileRange.js
var TileRange = class {
  /**
   * @param {number} minX Minimum X.
   * @param {number} maxX Maximum X.
   * @param {number} minY Minimum Y.
   * @param {number} maxY Maximum Y.
   */
  constructor(minX, maxX, minY, maxY) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {boolean} Contains tile coordinate.
   */
  contains(tileCoord) {
    return this.containsXY(tileCoord[1], tileCoord[2]);
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Contains.
   */
  containsTileRange(tileRange) {
    return this.minX <= tileRange.minX && tileRange.maxX <= this.maxX && this.minY <= tileRange.minY && tileRange.maxY <= this.maxY;
  }
  /**
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @return {boolean} Contains coordinate.
   */
  containsXY(x, y) {
    return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Equals.
   */
  equals(tileRange) {
    return this.minX == tileRange.minX && this.minY == tileRange.minY && this.maxX == tileRange.maxX && this.maxY == tileRange.maxY;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   */
  extend(tileRange) {
    if (tileRange.minX < this.minX) {
      this.minX = tileRange.minX;
    }
    if (tileRange.maxX > this.maxX) {
      this.maxX = tileRange.maxX;
    }
    if (tileRange.minY < this.minY) {
      this.minY = tileRange.minY;
    }
    if (tileRange.maxY > this.maxY) {
      this.maxY = tileRange.maxY;
    }
  }
  /**
   * @return {number} Height.
   */
  getHeight() {
    return this.maxY - this.minY + 1;
  }
  /**
   * @return {import("./size.js").Size} Size.
   */
  getSize() {
    return [this.getWidth(), this.getHeight()];
  }
  /**
   * @return {number} Width.
   */
  getWidth() {
    return this.maxX - this.minX + 1;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Intersects.
   */
  intersects(tileRange) {
    return this.minX <= tileRange.maxX && this.maxX >= tileRange.minX && this.minY <= tileRange.maxY && this.maxY >= tileRange.minY;
  }
};
function createOrUpdate2(minX, maxX, minY, maxY, tileRange) {
  if (tileRange !== void 0) {
    tileRange.minX = minX;
    tileRange.maxX = maxX;
    tileRange.minY = minY;
    tileRange.maxY = maxY;
    return tileRange;
  }
  return new TileRange(minX, maxX, minY, maxY);
}
var TileRange_default = TileRange;

// node_modules/ol/reproj/Triangulation.js
var MAX_SUBDIVISION = 10;
var MAX_TRIANGLE_WIDTH = 0.25;
var Triangulation = class {
  /**
   * @param {import("../proj/Projection.js").default} sourceProj Source projection.
   * @param {import("../proj/Projection.js").default} targetProj Target projection.
   * @param {import("../extent.js").Extent} targetExtent Target extent to triangulate.
   * @param {import("../extent.js").Extent} maxSourceExtent Maximal source extent that can be used.
   * @param {number} errorThreshold Acceptable error (in source units).
   * @param {?number} destinationResolution The (optional) resolution of the destination.
   * @param {import("../transform.js").Transform} [sourceMatrix] Source transform matrix.
   */
  constructor(sourceProj, targetProj, targetExtent, maxSourceExtent, errorThreshold, destinationResolution, sourceMatrix) {
    this.sourceProj_ = sourceProj;
    this.targetProj_ = targetProj;
    let transformInvCache = {};
    const transformInv = sourceMatrix ? createTransformFromCoordinateTransform(
      (input) => apply(
        sourceMatrix,
        transform(input, this.targetProj_, this.sourceProj_)
      )
    ) : getTransform(this.targetProj_, this.sourceProj_);
    this.transformInv_ = function(c) {
      const key = c[0] + "/" + c[1];
      if (!transformInvCache[key]) {
        transformInvCache[key] = transformInv(c);
      }
      return transformInvCache[key];
    };
    this.maxSourceExtent_ = maxSourceExtent;
    this.errorThresholdSquared_ = errorThreshold * errorThreshold;
    this.triangles_ = [];
    this.wrapsXInSource_ = false;
    this.canWrapXInSource_ = this.sourceProj_.canWrapX() && !!maxSourceExtent && !!this.sourceProj_.getExtent() && getWidth(maxSourceExtent) >= getWidth(this.sourceProj_.getExtent());
    this.sourceWorldWidth_ = this.sourceProj_.getExtent() ? getWidth(this.sourceProj_.getExtent()) : null;
    this.targetWorldWidth_ = this.targetProj_.getExtent() ? getWidth(this.targetProj_.getExtent()) : null;
    const destinationTopLeft = getTopLeft(targetExtent);
    const destinationTopRight = getTopRight(targetExtent);
    const destinationBottomRight = getBottomRight(targetExtent);
    const destinationBottomLeft = getBottomLeft(targetExtent);
    const sourceTopLeft = this.transformInv_(destinationTopLeft);
    const sourceTopRight = this.transformInv_(destinationTopRight);
    const sourceBottomRight = this.transformInv_(destinationBottomRight);
    const sourceBottomLeft = this.transformInv_(destinationBottomLeft);
    const maxSubdivision = MAX_SUBDIVISION + (destinationResolution ? Math.max(
      0,
      Math.ceil(
        Math.log2(
          getArea(targetExtent) / (destinationResolution * destinationResolution * 256 * 256)
        )
      )
    ) : 0);
    this.addQuad_(
      destinationTopLeft,
      destinationTopRight,
      destinationBottomRight,
      destinationBottomLeft,
      sourceTopLeft,
      sourceTopRight,
      sourceBottomRight,
      sourceBottomLeft,
      maxSubdivision
    );
    if (this.wrapsXInSource_) {
      let leftBound = Infinity;
      this.triangles_.forEach(function(triangle, i, arr) {
        leftBound = Math.min(
          leftBound,
          triangle.source[0][0],
          triangle.source[1][0],
          triangle.source[2][0]
        );
      });
      this.triangles_.forEach((triangle) => {
        if (Math.max(
          triangle.source[0][0],
          triangle.source[1][0],
          triangle.source[2][0]
        ) - leftBound > this.sourceWorldWidth_ / 2) {
          const newTriangle = [
            [triangle.source[0][0], triangle.source[0][1]],
            [triangle.source[1][0], triangle.source[1][1]],
            [triangle.source[2][0], triangle.source[2][1]]
          ];
          if (newTriangle[0][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[0][0] -= this.sourceWorldWidth_;
          }
          if (newTriangle[1][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[1][0] -= this.sourceWorldWidth_;
          }
          if (newTriangle[2][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[2][0] -= this.sourceWorldWidth_;
          }
          const minX = Math.min(
            newTriangle[0][0],
            newTriangle[1][0],
            newTriangle[2][0]
          );
          const maxX = Math.max(
            newTriangle[0][0],
            newTriangle[1][0],
            newTriangle[2][0]
          );
          if (maxX - minX < this.sourceWorldWidth_ / 2) {
            triangle.source = newTriangle;
          }
        }
      });
    }
    transformInvCache = {};
  }
  /**
   * Adds triangle to the triangulation.
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @private
   */
  addTriangle_(a, b, c, aSrc, bSrc, cSrc) {
    this.triangles_.push({
      source: [aSrc, bSrc, cSrc],
      target: [a, b, c]
    });
  }
  /**
   * Adds quad (points in clock-wise order) to the triangulation
   * (and reprojects the vertices) if valid.
   * Performs quad subdivision if needed to increase precision.
   *
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} d The target d coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @param {import("../coordinate.js").Coordinate} dSrc The source d coordinate.
   * @param {number} maxSubdivision Maximal allowed subdivision of the quad.
   * @private
   */
  addQuad_(a, b, c, d, aSrc, bSrc, cSrc, dSrc, maxSubdivision) {
    const sourceQuadExtent = boundingExtent([aSrc, bSrc, cSrc, dSrc]);
    const sourceCoverageX = this.sourceWorldWidth_ ? getWidth(sourceQuadExtent) / this.sourceWorldWidth_ : null;
    const sourceWorldWidth = (
      /** @type {number} */
      this.sourceWorldWidth_
    );
    const wrapsX = this.sourceProj_.canWrapX() && sourceCoverageX > 0.5 && sourceCoverageX < 1;
    let needsSubdivision = false;
    if (maxSubdivision > 0) {
      if (this.targetProj_.isGlobal() && this.targetWorldWidth_) {
        const targetQuadExtent = boundingExtent([a, b, c, d]);
        const targetCoverageX = getWidth(targetQuadExtent) / this.targetWorldWidth_;
        needsSubdivision = targetCoverageX > MAX_TRIANGLE_WIDTH || needsSubdivision;
      }
      if (!wrapsX && this.sourceProj_.isGlobal() && sourceCoverageX) {
        needsSubdivision = sourceCoverageX > MAX_TRIANGLE_WIDTH || needsSubdivision;
      }
    }
    if (!needsSubdivision && this.maxSourceExtent_) {
      if (isFinite(sourceQuadExtent[0]) && isFinite(sourceQuadExtent[1]) && isFinite(sourceQuadExtent[2]) && isFinite(sourceQuadExtent[3])) {
        if (!intersects(sourceQuadExtent, this.maxSourceExtent_)) {
          return;
        }
      }
    }
    let isNotFinite = 0;
    if (!needsSubdivision) {
      if (!isFinite(aSrc[0]) || !isFinite(aSrc[1]) || !isFinite(bSrc[0]) || !isFinite(bSrc[1]) || !isFinite(cSrc[0]) || !isFinite(cSrc[1]) || !isFinite(dSrc[0]) || !isFinite(dSrc[1])) {
        if (maxSubdivision > 0) {
          needsSubdivision = true;
        } else {
          isNotFinite = (!isFinite(aSrc[0]) || !isFinite(aSrc[1]) ? 8 : 0) + (!isFinite(bSrc[0]) || !isFinite(bSrc[1]) ? 4 : 0) + (!isFinite(cSrc[0]) || !isFinite(cSrc[1]) ? 2 : 0) + (!isFinite(dSrc[0]) || !isFinite(dSrc[1]) ? 1 : 0);
          if (isNotFinite != 1 && isNotFinite != 2 && isNotFinite != 4 && isNotFinite != 8) {
            return;
          }
        }
      }
    }
    if (maxSubdivision > 0) {
      if (!needsSubdivision) {
        const center = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        const centerSrc = this.transformInv_(center);
        let dx;
        if (wrapsX) {
          const centerSrcEstimX = (modulo(aSrc[0], sourceWorldWidth) + modulo(cSrc[0], sourceWorldWidth)) / 2;
          dx = centerSrcEstimX - modulo(centerSrc[0], sourceWorldWidth);
        } else {
          dx = (aSrc[0] + cSrc[0]) / 2 - centerSrc[0];
        }
        const dy = (aSrc[1] + cSrc[1]) / 2 - centerSrc[1];
        const centerSrcErrorSquared = dx * dx + dy * dy;
        needsSubdivision = centerSrcErrorSquared > this.errorThresholdSquared_;
      }
      if (needsSubdivision) {
        if (Math.abs(a[0] - c[0]) <= Math.abs(a[1] - c[1])) {
          const bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
          const bcSrc = this.transformInv_(bc);
          const da = [(d[0] + a[0]) / 2, (d[1] + a[1]) / 2];
          const daSrc = this.transformInv_(da);
          this.addQuad_(
            a,
            b,
            bc,
            da,
            aSrc,
            bSrc,
            bcSrc,
            daSrc,
            maxSubdivision - 1
          );
          this.addQuad_(
            da,
            bc,
            c,
            d,
            daSrc,
            bcSrc,
            cSrc,
            dSrc,
            maxSubdivision - 1
          );
        } else {
          const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          const abSrc = this.transformInv_(ab);
          const cd = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
          const cdSrc = this.transformInv_(cd);
          this.addQuad_(
            a,
            ab,
            cd,
            d,
            aSrc,
            abSrc,
            cdSrc,
            dSrc,
            maxSubdivision - 1
          );
          this.addQuad_(
            ab,
            b,
            c,
            cd,
            abSrc,
            bSrc,
            cSrc,
            cdSrc,
            maxSubdivision - 1
          );
        }
        return;
      }
    }
    if (wrapsX) {
      if (!this.canWrapXInSource_) {
        return;
      }
      this.wrapsXInSource_ = true;
    }
    if ((isNotFinite & 11) == 0) {
      this.addTriangle_(a, c, d, aSrc, cSrc, dSrc);
    }
    if ((isNotFinite & 14) == 0) {
      this.addTriangle_(a, c, b, aSrc, cSrc, bSrc);
    }
    if (isNotFinite) {
      if ((isNotFinite & 13) == 0) {
        this.addTriangle_(b, d, a, bSrc, dSrc, aSrc);
      }
      if ((isNotFinite & 7) == 0) {
        this.addTriangle_(b, d, c, bSrc, dSrc, cSrc);
      }
    }
  }
  /**
   * Calculates extent of the `source` coordinates from all the triangles.
   *
   * @return {import("../extent.js").Extent} Calculated extent.
   */
  calculateSourceExtent() {
    const extent = createEmpty();
    this.triangles_.forEach(function(triangle, i, arr) {
      const src = triangle.source;
      extendCoordinate(extent, src[0]);
      extendCoordinate(extent, src[1]);
      extendCoordinate(extent, src[2]);
    });
    return extent;
  }
  /**
   * @return {Array<Triangle>} Array of the calculated triangles.
   */
  getTriangles() {
    return this.triangles_;
  }
};
var Triangulation_default = Triangulation;

// node_modules/ol/reproj/common.js
var ERROR_THRESHOLD = 0.5;

// node_modules/ol/reproj/Tile.js
var ReprojTile = class extends Tile_default {
  /**
   * @param {import("../proj/Projection.js").default} sourceProj Source projection.
   * @param {import("../tilegrid/TileGrid.js").default} sourceTileGrid Source tile grid.
   * @param {import("../proj/Projection.js").default} targetProj Target projection.
   * @param {import("../tilegrid/TileGrid.js").default} targetTileGrid Target tile grid.
   * @param {import("../tilecoord.js").TileCoord} tileCoord Coordinate of the tile.
   * @param {import("../tilecoord.js").TileCoord} wrappedTileCoord Coordinate of the tile wrapped in X.
   * @param {number} pixelRatio Pixel ratio.
   * @param {number} gutter Gutter of the source tiles.
   * @param {FunctionType} getTileFunction
   *     Function returning source tiles (z, x, y, pixelRatio).
   * @param {number} [errorThreshold] Acceptable reprojection error (in px).
   * @param {boolean} [renderEdges] Render reprojection edges.
   * @param {import("../Tile.js").Options} [options] Tile options.
   */
  constructor(sourceProj, sourceTileGrid, targetProj, targetTileGrid, tileCoord, wrappedTileCoord, pixelRatio, gutter, getTileFunction, errorThreshold, renderEdges, options) {
    super(tileCoord, TileState_default.IDLE, options);
    this.renderEdges_ = renderEdges !== void 0 ? renderEdges : false;
    this.pixelRatio_ = pixelRatio;
    this.gutter_ = gutter;
    this.canvas_ = null;
    this.sourceTileGrid_ = sourceTileGrid;
    this.targetTileGrid_ = targetTileGrid;
    this.wrappedTileCoord_ = wrappedTileCoord ? wrappedTileCoord : tileCoord;
    this.sourceTiles_ = [];
    this.sourcesListenerKeys_ = null;
    this.sourceZ_ = 0;
    this.clipExtent_ = sourceProj.canWrapX() ? sourceProj.getExtent() : void 0;
    const targetExtent = targetTileGrid.getTileCoordExtent(
      this.wrappedTileCoord_
    );
    const maxTargetExtent = this.targetTileGrid_.getExtent();
    let maxSourceExtent = this.sourceTileGrid_.getExtent();
    const limitedTargetExtent = maxTargetExtent ? getIntersection(targetExtent, maxTargetExtent) : targetExtent;
    if (getArea(limitedTargetExtent) === 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    const sourceProjExtent = sourceProj.getExtent();
    if (sourceProjExtent) {
      if (!maxSourceExtent) {
        maxSourceExtent = sourceProjExtent;
      } else {
        maxSourceExtent = getIntersection(maxSourceExtent, sourceProjExtent);
      }
    }
    const targetResolution = targetTileGrid.getResolution(
      this.wrappedTileCoord_[0]
    );
    const sourceResolution = calculateSourceExtentResolution(
      sourceProj,
      targetProj,
      limitedTargetExtent,
      targetResolution
    );
    if (!isFinite(sourceResolution) || sourceResolution <= 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    const errorThresholdInPixels = errorThreshold !== void 0 ? errorThreshold : ERROR_THRESHOLD;
    this.triangulation_ = new Triangulation_default(
      sourceProj,
      targetProj,
      limitedTargetExtent,
      maxSourceExtent,
      sourceResolution * errorThresholdInPixels,
      targetResolution
    );
    if (this.triangulation_.getTriangles().length === 0) {
      this.state = TileState_default.EMPTY;
      return;
    }
    this.sourceZ_ = sourceTileGrid.getZForResolution(sourceResolution);
    let sourceExtent = this.triangulation_.calculateSourceExtent();
    if (maxSourceExtent) {
      if (sourceProj.canWrapX()) {
        sourceExtent[1] = clamp(
          sourceExtent[1],
          maxSourceExtent[1],
          maxSourceExtent[3]
        );
        sourceExtent[3] = clamp(
          sourceExtent[3],
          maxSourceExtent[1],
          maxSourceExtent[3]
        );
      } else {
        sourceExtent = getIntersection(sourceExtent, maxSourceExtent);
      }
    }
    if (!getArea(sourceExtent)) {
      this.state = TileState_default.EMPTY;
    } else {
      let worldWidth = 0;
      let worldsAway = 0;
      if (sourceProj.canWrapX()) {
        worldWidth = getWidth(sourceProjExtent);
        worldsAway = Math.floor(
          (sourceExtent[0] - sourceProjExtent[0]) / worldWidth
        );
      }
      const sourceExtents = wrapAndSliceX(
        sourceExtent.slice(),
        sourceProj,
        true
      );
      sourceExtents.forEach((extent) => {
        const sourceRange = sourceTileGrid.getTileRangeForExtentAndZ(
          extent,
          this.sourceZ_
        );
        for (let srcX = sourceRange.minX; srcX <= sourceRange.maxX; srcX++) {
          for (let srcY = sourceRange.minY; srcY <= sourceRange.maxY; srcY++) {
            const tile = getTileFunction(this.sourceZ_, srcX, srcY, pixelRatio);
            if (tile) {
              const offset = worldsAway * worldWidth;
              this.sourceTiles_.push({ tile, offset });
            }
          }
        }
        ++worldsAway;
      });
      if (this.sourceTiles_.length === 0) {
        this.state = TileState_default.EMPTY;
      }
    }
  }
  /**
   * Get the HTML Canvas element for this tile.
   * @return {HTMLCanvasElement} Canvas.
   */
  getImage() {
    return this.canvas_;
  }
  /**
   * @private
   */
  reproject_() {
    const sources = [];
    this.sourceTiles_.forEach((source) => {
      var _a;
      const tile = source.tile;
      if (tile && tile.getState() == TileState_default.LOADED) {
        const extent = this.sourceTileGrid_.getTileCoordExtent(tile.tileCoord);
        extent[0] += source.offset;
        extent[2] += source.offset;
        const clipExtent = (_a = this.clipExtent_) == null ? void 0 : _a.slice();
        if (clipExtent) {
          clipExtent[0] += source.offset;
          clipExtent[2] += source.offset;
        }
        sources.push({
          extent,
          clipExtent,
          image: tile.getImage()
        });
      }
    });
    this.sourceTiles_.length = 0;
    if (sources.length === 0) {
      this.state = TileState_default.ERROR;
    } else {
      const z = this.wrappedTileCoord_[0];
      const size = this.targetTileGrid_.getTileSize(z);
      const width = typeof size === "number" ? size : size[0];
      const height = typeof size === "number" ? size : size[1];
      const targetResolution = this.targetTileGrid_.getResolution(z);
      const sourceResolution = this.sourceTileGrid_.getResolution(
        this.sourceZ_
      );
      const targetExtent = this.targetTileGrid_.getTileCoordExtent(
        this.wrappedTileCoord_
      );
      this.canvas_ = render(
        width,
        height,
        this.pixelRatio_,
        sourceResolution,
        this.sourceTileGrid_.getExtent(),
        targetResolution,
        targetExtent,
        this.triangulation_,
        sources,
        this.gutter_,
        this.renderEdges_,
        this.interpolate
      );
      this.state = TileState_default.LOADED;
    }
    this.changed();
  }
  /**
   * Load not yet loaded URI.
   * @override
   */
  load() {
    if (this.state == TileState_default.IDLE) {
      this.state = TileState_default.LOADING;
      this.changed();
      let leftToLoad = 0;
      this.sourcesListenerKeys_ = [];
      this.sourceTiles_.forEach(({ tile }) => {
        const state = tile.getState();
        if (state == TileState_default.IDLE || state == TileState_default.LOADING) {
          leftToLoad++;
          const sourceListenKey = listen(tile, EventType_default.CHANGE, (e) => {
            const state2 = tile.getState();
            if (state2 == TileState_default.LOADED || state2 == TileState_default.ERROR || state2 == TileState_default.EMPTY) {
              unlistenByKey(sourceListenKey);
              leftToLoad--;
              if (leftToLoad === 0) {
                this.unlistenSources_();
                this.reproject_();
              }
            }
          });
          this.sourcesListenerKeys_.push(sourceListenKey);
        }
      });
      if (leftToLoad === 0) {
        setTimeout(this.reproject_.bind(this), 0);
      } else {
        this.sourceTiles_.forEach(function({ tile }, i, arr) {
          const state = tile.getState();
          if (state == TileState_default.IDLE) {
            tile.load();
          }
        });
      }
    }
  }
  /**
   * @private
   */
  unlistenSources_() {
    this.sourcesListenerKeys_.forEach(unlistenByKey);
    this.sourcesListenerKeys_ = null;
  }
  /**
   * Remove from the cache due to expiry
   * @override
   */
  release() {
    if (this.canvas_) {
      releaseCanvas(this.canvas_.getContext("2d"));
      canvasPool.push(this.canvas_);
      this.canvas_ = null;
    }
    super.release();
  }
};
var Tile_default2 = ReprojTile;

export {
  Tile_default,
  ImageTile_default,
  createOrUpdate2 as createOrUpdate,
  TileRange_default,
  calculateSourceResolution,
  Tile_default2,
  createOrUpdate as createOrUpdate2,
  getKeyZXY,
  hash,
  withinExtentAndZ
};
//# sourceMappingURL=chunk-Z54VUISL.js.map
