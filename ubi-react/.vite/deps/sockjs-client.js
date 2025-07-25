import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/sockjs-client/lib/utils/browser-crypto.js
var require_browser_crypto = __commonJS({
  "node_modules/sockjs-client/lib/utils/browser-crypto.js"(exports, module) {
    "use strict";
    if (global.crypto && global.crypto.getRandomValues) {
      module.exports.randomBytes = function(length) {
        var bytes = new Uint8Array(length);
        global.crypto.getRandomValues(bytes);
        return bytes;
      };
    } else {
      module.exports.randomBytes = function(length) {
        var bytes = new Array(length);
        for (var i = 0; i < length; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
      };
    }
  }
});

// node_modules/sockjs-client/lib/utils/random.js
var require_random = __commonJS({
  "node_modules/sockjs-client/lib/utils/random.js"(exports, module) {
    "use strict";
    var crypto = require_browser_crypto();
    var _randomStringChars = "abcdefghijklmnopqrstuvwxyz012345";
    module.exports = {
      string: function(length) {
        var max = _randomStringChars.length;
        var bytes = crypto.randomBytes(length);
        var ret = [];
        for (var i = 0; i < length; i++) {
          ret.push(_randomStringChars.substr(bytes[i] % max, 1));
        }
        return ret.join("");
      },
      number: function(max) {
        return Math.floor(Math.random() * max);
      },
      numberString: function(max) {
        var t = ("" + (max - 1)).length;
        var p = new Array(t + 1).join("0");
        return (p + this.number(max)).slice(-t);
      }
    };
  }
});

// node_modules/sockjs-client/lib/utils/event.js
var require_event = __commonJS({
  "node_modules/sockjs-client/lib/utils/event.js"(exports, module) {
    "use strict";
    var random = require_random();
    var onUnload = {};
    var afterUnload = false;
    var isChromePackagedApp = global.chrome && global.chrome.app && global.chrome.app.runtime;
    module.exports = {
      attachEvent: function(event, listener) {
        if (typeof global.addEventListener !== "undefined") {
          global.addEventListener(event, listener, false);
        } else if (global.document && global.attachEvent) {
          global.document.attachEvent("on" + event, listener);
          global.attachEvent("on" + event, listener);
        }
      },
      detachEvent: function(event, listener) {
        if (typeof global.addEventListener !== "undefined") {
          global.removeEventListener(event, listener, false);
        } else if (global.document && global.detachEvent) {
          global.document.detachEvent("on" + event, listener);
          global.detachEvent("on" + event, listener);
        }
      },
      unloadAdd: function(listener) {
        if (isChromePackagedApp) {
          return null;
        }
        var ref = random.string(8);
        onUnload[ref] = listener;
        if (afterUnload) {
          setTimeout(this.triggerUnloadCallbacks, 0);
        }
        return ref;
      },
      unloadDel: function(ref) {
        if (ref in onUnload) {
          delete onUnload[ref];
        }
      },
      triggerUnloadCallbacks: function() {
        for (var ref in onUnload) {
          onUnload[ref]();
          delete onUnload[ref];
        }
      }
    };
    var unloadTriggered = function() {
      if (afterUnload) {
        return;
      }
      afterUnload = true;
      module.exports.triggerUnloadCallbacks();
    };
    if (!isChromePackagedApp) {
      module.exports.attachEvent("unload", unloadTriggered);
    }
  }
});

// node_modules/requires-port/index.js
var require_requires_port = __commonJS({
  "node_modules/requires-port/index.js"(exports, module) {
    "use strict";
    module.exports = function required(port, protocol) {
      protocol = protocol.split(":")[0];
      port = +port;
      if (!port) return false;
      switch (protocol) {
        case "http":
        case "ws":
          return port !== 80;
        case "https":
        case "wss":
          return port !== 443;
        case "ftp":
          return port !== 21;
        case "gopher":
          return port !== 70;
        case "file":
          return false;
      }
      return port !== 0;
    };
  }
});

// node_modules/querystringify/index.js
var require_querystringify = __commonJS({
  "node_modules/querystringify/index.js"(exports) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var undef;
    function decode(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, " "));
      } catch (e) {
        return null;
      }
    }
    function encode(input) {
      try {
        return encodeURIComponent(input);
      } catch (e) {
        return null;
      }
    }
    function querystring(query) {
      var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
      while (part = parser.exec(query)) {
        var key = decode(part[1]), value = decode(part[2]);
        if (key === null || value === null || key in result) continue;
        result[key] = value;
      }
      return result;
    }
    function querystringify(obj, prefix) {
      prefix = prefix || "";
      var pairs = [], value, key;
      if ("string" !== typeof prefix) prefix = "?";
      for (key in obj) {
        if (has.call(obj, key)) {
          value = obj[key];
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = "";
          }
          key = encode(key);
          value = encode(value);
          if (key === null || value === null) continue;
          pairs.push(key + "=" + value);
        }
      }
      return pairs.length ? prefix + pairs.join("&") : "";
    }
    exports.stringify = querystringify;
    exports.parse = querystring;
  }
});

