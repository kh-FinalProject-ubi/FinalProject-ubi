import {
  Circle_default,
  Fill_default,
  Icon_default,
  RegularShape_default,
  Stroke_default,
  Style_default,
  Text_default,
  createDefaultStyle,
  toFunction
} from "./chunk-OY7O6K3O.js";
import {
  Layer_default
} from "./chunk-57FXQERA.js";
import {
  NO_COLOR,
  fromString,
  lchaToRgba,
  rgbaToLcha,
  toString,
  withAlpha
} from "./chunk-KIXJRUXM.js";
import {
  toSize
} from "./chunk-N3TI4B3Y.js";
import {
  RBush
} from "./chunk-QBUEIRCB.js";
import {
  ascending
} from "./chunk-4NB3WFBM.js";
import {
  isEmpty
} from "./chunk-YNGFQH43.js";

// node_modules/ol/expr/expression.js
var numTypes = 0;
var BooleanType = 1 << numTypes++;
var NumberType = 1 << numTypes++;
var StringType = 1 << numTypes++;
var ColorType = 1 << numTypes++;
var NumberArrayType = 1 << numTypes++;
var SizeType = 1 << numTypes++;
var AnyType = Math.pow(2, numTypes) - 1;
var typeNames = {
  [BooleanType]: "boolean",
  [NumberType]: "number",
  [StringType]: "string",
  [ColorType]: "color",
  [NumberArrayType]: "number[]",
  [SizeType]: "size"
};
var namedTypes = Object.keys(typeNames).map(Number).sort(ascending);
function isSpecific(type) {
  return type in typeNames;
}
function typeName(type) {
  const names = [];
  for (const namedType of namedTypes) {
    if (includesType(type, namedType)) {
      names.push(typeNames[namedType]);
    }
  }
  if (names.length === 0) {
    return "untyped";
  }
  if (names.length < 3) {
    return names.join(" or ");
  }
  return names.slice(0, -1).join(", ") + ", or " + names[names.length - 1];
}
function includesType(broad, specific) {
  return (broad & specific) === specific;
}
function isType(type, expected) {
  return type === expected;
}
var LiteralExpression = class {
  /**
   * @param {number} type The value type.
   * @param {LiteralValue} value The literal value.
   */
  constructor(type, value) {
    if (!isSpecific(type)) {
      throw new Error(
        `literal expressions must have a specific type, got ${typeName(type)}`
      );
    }
    this.type = type;
    this.value = value;
  }
};
var CallExpression = class {
  /**
   * @param {number} type The return type.
   * @param {string} operator The operator.
   * @param {...Expression} args The arguments.
   */
  constructor(type, operator, ...args) {
    this.type = type;
    this.operator = operator;
    this.args = args;
  }
};
function newParsingContext() {
  return {
    variables: /* @__PURE__ */ new Set(),
    properties: /* @__PURE__ */ new Set(),
    featureId: false,
    geometryType: false,
    mapState: false
  };
}
function parse(encoded, expectedType, context) {
  switch (typeof encoded) {
    case "boolean": {
      if (isType(expectedType, StringType)) {
        return new LiteralExpression(StringType, encoded ? "true" : "false");
      }
      if (!includesType(expectedType, BooleanType)) {
        throw new Error(
          `got a boolean, but expected ${typeName(expectedType)}`
        );
      }
      return new LiteralExpression(BooleanType, encoded);
    }
    case "number": {
      if (isType(expectedType, SizeType)) {
        return new LiteralExpression(SizeType, toSize(encoded));
      }
      if (isType(expectedType, BooleanType)) {
        return new LiteralExpression(BooleanType, !!encoded);
      }
      if (isType(expectedType, StringType)) {
        return new LiteralExpression(StringType, encoded.toString());
      }
      if (!includesType(expectedType, NumberType)) {
        throw new Error(`got a number, but expected ${typeName(expectedType)}`);
      }
      return new LiteralExpression(NumberType, encoded);
    }
    case "string": {
      if (isType(expectedType, ColorType)) {
        return new LiteralExpression(ColorType, fromString(encoded));
      }
      if (isType(expectedType, BooleanType)) {
        return new LiteralExpression(BooleanType, !!encoded);
      }
      if (!includesType(expectedType, StringType)) {
        throw new Error(`got a string, but expected ${typeName(expectedType)}`);
      }
      return new LiteralExpression(StringType, encoded);
    }
    default: {
    }
  }
  if (!Array.isArray(encoded)) {
    throw new Error("expression must be an array or a primitive value");
  }
  if (encoded.length === 0) {
    throw new Error("empty expression");
  }
  if (typeof encoded[0] === "string") {
    return parseCallExpression(encoded, expectedType, context);
  }
  for (const item of encoded) {
    if (typeof item !== "number") {
      throw new Error("expected an array of numbers");
    }
  }
  if (isType(expectedType, SizeType)) {
    if (encoded.length !== 2) {
      throw new Error(
        `expected an array of two values for a size, got ${encoded.length}`
      );
    }
    return new LiteralExpression(SizeType, encoded);
  }
  if (isType(expectedType, ColorType)) {
    if (encoded.length === 3) {
      return new LiteralExpression(ColorType, [...encoded, 1]);
    }
    if (encoded.length === 4) {
      return new LiteralExpression(ColorType, encoded);
    }
    throw new Error(
      `expected an array of 3 or 4 values for a color, got ${encoded.length}`
    );
  }
  if (!includesType(expectedType, NumberArrayType)) {
    throw new Error(
      `got an array of numbers, but expected ${typeName(expectedType)}`
    );
  }
  return new LiteralExpression(NumberArrayType, encoded);
}
var Ops = {
  Get: "get",
  Var: "var",
  Concat: "concat",
  GeometryType: "geometry-type",
  LineMetric: "line-metric",
  Any: "any",
  All: "all",
  Not: "!",
  Resolution: "resolution",
  Zoom: "zoom",
  Time: "time",
  Equal: "==",
  NotEqual: "!=",
  GreaterThan: ">",
  GreaterThanOrEqualTo: ">=",
  LessThan: "<",
  LessThanOrEqualTo: "<=",
  Multiply: "*",
  Divide: "/",
  Add: "+",
  Subtract: "-",
  Clamp: "clamp",
  Mod: "%",
  Pow: "^",
  Abs: "abs",
  Floor: "floor",
  Ceil: "ceil",
  Round: "round",
  Sin: "sin",
  Cos: "cos",
  Atan: "atan",
  Sqrt: "sqrt",
  Match: "match",
  Between: "between",
  Interpolate: "interpolate",
  Coalesce: "coalesce",
  Case: "case",
  In: "in",
  Number: "number",
  String: "string",
  Array: "array",
  Color: "color",
  Id: "id",
  Band: "band",
  Palette: "palette",
  ToString: "to-string",
  Has: "has"
};
var parsers = {
  [Ops.Get]: createCallExpressionParser(hasArgsCount(1, Infinity), withGetArgs),
  [Ops.Var]: createCallExpressionParser(hasArgsCount(1, 1), withVarArgs),
  [Ops.Has]: createCallExpressionParser(hasArgsCount(1, Infinity), withGetArgs),
  [Ops.Id]: createCallExpressionParser(usesFeatureId, withNoArgs),
  [Ops.Concat]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfType(StringType)
  ),
  [Ops.GeometryType]: createCallExpressionParser(usesGeometryType, withNoArgs),
  [Ops.LineMetric]: createCallExpressionParser(withNoArgs),
  [Ops.Resolution]: createCallExpressionParser(usesMapState, withNoArgs),
  [Ops.Zoom]: createCallExpressionParser(usesMapState, withNoArgs),
  [Ops.Time]: createCallExpressionParser(usesMapState, withNoArgs),
  [Ops.Any]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfType(BooleanType)
  ),
  [Ops.All]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfType(BooleanType)
  ),
  [Ops.Not]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(BooleanType)
  ),
  [Ops.Equal]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(AnyType)
  ),
  [Ops.NotEqual]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(AnyType)
  ),
  [Ops.GreaterThan]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.GreaterThanOrEqualTo]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.LessThan]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.LessThanOrEqualTo]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Multiply]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfReturnType
  ),
  [Ops.Coalesce]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfReturnType
  ),
  [Ops.Divide]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Add]: createCallExpressionParser(
    hasArgsCount(2, Infinity),
    withArgsOfType(NumberType)
  ),
  [Ops.Subtract]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Clamp]: createCallExpressionParser(
    hasArgsCount(3, 3),
    withArgsOfType(NumberType)
  ),
  [Ops.Mod]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Pow]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Abs]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Floor]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Ceil]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Round]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Sin]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Cos]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Atan]: createCallExpressionParser(
    hasArgsCount(1, 2),
    withArgsOfType(NumberType)
  ),
  [Ops.Sqrt]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(NumberType)
  ),
  [Ops.Match]: createCallExpressionParser(
    hasArgsCount(4, Infinity),
    hasEvenArgs,
    withMatchArgs
  ),
  [Ops.Between]: createCallExpressionParser(
    hasArgsCount(3, 3),
    withArgsOfType(NumberType)
  ),
  [Ops.Interpolate]: createCallExpressionParser(
    hasArgsCount(6, Infinity),
    hasEvenArgs,
    withInterpolateArgs
  ),
  [Ops.Case]: createCallExpressionParser(
    hasArgsCount(3, Infinity),
    hasOddArgs,
    withCaseArgs
  ),
  [Ops.In]: createCallExpressionParser(hasArgsCount(2, 2), withInArgs),
  [Ops.Number]: createCallExpressionParser(
    hasArgsCount(1, Infinity),
    withArgsOfType(AnyType)
  ),
  [Ops.String]: createCallExpressionParser(
    hasArgsCount(1, Infinity),
    withArgsOfType(AnyType)
  ),
  [Ops.Array]: createCallExpressionParser(
    hasArgsCount(1, Infinity),
    withArgsOfType(NumberType)
  ),
  [Ops.Color]: createCallExpressionParser(
    hasArgsCount(1, 4),
    withArgsOfType(NumberType)
  ),
  [Ops.Band]: createCallExpressionParser(
    hasArgsCount(1, 3),
    withArgsOfType(NumberType)
  ),
  [Ops.Palette]: createCallExpressionParser(
    hasArgsCount(2, 2),
    withPaletteArgs
  ),
  [Ops.ToString]: createCallExpressionParser(
    hasArgsCount(1, 1),
    withArgsOfType(BooleanType | NumberType | StringType | ColorType)
  )
};
function withGetArgs(encoded, returnType, context) {
  const argsCount = encoded.length - 1;
  const args = new Array(argsCount);
  for (let i = 0; i < argsCount; ++i) {
    const key = encoded[i + 1];
    switch (typeof key) {
      case "number": {
        args[i] = new LiteralExpression(NumberType, key);
        break;
      }
      case "string": {
        args[i] = new LiteralExpression(StringType, key);
        break;
      }
      default: {
        throw new Error(
          `expected a string key or numeric array index for a get operation, got ${key}`
        );
      }
    }
    if (i === 0) {
      context.properties.add(String(key));
    }
  }
  return args;
}
function withVarArgs(encoded, returnType, context) {
  const name = encoded[1];
  if (typeof name !== "string") {
    throw new Error("expected a string argument for var operation");
  }
  context.variables.add(name);
  return [new LiteralExpression(StringType, name)];
}
function usesFeatureId(encoded, returnType, context) {
  context.featureId = true;
}
function usesGeometryType(encoded, returnType, context) {
  context.geometryType = true;
}
function usesMapState(encoded, returnType, context) {
  context.mapState = true;
}
function withNoArgs(encoded, returnType, context) {
  const operation = encoded[0];
  if (encoded.length !== 1) {
    throw new Error(`expected no arguments for ${operation} operation`);
  }
  return [];
}
function hasArgsCount(minArgs, maxArgs) {
  return function(encoded, returnType, context) {
    const operation = encoded[0];
    const argCount = encoded.length - 1;
    if (minArgs === maxArgs) {
      if (argCount !== minArgs) {
        const plural = minArgs === 1 ? "" : "s";
        throw new Error(
          `expected ${minArgs} argument${plural} for ${operation}, got ${argCount}`
        );
      }
    } else if (argCount < minArgs || argCount > maxArgs) {
      const range = maxArgs === Infinity ? `${minArgs} or more` : `${minArgs} to ${maxArgs}`;
      throw new Error(
        `expected ${range} arguments for ${operation}, got ${argCount}`
      );
    }
  };
}
function withArgsOfReturnType(encoded, returnType, context) {
  const argCount = encoded.length - 1;
  const args = new Array(argCount);
  for (let i = 0; i < argCount; ++i) {
    const expression = parse(encoded[i + 1], returnType, context);
    args[i] = expression;
  }
  return args;
}
function withArgsOfType(argType) {
  return function(encoded, returnType, context) {
    const argCount = encoded.length - 1;
    const args = new Array(argCount);
    for (let i = 0; i < argCount; ++i) {
      const expression = parse(encoded[i + 1], argType, context);
      args[i] = expression;
    }
    return args;
  };
}
function hasOddArgs(encoded, returnType, context) {
  const operation = encoded[0];
  const argCount = encoded.length - 1;
  if (argCount % 2 === 0) {
    throw new Error(
      `expected an odd number of arguments for ${operation}, got ${argCount} instead`
    );
  }
}
function hasEvenArgs(encoded, returnType, context) {
  const operation = encoded[0];
  const argCount = encoded.length - 1;
  if (argCount % 2 === 1) {
    throw new Error(
      `expected an even number of arguments for operation ${operation}, got ${argCount} instead`
    );
  }
}
function withMatchArgs(encoded, returnType, context) {
  const argsCount = encoded.length - 1;
  const inputType = StringType | NumberType | BooleanType;
  const input = parse(encoded[1], inputType, context);
  const fallback = parse(encoded[encoded.length - 1], returnType, context);
  const args = new Array(argsCount - 2);
  for (let i = 0; i < argsCount - 2; i += 2) {
    try {
      const match = parse(encoded[i + 2], input.type, context);
      args[i] = match;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i + 1} of match expression: ${err.message}`
      );
    }
    try {
      const output = parse(encoded[i + 3], fallback.type, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i + 2} of match expression: ${err.message}`
      );
    }
  }
  return [input, ...args, fallback];
}
function withInterpolateArgs(encoded, returnType, context) {
  const interpolationType = encoded[1];
  let base;
  switch (interpolationType[0]) {
    case "linear":
      base = 1;
      break;
    case "exponential":
      const b = interpolationType[1];
      if (typeof b !== "number" || b <= 0) {
        throw new Error(
          `expected a number base for exponential interpolation, got ${JSON.stringify(b)} instead`
        );
      }
      base = b;
      break;
    default:
      throw new Error(
        `invalid interpolation type: ${JSON.stringify(interpolationType)}`
      );
  }
  const interpolation = new LiteralExpression(NumberType, base);
  let input;
  try {
    input = parse(encoded[2], NumberType, context);
  } catch (err) {
    throw new Error(
      `failed to parse argument 1 in interpolate expression: ${err.message}`
    );
  }
  const args = new Array(encoded.length - 3);
  for (let i = 0; i < args.length; i += 2) {
    try {
      const stop = parse(encoded[i + 3], NumberType, context);
      args[i] = stop;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i + 2} for interpolate expression: ${err.message}`
      );
    }
    try {
      const output = parse(encoded[i + 4], returnType, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i + 3} for interpolate expression: ${err.message}`
      );
    }
  }
  return [interpolation, input, ...args];
}
function withCaseArgs(encoded, returnType, context) {
  const fallback = parse(encoded[encoded.length - 1], returnType, context);
  const args = new Array(encoded.length - 1);
  for (let i = 0; i < args.length - 1; i += 2) {
    try {
      const condition = parse(encoded[i + 1], BooleanType, context);
      args[i] = condition;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i} of case expression: ${err.message}`
      );
    }
    try {
      const output = parse(encoded[i + 2], fallback.type, context);
      args[i + 1] = output;
    } catch (err) {
      throw new Error(
        `failed to parse argument ${i + 1} of case expression: ${err.message}`
      );
    }
  }
  args[args.length - 1] = fallback;
  return args;
}
function withInArgs(encoded, returnType, context) {
  let haystack = encoded[2];
  if (!Array.isArray(haystack)) {
    throw new Error(
      `the second argument for the "in" operator must be an array`
    );
  }
  let needleType;
  if (typeof haystack[0] === "string") {
    if (haystack[0] !== "literal") {
      throw new Error(
        `for the "in" operator, a string array should be wrapped in a "literal" operator to disambiguate from expressions`
      );
    }
    if (!Array.isArray(haystack[1])) {
      throw new Error(
        `failed to parse "in" expression: the literal operator must be followed by an array`
      );
    }
    haystack = haystack[1];
    needleType = StringType;
  } else {
    needleType = NumberType;
  }
  const args = new Array(haystack.length);
  for (let i = 0; i < args.length; i++) {
    try {
      const arg = parse(haystack[i], needleType, context);
      args[i] = arg;
    } catch (err) {
      throw new Error(
        `failed to parse haystack item ${i} for "in" expression: ${err.message}`
      );
    }
  }
  const needle = parse(encoded[1], needleType, context);
  return [needle, ...args];
}
function withPaletteArgs(encoded, returnType, context) {
  let index;
  try {
    index = parse(encoded[1], NumberType, context);
  } catch (err) {
    throw new Error(
      `failed to parse first argument in palette expression: ${err.message}`
    );
  }
  const colors = encoded[2];
  if (!Array.isArray(colors)) {
    throw new Error("the second argument of palette must be an array");
  }
  const parsedColors = new Array(colors.length);
  for (let i = 0; i < parsedColors.length; i++) {
    let color;
    try {
      color = parse(colors[i], ColorType, context);
    } catch (err) {
      throw new Error(
        `failed to parse color at index ${i} in palette expression: ${err.message}`
      );
    }
    if (!(color instanceof LiteralExpression)) {
      throw new Error(
        `the palette color at index ${i} must be a literal value`
      );
    }
    parsedColors[i] = color;
  }
  return [index, ...parsedColors];
}
function createCallExpressionParser(...validators) {
  return function(encoded, returnType, context) {
    const operator = encoded[0];
    let args;
    for (let i = 0; i < validators.length; i++) {
      const parsed = validators[i](encoded, returnType, context);
      if (i == validators.length - 1) {
        if (!parsed) {
          throw new Error(
            "expected last argument validator to return the parsed args"
          );
        }
        args = parsed;
      }
    }
    return new CallExpression(returnType, operator, ...args);
  };
}
function parseCallExpression(encoded, returnType, context) {
  const operator = encoded[0];
  const parser = parsers[operator];
  if (!parser) {
    throw new Error(`unknown operator: ${operator}`);
  }
  return parser(encoded, returnType, context);
}
function computeGeometryType(geometry) {
  if (!geometry) {
    return "";
  }
  const type = geometry.getType();
  switch (type) {
    case "Point":
    case "LineString":
    case "Polygon":
      return type;
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
      return (
        /** @type {'Point'|'LineString'|'Polygon'} */
        type.substring(5)
      );
    case "Circle":
      return "Polygon";
    case "GeometryCollection":
      return computeGeometryType(
        /** @type {import("../geom/GeometryCollection.js").default} */
        geometry.getGeometries()[0]
      );
    default:
      return "";
  }
}

// node_modules/ol/expr/cpu.js
function newEvaluationContext() {
  return {
    variables: {},
    properties: {},
    resolution: NaN,
    featureId: null,
    geometryType: ""
  };
}
function buildExpression(encoded, type, context) {
  const expression = parse(encoded, type, context);
  return compileExpression(expression, context);
}
function compileExpression(expression, context) {
  if (expression instanceof LiteralExpression) {
    if (expression.type === ColorType && typeof expression.value === "string") {
      const colorValue = fromString(expression.value);
      return function() {
        return colorValue;
      };
    }
    return function() {
      return expression.value;
    };
  }
  const operator = expression.operator;
  switch (operator) {
    case Ops.Number:
    case Ops.String:
    case Ops.Coalesce: {
      return compileAssertionExpression(expression, context);
    }
    case Ops.Get:
    case Ops.Var:
    case Ops.Has: {
      return compileAccessorExpression(expression, context);
    }
    case Ops.Id: {
      return (context2) => context2.featureId;
    }
    case Ops.GeometryType: {
      return (context2) => context2.geometryType;
    }
    case Ops.Concat: {
      const args = expression.args.map((e) => compileExpression(e, context));
      return (context2) => "".concat(...args.map((arg) => arg(context2).toString()));
    }
    case Ops.Resolution: {
      return (context2) => context2.resolution;
    }
    case Ops.Any:
    case Ops.All:
    case Ops.Between:
    case Ops.In:
    case Ops.Not: {
      return compileLogicalExpression(expression, context);
    }
    case Ops.Equal:
    case Ops.NotEqual:
    case Ops.LessThan:
    case Ops.LessThanOrEqualTo:
    case Ops.GreaterThan:
    case Ops.GreaterThanOrEqualTo: {
      return compileComparisonExpression(expression, context);
    }
    case Ops.Multiply:
    case Ops.Divide:
    case Ops.Add:
    case Ops.Subtract:
    case Ops.Clamp:
    case Ops.Mod:
    case Ops.Pow:
    case Ops.Abs:
    case Ops.Floor:
    case Ops.Ceil:
    case Ops.Round:
    case Ops.Sin:
    case Ops.Cos:
    case Ops.Atan:
    case Ops.Sqrt: {
      return compileNumericExpression(expression, context);
    }
    case Ops.Case: {
      return compileCaseExpression(expression, context);
    }
    case Ops.Match: {
      return compileMatchExpression(expression, context);
    }
    case Ops.Interpolate: {
      return compileInterpolateExpression(expression, context);
    }
    case Ops.ToString: {
      return compileConvertExpression(expression, context);
    }
    default: {
      throw new Error(`Unsupported operator ${operator}`);
    }
  }
}
function compileAssertionExpression(expression, context) {
  const type = expression.operator;
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  switch (type) {
    case Ops.Coalesce: {
      return (context2) => {
        for (let i = 0; i < length; ++i) {
          const value = args[i](context2);
          if (typeof value !== "undefined" && value !== null) {
            return value;
          }
        }
        throw new Error("Expected one of the values to be non-null");
      };
    }
    case Ops.Number:
    case Ops.String: {
      return (context2) => {
        for (let i = 0; i < length; ++i) {
          const value = args[i](context2);
          if (typeof value === type) {
            return value;
          }
        }
        throw new Error(`Expected one of the values to be a ${type}`);
      };
    }
    default: {
      throw new Error(`Unsupported assertion operator ${type}`);
    }
  }
}
function compileAccessorExpression(expression, context) {
  const nameExpression = (
    /** @type {LiteralExpression} */
    expression.args[0]
  );
  const name = (
    /** @type {string} */
    nameExpression.value
  );
  switch (expression.operator) {
    case Ops.Get: {
      return (context2) => {
        const args = expression.args;
        let value = context2.properties[name];
        for (let i = 1, ii = args.length; i < ii; ++i) {
          const keyExpression = (
            /** @type {LiteralExpression} */
            args[i]
          );
          const key = (
            /** @type {string|number} */
            keyExpression.value
          );
          value = value[key];
        }
        return value;
      };
    }
    case Ops.Var: {
      return (context2) => context2.variables[name];
    }
    case Ops.Has: {
      return (context2) => {
        const args = expression.args;
        if (!(name in context2.properties)) {
          return false;
        }
        let value = context2.properties[name];
        for (let i = 1, ii = args.length; i < ii; ++i) {
          const keyExpression = (
            /** @type {LiteralExpression} */
            args[i]
          );
          const key = (
            /** @type {string|number} */
            keyExpression.value
          );
          if (!value || !Object.hasOwn(value, key)) {
            return false;
          }
          value = value[key];
        }
        return true;
      };
    }
    default: {
      throw new Error(`Unsupported accessor operator ${expression.operator}`);
    }
  }
}
function compileComparisonExpression(expression, context) {
  const op = expression.operator;
  const left = compileExpression(expression.args[0], context);
  const right = compileExpression(expression.args[1], context);
  switch (op) {
    case Ops.Equal: {
      return (context2) => left(context2) === right(context2);
    }
    case Ops.NotEqual: {
      return (context2) => left(context2) !== right(context2);
    }
    case Ops.LessThan: {
      return (context2) => left(context2) < right(context2);
    }
    case Ops.LessThanOrEqualTo: {
      return (context2) => left(context2) <= right(context2);
    }
    case Ops.GreaterThan: {
      return (context2) => left(context2) > right(context2);
    }
    case Ops.GreaterThanOrEqualTo: {
      return (context2) => left(context2) >= right(context2);
    }
    default: {
      throw new Error(`Unsupported comparison operator ${op}`);
    }
  }
}
function compileLogicalExpression(expression, context) {
  const op = expression.operator;
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  switch (op) {
    case Ops.Any: {
      return (context2) => {
        for (let i = 0; i < length; ++i) {
          if (args[i](context2)) {
            return true;
          }
        }
        return false;
      };
    }
    case Ops.All: {
      return (context2) => {
        for (let i = 0; i < length; ++i) {
          if (!args[i](context2)) {
            return false;
          }
        }
        return true;
      };
    }
    case Ops.Between: {
      return (context2) => {
        const value = args[0](context2);
        const min = args[1](context2);
        const max = args[2](context2);
        return value >= min && value <= max;
      };
    }
    case Ops.In: {
      return (context2) => {
        const value = args[0](context2);
        for (let i = 1; i < length; ++i) {
          if (value === args[i](context2)) {
            return true;
          }
        }
        return false;
      };
    }
    case Ops.Not: {
      return (context2) => !args[0](context2);
    }
    default: {
      throw new Error(`Unsupported logical operator ${op}`);
    }
  }
}
function compileNumericExpression(expression, context) {
  const op = expression.operator;
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  switch (op) {
    case Ops.Multiply: {
      return (context2) => {
        let value = 1;
        for (let i = 0; i < length; ++i) {
          value *= args[i](context2);
        }
        return value;
      };
    }
    case Ops.Divide: {
      return (context2) => args[0](context2) / args[1](context2);
    }
    case Ops.Add: {
      return (context2) => {
        let value = 0;
        for (let i = 0; i < length; ++i) {
          value += args[i](context2);
        }
        return value;
      };
    }
    case Ops.Subtract: {
      return (context2) => args[0](context2) - args[1](context2);
    }
    case Ops.Clamp: {
      return (context2) => {
        const value = args[0](context2);
        const min = args[1](context2);
        if (value < min) {
          return min;
        }
        const max = args[2](context2);
        if (value > max) {
          return max;
        }
        return value;
      };
    }
    case Ops.Mod: {
      return (context2) => args[0](context2) % args[1](context2);
    }
    case Ops.Pow: {
      return (context2) => Math.pow(args[0](context2), args[1](context2));
    }
    case Ops.Abs: {
      return (context2) => Math.abs(args[0](context2));
    }
    case Ops.Floor: {
      return (context2) => Math.floor(args[0](context2));
    }
    case Ops.Ceil: {
      return (context2) => Math.ceil(args[0](context2));
    }
    case Ops.Round: {
      return (context2) => Math.round(args[0](context2));
    }
    case Ops.Sin: {
      return (context2) => Math.sin(args[0](context2));
    }
    case Ops.Cos: {
      return (context2) => Math.cos(args[0](context2));
    }
    case Ops.Atan: {
      if (length === 2) {
        return (context2) => Math.atan2(args[0](context2), args[1](context2));
      }
      return (context2) => Math.atan(args[0](context2));
    }
    case Ops.Sqrt: {
      return (context2) => Math.sqrt(args[0](context2));
    }
    default: {
      throw new Error(`Unsupported numeric operator ${op}`);
    }
  }
}
function compileCaseExpression(expression, context) {
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  return (context2) => {
    for (let i = 0; i < length - 1; i += 2) {
      const condition = args[i](context2);
      if (condition) {
        return args[i + 1](context2);
      }
    }
    return args[length - 1](context2);
  };
}
function compileMatchExpression(expression, context) {
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  return (context2) => {
    const value = args[0](context2);
    for (let i = 1; i < length - 1; i += 2) {
      if (value === args[i](context2)) {
        return args[i + 1](context2);
      }
    }
    return args[length - 1](context2);
  };
}
function compileInterpolateExpression(expression, context) {
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  return (context2) => {
    const base = args[0](context2);
    const value = args[1](context2);
    let previousInput;
    let previousOutput;
    for (let i = 2; i < length; i += 2) {
      const input = args[i](context2);
      let output = args[i + 1](context2);
      const isColor = Array.isArray(output);
      if (isColor) {
        output = withAlpha(output);
      }
      if (input >= value) {
        if (i === 2) {
          return output;
        }
        if (isColor) {
          return interpolateColor(
            base,
            value,
            previousInput,
            previousOutput,
            input,
            output
          );
        }
        return interpolateNumber(
          base,
          value,
          previousInput,
          previousOutput,
          input,
          output
        );
      }
      previousInput = input;
      previousOutput = output;
    }
    return previousOutput;
  };
}
function compileConvertExpression(expression, context) {
  const op = expression.operator;
  const length = expression.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; ++i) {
    args[i] = compileExpression(expression.args[i], context);
  }
  switch (op) {
    case Ops.ToString: {
      return (context2) => {
        const value = args[0](context2);
        if (expression.args[0].type === ColorType) {
          return toString(value);
        }
        return value.toString();
      };
    }
    default: {
      throw new Error(`Unsupported convert operator ${op}`);
    }
  }
}
function interpolateNumber(base, value, input1, output1, input2, output2) {
  const delta = input2 - input1;
  if (delta === 0) {
    return output1;
  }
  const along = value - input1;
  const factor = base === 1 ? along / delta : (Math.pow(base, along) - 1) / (Math.pow(base, delta) - 1);
  return output1 + factor * (output2 - output1);
}
function interpolateColor(base, value, input1, rgba1, input2, rgba2) {
  const delta = input2 - input1;
  if (delta === 0) {
    return rgba1;
  }
  const lcha1 = rgbaToLcha(rgba1);
  const lcha2 = rgbaToLcha(rgba2);
  let deltaHue = lcha2[2] - lcha1[2];
  if (deltaHue > 180) {
    deltaHue -= 360;
  } else if (deltaHue < -180) {
    deltaHue += 360;
  }
  const lcha = [
    interpolateNumber(base, value, input1, lcha1[0], input2, lcha2[0]),
    interpolateNumber(base, value, input1, lcha1[1], input2, lcha2[1]),
    lcha1[2] + interpolateNumber(base, value, input1, 0, input2, deltaHue),
    interpolateNumber(base, value, input1, rgba1[3], input2, rgba2[3])
  ];
  return lchaToRgba(lcha);
}

// node_modules/ol/render/canvas/style.js
function always(context) {
  return true;
}
function rulesToStyleFunction(rules) {
  const parsingContext = newParsingContext();
  const evaluator = buildRuleSet(rules, parsingContext);
  const evaluationContext = newEvaluationContext();
  return function(feature, resolution) {
    evaluationContext.properties = feature.getPropertiesInternal();
    evaluationContext.resolution = resolution;
    if (parsingContext.featureId) {
      const id = feature.getId();
      if (id !== void 0) {
        evaluationContext.featureId = id;
      } else {
        evaluationContext.featureId = null;
      }
    }
    if (parsingContext.geometryType) {
      evaluationContext.geometryType = computeGeometryType(
        feature.getGeometry()
      );
    }
    return evaluator(evaluationContext);
  };
}
function flatStylesToStyleFunction(flatStyles) {
  const parsingContext = newParsingContext();
  const length = flatStyles.length;
  const evaluators = new Array(length);
  for (let i = 0; i < length; ++i) {
    evaluators[i] = buildStyle(flatStyles[i], parsingContext);
  }
  const evaluationContext = newEvaluationContext();
  const styles = new Array(length);
  return function(feature, resolution) {
    evaluationContext.properties = feature.getPropertiesInternal();
    evaluationContext.resolution = resolution;
    if (parsingContext.featureId) {
      const id = feature.getId();
      if (id !== void 0) {
        evaluationContext.featureId = id;
      } else {
        evaluationContext.featureId = null;
      }
    }
    let nonNullCount = 0;
    for (let i = 0; i < length; ++i) {
      const style = evaluators[i](evaluationContext);
      if (style) {
        styles[nonNullCount] = style;
        nonNullCount += 1;
      }
    }
    styles.length = nonNullCount;
    return styles;
  };
}
function buildRuleSet(rules, context) {
  const length = rules.length;
  const compiledRules = new Array(length);
  for (let i = 0; i < length; ++i) {
    const rule = rules[i];
    const filter = "filter" in rule ? buildExpression(rule.filter, BooleanType, context) : always;
    let styles;
    if (Array.isArray(rule.style)) {
      const styleLength = rule.style.length;
      styles = new Array(styleLength);
      for (let j = 0; j < styleLength; ++j) {
        styles[j] = buildStyle(rule.style[j], context);
      }
    } else {
      styles = [buildStyle(rule.style, context)];
    }
    compiledRules[i] = { filter, styles };
  }
  return function(context2) {
    const styles = [];
    let someMatched = false;
    for (let i = 0; i < length; ++i) {
      const filterEvaluator = compiledRules[i].filter;
      if (!filterEvaluator(context2)) {
        continue;
      }
      if (rules[i].else && someMatched) {
        continue;
      }
      someMatched = true;
      for (const styleEvaluator of compiledRules[i].styles) {
        const style = styleEvaluator(context2);
        if (!style) {
          continue;
        }
        styles.push(style);
      }
    }
    return styles;
  };
}
function buildStyle(flatStyle, context) {
  const evaluateFill = buildFill(flatStyle, "", context);
  const evaluateStroke = buildStroke(flatStyle, "", context);
  const evaluateText = buildText(flatStyle, context);
  const evaluateImage = buildImage(flatStyle, context);
  const evaluateZIndex = numberEvaluator(flatStyle, "z-index", context);
  if (!evaluateFill && !evaluateStroke && !evaluateText && !evaluateImage && !isEmpty(flatStyle)) {
    throw new Error(
      "No fill, stroke, point, or text symbolizer properties in style: " + JSON.stringify(flatStyle)
    );
  }
  const style = new Style_default();
  return function(context2) {
    let empty = true;
    if (evaluateFill) {
      const fill = evaluateFill(context2);
      if (fill) {
        empty = false;
      }
      style.setFill(fill);
    }
    if (evaluateStroke) {
      const stroke = evaluateStroke(context2);
      if (stroke) {
        empty = false;
      }
      style.setStroke(stroke);
    }
    if (evaluateText) {
      const text = evaluateText(context2);
      if (text) {
        empty = false;
      }
      style.setText(text);
    }
    if (evaluateImage) {
      const image = evaluateImage(context2);
      if (image) {
        empty = false;
      }
      style.setImage(image);
    }
    if (evaluateZIndex) {
      style.setZIndex(evaluateZIndex(context2));
    }
    if (empty) {
      return null;
    }
    return style;
  };
}
function buildFill(flatStyle, prefix, context) {
  let evaluateColor;
  if (prefix + "fill-pattern-src" in flatStyle) {
    evaluateColor = patternEvaluator(flatStyle, prefix + "fill-", context);
  } else {
    if (flatStyle[prefix + "fill-color"] === "none") {
      return (context2) => null;
    }
    evaluateColor = colorLikeEvaluator(
      flatStyle,
      prefix + "fill-color",
      context
    );
  }
  if (!evaluateColor) {
    return null;
  }
  const fill = new Fill_default();
  return function(context2) {
    const color = evaluateColor(context2);
    if (color === NO_COLOR) {
      return null;
    }
    fill.setColor(color);
    return fill;
  };
}
function buildStroke(flatStyle, prefix, context) {
  const evaluateWidth = numberEvaluator(
    flatStyle,
    prefix + "stroke-width",
    context
  );
  const evaluateColor = colorLikeEvaluator(
    flatStyle,
    prefix + "stroke-color",
    context
  );
  if (!evaluateWidth && !evaluateColor) {
    return null;
  }
  const evaluateLineCap = stringEvaluator(
    flatStyle,
    prefix + "stroke-line-cap",
    context
  );
  const evaluateLineJoin = stringEvaluator(
    flatStyle,
    prefix + "stroke-line-join",
    context
  );
  const evaluateLineDash = numberArrayEvaluator(
    flatStyle,
    prefix + "stroke-line-dash",
    context
  );
  const evaluateLineDashOffset = numberEvaluator(
    flatStyle,
    prefix + "stroke-line-dash-offset",
    context
  );
  const evaluateMiterLimit = numberEvaluator(
    flatStyle,
    prefix + "stroke-miter-limit",
    context
  );
  const stroke = new Stroke_default();
  return function(context2) {
    if (evaluateColor) {
      const color = evaluateColor(context2);
      if (color === NO_COLOR) {
        return null;
      }
      stroke.setColor(color);
    }
    if (evaluateWidth) {
      stroke.setWidth(evaluateWidth(context2));
    }
    if (evaluateLineCap) {
      const lineCap = evaluateLineCap(context2);
      if (lineCap !== "butt" && lineCap !== "round" && lineCap !== "square") {
        throw new Error("Expected butt, round, or square line cap");
      }
      stroke.setLineCap(lineCap);
    }
    if (evaluateLineJoin) {
      const lineJoin = evaluateLineJoin(context2);
      if (lineJoin !== "bevel" && lineJoin !== "round" && lineJoin !== "miter") {
        throw new Error("Expected bevel, round, or miter line join");
      }
      stroke.setLineJoin(lineJoin);
    }
    if (evaluateLineDash) {
      stroke.setLineDash(evaluateLineDash(context2));
    }
    if (evaluateLineDashOffset) {
      stroke.setLineDashOffset(evaluateLineDashOffset(context2));
    }
    if (evaluateMiterLimit) {
      stroke.setMiterLimit(evaluateMiterLimit(context2));
    }
    return stroke;
  };
}
function buildText(flatStyle, context) {
  const prefix = "text-";
  const evaluateValue = stringEvaluator(flatStyle, prefix + "value", context);
  if (!evaluateValue) {
    return null;
  }
  const evaluateFill = buildFill(flatStyle, prefix, context);
  const evaluateBackgroundFill = buildFill(
    flatStyle,
    prefix + "background-",
    context
  );
  const evaluateStroke = buildStroke(flatStyle, prefix, context);
  const evaluateBackgroundStroke = buildStroke(
    flatStyle,
    prefix + "background-",
    context
  );
  const evaluateFont = stringEvaluator(flatStyle, prefix + "font", context);
  const evaluateMaxAngle = numberEvaluator(
    flatStyle,
    prefix + "max-angle",
    context
  );
  const evaluateOffsetX = numberEvaluator(
    flatStyle,
    prefix + "offset-x",
    context
  );
  const evaluateOffsetY = numberEvaluator(
    flatStyle,
    prefix + "offset-y",
    context
  );
  const evaluateOverflow = booleanEvaluator(
    flatStyle,
    prefix + "overflow",
    context
  );
  const evaluatePlacement = stringEvaluator(
    flatStyle,
    prefix + "placement",
    context
  );
  const evaluateRepeat = numberEvaluator(flatStyle, prefix + "repeat", context);
  const evaluateScale = sizeLikeEvaluator(flatStyle, prefix + "scale", context);
  const evaluateRotateWithView = booleanEvaluator(
    flatStyle,
    prefix + "rotate-with-view",
    context
  );
  const evaluateRotation = numberEvaluator(
    flatStyle,
    prefix + "rotation",
    context
  );
  const evaluateAlign = stringEvaluator(flatStyle, prefix + "align", context);
  const evaluateJustify = stringEvaluator(
    flatStyle,
    prefix + "justify",
    context
  );
  const evaluateBaseline = stringEvaluator(
    flatStyle,
    prefix + "baseline",
    context
  );
  const evaluateKeepUpright = booleanEvaluator(
    flatStyle,
    prefix + "keep-upright",
    context
  );
  const evaluatePadding = numberArrayEvaluator(
    flatStyle,
    prefix + "padding",
    context
  );
  const declutterMode = optionalDeclutterMode(
    flatStyle,
    prefix + "declutter-mode"
  );
  const text = new Text_default({ declutterMode });
  return function(context2) {
    text.setText(evaluateValue(context2));
    if (evaluateFill) {
      text.setFill(evaluateFill(context2));
    }
    if (evaluateBackgroundFill) {
      text.setBackgroundFill(evaluateBackgroundFill(context2));
    }
    if (evaluateStroke) {
      text.setStroke(evaluateStroke(context2));
    }
    if (evaluateBackgroundStroke) {
      text.setBackgroundStroke(evaluateBackgroundStroke(context2));
    }
    if (evaluateFont) {
      text.setFont(evaluateFont(context2));
    }
    if (evaluateMaxAngle) {
      text.setMaxAngle(evaluateMaxAngle(context2));
    }
    if (evaluateOffsetX) {
      text.setOffsetX(evaluateOffsetX(context2));
    }
    if (evaluateOffsetY) {
      text.setOffsetY(evaluateOffsetY(context2));
    }
    if (evaluateOverflow) {
      text.setOverflow(evaluateOverflow(context2));
    }
    if (evaluatePlacement) {
      const placement = evaluatePlacement(context2);
      if (placement !== "point" && placement !== "line") {
        throw new Error("Expected point or line for text-placement");
      }
      text.setPlacement(placement);
    }
    if (evaluateRepeat) {
      text.setRepeat(evaluateRepeat(context2));
    }
    if (evaluateScale) {
      text.setScale(evaluateScale(context2));
    }
    if (evaluateRotateWithView) {
      text.setRotateWithView(evaluateRotateWithView(context2));
    }
    if (evaluateRotation) {
      text.setRotation(evaluateRotation(context2));
    }
    if (evaluateAlign) {
      const textAlign = evaluateAlign(context2);
      if (textAlign !== "left" && textAlign !== "center" && textAlign !== "right" && textAlign !== "end" && textAlign !== "start") {
        throw new Error(
          "Expected left, right, center, start, or end for text-align"
        );
      }
      text.setTextAlign(textAlign);
    }
    if (evaluateJustify) {
      const justify = evaluateJustify(context2);
      if (justify !== "left" && justify !== "right" && justify !== "center") {
        throw new Error("Expected left, right, or center for text-justify");
      }
      text.setJustify(justify);
    }
    if (evaluateBaseline) {
      const textBaseline = evaluateBaseline(context2);
      if (textBaseline !== "bottom" && textBaseline !== "top" && textBaseline !== "middle" && textBaseline !== "alphabetic" && textBaseline !== "hanging") {
        throw new Error(
          "Expected bottom, top, middle, alphabetic, or hanging for text-baseline"
        );
      }
      text.setTextBaseline(textBaseline);
    }
    if (evaluatePadding) {
      text.setPadding(evaluatePadding(context2));
    }
    if (evaluateKeepUpright) {
      text.setKeepUpright(evaluateKeepUpright(context2));
    }
    return text;
  };
}
function buildImage(flatStyle, context) {
  if ("icon-src" in flatStyle) {
    return buildIcon(flatStyle, context);
  }
  if ("shape-points" in flatStyle) {
    return buildShape(flatStyle, context);
  }
  if ("circle-radius" in flatStyle) {
    return buildCircle(flatStyle, context);
  }
  return null;
}
function buildIcon(flatStyle, context) {
  const prefix = "icon-";
  const srcName = prefix + "src";
  const src = requireString(flatStyle[srcName], srcName);
  const evaluateAnchor = coordinateEvaluator(
    flatStyle,
    prefix + "anchor",
    context
  );
  const evaluateScale = sizeLikeEvaluator(flatStyle, prefix + "scale", context);
  const evaluateOpacity = numberEvaluator(
    flatStyle,
    prefix + "opacity",
    context
  );
  const evaluateDisplacement = coordinateEvaluator(
    flatStyle,
    prefix + "displacement",
    context
  );
  const evaluateRotation = numberEvaluator(
    flatStyle,
    prefix + "rotation",
    context
  );
  const evaluateRotateWithView = booleanEvaluator(
    flatStyle,
    prefix + "rotate-with-view",
    context
  );
  const anchorOrigin = optionalIconOrigin(flatStyle, prefix + "anchor-origin");
  const anchorXUnits = optionalIconAnchorUnits(
    flatStyle,
    prefix + "anchor-x-units"
  );
  const anchorYUnits = optionalIconAnchorUnits(
    flatStyle,
    prefix + "anchor-y-units"
  );
  const color = optionalColorLike(flatStyle, prefix + "color");
  const crossOrigin = optionalString(flatStyle, prefix + "cross-origin");
  const offset = optionalNumberArray(flatStyle, prefix + "offset");
  const offsetOrigin = optionalIconOrigin(flatStyle, prefix + "offset-origin");
  const width = optionalNumber(flatStyle, prefix + "width");
  const height = optionalNumber(flatStyle, prefix + "height");
  const size = optionalSize(flatStyle, prefix + "size");
  const declutterMode = optionalDeclutterMode(
    flatStyle,
    prefix + "declutter-mode"
  );
  const icon = new Icon_default({
    src,
    anchorOrigin,
    anchorXUnits,
    anchorYUnits,
    color,
    crossOrigin,
    offset,
    offsetOrigin,
    height,
    width,
    size,
    declutterMode
  });
  return function(context2) {
    if (evaluateOpacity) {
      icon.setOpacity(evaluateOpacity(context2));
    }
    if (evaluateDisplacement) {
      icon.setDisplacement(evaluateDisplacement(context2));
    }
    if (evaluateRotation) {
      icon.setRotation(evaluateRotation(context2));
    }
    if (evaluateRotateWithView) {
      icon.setRotateWithView(evaluateRotateWithView(context2));
    }
    if (evaluateScale) {
      icon.setScale(evaluateScale(context2));
    }
    if (evaluateAnchor) {
      icon.setAnchor(evaluateAnchor(context2));
    }
    return icon;
  };
}
function buildShape(flatStyle, context) {
  const prefix = "shape-";
  const pointsName = prefix + "points";
  const radiusName = prefix + "radius";
  const points = requireNumber(flatStyle[pointsName], pointsName);
  const radius = requireNumber(flatStyle[radiusName], radiusName);
  const evaluateFill = buildFill(flatStyle, prefix, context);
  const evaluateStroke = buildStroke(flatStyle, prefix, context);
  const evaluateScale = sizeLikeEvaluator(flatStyle, prefix + "scale", context);
  const evaluateDisplacement = coordinateEvaluator(
    flatStyle,
    prefix + "displacement",
    context
  );
  const evaluateRotation = numberEvaluator(
    flatStyle,
    prefix + "rotation",
    context
  );
  const evaluateRotateWithView = booleanEvaluator(
    flatStyle,
    prefix + "rotate-with-view",
    context
  );
  const radius2 = optionalNumber(flatStyle, prefix + "radius2");
  const angle = optionalNumber(flatStyle, prefix + "angle");
  const declutterMode = optionalDeclutterMode(
    flatStyle,
    prefix + "declutter-mode"
  );
  const shape = new RegularShape_default({
    points,
    radius,
    radius2,
    angle,
    declutterMode
  });
  return function(context2) {
    if (evaluateFill) {
      shape.setFill(evaluateFill(context2));
    }
    if (evaluateStroke) {
      shape.setStroke(evaluateStroke(context2));
    }
    if (evaluateDisplacement) {
      shape.setDisplacement(evaluateDisplacement(context2));
    }
    if (evaluateRotation) {
      shape.setRotation(evaluateRotation(context2));
    }
    if (evaluateRotateWithView) {
      shape.setRotateWithView(evaluateRotateWithView(context2));
    }
    if (evaluateScale) {
      shape.setScale(evaluateScale(context2));
    }
    return shape;
  };
}
function buildCircle(flatStyle, context) {
  const prefix = "circle-";
  const evaluateFill = buildFill(flatStyle, prefix, context);
  const evaluateStroke = buildStroke(flatStyle, prefix, context);
  const evaluateRadius = numberEvaluator(flatStyle, prefix + "radius", context);
  const evaluateScale = sizeLikeEvaluator(flatStyle, prefix + "scale", context);
  const evaluateDisplacement = coordinateEvaluator(
    flatStyle,
    prefix + "displacement",
    context
  );
  const evaluateRotation = numberEvaluator(
    flatStyle,
    prefix + "rotation",
    context
  );
  const evaluateRotateWithView = booleanEvaluator(
    flatStyle,
    prefix + "rotate-with-view",
    context
  );
  const declutterMode = optionalDeclutterMode(
    flatStyle,
    prefix + "declutter-mode"
  );
  const circle = new Circle_default({
    radius: 5,
    // this is arbitrary, but required - the evaluated radius is used below
    declutterMode
  });
  return function(context2) {
    if (evaluateRadius) {
      circle.setRadius(evaluateRadius(context2));
    }
    if (evaluateFill) {
      circle.setFill(evaluateFill(context2));
    }
    if (evaluateStroke) {
      circle.setStroke(evaluateStroke(context2));
    }
    if (evaluateDisplacement) {
      circle.setDisplacement(evaluateDisplacement(context2));
    }
    if (evaluateRotation) {
      circle.setRotation(evaluateRotation(context2));
    }
    if (evaluateRotateWithView) {
      circle.setRotateWithView(evaluateRotateWithView(context2));
    }
    if (evaluateScale) {
      circle.setScale(evaluateScale(context2));
    }
    return circle;
  };
}
function numberEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return void 0;
  }
  const evaluator = buildExpression(flatStyle[name], NumberType, context);
  return function(context2) {
    return requireNumber(evaluator(context2), name);
  };
}
function stringEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], StringType, context);
  return function(context2) {
    return requireString(evaluator(context2), name);
  };
}
function patternEvaluator(flatStyle, prefix, context) {
  const srcEvaluator = stringEvaluator(
    flatStyle,
    prefix + "pattern-src",
    context
  );
  const offsetEvaluator = sizeEvaluator(
    flatStyle,
    prefix + "pattern-offset",
    context
  );
  const patternSizeEvaluator = sizeEvaluator(
    flatStyle,
    prefix + "pattern-size",
    context
  );
  const colorEvaluator = colorLikeEvaluator(
    flatStyle,
    prefix + "color",
    context
  );
  return function(context2) {
    return {
      src: srcEvaluator(context2),
      offset: offsetEvaluator && offsetEvaluator(context2),
      size: patternSizeEvaluator && patternSizeEvaluator(context2),
      color: colorEvaluator && colorEvaluator(context2)
    };
  };
}
function booleanEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], BooleanType, context);
  return function(context2) {
    const value = evaluator(context2);
    if (typeof value !== "boolean") {
      throw new Error(`Expected a boolean for ${name}`);
    }
    return value;
  };
}
function colorLikeEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], ColorType, context);
  return function(context2) {
    return requireColorLike(evaluator(context2), name);
  };
}
function numberArrayEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], NumberArrayType, context);
  return function(context2) {
    return requireNumberArray(evaluator(context2), name);
  };
}
function coordinateEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], NumberArrayType, context);
  return function(context2) {
    const array = requireNumberArray(evaluator(context2), name);
    if (array.length !== 2) {
      throw new Error(`Expected two numbers for ${name}`);
    }
    return array;
  };
}
function sizeEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(flatStyle[name], NumberArrayType, context);
  return function(context2) {
    return requireSize(evaluator(context2), name);
  };
}
function sizeLikeEvaluator(flatStyle, name, context) {
  if (!(name in flatStyle)) {
    return null;
  }
  const evaluator = buildExpression(
    flatStyle[name],
    NumberArrayType | NumberType,
    context
  );
  return function(context2) {
    return requireSizeLike(evaluator(context2), name);
  };
}
function optionalNumber(flatStyle, property) {
  const value = flatStyle[property];
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "number") {
    throw new Error(`Expected a number for ${property}`);
  }
  return value;
}
function optionalSize(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  if (typeof encoded === "number") {
    return toSize(encoded);
  }
  if (!Array.isArray(encoded)) {
    throw new Error(`Expected a number or size array for ${property}`);
  }
  if (encoded.length !== 2 || typeof encoded[0] !== "number" || typeof encoded[1] !== "number") {
    throw new Error(`Expected a number or size array for ${property}`);
  }
  return encoded;
}
function optionalString(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  if (typeof encoded !== "string") {
    throw new Error(`Expected a string for ${property}`);
  }
  return encoded;
}
function optionalIconOrigin(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  if (encoded !== "bottom-left" && encoded !== "bottom-right" && encoded !== "top-left" && encoded !== "top-right") {
    throw new Error(
      `Expected bottom-left, bottom-right, top-left, or top-right for ${property}`
    );
  }
  return encoded;
}
function optionalIconAnchorUnits(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  if (encoded !== "pixels" && encoded !== "fraction") {
    throw new Error(`Expected pixels or fraction for ${property}`);
  }
  return encoded;
}
function optionalNumberArray(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  return requireNumberArray(encoded, property);
}
function optionalDeclutterMode(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  if (typeof encoded !== "string") {
    throw new Error(`Expected a string for ${property}`);
  }
  if (encoded !== "declutter" && encoded !== "obstacle" && encoded !== "none") {
    throw new Error(`Expected declutter, obstacle, or none for ${property}`);
  }
  return encoded;
}
function optionalColorLike(flatStyle, property) {
  const encoded = flatStyle[property];
  if (encoded === void 0) {
    return void 0;
  }
  return requireColorLike(encoded, property);
}
function requireNumberArray(value, property) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected an array for ${property}`);
  }
  const length = value.length;
  for (let i = 0; i < length; ++i) {
    if (typeof value[i] !== "number") {
      throw new Error(`Expected an array of numbers for ${property}`);
    }
  }
  return value;
}
function requireString(value, property) {
  if (typeof value !== "string") {
    throw new Error(`Expected a string for ${property}`);
  }
  return value;
}
function requireNumber(value, property) {
  if (typeof value !== "number") {
    throw new Error(`Expected a number for ${property}`);
  }
  return value;
}
function requireColorLike(value, property) {
  if (typeof value === "string") {
    return value;
  }
  const array = requireNumberArray(value, property);
  const length = array.length;
  if (length < 3 || length > 4) {
    throw new Error(`Expected a color with 3 or 4 values for ${property}`);
  }
  return array;
}
function requireSize(value, property) {
  const size = requireNumberArray(value, property);
  if (size.length !== 2) {
    throw new Error(`Expected an array of two numbers for ${property}`);
  }
  return size;
}
function requireSizeLike(value, property) {
  if (typeof value === "number") {
    return value;
  }
  return requireSize(value, property);
}