// node_modules/url-parse/index.js
var require_url_parse = __commonJS({
  "node_modules/url-parse/index.js"(exports, module) {
    "use strict";
    var required = require_requires_port();
    var qs = require_querystringify();
    var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
    var CRHTLF = /[\n\r\t]/g;
    var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
    var port = /:\d+$/;
    var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
    var windowsDriveLetter = /^[a-zA-Z]:/;
    function trimLeft(str) {
      return (str ? str : "").toString().replace(controlOrWhitespace, "");
    }
    var rules = [
      ["#", "hash"],
      // Extract from the back.
      ["?", "query"],
      // Extract from the back.
      function sanitize(address, url) {
        return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
      },
      ["/", "pathname"],
      // Extract from the back.
      ["@", "auth", 1],
      // Extract from the front.
      [NaN, "host", void 0, 1, 1],
      // Set left over value.
      [/:(\d*)$/, "port", void 0, 1],
      // RegExp the back.
      [NaN, "hostname", void 0, 1, 1]
      // Set left over.
    ];
    var ignore = { hash: 1, query: 1 };
    function lolcation(loc) {
      var globalVar;
      if (typeof window !== "undefined") globalVar = window;
      else if (typeof global !== "undefined") globalVar = global;
      else if (typeof self !== "undefined") globalVar = self;
      else globalVar = {};
      var location = globalVar.location || {};
      loc = loc || location;
      var finaldestination = {}, type = typeof loc, key;
      if ("blob:" === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ("string" === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ("object" === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }
        if (finaldestination.slashes === void 0) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }
      return finaldestination;
    }
    function isSpecial(scheme) {
      return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
    }
    function extractProtocol(address, location) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      location = location || {};
      var match = protocolre.exec(address);
      var protocol = match[1] ? match[1].toLowerCase() : "";
      var forwardSlashes = !!match[2];
      var otherSlashes = !!match[3];
      var slashesCount = 0;
      var rest;
      if (forwardSlashes) {
        if (otherSlashes) {
          rest = match[2] + match[3] + match[4];
          slashesCount = match[2].length + match[3].length;
        } else {
          rest = match[2] + match[4];
          slashesCount = match[2].length;
        }
      } else {
        if (otherSlashes) {
          rest = match[3] + match[4];
          slashesCount = match[3].length;
        } else {
          rest = match[4];
        }
      }
      if (protocol === "file:") {
        if (slashesCount >= 2) {
          rest = rest.slice(2);
        }
      } else if (isSpecial(protocol)) {
        rest = match[4];
      } else if (protocol) {
        if (forwardSlashes) {
          rest = rest.slice(2);
        }
      } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
        rest = match[4];
      }
      return {
        protocol,
        slashes: forwardSlashes || isSpecial(protocol),
        slashesCount,
        rest
      };
    }
    function resolve(relative, base) {
      if (relative === "") return base;
      var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
      while (i--) {
        if (path[i] === ".") {
          path.splice(i, 1);
        } else if (path[i] === "..") {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0) unshift = true;
          path.splice(i, 1);
          up--;
        }
      }
      if (unshift) path.unshift("");
      if (last === "." || last === "..") path.push("");
      return path.join("/");
    }
    function Url(address, location, parser) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }
      var relative, extracted, parse, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i = 0;
      if ("object" !== type && "string" !== type) {
        parser = location;
        location = null;
      }
      if (parser && "function" !== typeof parser) parser = qs.parse;
      location = lolcation(location);
      extracted = extractProtocol(address || "", location);
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || "";
      address = extracted.rest;
      if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
        instructions[3] = [/(.*)/, "pathname"];
      }
      for (; i < instructions.length; i++) {
        instruction = instructions[i];
        if (typeof instruction === "function") {
          address = instruction(address, url);
          continue;
        }
        parse = instruction[0];
        key = instruction[1];
        if (parse !== parse) {
          url[key] = address;
        } else if ("string" === typeof parse) {
          index = parse === "@" ? address.lastIndexOf(parse) : address.indexOf(parse);
          if (~index) {
            if ("number" === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if (index = parse.exec(address)) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }
        url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }
      if (parser) url.query = parser(url.query);
      if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
        url.pathname = resolve(url.pathname, location.pathname);
      }
      if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
        url.pathname = "/" + url.pathname;
      }
      if (!required(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = "";
      }
      url.username = url.password = "";
      if (url.auth) {
        index = url.auth.indexOf(":");
        if (~index) {
          url.username = url.auth.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = url.auth.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(url.auth));
        }
        url.auth = url.password ? url.username + ":" + url.password : url.username;
      }
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
    }
    function set(part, value, fn) {
      var url = this;
      switch (part) {
        case "query":
          if ("string" === typeof value && value.length) {
            value = (fn || qs.parse)(value);
          }
          url[part] = value;
          break;
        case "port":
          url[part] = value;
          if (!required(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = "";
          } else if (value) {
            url.host = url.hostname + ":" + value;
          }
          break;
        case "hostname":
          url[part] = value;
          if (url.port) value += ":" + url.port;
          url.host = value;
          break;
        case "host":
          url[part] = value;
          if (port.test(value)) {
            value = value.split(":");
            url.port = value.pop();
            url.hostname = value.join(":");
          } else {
            url.hostname = value;
            url.port = "";
          }
          break;
        case "protocol":
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;
        case "pathname":
        case "hash":
          if (value) {
            var char = part === "pathname" ? "/" : "#";
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;
        case "username":
        case "password":
          url[part] = encodeURIComponent(value);
          break;
        case "auth":
          var index = value.indexOf(":");
          if (~index) {
            url.username = value.slice(0, index);
            url.username = encodeURIComponent(decodeURIComponent(url.username));
            url.password = value.slice(index + 1);
            url.password = encodeURIComponent(decodeURIComponent(url.password));
          } else {
            url.username = encodeURIComponent(decodeURIComponent(value));
          }
      }
      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];
        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }
      url.auth = url.password ? url.username + ":" + url.password : url.username;
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
      return url;
    }
    function toString(stringify) {
      if (!stringify || "function" !== typeof stringify) stringify = qs.stringify;
      var query, url = this, host = url.host, protocol = url.protocol;
      if (protocol && protocol.charAt(protocol.length - 1) !== ":") protocol += ":";
      var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
      if (url.username) {
        result += url.username;
        if (url.password) result += ":" + url.password;
        result += "@";
      } else if (url.password) {
        result += ":" + url.password;
        result += "@";
      } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
        result += "@";
      }
      if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
        host += ":";
      }
      result += host + url.pathname;
      query = "object" === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += "?" !== query.charAt(0) ? "?" + query : query;
      if (url.hash) result += url.hash;
      return result;
    }
    Url.prototype = { set, toString };
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = qs;
    module.exports = Url;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/sockjs-client/node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/sockjs-client/node_modules/debug/src/common.js"(exports, module) {
    "use strict";
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      Object.keys(env).forEach(function(key) {
        createDebug[key] = env[key];
      });
      createDebug.instances = [];
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        var hash = 0;
        for (var i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        var prevTime;
        function debug() {
          if (!debug.enabled) {
            return;
          }
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          var self2 = debug;
          var curr = Number(/* @__PURE__ */ new Date());
          var ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          var index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
            if (match === "%%") {
              return match;
            }
            index++;
            var formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              var val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          var logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.enabled = createDebug.enabled(namespace);
        debug.useColors = createDebug.useColors();
        debug.color = selectColor(namespace);
        debug.destroy = destroy;
        debug.extend = extend;
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        createDebug.instances.push(debug);
        return debug;
      }
      function destroy() {
        var index = createDebug.instances.indexOf(this);
        if (index !== -1) {
          createDebug.instances.splice(index, 1);
          return true;
        }
        return false;
      }
      function extend(namespace, delimiter) {
        return createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.names = [];
        createDebug.skips = [];
        var i;
        var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        var len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
        for (i = 0; i < createDebug.instances.length; i++) {
          var instance = createDebug.instances[i];
          instance.enabled = createDebug.enabled(instance.namespace);
        }
      }
      function disable() {
        createDebug.enable("");
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        var i;
        var len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/sockjs-client/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/sockjs-client/node_modules/debug/src/browser.js"(exports, module) {
    "use strict";
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      var _console;
      return (typeof console === "undefined" ? "undefined" : _typeof(console)) === "object" && console.log && (_console = console).log.apply(_console, arguments);
    }
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var formatters = module.exports.formatters;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/sockjs-client/lib/utils/url.js
var require_url = __commonJS({
  "node_modules/sockjs-client/lib/utils/url.js"(exports, module) {
    "use strict";
    var URL = require_url_parse();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:utils:url");
    }
    module.exports = {
      getOrigin: function(url) {
        if (!url) {
          return null;
        }
        var p = new URL(url);
        if (p.protocol === "file:") {
          return null;
        }
        var port = p.port;
        if (!port) {
          port = p.protocol === "https:" ? "443" : "80";
        }
        return p.protocol + "//" + p.hostname + ":" + port;
      },
      isOriginEqual: function(a, b) {
        var res = this.getOrigin(a) === this.getOrigin(b);
        debug("same", a, b, res);
        return res;
      },
      isSchemeEqual: function(a, b) {
        return a.split(":")[0] === b.split(":")[0];
      },
      addPath: function(url, path) {
        var qs = url.split("?");
        return qs[0] + path + (qs[1] ? "?" + qs[1] : "");
      },
      addQuery: function(url, q) {
        return url + (url.indexOf("?") === -1 ? "?" + q : "&" + q);
      },
      isLoopbackAddr: function(addr) {
        return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
      }
    };
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/sockjs-client/lib/event/eventtarget.js
var require_eventtarget = __commonJS({
  "node_modules/sockjs-client/lib/event/eventtarget.js"(exports, module) {
    "use strict";
    function EventTarget() {
      this._listeners = {};
    }
    EventTarget.prototype.addEventListener = function(eventType, listener) {
      if (!(eventType in this._listeners)) {
        this._listeners[eventType] = [];
      }
      var arr = this._listeners[eventType];
      if (arr.indexOf(listener) === -1) {
        arr = arr.concat([listener]);
      }
      this._listeners[eventType] = arr;
    };
    EventTarget.prototype.removeEventListener = function(eventType, listener) {
      var arr = this._listeners[eventType];
      if (!arr) {
        return;
      }
      var idx = arr.indexOf(listener);
      if (idx !== -1) {
        if (arr.length > 1) {
          this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
        } else {
          delete this._listeners[eventType];
        }
        return;
      }
    };
    EventTarget.prototype.dispatchEvent = function() {
      var event = arguments[0];
      var t = event.type;
      var args = arguments.length === 1 ? [event] : Array.apply(null, arguments);
      if (this["on" + t]) {
        this["on" + t].apply(this, args);
      }
      if (t in this._listeners) {
        var listeners = this._listeners[t];
        for (var i = 0; i < listeners.length; i++) {
          listeners[i].apply(this, args);
        }
      }
    };
    module.exports = EventTarget;
  }
});

// node_modules/sockjs-client/lib/event/emitter.js
var require_emitter = __commonJS({
  "node_modules/sockjs-client/lib/event/emitter.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventTarget = require_eventtarget();
    function EventEmitter() {
      EventTarget.call(this);
    }
    inherits(EventEmitter, EventTarget);
    EventEmitter.prototype.removeAllListeners = function(type) {
      if (type) {
        delete this._listeners[type];
      } else {
        this._listeners = {};
      }
    };
    EventEmitter.prototype.once = function(type, listener) {
      var self2 = this, fired = false;
      function g() {
        self2.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }
      this.on(type, g);
    };
    EventEmitter.prototype.emit = function() {
      var type = arguments[0];
      var listeners = this._listeners[type];
      if (!listeners) {
        return;
      }
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var ai = 1; ai < l; ai++) {
        args[ai - 1] = arguments[ai];
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].apply(this, args);
      }
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener = EventTarget.prototype.addEventListener;
    EventEmitter.prototype.removeListener = EventTarget.prototype.removeEventListener;
    module.exports.EventEmitter = EventEmitter;
  }
});

// node_modules/sockjs-client/lib/transport/browser/websocket.js
var require_websocket = __commonJS({
  "node_modules/sockjs-client/lib/transport/browser/websocket.js"(exports, module) {
    "use strict";
    var Driver = global.WebSocket || global.MozWebSocket;
    if (Driver) {
      module.exports = function WebSocketBrowserDriver(url) {
        return new Driver(url);
      };
    } else {
      module.exports = void 0;
    }
  }
});

// node_modules/sockjs-client/lib/transport/websocket.js
var require_websocket2 = __commonJS({
  "node_modules/sockjs-client/lib/transport/websocket.js"(exports, module) {
    "use strict";
    var utils = require_event();
    var urlUtils = require_url();
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var WebsocketDriver = require_websocket();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:websocket");
    }
    function WebSocketTransport(transUrl, ignore, options) {
      if (!WebSocketTransport.enabled()) {
        throw new Error("Transport created when disabled");
      }
      EventEmitter.call(this);
      debug("constructor", transUrl);
      var self2 = this;
      var url = urlUtils.addPath(transUrl, "/websocket");
      if (url.slice(0, 5) === "https") {
        url = "wss" + url.slice(5);
      } else {
        url = "ws" + url.slice(4);
      }
      this.url = url;
      this.ws = new WebsocketDriver(this.url, [], options);
      this.ws.onmessage = function(e) {
        debug("message event", e.data);
        self2.emit("message", e.data);
      };
      this.unloadRef = utils.unloadAdd(function() {
        debug("unload");
        self2.ws.close();
      });
      this.ws.onclose = function(e) {
        debug("close event", e.code, e.reason);
        self2.emit("close", e.code, e.reason);
        self2._cleanup();
      };
      this.ws.onerror = function(e) {
        debug("error event", e);
        self2.emit("close", 1006, "WebSocket connection broken");
        self2._cleanup();
      };
    }
    inherits(WebSocketTransport, EventEmitter);
    WebSocketTransport.prototype.send = function(data) {
      var msg = "[" + data + "]";
      debug("send", msg);
      this.ws.send(msg);
    };
    WebSocketTransport.prototype.close = function() {
      debug("close");
      var ws = this.ws;
      this._cleanup();
      if (ws) {
        ws.close();
      }
    };
    WebSocketTransport.prototype._cleanup = function() {
      debug("_cleanup");
      var ws = this.ws;
      if (ws) {
        ws.onmessage = ws.onclose = ws.onerror = null;
      }
      utils.unloadDel(this.unloadRef);
      this.unloadRef = this.ws = null;
      this.removeAllListeners();
    };
    WebSocketTransport.enabled = function() {
      debug("enabled");
      return !!WebsocketDriver;
    };
    WebSocketTransport.transportName = "websocket";
    WebSocketTransport.roundTrips = 2;
    module.exports = WebSocketTransport;
  }
});

// node_modules/sockjs-client/lib/transport/lib/buffered-sender.js
var require_buffered_sender = __commonJS({
  "node_modules/sockjs-client/lib/transport/lib/buffered-sender.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:buffered-sender");
    }
    function BufferedSender(url, sender) {
      debug(url);
      EventEmitter.call(this);
      this.sendBuffer = [];
      this.sender = sender;
      this.url = url;
    }
    inherits(BufferedSender, EventEmitter);
    BufferedSender.prototype.send = function(message) {
      debug("send", message);
      this.sendBuffer.push(message);
      if (!this.sendStop) {
        this.sendSchedule();
      }
    };
    BufferedSender.prototype.sendScheduleWait = function() {
      debug("sendScheduleWait");
      var self2 = this;
      var tref;
      this.sendStop = function() {
        debug("sendStop");
        self2.sendStop = null;
        clearTimeout(tref);
      };
      tref = setTimeout(function() {
        debug("timeout");
        self2.sendStop = null;
        self2.sendSchedule();
      }, 25);
    };
    BufferedSender.prototype.sendSchedule = function() {
      debug("sendSchedule", this.sendBuffer.length);
      var self2 = this;
      if (this.sendBuffer.length > 0) {
        var payload = "[" + this.sendBuffer.join(",") + "]";
        this.sendStop = this.sender(this.url, payload, function(err) {
          self2.sendStop = null;
          if (err) {
            debug("error", err);
            self2.emit("close", err.code || 1006, "Sending error: " + err);
            self2.close();
          } else {
            self2.sendScheduleWait();
          }
        });
        this.sendBuffer = [];
      }
    };
    BufferedSender.prototype._cleanup = function() {
      debug("_cleanup");
      this.removeAllListeners();
    };
    BufferedSender.prototype.close = function() {
      debug("close");
      this._cleanup();
      if (this.sendStop) {
        this.sendStop();
        this.sendStop = null;
      }
    };
    module.exports = BufferedSender;
  }
});

// node_modules/sockjs-client/lib/transport/lib/polling.js
var require_polling = __commonJS({
  "node_modules/sockjs-client/lib/transport/lib/polling.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:polling");
    }
    function Polling(Receiver, receiveUrl, AjaxObject) {
      debug(receiveUrl);
      EventEmitter.call(this);
      this.Receiver = Receiver;
      this.receiveUrl = receiveUrl;
      this.AjaxObject = AjaxObject;
      this._scheduleReceiver();
    }
    inherits(Polling, EventEmitter);
    Polling.prototype._scheduleReceiver = function() {
      debug("_scheduleReceiver");
      var self2 = this;
      var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);
      poll.on("message", function(msg) {
        debug("message", msg);
        self2.emit("message", msg);
      });
      poll.once("close", function(code, reason) {
        debug("close", code, reason, self2.pollIsClosing);
        self2.poll = poll = null;
        if (!self2.pollIsClosing) {
          if (reason === "network") {
            self2._scheduleReceiver();
          } else {
            self2.emit("close", code || 1006, reason);
            self2.removeAllListeners();
          }
        }
      });
    };
    Polling.prototype.abort = function() {
      debug("abort");
      this.removeAllListeners();
      this.pollIsClosing = true;
      if (this.poll) {
        this.poll.abort();
      }
    };
    module.exports = Polling;
  }
});

// node_modules/sockjs-client/lib/transport/lib/sender-receiver.js
var require_sender_receiver = __commonJS({
  "node_modules/sockjs-client/lib/transport/lib/sender-receiver.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var urlUtils = require_url();
    var BufferedSender = require_buffered_sender();
    var Polling = require_polling();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:sender-receiver");
    }
    function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
      var pollUrl = urlUtils.addPath(transUrl, urlSuffix);
      debug(pollUrl);
      var self2 = this;
      BufferedSender.call(this, transUrl, senderFunc);
      this.poll = new Polling(Receiver, pollUrl, AjaxObject);
      this.poll.on("message", function(msg) {
        debug("poll message", msg);
        self2.emit("message", msg);
      });
      this.poll.once("close", function(code, reason) {
        debug("poll close", code, reason);
        self2.poll = null;
        self2.emit("close", code, reason);
        self2.close();
      });
    }
    inherits(SenderReceiver, BufferedSender);
    SenderReceiver.prototype.close = function() {
      BufferedSender.prototype.close.call(this);
      debug("close");
      this.removeAllListeners();
      if (this.poll) {
        this.poll.abort();
        this.poll = null;
      }
    };
    module.exports = SenderReceiver;
  }
});

// node_modules/sockjs-client/lib/transport/lib/ajax-based.js
var require_ajax_based = __commonJS({
  "node_modules/sockjs-client/lib/transport/lib/ajax-based.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var urlUtils = require_url();
    var SenderReceiver = require_sender_receiver();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:ajax-based");
    }
    function createAjaxSender(AjaxObject) {
      return function(url, payload, callback) {
        debug("create ajax sender", url, payload);
        var opt = {};
        if (typeof payload === "string") {
          opt.headers = { "Content-type": "text/plain" };
        }
        var ajaxUrl = urlUtils.addPath(url, "/xhr_send");
        var xo = new AjaxObject("POST", ajaxUrl, payload, opt);
        xo.once("finish", function(status) {
          debug("finish", status);
          xo = null;
          if (status !== 200 && status !== 204) {
            return callback(new Error("http status " + status));
          }
          callback();
        });
        return function() {
          debug("abort");
          xo.close();
          xo = null;
          var err = new Error("Aborted");
          err.code = 1e3;
          callback(err);
        };
      };
    }
    function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
      SenderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
    }
    inherits(AjaxBasedTransport, SenderReceiver);
    module.exports = AjaxBasedTransport;
  }
});

// node_modules/sockjs-client/lib/transport/receiver/xhr.js
var require_xhr = __commonJS({
  "node_modules/sockjs-client/lib/transport/receiver/xhr.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:receiver:xhr");
    }
    function XhrReceiver(url, AjaxObject) {
      debug(url);
      EventEmitter.call(this);
      var self2 = this;
      this.bufferPosition = 0;
      this.xo = new AjaxObject("POST", url, null);
      this.xo.on("chunk", this._chunkHandler.bind(this));
      this.xo.once("finish", function(status, text) {
        debug("finish", status, text);
        self2._chunkHandler(status, text);
        self2.xo = null;
        var reason = status === 200 ? "network" : "permanent";
        debug("close", reason);
        self2.emit("close", null, reason);
        self2._cleanup();
      });
    }
    inherits(XhrReceiver, EventEmitter);
    XhrReceiver.prototype._chunkHandler = function(status, text) {
      debug("_chunkHandler", status);
      if (status !== 200 || !text) {
        return;
      }
      for (var idx = -1; ; this.bufferPosition += idx + 1) {
        var buf = text.slice(this.bufferPosition);
        idx = buf.indexOf("\n");
        if (idx === -1) {
          break;
        }
        var msg = buf.slice(0, idx);
        if (msg) {
          debug("message", msg);
          this.emit("message", msg);
        }
      }
    };
    XhrReceiver.prototype._cleanup = function() {
      debug("_cleanup");
      this.removeAllListeners();
    };
    XhrReceiver.prototype.abort = function() {
      debug("abort");
      if (this.xo) {
        this.xo.close();
        debug("close");
        this.emit("close", null, "user");
        this.xo = null;
      }
      this._cleanup();
    };
    module.exports = XhrReceiver;
  }
});

// node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js
var require_abstract_xhr = __commonJS({
  "node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    var utils = require_event();
    var urlUtils = require_url();
    var XHR = global.XMLHttpRequest;
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:browser:xhr");
    }
    function AbstractXHRObject(method, url, payload, opts) {
      debug(method, url);
      var self2 = this;
      EventEmitter.call(this);
      setTimeout(function() {
        self2._start(method, url, payload, opts);
      }, 0);
    }
    inherits(AbstractXHRObject, EventEmitter);
    AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
      var self2 = this;
      try {
        this.xhr = new XHR();
      } catch (x) {
      }
      if (!this.xhr) {
        debug("no xhr");
        this.emit("finish", 0, "no xhr support");
        this._cleanup();
        return;
      }
      url = urlUtils.addQuery(url, "t=" + +/* @__PURE__ */ new Date());
      this.unloadRef = utils.unloadAdd(function() {
        debug("unload cleanup");
        self2._cleanup(true);
      });
      try {
        this.xhr.open(method, url, true);
        if (this.timeout && "timeout" in this.xhr) {
          this.xhr.timeout = this.timeout;
          this.xhr.ontimeout = function() {
            debug("xhr timeout");
            self2.emit("finish", 0, "");
            self2._cleanup(false);
          };
        }
      } catch (e) {
        debug("exception", e);
        this.emit("finish", 0, "");
        this._cleanup(false);
        return;
      }
      if ((!opts || !opts.noCredentials) && AbstractXHRObject.supportsCORS) {
        debug("withCredentials");
        this.xhr.withCredentials = true;
      }
      if (opts && opts.headers) {
        for (var key in opts.headers) {
          this.xhr.setRequestHeader(key, opts.headers[key]);
        }
      }
      this.xhr.onreadystatechange = function() {
        if (self2.xhr) {
          var x = self2.xhr;
          var text, status;
          debug("readyState", x.readyState);
          switch (x.readyState) {
            case 3:
              try {
                status = x.status;
                text = x.responseText;
              } catch (e) {
              }
              debug("status", status);
              if (status === 1223) {
                status = 204;
              }
              if (status === 200 && text && text.length > 0) {
                debug("chunk");
                self2.emit("chunk", status, text);
              }
              break;
            case 4:
              status = x.status;
              debug("status", status);
              if (status === 1223) {
                status = 204;
              }
              if (status === 12005 || status === 12029) {
                status = 0;
              }
              debug("finish", status, x.responseText);
              self2.emit("finish", status, x.responseText);
              self2._cleanup(false);
              break;
          }
        }
      };
      try {
        self2.xhr.send(payload);
      } catch (e) {
        self2.emit("finish", 0, "");
        self2._cleanup(false);
      }
    };
    AbstractXHRObject.prototype._cleanup = function(abort) {
      debug("cleanup");
      if (!this.xhr) {
        return;
      }
      this.removeAllListeners();
      utils.unloadDel(this.unloadRef);
      this.xhr.onreadystatechange = function() {
      };
      if (this.xhr.ontimeout) {
        this.xhr.ontimeout = null;
      }
      if (abort) {
        try {
          this.xhr.abort();
        } catch (x) {
        }
      }
      this.unloadRef = this.xhr = null;
    };
    AbstractXHRObject.prototype.close = function() {
      debug("close");
      this._cleanup(true);
    };
    AbstractXHRObject.enabled = !!XHR;
    var axo = ["Active"].concat("Object").join("X");
    if (!AbstractXHRObject.enabled && axo in global) {
      debug("overriding xmlhttprequest");
      XHR = function() {
        try {
          return new global[axo]("Microsoft.XMLHTTP");
        } catch (e) {
          return null;
        }
      };
      AbstractXHRObject.enabled = !!new XHR();
    }
    var cors = false;
    try {
      cors = "withCredentials" in new XHR();
    } catch (ignored) {
    }
    AbstractXHRObject.supportsCORS = cors;
    module.exports = AbstractXHRObject;
  }
});

// node_modules/sockjs-client/lib/transport/sender/xhr-cors.js
var require_xhr_cors = __commonJS({
  "node_modules/sockjs-client/lib/transport/sender/xhr-cors.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var XhrDriver = require_abstract_xhr();
    function XHRCorsObject(method, url, payload, opts) {
      XhrDriver.call(this, method, url, payload, opts);
    }
    inherits(XHRCorsObject, XhrDriver);
    XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;
    module.exports = XHRCorsObject;
  }
});

// node_modules/sockjs-client/lib/transport/sender/xhr-local.js
var require_xhr_local = __commonJS({
  "node_modules/sockjs-client/lib/transport/sender/xhr-local.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var XhrDriver = require_abstract_xhr();
    function XHRLocalObject(method, url, payload) {
      XhrDriver.call(this, method, url, payload, {
        noCredentials: true
      });
    }
    inherits(XHRLocalObject, XhrDriver);
    XHRLocalObject.enabled = XhrDriver.enabled;
    module.exports = XHRLocalObject;
  }
});

// node_modules/sockjs-client/lib/utils/browser.js
var require_browser2 = __commonJS({
  "node_modules/sockjs-client/lib/utils/browser.js"(exports, module) {
    "use strict";
    module.exports = {
      isOpera: function() {
        return global.navigator && /opera/i.test(global.navigator.userAgent);
      },
      isKonqueror: function() {
        return global.navigator && /konqueror/i.test(global.navigator.userAgent);
      },
      hasDomain: function() {
        if (!global.document) {
          return true;
        }
        try {
          return !!global.document.domain;
        } catch (e) {
          return false;
        }
      }
    };
  }
});

// node_modules/sockjs-client/lib/transport/xhr-streaming.js
var require_xhr_streaming = __commonJS({
  "node_modules/sockjs-client/lib/transport/xhr-streaming.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var AjaxBasedTransport = require_ajax_based();
    var XhrReceiver = require_xhr();
    var XHRCorsObject = require_xhr_cors();
    var XHRLocalObject = require_xhr_local();
    var browser = require_browser2();
    function XhrStreamingTransport(transUrl) {
      if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/xhr_streaming", XhrReceiver, XHRCorsObject);
    }
    inherits(XhrStreamingTransport, AjaxBasedTransport);
    XhrStreamingTransport.enabled = function(info) {
      if (info.nullOrigin) {
        return false;
      }
      if (browser.isOpera()) {
        return false;
      }
      return XHRCorsObject.enabled;
    };
    XhrStreamingTransport.transportName = "xhr-streaming";
    XhrStreamingTransport.roundTrips = 2;
    XhrStreamingTransport.needBody = !!global.document;
    module.exports = XhrStreamingTransport;
  }
});