// node_modules/ol/layer/BaseVector.js
var Property = {
  RENDER_ORDER: "renderOrder"
};
var BaseVectorLayer = class extends Layer_default {
  /**
   * @param {Options<FeatureType, VectorSourceType>} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const baseOptions = Object.assign({}, options);
    delete baseOptions.style;
    delete baseOptions.renderBuffer;
    delete baseOptions.updateWhileAnimating;
    delete baseOptions.updateWhileInteracting;
    super(baseOptions);
    this.declutter_ = options.declutter ? String(options.declutter) : void 0;
    this.renderBuffer_ = options.renderBuffer !== void 0 ? options.renderBuffer : 100;
    this.style_ = null;
    this.styleFunction_ = void 0;
    this.setStyle(options.style);
    this.updateWhileAnimating_ = options.updateWhileAnimating !== void 0 ? options.updateWhileAnimating : false;
    this.updateWhileInteracting_ = options.updateWhileInteracting !== void 0 ? options.updateWhileInteracting : false;
  }
  /**
   * @return {string} Declutter group.
   * @override
   */
  getDeclutter() {
    return this.declutter_;
  }
  /**
   * Get the topmost feature that intersects the given pixel on the viewport. Returns a promise
   * that resolves with an array of features. The array will either contain the topmost feature
   * when a hit was detected, or it will be empty.
   *
   * The hit detection algorithm used for this method is optimized for performance, but is less
   * accurate than the one used in [map.getFeaturesAtPixel()]{@link import("../Map.js").default#getFeaturesAtPixel}.
   * Text is not considered, and icons are only represented by their bounding box instead of the exact
   * image.
   *
   * @param {import("../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../Feature").FeatureLike>>} Promise that resolves with an array of features.
   * @api
   * @override
   */
  getFeatures(pixel) {
    return super.getFeatures(pixel);
  }
  /**
   * @return {number|undefined} Render buffer.
   */
  getRenderBuffer() {
    return this.renderBuffer_;
  }
  /**
   * @return {import("../render.js").OrderFunction|null|undefined} Render order.
   */
  getRenderOrder() {
    return (
      /** @type {import("../render.js").OrderFunction|null|undefined} */
      this.get(Property.RENDER_ORDER)
    );
  }
  /**
   * Get the style for features.  This returns whatever was passed to the `style`
   * option at construction or to the `setStyle` method.
   * @return {import("../style/Style.js").StyleLike|import("../style/flat.js").FlatStyleLike|null|undefined} Layer style.
   * @api
   */
  getStyle() {
    return this.style_;
  }
  /**
   * Get the style function.
   * @return {import("../style/Style.js").StyleFunction|undefined} Layer style function.
   * @api
   */
  getStyleFunction() {
    return this.styleFunction_;
  }
  /**
   * @return {boolean} Whether the rendered layer should be updated while
   *     animating.
   */
  getUpdateWhileAnimating() {
    return this.updateWhileAnimating_;
  }
  /**
   * @return {boolean} Whether the rendered layer should be updated while
   *     interacting.
   */
  getUpdateWhileInteracting() {
    return this.updateWhileInteracting_;
  }
  /**
   * Render declutter items for this layer
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @param {import("../layer/Layer.js").State} layerState Layer state.
   * @override
   */
  renderDeclutter(frameState, layerState) {
    const declutterGroup = this.getDeclutter();
    if (declutterGroup in frameState.declutter === false) {
      frameState.declutter[declutterGroup] = new RBush(9);
    }
    this.getRenderer().renderDeclutter(frameState, layerState);
  }
  /**
   * @param {import("../render.js").OrderFunction|null|undefined} renderOrder
   *     Render order.
   */
  setRenderOrder(renderOrder) {
    this.set(Property.RENDER_ORDER, renderOrder);
  }
  /**
   * Set the style for features.  This can be a single style object, an array
   * of styles, or a function that takes a feature and resolution and returns
   * an array of styles. If set to `null`, the layer has no style (a `null` style),
   * so only features that have their own styles will be rendered in the layer. Call
   * `setStyle()` without arguments to reset to the default style. See
   * [the ol/style/Style module]{@link module:ol/style/Style~Style} for information on the default style.
   *
   * If your layer has a static style, you can use [flat style]{@link module:ol/style/flat~FlatStyle} object
   * literals instead of using the `Style` and symbolizer constructors (`Fill`, `Stroke`, etc.):
   * ```js
   * vectorLayer.setStyle({
   *   "fill-color": "yellow",
   *   "stroke-color": "black",
   *   "stroke-width": 4
   * })
   * ```
   *
   * @param {import("../style/Style.js").StyleLike|import("../style/flat.js").FlatStyleLike|null} [style] Layer style.
   * @api
   */
  setStyle(style) {
    this.style_ = style === void 0 ? createDefaultStyle : style;
    const styleLike = toStyleLike(style);
    this.styleFunction_ = style === null ? void 0 : toFunction(styleLike);
    this.changed();
  }
  /**
   * @param {boolean|string|number} declutter Declutter images and text.
   * @api
   */
  setDeclutter(declutter) {
    this.declutter_ = declutter ? String(declutter) : void 0;
    this.changed();
  }
};
function toStyleLike(style) {
  if (style === void 0) {
    return createDefaultStyle;
  }
  if (!style) {
    return null;
  }
  if (typeof style === "function") {
    return style;
  }
  if (style instanceof Style_default) {
    return style;
  }
  if (!Array.isArray(style)) {
    return flatStylesToStyleFunction([style]);
  }
  if (style.length === 0) {
    return [];
  }
  const length = style.length;
  const first = style[0];
  if (first instanceof Style_default) {
    const styles = new Array(length);
    for (let i = 0; i < length; ++i) {
      const candidate = style[i];
      if (!(candidate instanceof Style_default)) {
        throw new Error("Expected a list of style instances");
      }
      styles[i] = candidate;
    }
    return styles;
  }
  if ("style" in first) {
    const rules = new Array(length);
    for (let i = 0; i < length; ++i) {
      const candidate = style[i];
      if (!("style" in candidate)) {
        throw new Error("Expected a list of rules with a style property");
      }
      rules[i] = candidate;
    }
    return rulesToStyleFunction(rules);
  }
  const flatStyles = (
    /** @type {Array<import("../style/flat.js").FlatStyle>} */
    style
  );
  return flatStylesToStyleFunction(flatStyles);
}
var BaseVector_default = BaseVectorLayer;

export {
  BaseVector_default
};
//# sourceMappingURL=chunk-FFPX5ILK.js.map