// node_modules/sockjs-client/lib/transport/sender/xdr.js
var require_xdr = __commonJS({
  "node_modules/sockjs-client/lib/transport/sender/xdr.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    var eventUtils = require_event();
    var browser = require_browser2();
    var urlUtils = require_url();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:sender:xdr");
    }
    function XDRObject(method, url, payload) {
      debug(method, url);
      var self2 = this;
      EventEmitter.call(this);
      setTimeout(function() {
        self2._start(method, url, payload);
      }, 0);
    }
    inherits(XDRObject, EventEmitter);
    XDRObject.prototype._start = function(method, url, payload) {
      debug("_start");
      var self2 = this;
      var xdr = new global.XDomainRequest();
      url = urlUtils.addQuery(url, "t=" + +/* @__PURE__ */ new Date());
      xdr.onerror = function() {
        debug("onerror");
        self2._error();
      };
      xdr.ontimeout = function() {
        debug("ontimeout");
        self2._error();
      };
      xdr.onprogress = function() {
        debug("progress", xdr.responseText);
        self2.emit("chunk", 200, xdr.responseText);
      };
      xdr.onload = function() {
        debug("load");
        self2.emit("finish", 200, xdr.responseText);
        self2._cleanup(false);
      };
      this.xdr = xdr;
      this.unloadRef = eventUtils.unloadAdd(function() {
        self2._cleanup(true);
      });
      try {
        this.xdr.open(method, url);
        if (this.timeout) {
          this.xdr.timeout = this.timeout;
        }
        this.xdr.send(payload);
      } catch (x) {
        this._error();
      }
    };
    XDRObject.prototype._error = function() {
      this.emit("finish", 0, "");
      this._cleanup(false);
    };
    XDRObject.prototype._cleanup = function(abort) {
      debug("cleanup", abort);
      if (!this.xdr) {
        return;
      }
      this.removeAllListeners();
      eventUtils.unloadDel(this.unloadRef);
      this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
      if (abort) {
        try {
          this.xdr.abort();
        } catch (x) {
        }
      }
      this.unloadRef = this.xdr = null;
    };
    XDRObject.prototype.close = function() {
      debug("close");
      this._cleanup(true);
    };
    XDRObject.enabled = !!(global.XDomainRequest && browser.hasDomain());
    module.exports = XDRObject;
  }
});

// node_modules/sockjs-client/lib/transport/xdr-streaming.js
var require_xdr_streaming = __commonJS({
  "node_modules/sockjs-client/lib/transport/xdr-streaming.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var AjaxBasedTransport = require_ajax_based();
    var XhrReceiver = require_xhr();
    var XDRObject = require_xdr();
    function XdrStreamingTransport(transUrl) {
      if (!XDRObject.enabled) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/xhr_streaming", XhrReceiver, XDRObject);
    }
    inherits(XdrStreamingTransport, AjaxBasedTransport);
    XdrStreamingTransport.enabled = function(info) {
      if (info.cookie_needed || info.nullOrigin) {
        return false;
      }
      return XDRObject.enabled && info.sameScheme;
    };
    XdrStreamingTransport.transportName = "xdr-streaming";
    XdrStreamingTransport.roundTrips = 2;
    module.exports = XdrStreamingTransport;
  }
});

// node_modules/sockjs-client/lib/transport/browser/eventsource.js
var require_eventsource = __commonJS({
  "node_modules/sockjs-client/lib/transport/browser/eventsource.js"(exports, module) {
    module.exports = global.EventSource;
  }
});

// node_modules/sockjs-client/lib/transport/receiver/eventsource.js
var require_eventsource2 = __commonJS({
  "node_modules/sockjs-client/lib/transport/receiver/eventsource.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var EventSourceDriver = require_eventsource();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:receiver:eventsource");
    }
    function EventSourceReceiver(url) {
      debug(url);
      EventEmitter.call(this);
      var self2 = this;
      var es = this.es = new EventSourceDriver(url);
      es.onmessage = function(e) {
        debug("message", e.data);
        self2.emit("message", decodeURI(e.data));
      };
      es.onerror = function(e) {
        debug("error", es.readyState, e);
        var reason = es.readyState !== 2 ? "network" : "permanent";
        self2._cleanup();
        self2._close(reason);
      };
    }
    inherits(EventSourceReceiver, EventEmitter);
    EventSourceReceiver.prototype.abort = function() {
      debug("abort");
      this._cleanup();
      this._close("user");
    };
    EventSourceReceiver.prototype._cleanup = function() {
      debug("cleanup");
      var es = this.es;
      if (es) {
        es.onmessage = es.onerror = null;
        es.close();
        this.es = null;
      }
    };
    EventSourceReceiver.prototype._close = function(reason) {
      debug("close", reason);
      var self2 = this;
      setTimeout(function() {
        self2.emit("close", null, reason);
        self2.removeAllListeners();
      }, 200);
    };
    module.exports = EventSourceReceiver;
  }
});

// node_modules/sockjs-client/lib/transport/eventsource.js
var require_eventsource3 = __commonJS({
  "node_modules/sockjs-client/lib/transport/eventsource.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var AjaxBasedTransport = require_ajax_based();
    var EventSourceReceiver = require_eventsource2();
    var XHRCorsObject = require_xhr_cors();
    var EventSourceDriver = require_eventsource();
    function EventSourceTransport(transUrl) {
      if (!EventSourceTransport.enabled()) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/eventsource", EventSourceReceiver, XHRCorsObject);
    }
    inherits(EventSourceTransport, AjaxBasedTransport);
    EventSourceTransport.enabled = function() {
      return !!EventSourceDriver;
    };
    EventSourceTransport.transportName = "eventsource";
    EventSourceTransport.roundTrips = 2;
    module.exports = EventSourceTransport;
  }
});

// node_modules/sockjs-client/lib/version.js
var require_version = __commonJS({
  "node_modules/sockjs-client/lib/version.js"(exports, module) {
    module.exports = "1.6.1";
  }
});

// node_modules/sockjs-client/lib/utils/iframe.js
var require_iframe = __commonJS({
  "node_modules/sockjs-client/lib/utils/iframe.js"(exports, module) {
    "use strict";
    var eventUtils = require_event();
    var browser = require_browser2();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:utils:iframe");
    }
    module.exports = {
      WPrefix: "_jp",
      currentWindowId: null,
      polluteGlobalNamespace: function() {
        if (!(module.exports.WPrefix in global)) {
          global[module.exports.WPrefix] = {};
        }
      },
      postMessage: function(type, data) {
        if (global.parent !== global) {
          global.parent.postMessage(JSON.stringify({
            windowId: module.exports.currentWindowId,
            type,
            data: data || ""
          }), "*");
        } else {
          debug("Cannot postMessage, no parent window.", type, data);
        }
      },
      createIframe: function(iframeUrl, errorCallback) {
        var iframe = global.document.createElement("iframe");
        var tref, unloadRef;
        var unattach = function() {
          debug("unattach");
          clearTimeout(tref);
          try {
            iframe.onload = null;
          } catch (x) {
          }
          iframe.onerror = null;
        };
        var cleanup = function() {
          debug("cleanup");
          if (iframe) {
            unattach();
            setTimeout(function() {
              if (iframe) {
                iframe.parentNode.removeChild(iframe);
              }
              iframe = null;
            }, 0);
            eventUtils.unloadDel(unloadRef);
          }
        };
        var onerror = function(err) {
          debug("onerror", err);
          if (iframe) {
            cleanup();
            errorCallback(err);
          }
        };
        var post = function(msg, origin) {
          debug("post", msg, origin);
          setTimeout(function() {
            try {
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
              }
            } catch (x) {
            }
          }, 0);
        };
        iframe.src = iframeUrl;
        iframe.style.display = "none";
        iframe.style.position = "absolute";
        iframe.onerror = function() {
          onerror("onerror");
        };
        iframe.onload = function() {
          debug("onload");
          clearTimeout(tref);
          tref = setTimeout(function() {
            onerror("onload timeout");
          }, 2e3);
        };
        global.document.body.appendChild(iframe);
        tref = setTimeout(function() {
          onerror("timeout");
        }, 15e3);
        unloadRef = eventUtils.unloadAdd(cleanup);
        return {
          post,
          cleanup,
          loaded: unattach
        };
      },
      createHtmlfile: function(iframeUrl, errorCallback) {
        var axo = ["Active"].concat("Object").join("X");
        var doc = new global[axo]("htmlfile");
        var tref, unloadRef;
        var iframe;
        var unattach = function() {
          clearTimeout(tref);
          iframe.onerror = null;
        };
        var cleanup = function() {
          if (doc) {
            unattach();
            eventUtils.unloadDel(unloadRef);
            iframe.parentNode.removeChild(iframe);
            iframe = doc = null;
            CollectGarbage();
          }
        };
        var onerror = function(r) {
          debug("onerror", r);
          if (doc) {
            cleanup();
            errorCallback(r);
          }
        };
        var post = function(msg, origin) {
          try {
            setTimeout(function() {
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, origin);
              }
            }, 0);
          } catch (x) {
          }
        };
        doc.open();
        doc.write('<html><script>document.domain="' + global.document.domain + '";<\/script></html>');
        doc.close();
        doc.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix];
        var c = doc.createElement("div");
        doc.body.appendChild(c);
        iframe = doc.createElement("iframe");
        c.appendChild(iframe);
        iframe.src = iframeUrl;
        iframe.onerror = function() {
          onerror("onerror");
        };
        tref = setTimeout(function() {
          onerror("timeout");
        }, 15e3);
        unloadRef = eventUtils.unloadAdd(cleanup);
        return {
          post,
          cleanup,
          loaded: unattach
        };
      }
    };
    module.exports.iframeEnabled = false;
    if (global.document) {
      module.exports.iframeEnabled = (typeof global.postMessage === "function" || typeof global.postMessage === "object") && !browser.isKonqueror();
    }
  }
});

// node_modules/sockjs-client/lib/transport/iframe.js
var require_iframe2 = __commonJS({
  "node_modules/sockjs-client/lib/transport/iframe.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var version = require_version();
    var urlUtils = require_url();
    var iframeUtils = require_iframe();
    var eventUtils = require_event();
    var random = require_random();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:transport:iframe");
    }
    function IframeTransport(transport, transUrl, baseUrl) {
      if (!IframeTransport.enabled()) {
        throw new Error("Transport created when disabled");
      }
      EventEmitter.call(this);
      var self2 = this;
      this.origin = urlUtils.getOrigin(baseUrl);
      this.baseUrl = baseUrl;
      this.transUrl = transUrl;
      this.transport = transport;
      this.windowId = random.string(8);
      var iframeUrl = urlUtils.addPath(baseUrl, "/iframe.html") + "#" + this.windowId;
      debug(transport, transUrl, iframeUrl);
      this.iframeObj = iframeUtils.createIframe(iframeUrl, function(r) {
        debug("err callback");
        self2.emit("close", 1006, "Unable to load an iframe (" + r + ")");
        self2.close();
      });
      this.onmessageCallback = this._message.bind(this);
      eventUtils.attachEvent("message", this.onmessageCallback);
    }
    inherits(IframeTransport, EventEmitter);
    IframeTransport.prototype.close = function() {
      debug("close");
      this.removeAllListeners();
      if (this.iframeObj) {
        eventUtils.detachEvent("message", this.onmessageCallback);
        try {
          this.postMessage("c");
        } catch (x) {
        }
        this.iframeObj.cleanup();
        this.iframeObj = null;
        this.onmessageCallback = this.iframeObj = null;
      }
    };
    IframeTransport.prototype._message = function(e) {
      debug("message", e.data);
      if (!urlUtils.isOriginEqual(e.origin, this.origin)) {
        debug("not same origin", e.origin, this.origin);
        return;
      }
      var iframeMessage;
      try {
        iframeMessage = JSON.parse(e.data);
      } catch (ignored) {
        debug("bad json", e.data);
        return;
      }
      if (iframeMessage.windowId !== this.windowId) {
        debug("mismatched window id", iframeMessage.windowId, this.windowId);
        return;
      }
      switch (iframeMessage.type) {
        case "s":
          this.iframeObj.loaded();
          this.postMessage("s", JSON.stringify([
            version,
            this.transport,
            this.transUrl,
            this.baseUrl
          ]));
          break;
        case "t":
          this.emit("message", iframeMessage.data);
          break;
        case "c":
          var cdata;
          try {
            cdata = JSON.parse(iframeMessage.data);
          } catch (ignored) {
            debug("bad json", iframeMessage.data);
            return;
          }
          this.emit("close", cdata[0], cdata[1]);
          this.close();
          break;
      }
    };
    IframeTransport.prototype.postMessage = function(type, data) {
      debug("postMessage", type, data);
      this.iframeObj.post(JSON.stringify({
        windowId: this.windowId,
        type,
        data: data || ""
      }), this.origin);
    };
    IframeTransport.prototype.send = function(message) {
      debug("send", message);
      this.postMessage("m", message);
    };
    IframeTransport.enabled = function() {
      return iframeUtils.iframeEnabled;
    };
    IframeTransport.transportName = "iframe";
    IframeTransport.roundTrips = 2;
    module.exports = IframeTransport;
  }
});

// node_modules/sockjs-client/lib/utils/object.js
var require_object = __commonJS({
  "node_modules/sockjs-client/lib/utils/object.js"(exports, module) {
    "use strict";
    module.exports = {
      isObject: function(obj) {
        var type = typeof obj;
        return type === "function" || type === "object" && !!obj;
      },
      extend: function(obj) {
        if (!this.isObject(obj)) {
          return obj;
        }
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
          source = arguments[i];
          for (prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
              obj[prop] = source[prop];
            }
          }
        }
        return obj;
      }
    };
  }
});

// node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js
var require_iframe_wrap = __commonJS({
  "node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var IframeTransport = require_iframe2();
    var objectUtils = require_object();
    module.exports = function(transport) {
      function IframeWrapTransport(transUrl, baseUrl) {
        IframeTransport.call(this, transport.transportName, transUrl, baseUrl);
      }
      inherits(IframeWrapTransport, IframeTransport);
      IframeWrapTransport.enabled = function(url, info) {
        if (!global.document) {
          return false;
        }
        var iframeInfo = objectUtils.extend({}, info);
        iframeInfo.sameOrigin = true;
        return transport.enabled(iframeInfo) && IframeTransport.enabled();
      };
      IframeWrapTransport.transportName = "iframe-" + transport.transportName;
      IframeWrapTransport.needBody = true;
      IframeWrapTransport.roundTrips = IframeTransport.roundTrips + transport.roundTrips - 1;
      IframeWrapTransport.facadeTransport = transport;
      return IframeWrapTransport;
    };
  }
});

// node_modules/sockjs-client/lib/transport/receiver/htmlfile.js
var require_htmlfile = __commonJS({
  "node_modules/sockjs-client/lib/transport/receiver/htmlfile.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var iframeUtils = require_iframe();
    var urlUtils = require_url();
    var EventEmitter = require_emitter().EventEmitter;
    var random = require_random();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:receiver:htmlfile");
    }
    function HtmlfileReceiver(url) {
      debug(url);
      EventEmitter.call(this);
      var self2 = this;
      iframeUtils.polluteGlobalNamespace();
      this.id = "a" + random.string(6);
      url = urlUtils.addQuery(url, "c=" + decodeURIComponent(iframeUtils.WPrefix + "." + this.id));
      debug("using htmlfile", HtmlfileReceiver.htmlfileEnabled);
      var constructFunc = HtmlfileReceiver.htmlfileEnabled ? iframeUtils.createHtmlfile : iframeUtils.createIframe;
      global[iframeUtils.WPrefix][this.id] = {
        start: function() {
          debug("start");
          self2.iframeObj.loaded();
        },
        message: function(data) {
          debug("message", data);
          self2.emit("message", data);
        },
        stop: function() {
          debug("stop");
          self2._cleanup();
          self2._close("network");
        }
      };
      this.iframeObj = constructFunc(url, function() {
        debug("callback");
        self2._cleanup();
        self2._close("permanent");
      });
    }
    inherits(HtmlfileReceiver, EventEmitter);
    HtmlfileReceiver.prototype.abort = function() {
      debug("abort");
      this._cleanup();
      this._close("user");
    };
    HtmlfileReceiver.prototype._cleanup = function() {
      debug("_cleanup");
      if (this.iframeObj) {
        this.iframeObj.cleanup();
        this.iframeObj = null;
      }
      delete global[iframeUtils.WPrefix][this.id];
    };
    HtmlfileReceiver.prototype._close = function(reason) {
      debug("_close", reason);
      this.emit("close", null, reason);
      this.removeAllListeners();
    };
    HtmlfileReceiver.htmlfileEnabled = false;
    var axo = ["Active"].concat("Object").join("X");
    if (axo in global) {
      try {
        HtmlfileReceiver.htmlfileEnabled = !!new global[axo]("htmlfile");
      } catch (x) {
      }
    }
    HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframeUtils.iframeEnabled;
    module.exports = HtmlfileReceiver;
  }
});

// node_modules/sockjs-client/lib/transport/htmlfile.js
var require_htmlfile2 = __commonJS({
  "node_modules/sockjs-client/lib/transport/htmlfile.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var HtmlfileReceiver = require_htmlfile();
    var XHRLocalObject = require_xhr_local();
    var AjaxBasedTransport = require_ajax_based();
    function HtmlFileTransport(transUrl) {
      if (!HtmlfileReceiver.enabled) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/htmlfile", HtmlfileReceiver, XHRLocalObject);
    }
    inherits(HtmlFileTransport, AjaxBasedTransport);
    HtmlFileTransport.enabled = function(info) {
      return HtmlfileReceiver.enabled && info.sameOrigin;
    };
    HtmlFileTransport.transportName = "htmlfile";
    HtmlFileTransport.roundTrips = 2;
    module.exports = HtmlFileTransport;
  }
});

// node_modules/sockjs-client/lib/transport/xhr-polling.js
var require_xhr_polling = __commonJS({
  "node_modules/sockjs-client/lib/transport/xhr-polling.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var AjaxBasedTransport = require_ajax_based();
    var XhrReceiver = require_xhr();
    var XHRCorsObject = require_xhr_cors();
    var XHRLocalObject = require_xhr_local();
    function XhrPollingTransport(transUrl) {
      if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/xhr", XhrReceiver, XHRCorsObject);
    }
    inherits(XhrPollingTransport, AjaxBasedTransport);
    XhrPollingTransport.enabled = function(info) {
      if (info.nullOrigin) {
        return false;
      }
      if (XHRLocalObject.enabled && info.sameOrigin) {
        return true;
      }
      return XHRCorsObject.enabled;
    };
    XhrPollingTransport.transportName = "xhr-polling";
    XhrPollingTransport.roundTrips = 2;
    module.exports = XhrPollingTransport;
  }
});

// node_modules/sockjs-client/lib/transport/xdr-polling.js
var require_xdr_polling = __commonJS({
  "node_modules/sockjs-client/lib/transport/xdr-polling.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var AjaxBasedTransport = require_ajax_based();
    var XdrStreamingTransport = require_xdr_streaming();
    var XhrReceiver = require_xhr();
    var XDRObject = require_xdr();
    function XdrPollingTransport(transUrl) {
      if (!XDRObject.enabled) {
        throw new Error("Transport created when disabled");
      }
      AjaxBasedTransport.call(this, transUrl, "/xhr", XhrReceiver, XDRObject);
    }
    inherits(XdrPollingTransport, AjaxBasedTransport);
    XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
    XdrPollingTransport.transportName = "xdr-polling";
    XdrPollingTransport.roundTrips = 2;
    module.exports = XdrPollingTransport;
  }
});

// node_modules/sockjs-client/lib/transport/receiver/jsonp.js
var require_jsonp = __commonJS({
  "node_modules/sockjs-client/lib/transport/receiver/jsonp.js"(exports, module) {
    "use strict";
    var utils = require_iframe();
    var random = require_random();
    var browser = require_browser2();
    var urlUtils = require_url();
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:receiver:jsonp");
    }
    function JsonpReceiver(url) {
      debug(url);
      var self2 = this;
      EventEmitter.call(this);
      utils.polluteGlobalNamespace();
      this.id = "a" + random.string(6);
      var urlWithId = urlUtils.addQuery(url, "c=" + encodeURIComponent(utils.WPrefix + "." + this.id));
      global[utils.WPrefix][this.id] = this._callback.bind(this);
      this._createScript(urlWithId);
      this.timeoutId = setTimeout(function() {
        debug("timeout");
        self2._abort(new Error("JSONP script loaded abnormally (timeout)"));
      }, JsonpReceiver.timeout);
    }
    inherits(JsonpReceiver, EventEmitter);
    JsonpReceiver.prototype.abort = function() {
      debug("abort");
      if (global[utils.WPrefix][this.id]) {
        var err = new Error("JSONP user aborted read");
        err.code = 1e3;
        this._abort(err);
      }
    };
    JsonpReceiver.timeout = 35e3;
    JsonpReceiver.scriptErrorTimeout = 1e3;
    JsonpReceiver.prototype._callback = function(data) {
      debug("_callback", data);
      this._cleanup();
      if (this.aborting) {
        return;
      }
      if (data) {
        debug("message", data);
        this.emit("message", data);
      }
      this.emit("close", null, "network");
      this.removeAllListeners();
    };
    JsonpReceiver.prototype._abort = function(err) {
      debug("_abort", err);
      this._cleanup();
      this.aborting = true;
      this.emit("close", err.code, err.message);
      this.removeAllListeners();
    };
    JsonpReceiver.prototype._cleanup = function() {
      debug("_cleanup");
      clearTimeout(this.timeoutId);
      if (this.script2) {
        this.script2.parentNode.removeChild(this.script2);
        this.script2 = null;
      }
      if (this.script) {
        var script = this.script;
        script.parentNode.removeChild(script);
        script.onreadystatechange = script.onerror = script.onload = script.onclick = null;
        this.script = null;
      }
      delete global[utils.WPrefix][this.id];
    };
    JsonpReceiver.prototype._scriptError = function() {
      debug("_scriptError");
      var self2 = this;
      if (this.errorTimer) {
        return;
      }
      this.errorTimer = setTimeout(function() {
        if (!self2.loadedOkay) {
          self2._abort(new Error("JSONP script loaded abnormally (onerror)"));
        }
      }, JsonpReceiver.scriptErrorTimeout);
    };
    JsonpReceiver.prototype._createScript = function(url) {
      debug("_createScript", url);
      var self2 = this;
      var script = this.script = global.document.createElement("script");
      var script2;
      script.id = "a" + random.string(8);
      script.src = url;
      script.type = "text/javascript";
      script.charset = "UTF-8";
      script.onerror = this._scriptError.bind(this);
      script.onload = function() {
        debug("onload");
        self2._abort(new Error("JSONP script loaded abnormally (onload)"));
      };
      script.onreadystatechange = function() {
        debug("onreadystatechange", script.readyState);
        if (/loaded|closed/.test(script.readyState)) {
          if (script && script.htmlFor && script.onclick) {
            self2.loadedOkay = true;
            try {
              script.onclick();
            } catch (x) {
            }
          }
          if (script) {
            self2._abort(new Error("JSONP script loaded abnormally (onreadystatechange)"));
          }
        }
      };
      if (typeof script.async === "undefined" && global.document.attachEvent) {
        if (!browser.isOpera()) {
          try {
            script.htmlFor = script.id;
            script.event = "onclick";
          } catch (x) {
          }
          script.async = true;
        } else {
          script2 = this.script2 = global.document.createElement("script");
          script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
          script.async = script2.async = false;
        }
      }
      if (typeof script.async !== "undefined") {
        script.async = true;
      }
      var head = global.document.getElementsByTagName("head")[0];
      head.insertBefore(script, head.firstChild);
      if (script2) {
        head.insertBefore(script2, head.firstChild);
      }
    };
    module.exports = JsonpReceiver;
  }
});

// node_modules/sockjs-client/lib/transport/sender/jsonp.js
var require_jsonp2 = __commonJS({
  "node_modules/sockjs-client/lib/transport/sender/jsonp.js"(exports, module) {
    "use strict";
    var random = require_random();
    var urlUtils = require_url();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:sender:jsonp");
    }
    var form;
    var area;
    function createIframe(id) {
      debug("createIframe", id);
      try {
        return global.document.createElement('<iframe name="' + id + '">');
      } catch (x) {
        var iframe = global.document.createElement("iframe");
        iframe.name = id;
        return iframe;
      }
    }
    function createForm() {
      debug("createForm");
      form = global.document.createElement("form");
      form.style.display = "none";
      form.style.position = "absolute";
      form.method = "POST";
      form.enctype = "application/x-www-form-urlencoded";
      form.acceptCharset = "UTF-8";
      area = global.document.createElement("textarea");
      area.name = "d";
      form.appendChild(area);
      global.document.body.appendChild(form);
    }
    module.exports = function(url, payload, callback) {
      debug(url, payload);
      if (!form) {
        createForm();
      }
      var id = "a" + random.string(8);
      form.target = id;
      form.action = urlUtils.addQuery(urlUtils.addPath(url, "/jsonp_send"), "i=" + id);
      var iframe = createIframe(id);
      iframe.id = id;
      iframe.style.display = "none";
      form.appendChild(iframe);
      try {
        area.value = payload;
      } catch (e) {
      }
      form.submit();
      var completed = function(err) {
        debug("completed", id, err);
        if (!iframe.onerror) {
          return;
        }
        iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
        setTimeout(function() {
          debug("cleaning up", id);
          iframe.parentNode.removeChild(iframe);
          iframe = null;
        }, 500);
        area.value = "";
        callback(err);
      };
      iframe.onerror = function() {
        debug("onerror", id);
        completed();
      };
      iframe.onload = function() {
        debug("onload", id);
        completed();
      };
      iframe.onreadystatechange = function(e) {
        debug("onreadystatechange", id, iframe.readyState, e);
        if (iframe.readyState === "complete") {
          completed();
        }
      };
      return function() {
        debug("aborted", id);
        completed(new Error("Aborted"));
      };
    };
  }
});

// node_modules/sockjs-client/lib/transport/jsonp-polling.js
var require_jsonp_polling = __commonJS({
  "node_modules/sockjs-client/lib/transport/jsonp-polling.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var SenderReceiver = require_sender_receiver();
    var JsonpReceiver = require_jsonp();
    var jsonpSender = require_jsonp2();
    function JsonPTransport(transUrl) {
      if (!JsonPTransport.enabled()) {
        throw new Error("Transport created when disabled");
      }
      SenderReceiver.call(this, transUrl, "/jsonp", jsonpSender, JsonpReceiver);
    }
    inherits(JsonPTransport, SenderReceiver);
    JsonPTransport.enabled = function() {
      return !!global.document;
    };
    JsonPTransport.transportName = "jsonp-polling";
    JsonPTransport.roundTrips = 1;
    JsonPTransport.needBody = true;
    module.exports = JsonPTransport;
  }
});

// node_modules/sockjs-client/lib/transport-list.js
var require_transport_list = __commonJS({
  "node_modules/sockjs-client/lib/transport-list.js"(exports, module) {
    "use strict";
    module.exports = [
      // streaming transports
      require_websocket2(),
      require_xhr_streaming(),
      require_xdr_streaming(),
      require_eventsource3(),
      require_iframe_wrap()(require_eventsource3()),
      require_htmlfile2(),
      require_iframe_wrap()(require_htmlfile2()),
      require_xhr_polling(),
      require_xdr_polling(),
      require_iframe_wrap()(require_xhr_polling()),
      require_jsonp_polling()
    ];
  }
});

// node_modules/sockjs-client/lib/shims.js
var require_shims = __commonJS({
  "node_modules/sockjs-client/lib/shims.js"() {
    "use strict";
    var ArrayPrototype = Array.prototype;
    var ObjectPrototype = Object.prototype;
    var FunctionPrototype = Function.prototype;
    var StringPrototype = String.prototype;
    var array_slice = ArrayPrototype.slice;
    var _toString = ObjectPrototype.toString;
    var isFunction = function(val) {
      return ObjectPrototype.toString.call(val) === "[object Function]";
    };
    var isArray = function isArray2(obj) {
      return _toString.call(obj) === "[object Array]";
    };
    var isString = function isString2(obj) {
      return _toString.call(obj) === "[object String]";
    };
    var supportsDescriptors = Object.defineProperty && function() {
      try {
        Object.defineProperty({}, "x", {});
        return true;
      } catch (e) {
        return false;
      }
    }();
    var defineProperty;
    if (supportsDescriptors) {
      defineProperty = function(object, name, method, forceAssign) {
        if (!forceAssign && name in object) {
          return;
        }
        Object.defineProperty(object, name, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: method
        });
      };
    } else {
      defineProperty = function(object, name, method, forceAssign) {
        if (!forceAssign && name in object) {
          return;
        }
        object[name] = method;
      };
    }
    var defineProperties = function(object, map, forceAssign) {
      for (var name in map) {
        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
          defineProperty(object, name, map[name], forceAssign);
        }
      }
    };
    var toObject = function(o) {
      if (o == null) {
        throw new TypeError("can't convert " + o + " to object");
      }
      return Object(o);
    };
    function toInteger(num) {
      var n = +num;
      if (n !== n) {
        n = 0;
      } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
      return n;
    }
    function ToUint32(x) {
      return x >>> 0;
    }
    function Empty() {
    }
    defineProperties(FunctionPrototype, {
      bind: function bind(that) {
        var target = this;
        if (!isFunction(target)) {
          throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = array_slice.call(arguments, 1);
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              args.concat(array_slice.call(arguments))
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          } else {
            return target.apply(
              that,
              args.concat(array_slice.call(arguments))
            );
          }
        };
        var boundLength = Math.max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs.push("$" + i);
        }
        var bound = Function("binder", "return function (" + boundArgs.join(",") + "){ return binder.apply(this, arguments); }")(binder);
        if (target.prototype) {
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      }
    });
    defineProperties(Array, { isArray });
    var boxedString = Object("a");
    var splitString = boxedString[0] !== "a" || !(0 in boxedString);
    var properlyBoxesContext = function properlyBoxed(method) {
      var properlyBoxesNonStrict = true;
      var properlyBoxesStrict = true;
      if (method) {
        method.call("foo", function(_, __, context) {
          if (typeof context !== "object") {
            properlyBoxesNonStrict = false;
          }
        });
        method.call([1], function() {
          "use strict";
          properlyBoxesStrict = typeof this === "string";
        }, "x");
      }
      return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
    };
    defineProperties(ArrayPrototype, {
      forEach: function forEach(fun) {
        var object = toObject(this), self2 = splitString && isString(this) ? this.split("") : object, thisp = arguments[1], i = -1, length = self2.length >>> 0;
        if (!isFunction(fun)) {
          throw new TypeError();
        }
        while (++i < length) {
          if (i in self2) {
            fun.call(thisp, self2[i], i, object);
          }
        }
      }
    }, !properlyBoxesContext(ArrayPrototype.forEach));
    var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
    defineProperties(ArrayPrototype, {
      indexOf: function indexOf(sought) {
        var self2 = splitString && isString(this) ? this.split("") : toObject(this), length = self2.length >>> 0;
        if (!length) {
          return -1;
        }
        var i = 0;
        if (arguments.length > 1) {
          i = toInteger(arguments[1]);
        }
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
          if (i in self2 && self2[i] === sought) {
            return i;
          }
        }
        return -1;
      }
    }, hasFirefox2IndexOfBug);
    var string_split = StringPrototype.split;
    if ("ab".split(/(?:ab)*/).length !== 2 || ".".split(/(.?)(.?)/).length !== 4 || "tesst".split(/(s)*/)[1] === "t" || "test".split(/(?:)/, -1).length !== 4 || "".split(/.?/).length || ".".split(/()()/).length > 1) {
      (function() {
        var compliantExecNpcg = /()??/.exec("")[1] === void 0;
        StringPrototype.split = function(separator, limit) {
          var string = this;
          if (separator === void 0 && limit === 0) {
            return [];
          }
          if (_toString.call(separator) !== "[object RegExp]") {
            return string_split.call(this, separator, limit);
          }
          var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
          (separator.sticky ? "y" : ""), lastLastIndex = 0, separator2, match, lastIndex, lastLength;
          separator = new RegExp(separator.source, flags + "g");
          string += "";
          if (!compliantExecNpcg) {
            separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
          }
          limit = limit === void 0 ? -1 >>> 0 : (
            // Math.pow(2, 32) - 1
            ToUint32(limit)
          );
          while (match = separator.exec(string)) {
            lastIndex = match.index + match[0].length;
            if (lastIndex > lastLastIndex) {
              output.push(string.slice(lastLastIndex, match.index));
              if (!compliantExecNpcg && match.length > 1) {
                match[0].replace(separator2, function() {
                  for (var i = 1; i < arguments.length - 2; i++) {
                    if (arguments[i] === void 0) {
                      match[i] = void 0;
                    }
                  }
                });
              }
              if (match.length > 1 && match.index < string.length) {
                ArrayPrototype.push.apply(output, match.slice(1));
              }
              lastLength = match[0].length;
              lastLastIndex = lastIndex;
              if (output.length >= limit) {
                break;
              }
            }
            if (separator.lastIndex === match.index) {
              separator.lastIndex++;
            }
          }
          if (lastLastIndex === string.length) {
            if (lastLength || !separator.test("")) {
              output.push("");
            }
          } else {
            output.push(string.slice(lastLastIndex));
          }
          return output.length > limit ? output.slice(0, limit) : output;
        };
      })();
    } else if ("0".split(void 0, 0).length) {
      StringPrototype.split = function split(separator, limit) {
        if (separator === void 0 && limit === 0) {
          return [];
        }
        return string_split.call(this, separator, limit);
      };
    }
    var string_substr = StringPrototype.substr;
    var hasNegativeSubstrBug = "".substr && "0b".substr(-1) !== "b";
    defineProperties(StringPrototype, {
      substr: function substr(start, length) {
        return string_substr.call(
          this,
          start < 0 ? (start = this.length + start) < 0 ? 0 : start : start,
          length
        );
      }
    }, hasNegativeSubstrBug);
  }
});

// node_modules/sockjs-client/lib/utils/escape.js
var require_escape = __commonJS({
  "node_modules/sockjs-client/lib/utils/escape.js"(exports, module) {
    "use strict";
    var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g;
    var extraLookup;
    var unrollLookup = function(escapable) {
      var i;
      var unrolled = {};
      var c = [];
      for (i = 0; i < 65536; i++) {
        c.push(String.fromCharCode(i));
      }
      escapable.lastIndex = 0;
      c.join("").replace(escapable, function(a) {
        unrolled[a] = "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        return "";
      });
      escapable.lastIndex = 0;
      return unrolled;
    };
    module.exports = {
      quote: function(string) {
        var quoted = JSON.stringify(string);
        extraEscapable.lastIndex = 0;
        if (!extraEscapable.test(quoted)) {
          return quoted;
        }
        if (!extraLookup) {
          extraLookup = unrollLookup(extraEscapable);
        }
        return quoted.replace(extraEscapable, function(a) {
          return extraLookup[a];
        });
      }
    };
  }
});

// node_modules/sockjs-client/lib/utils/transport.js
var require_transport = __commonJS({
  "node_modules/sockjs-client/lib/utils/transport.js"(exports, module) {
    "use strict";
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:utils:transport");
    }
    module.exports = function(availableTransports) {
      return {
        filterToEnabled: function(transportsWhitelist, info) {
          var transports = {
            main: [],
            facade: []
          };
          if (!transportsWhitelist) {
            transportsWhitelist = [];
          } else if (typeof transportsWhitelist === "string") {
            transportsWhitelist = [transportsWhitelist];
          }
          availableTransports.forEach(function(trans) {
            if (!trans) {
              return;
            }
            if (trans.transportName === "websocket" && info.websocket === false) {
              debug("disabled from server", "websocket");
              return;
            }
            if (transportsWhitelist.length && transportsWhitelist.indexOf(trans.transportName) === -1) {
              debug("not in whitelist", trans.transportName);
              return;
            }
            if (trans.enabled(info)) {
              debug("enabled", trans.transportName);
              transports.main.push(trans);
              if (trans.facadeTransport) {
                transports.facade.push(trans.facadeTransport);
              }
            } else {
              debug("disabled", trans.transportName);
            }
          });
          return transports;
        }
      };
    };
  }
});

// node_modules/sockjs-client/lib/utils/log.js
var require_log = __commonJS({
  "node_modules/sockjs-client/lib/utils/log.js"(exports, module) {
    "use strict";
    var logObject = {};
    ["log", "debug", "warn"].forEach(function(level) {
      var levelExists;
      try {
        levelExists = global.console && global.console[level] && global.console[level].apply;
      } catch (e) {
      }
      logObject[level] = levelExists ? function() {
        return global.console[level].apply(global.console, arguments);
      } : level === "log" ? function() {
      } : logObject.log;
    });
    module.exports = logObject;
  }
});

// node_modules/sockjs-client/lib/event/event.js
var require_event2 = __commonJS({
  "node_modules/sockjs-client/lib/event/event.js"(exports, module) {
    "use strict";
    function Event(eventType) {
      this.type = eventType;
    }
    Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
      this.type = eventType;
      this.bubbles = canBubble;
      this.cancelable = cancelable;
      this.timeStamp = +/* @__PURE__ */ new Date();
      return this;
    };
    Event.prototype.stopPropagation = function() {
    };
    Event.prototype.preventDefault = function() {
    };
    Event.CAPTURING_PHASE = 1;
    Event.AT_TARGET = 2;
    Event.BUBBLING_PHASE = 3;
    module.exports = Event;
  }
});

// node_modules/sockjs-client/lib/location.js
var require_location = __commonJS({
  "node_modules/sockjs-client/lib/location.js"(exports, module) {
    "use strict";
    module.exports = global.location || {
      origin: "http://localhost:80",
      protocol: "http:",
      host: "localhost",
      port: 80,
      href: "http://localhost/",
      hash: ""
    };
  }
});

// node_modules/sockjs-client/lib/event/close.js
var require_close = __commonJS({
  "node_modules/sockjs-client/lib/event/close.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var Event = require_event2();
    function CloseEvent() {
      Event.call(this);
      this.initEvent("close", false, false);
      this.wasClean = false;
      this.code = 0;
      this.reason = "";
    }
    inherits(CloseEvent, Event);
    module.exports = CloseEvent;
  }
});

// node_modules/sockjs-client/lib/event/trans-message.js
var require_trans_message = __commonJS({
  "node_modules/sockjs-client/lib/event/trans-message.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var Event = require_event2();
    function TransportMessageEvent(data) {
      Event.call(this);
      this.initEvent("message", false, false);
      this.data = data;
    }
    inherits(TransportMessageEvent, Event);
    module.exports = TransportMessageEvent;
  }
});

// node_modules/sockjs-client/lib/transport/sender/xhr-fake.js
var require_xhr_fake = __commonJS({
  "node_modules/sockjs-client/lib/transport/sender/xhr-fake.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    function XHRFake() {
      var self2 = this;
      EventEmitter.call(this);
      this.to = setTimeout(function() {
        self2.emit("finish", 200, "{}");
      }, XHRFake.timeout);
    }
    inherits(XHRFake, EventEmitter);
    XHRFake.prototype.close = function() {
      clearTimeout(this.to);
    };
    XHRFake.timeout = 2e3;
    module.exports = XHRFake;
  }
});

// node_modules/sockjs-client/lib/info-ajax.js
var require_info_ajax = __commonJS({
  "node_modules/sockjs-client/lib/info-ajax.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    var objectUtils = require_object();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:info-ajax");
    }
    function InfoAjax(url, AjaxObject) {
      EventEmitter.call(this);
      var self2 = this;
      var t0 = +/* @__PURE__ */ new Date();
      this.xo = new AjaxObject("GET", url);
      this.xo.once("finish", function(status, text) {
        var info, rtt;
        if (status === 200) {
          rtt = +/* @__PURE__ */ new Date() - t0;
          if (text) {
            try {
              info = JSON.parse(text);
            } catch (e) {
              debug("bad json", text);
            }
          }
          if (!objectUtils.isObject(info)) {
            info = {};
          }
        }
        self2.emit("finish", info, rtt);
        self2.removeAllListeners();
      });
    }
    inherits(InfoAjax, EventEmitter);
    InfoAjax.prototype.close = function() {
      this.removeAllListeners();
      this.xo.close();
    };
    module.exports = InfoAjax;
  }
});

// node_modules/sockjs-client/lib/info-iframe-receiver.js
var require_info_iframe_receiver = __commonJS({
  "node_modules/sockjs-client/lib/info-iframe-receiver.js"(exports, module) {
    "use strict";
    var inherits = require_inherits_browser();
    var EventEmitter = require_emitter().EventEmitter;
    var XHRLocalObject = require_xhr_local();
    var InfoAjax = require_info_ajax();
    function InfoReceiverIframe(transUrl) {
      var self2 = this;
      EventEmitter.call(this);
      this.ir = new InfoAjax(transUrl, XHRLocalObject);
      this.ir.once("finish", function(info, rtt) {
        self2.ir = null;
        self2.emit("message", JSON.stringify([info, rtt]));
      });
    }
    inherits(InfoReceiverIframe, EventEmitter);
    InfoReceiverIframe.transportName = "iframe-info-receiver";
    InfoReceiverIframe.prototype.close = function() {
      if (this.ir) {
        this.ir.close();
        this.ir = null;
      }
      this.removeAllListeners();
    };
    module.exports = InfoReceiverIframe;
  }
});

// node_modules/sockjs-client/lib/info-iframe.js
var require_info_iframe = __commonJS({
  "node_modules/sockjs-client/lib/info-iframe.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    var utils = require_event();
    var IframeTransport = require_iframe2();
    var InfoReceiverIframe = require_info_iframe_receiver();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:info-iframe");
    }
    function InfoIframe(baseUrl, url) {
      var self2 = this;
      EventEmitter.call(this);
      var go = function() {
        var ifr = self2.ifr = new IframeTransport(InfoReceiverIframe.transportName, url, baseUrl);
        ifr.once("message", function(msg) {
          if (msg) {
            var d;
            try {
              d = JSON.parse(msg);
            } catch (e) {
              debug("bad json", msg);
              self2.emit("finish");
              self2.close();
              return;
            }
            var info = d[0], rtt = d[1];
            self2.emit("finish", info, rtt);
          }
          self2.close();
        });
        ifr.once("close", function() {
          self2.emit("finish");
          self2.close();
        });
      };
      if (!global.document.body) {
        utils.attachEvent("load", go);
      } else {
        go();
      }
    }
    inherits(InfoIframe, EventEmitter);
    InfoIframe.enabled = function() {
      return IframeTransport.enabled();
    };
    InfoIframe.prototype.close = function() {
      if (this.ifr) {
        this.ifr.close();
      }
      this.removeAllListeners();
      this.ifr = null;
    };
    module.exports = InfoIframe;
  }
});

// node_modules/sockjs-client/lib/info-receiver.js
var require_info_receiver = __commonJS({
  "node_modules/sockjs-client/lib/info-receiver.js"(exports, module) {
    "use strict";
    var EventEmitter = require_emitter().EventEmitter;
    var inherits = require_inherits_browser();
    var urlUtils = require_url();
    var XDR = require_xdr();
    var XHRCors = require_xhr_cors();
    var XHRLocal = require_xhr_local();
    var XHRFake = require_xhr_fake();
    var InfoIframe = require_info_iframe();
    var InfoAjax = require_info_ajax();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:info-receiver");
    }
    function InfoReceiver(baseUrl, urlInfo) {
      debug(baseUrl);
      var self2 = this;
      EventEmitter.call(this);
      setTimeout(function() {
        self2.doXhr(baseUrl, urlInfo);
      }, 0);
    }
    inherits(InfoReceiver, EventEmitter);
    InfoReceiver._getReceiver = function(baseUrl, url, urlInfo) {
      if (urlInfo.sameOrigin) {
        return new InfoAjax(url, XHRLocal);
      }
      if (XHRCors.enabled) {
        return new InfoAjax(url, XHRCors);
      }
      if (XDR.enabled && urlInfo.sameScheme) {
        return new InfoAjax(url, XDR);
      }
      if (InfoIframe.enabled()) {
        return new InfoIframe(baseUrl, url);
      }
      return new InfoAjax(url, XHRFake);
    };
    InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
      var self2 = this, url = urlUtils.addPath(baseUrl, "/info");
      debug("doXhr", url);
      this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);
      this.timeoutRef = setTimeout(function() {
        debug("timeout");
        self2._cleanup(false);
        self2.emit("finish");
      }, InfoReceiver.timeout);
      this.xo.once("finish", function(info, rtt) {
        debug("finish", info, rtt);
        self2._cleanup(true);
        self2.emit("finish", info, rtt);
      });
    };
    InfoReceiver.prototype._cleanup = function(wasClean) {
      debug("_cleanup");
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
      if (!wasClean && this.xo) {
        this.xo.close();
      }
      this.xo = null;
    };
    InfoReceiver.prototype.close = function() {
      debug("close");
      this.removeAllListeners();
      this._cleanup(false);
    };
    InfoReceiver.timeout = 8e3;
    module.exports = InfoReceiver;
  }
});

// node_modules/sockjs-client/lib/facade.js
var require_facade = __commonJS({
  "node_modules/sockjs-client/lib/facade.js"(exports, module) {
    "use strict";
    var iframeUtils = require_iframe();
    function FacadeJS(transport) {
      this._transport = transport;
      transport.on("message", this._transportMessage.bind(this));
      transport.on("close", this._transportClose.bind(this));
    }
    FacadeJS.prototype._transportClose = function(code, reason) {
      iframeUtils.postMessage("c", JSON.stringify([code, reason]));
    };
    FacadeJS.prototype._transportMessage = function(frame) {
      iframeUtils.postMessage("t", frame);
    };
    FacadeJS.prototype._send = function(data) {
      this._transport.send(data);
    };
    FacadeJS.prototype._close = function() {
      this._transport.close();
      this._transport.removeAllListeners();
    };
    module.exports = FacadeJS;
  }
});

// node_modules/sockjs-client/lib/iframe-bootstrap.js
var require_iframe_bootstrap = __commonJS({
  "node_modules/sockjs-client/lib/iframe-bootstrap.js"(exports, module) {
    "use strict";
    var urlUtils = require_url();
    var eventUtils = require_event();
    var FacadeJS = require_facade();
    var InfoIframeReceiver = require_info_iframe_receiver();
    var iframeUtils = require_iframe();
    var loc = require_location();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:iframe-bootstrap");
    }
    module.exports = function(SockJS, availableTransports) {
      var transportMap = {};
      availableTransports.forEach(function(at) {
        if (at.facadeTransport) {
          transportMap[at.facadeTransport.transportName] = at.facadeTransport;
        }
      });
      transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver;
      var parentOrigin;
      SockJS.bootstrap_iframe = function() {
        var facade;
        iframeUtils.currentWindowId = loc.hash.slice(1);
        var onMessage = function(e) {
          if (e.source !== parent) {
            return;
          }
          if (typeof parentOrigin === "undefined") {
            parentOrigin = e.origin;
          }
          if (e.origin !== parentOrigin) {
            return;
          }
          var iframeMessage;
          try {
            iframeMessage = JSON.parse(e.data);
          } catch (ignored) {
            debug("bad json", e.data);
            return;
          }
          if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
            return;
          }
          switch (iframeMessage.type) {
            case "s":
              var p;
              try {
                p = JSON.parse(iframeMessage.data);
              } catch (ignored) {
                debug("bad json", iframeMessage.data);
                break;
              }
              var version = p[0];
              var transport = p[1];
              var transUrl = p[2];
              var baseUrl = p[3];
              debug(version, transport, transUrl, baseUrl);
              if (version !== SockJS.version) {
                throw new Error('Incompatible SockJS! Main site uses: "' + version + '", the iframe: "' + SockJS.version + '".');
              }
              if (!urlUtils.isOriginEqual(transUrl, loc.href) || !urlUtils.isOriginEqual(baseUrl, loc.href)) {
                throw new Error("Can't connect to different domain from within an iframe. (" + loc.href + ", " + transUrl + ", " + baseUrl + ")");
              }
              facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
              break;
            case "m":
              facade._send(iframeMessage.data);
              break;
            case "c":
              if (facade) {
                facade._close();
              }
              facade = null;
              break;
          }
        };
        eventUtils.attachEvent("message", onMessage);
        iframeUtils.postMessage("s");
      };
    };
  }
});

// node_modules/sockjs-client/lib/main.js
var require_main = __commonJS({
  "node_modules/sockjs-client/lib/main.js"(exports, module) {
    "use strict";
    require_shims();
    var URL = require_url_parse();
    var inherits = require_inherits_browser();
    var random = require_random();
    var escape = require_escape();
    var urlUtils = require_url();
    var eventUtils = require_event();
    var transport = require_transport();
    var objectUtils = require_object();
    var browser = require_browser2();
    var log = require_log();
    var Event = require_event2();
    var EventTarget = require_eventtarget();
    var loc = require_location();
    var CloseEvent = require_close();
    var TransportMessageEvent = require_trans_message();
    var InfoReceiver = require_info_receiver();
    var debug = function() {
    };
    if (true) {
      debug = require_browser()("sockjs-client:main");
    }
    var transports;
    function SockJS(url, protocols, options) {
      if (!(this instanceof SockJS)) {
        return new SockJS(url, protocols, options);
      }
      if (arguments.length < 1) {
        throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
      }
      EventTarget.call(this);
      this.readyState = SockJS.CONNECTING;
      this.extensions = "";
      this.protocol = "";
      options = options || {};
      if (options.protocols_whitelist) {
        log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
      }
      this._transportsWhitelist = options.transports;
      this._transportOptions = options.transportOptions || {};
      this._timeout = options.timeout || 0;
      var sessionId = options.sessionId || 8;
      if (typeof sessionId === "function") {
        this._generateSessionId = sessionId;
      } else if (typeof sessionId === "number") {
        this._generateSessionId = function() {
          return random.string(sessionId);
        };
      } else {
        throw new TypeError("If sessionId is used in the options, it needs to be a number or a function.");
      }
      this._server = options.server || random.numberString(1e3);
      var parsedUrl = new URL(url);
      if (!parsedUrl.host || !parsedUrl.protocol) {
        throw new SyntaxError("The URL '" + url + "' is invalid");
      } else if (parsedUrl.hash) {
        throw new SyntaxError("The URL must not contain a fragment");
      } else if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
      }
      var secure = parsedUrl.protocol === "https:";
      if (loc.protocol === "https:" && !secure) {
        if (!urlUtils.isLoopbackAddr(parsedUrl.hostname)) {
          throw new Error("SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS");
        }
      }
      if (!protocols) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        protocols = [protocols];
      }
      var sortedProtocols = protocols.sort();
      sortedProtocols.forEach(function(proto, i) {
        if (!proto) {
          throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
        }
        if (i < sortedProtocols.length - 1 && proto === sortedProtocols[i + 1]) {
          throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
        }
      });
      var o = urlUtils.getOrigin(loc.href);
      this._origin = o ? o.toLowerCase() : null;
      parsedUrl.set("pathname", parsedUrl.pathname.replace(/\/+$/, ""));
      this.url = parsedUrl.href;
      debug("using url", this.url);
      this._urlInfo = {
        nullOrigin: !browser.hasDomain(),
        sameOrigin: urlUtils.isOriginEqual(this.url, loc.href),
        sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
      };
      this._ir = new InfoReceiver(this.url, this._urlInfo);
      this._ir.once("finish", this._receiveInfo.bind(this));
    }
    inherits(SockJS, EventTarget);
    function userSetCode(code) {
      return code === 1e3 || code >= 3e3 && code <= 4999;
    }
    SockJS.prototype.close = function(code, reason) {
      if (code && !userSetCode(code)) {
        throw new Error("InvalidAccessError: Invalid code");
      }
      if (reason && reason.length > 123) {
        throw new SyntaxError("reason argument has an invalid length");
      }
      if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
        return;
      }
      var wasClean = true;
      this._close(code || 1e3, reason || "Normal closure", wasClean);
    };
    SockJS.prototype.send = function(data) {
      if (typeof data !== "string") {
        data = "" + data;
      }
      if (this.readyState === SockJS.CONNECTING) {
        throw new Error("InvalidStateError: The connection has not been established yet");
      }
      if (this.readyState !== SockJS.OPEN) {
        return;
      }
      this._transport.send(escape.quote(data));
    };
    SockJS.version = require_version();
    SockJS.CONNECTING = 0;
    SockJS.OPEN = 1;
    SockJS.CLOSING = 2;
    SockJS.CLOSED = 3;
    SockJS.prototype._receiveInfo = function(info, rtt) {
      debug("_receiveInfo", rtt);
      this._ir = null;
      if (!info) {
        this._close(1002, "Cannot connect to server");
        return;
      }
      this._rto = this.countRTO(rtt);
      this._transUrl = info.base_url ? info.base_url : this.url;
      info = objectUtils.extend(info, this._urlInfo);
      debug("info", info);
      var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
      this._transports = enabledTransports.main;
      debug(this._transports.length + " enabled transports");
      this._connect();
    };
    SockJS.prototype._connect = function() {
      for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
        debug("attempt", Transport.transportName);
        if (Transport.needBody) {
          if (!global.document.body || typeof global.document.readyState !== "undefined" && global.document.readyState !== "complete" && global.document.readyState !== "interactive") {
            debug("waiting for body");
            this._transports.unshift(Transport);
            eventUtils.attachEvent("load", this._connect.bind(this));
            return;
          }
        }
        var timeoutMs = Math.max(this._timeout, this._rto * Transport.roundTrips || 5e3);
        this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
        debug("using timeout", timeoutMs);
        var transportUrl = urlUtils.addPath(this._transUrl, "/" + this._server + "/" + this._generateSessionId());
        var options = this._transportOptions[Transport.transportName];
        debug("transport url", transportUrl);
        var transportObj = new Transport(transportUrl, this._transUrl, options);
        transportObj.on("message", this._transportMessage.bind(this));
        transportObj.once("close", this._transportClose.bind(this));
        transportObj.transportName = Transport.transportName;
        this._transport = transportObj;
        return;
      }
      this._close(2e3, "All transports failed", false);
    };
    SockJS.prototype._transportTimeout = function() {
      debug("_transportTimeout");
      if (this.readyState === SockJS.CONNECTING) {
        if (this._transport) {
          this._transport.close();
        }
        this._transportClose(2007, "Transport timed out");
      }
    };
    SockJS.prototype._transportMessage = function(msg) {
      debug("_transportMessage", msg);
      var self2 = this, type = msg.slice(0, 1), content = msg.slice(1), payload;
      switch (type) {
        case "o":
          this._open();
          return;
        case "h":
          this.dispatchEvent(new Event("heartbeat"));
          debug("heartbeat", this.transport);
          return;
      }
      if (content) {
        try {
          payload = JSON.parse(content);
        } catch (e) {
          debug("bad json", content);
        }
      }
      if (typeof payload === "undefined") {
        debug("empty payload", content);
        return;
      }
      switch (type) {
        case "a":
          if (Array.isArray(payload)) {
            payload.forEach(function(p) {
              debug("message", self2.transport, p);
              self2.dispatchEvent(new TransportMessageEvent(p));
            });
          }
          break;
        case "m":
          debug("message", this.transport, payload);
          this.dispatchEvent(new TransportMessageEvent(payload));
          break;
        case "c":
          if (Array.isArray(payload) && payload.length === 2) {
            this._close(payload[0], payload[1], true);
          }
          break;
      }
    };
    SockJS.prototype._transportClose = function(code, reason) {
      debug("_transportClose", this.transport, code, reason);
      if (this._transport) {
        this._transport.removeAllListeners();
        this._transport = null;
        this.transport = null;
      }
      if (!userSetCode(code) && code !== 2e3 && this.readyState === SockJS.CONNECTING) {
        this._connect();
        return;
      }
      this._close(code, reason);
    };
    SockJS.prototype._open = function() {
      debug("_open", this._transport && this._transport.transportName, this.readyState);
      if (this.readyState === SockJS.CONNECTING) {
        if (this._transportTimeoutId) {
          clearTimeout(this._transportTimeoutId);
          this._transportTimeoutId = null;
        }
        this.readyState = SockJS.OPEN;
        this.transport = this._transport.transportName;
        this.dispatchEvent(new Event("open"));
        debug("connected", this.transport);
      } else {
        this._close(1006, "Server lost session");
      }
    };
    SockJS.prototype._close = function(code, reason, wasClean) {
      debug("_close", this.transport, code, reason, wasClean, this.readyState);
      var forceFail = false;
      if (this._ir) {
        forceFail = true;
        this._ir.close();
        this._ir = null;
      }
      if (this._transport) {
        this._transport.close();
        this._transport = null;
        this.transport = null;
      }
      if (this.readyState === SockJS.CLOSED) {
        throw new Error("InvalidStateError: SockJS has already been closed");
      }
      this.readyState = SockJS.CLOSING;
      setTimeout((function() {
        this.readyState = SockJS.CLOSED;
        if (forceFail) {
          this.dispatchEvent(new Event("error"));
        }
        var e = new CloseEvent("close");
        e.wasClean = wasClean || false;
        e.code = code || 1e3;
        e.reason = reason;
        this.dispatchEvent(e);
        this.onmessage = this.onclose = this.onerror = null;
        debug("disconnected");
      }).bind(this), 0);
    };
    SockJS.prototype.countRTO = function(rtt) {
      if (rtt > 100) {
        return 4 * rtt;
      }
      return 300 + rtt;
    };
    module.exports = function(availableTransports) {
      transports = transport(availableTransports);
      require_iframe_bootstrap()(SockJS, availableTransports);
      return SockJS;
    };
  }
});

// node_modules/sockjs-client/lib/entry.js
var require_entry = __commonJS({
  "node_modules/sockjs-client/lib/entry.js"(exports, module) {
    var transportList = require_transport_list();
    module.exports = require_main()(transportList);
    if ("_sockjs_onload" in global) {
      setTimeout(global._sockjs_onload, 1);
    }
  }
});
export default require_entry();
//# sourceMappingURL=sockjs-client.js.map
