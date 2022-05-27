/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1605:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 1413:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Materialize v1.0.0 (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document,
      win = window,
      ArrayProto = Array.prototype,
      slice = ArrayProto.slice,
      filter = ArrayProto.filter,
      push = ArrayProto.push;

  var noop = function () {},
      isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  },
      isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/,
      classMatch = /^\.[\w-]*$/,
      htmlMatch = /<.+>/,
      singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector,
        i = 0,
        length;

    if (isString(selector)) {
      elems = idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context);

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments),
        length = args.length,
        i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length,
        i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
      /* Use browser's `matches` function if string */
      isString(selector) ? matches :
      /* Match a cash element */
      selector.cash ? function (el) {
        return selector.is(el);
      } :
      /* Direct comparison */
      function (el, selector) {
        return el === selector;
      }
    );
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length,
          i = first.length,
          j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return node[uid] = node[uid] || {};
  }

  function setData(node, key, value) {
    return getDataCache(node)[key] = value;
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        });
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this;
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false,
          classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        });
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this;
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this;
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = isFunction(selector) ? selector : getCompareFunction(selector);

      return cash(filter.call(this, function (e) {
        return comparator(e, selector);
      }));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return index < 0 ? this[index + this.length] : this[index];
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0],
          collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var camelCase = function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g,
        whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    };
  }();

  var getPrefixedProp = function () {
    var cache = {},
        doc = document,
        div = doc.createElement("div"),
        style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
          prefixes = ["webkit", "moz", "ms", "o"],
          props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }();

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return arguments.length > 1 ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop];
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    }

  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var events = getData(node, "_cashEvents"),
        eventCache = events && events[eventName],
        index;

    if (!eventCache) {
      return;
    }

    if (callback) {
      node.removeEventListener(eventName, callback);
      index = eventCache.indexOf(callback);
      if (index >= 0) {
        eventCache.splice(index, 1);
      }
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      // jshint ignore:line
      var originalCallback;
      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);
        return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            if (t === this || t === null) {
              return t = false;
            }

            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return el.checked ? el.value : null;
      case "checkbox":
        return el.checked ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return v.value = value;
      });
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, i === 0 ? child : child.cloneNode(true), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = content.nodeType ? content[0].outerHTML : content;
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;

      cash(selector).each(function (el, i) {
        var parent = el.parentNode,
            sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return !selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      });
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false,
          comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      };

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last,
          result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || selector && matches(last, selector)) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector),
          el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });

  return cash;
});
;
var Component = function () {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  function Component(classDef, el, options) {
    _classCallCheck(this, Component);

    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    var ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }

  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */


  _createClass(Component, null, [{
    key: "init",
    value: function init(classDef, els, options) {
      var instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        var instancesArr = [];
        for (var i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }

      return instances;
    }
  }]);

  return Component;
}();

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
  if (window.Package) {
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (true) {
  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
    return M;
  }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Common JS
} else {}

M.version = '1.0.0';

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
M.keyDown = false;
var docHandleKeydown = function (e) {
  M.keyDown = true;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = true;
  }
};
var docHandleKeyup = function (e) {
  M.keyDown = false;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = false;
  }
};
var docHandleFocus = function (e) {
  if (M.keyDown) {
    document.body.classList.add('keyboard-focused');
  }
};
var docHandleBlur = function (e) {
  document.body.classList.remove('keyboard-focused');
};
document.addEventListener('keydown', docHandleKeydown, true);
document.addEventListener('keyup', docHandleKeyup, true);
document.addEventListener('focus', docHandleFocus, true);
document.addEventListener('blur', docHandleBlur, true);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function (methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      var params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === 'get') {
        var instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function () {
        var instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

      // Initialize plugin if options or no argument is passed in
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      plugin.init(this, arguments[0]);
      return this;
    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error("Method " + methodOrOptions + " does not exist on jQuery." + pluginName);
  };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function (context) {
  // Use document.body if no context is given
  var root = !!context ? context : document.body;

  var registry = {
    Autocomplete: root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
    Carousel: root.querySelectorAll('.carousel:not(.no-autoinit)'),
    Chips: root.querySelectorAll('.chips:not(.no-autoinit)'),
    Collapsible: root.querySelectorAll('.collapsible:not(.no-autoinit)'),
    Datepicker: root.querySelectorAll('.datepicker:not(.no-autoinit)'),
    Dropdown: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
    Materialbox: root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
    Modal: root.querySelectorAll('.modal:not(.no-autoinit)'),
    Parallax: root.querySelectorAll('.parallax:not(.no-autoinit)'),
    Pushpin: root.querySelectorAll('.pushpin:not(.no-autoinit)'),
    ScrollSpy: root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
    FormSelect: root.querySelectorAll('select:not(.no-autoinit)'),
    Sidenav: root.querySelectorAll('.sidenav:not(.no-autoinit)'),
    Tabs: root.querySelectorAll('.tabs:not(.no-autoinit)'),
    TapTarget: root.querySelectorAll('.tap-target:not(.no-autoinit)'),
    Timepicker: root.querySelectorAll('.timepicker:not(.no-autoinit)'),
    Tooltip: root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
    FloatingActionButton: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)')
  };

  for (var pluginName in registry) {
    var plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function (obj) {
  var tagStr = obj.prop('tagName') || '';
  var idStr = obj.attr('id') || '';
  var classStr = obj.attr('class') || '';
  return (tagStr + idStr + classStr).replace(/\s/g, '');
};

// Unique Random ID
M.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function (hash) {
  return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, '\\$1');
};

M.elementOrParentIsFixed = function (element) {
  var $element = $(element);
  var $checkElements = $element.add($element.parents());
  var isFixed = false;
  $checkElements.each(function () {
    if ($(this).css('position') === 'fixed') {
      isFixed = true;
      return false;
    }
  });
  return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function (container, bounding, offset) {
  var edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  var containerRect = container.getBoundingClientRect();
  // If body element is smaller than viewport, use viewport height instead.
  var containerBottom = container === document.body ? Math.max(containerRect.bottom, window.innerHeight) : containerRect.bottom;

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (scrolledX + bounding.width > containerRect.right - offset || scrolledX + bounding.width > window.innerWidth - offset) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (scrolledY + bounding.height > containerBottom - offset || scrolledY + bounding.height > window.innerHeight - offset) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
  var canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  var containerRect = container.getBoundingClientRect();
  var containerHeight = Math.min(containerRect.height, window.innerHeight);
  var containerWidth = Math.min(containerRect.width, window.innerWidth);
  var elOffsetRect = el.getBoundingClientRect();

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledYTopEdge = bounding.top - scrollTop;
  var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function (element) {
  if (element == null) {
    return null;
  }

  if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function (trigger) {
  var id = trigger.getAttribute('data-target');
  if (!id) {
    id = trigger.getAttribute('href');
    if (id) {
      id = id.slice(1);
    } else {
      id = '';
    }
  }
  return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
var getTime = Date.now || function () {
  return new Date().getTime();
};

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function (func, wait, options) {
  var context = void 0,
      args = void 0,
      result = void 0;
  var timeout = null;
  var previous = 0;
  options || (options = {});
  var later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    var now = getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
; /*
  v2.2.0
  2017 Julian Garnier
  Released under the MIT license
  */
var $jscomp = { scope: {} };$jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (e, r, p) {
  if (p.get || p.set) throw new TypeError("ES3 does not support getters and setters.");e != Array.prototype && e != Object.prototype && (e[r] = p.value);
};$jscomp.getGlobal = function (e) {
  return "undefined" != typeof window && window === e ? e : "undefined" != typeof __webpack_require__.g && null != __webpack_require__.g ? __webpack_require__.g : e;
};$jscomp.global = $jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};$jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};$jscomp.symbolCounter_ = 0;$jscomp.Symbol = function (e) {
  return $jscomp.SYMBOL_PREFIX + (e || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();var e = $jscomp.global.Symbol.iterator;e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));"function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, { configurable: !0, writable: !0, value: function () {
      return $jscomp.arrayIterator(this);
    } });$jscomp.initSymbolIterator = function () {};
};$jscomp.arrayIterator = function (e) {
  var r = 0;return $jscomp.iteratorPrototype(function () {
    return r < e.length ? { done: !1, value: e[r++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (e) {
  $jscomp.initSymbolIterator();e = { next: e };e[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };return e;
};$jscomp.array = $jscomp.array || {};$jscomp.iteratorFromArray = function (e, r) {
  $jscomp.initSymbolIterator();e instanceof String && (e += "");var p = 0,
      m = { next: function () {
      if (p < e.length) {
        var u = p++;return { value: r(u, e[u]), done: !1 };
      }m.next = function () {
        return { done: !0, value: void 0 };
      };return m.next();
    } };m[Symbol.iterator] = function () {
    return m;
  };return m;
};
$jscomp.polyfill = function (e, r, p, m) {
  if (r) {
    p = $jscomp.global;e = e.split(".");for (m = 0; m < e.length - 1; m++) {
      var u = e[m];u in p || (p[u] = {});p = p[u];
    }e = e[e.length - 1];m = p[e];r = r(m);r != m && null != r && $jscomp.defineProperty(p, e, { configurable: !0, writable: !0, value: r });
  }
};$jscomp.polyfill("Array.prototype.keys", function (e) {
  return e ? e : function () {
    return $jscomp.iteratorFromArray(this, function (e) {
      return e;
    });
  };
}, "es6-impl", "es3");var $jscomp$this = this;
(function (r) {
  M.anime = r();
})(function () {
  function e(a) {
    if (!h.col(a)) try {
      return document.querySelectorAll(a);
    } catch (c) {}
  }function r(a, c) {
    for (var d = a.length, b = 2 <= arguments.length ? arguments[1] : void 0, f = [], n = 0; n < d; n++) {
      if (n in a) {
        var k = a[n];c.call(b, k, n, a) && f.push(k);
      }
    }return f;
  }function p(a) {
    return a.reduce(function (a, d) {
      return a.concat(h.arr(d) ? p(d) : d);
    }, []);
  }function m(a) {
    if (h.arr(a)) return a;
    h.str(a) && (a = e(a) || a);return a instanceof NodeList || a instanceof HTMLCollection ? [].slice.call(a) : [a];
  }function u(a, c) {
    return a.some(function (a) {
      return a === c;
    });
  }function C(a) {
    var c = {},
        d;for (d in a) {
      c[d] = a[d];
    }return c;
  }function D(a, c) {
    var d = C(a),
        b;for (b in a) {
      d[b] = c.hasOwnProperty(b) ? c[b] : a[b];
    }return d;
  }function z(a, c) {
    var d = C(a),
        b;for (b in c) {
      d[b] = h.und(a[b]) ? c[b] : a[b];
    }return d;
  }function T(a) {
    a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (a, c, d, k) {
      return c + c + d + d + k + k;
    });var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
    a = parseInt(c[1], 16);var d = parseInt(c[2], 16),
        c = parseInt(c[3], 16);return "rgba(" + a + "," + d + "," + c + ",1)";
  }function U(a) {
    function c(a, c, b) {
      0 > b && (b += 1);1 < b && --b;return b < 1 / 6 ? a + 6 * (c - a) * b : .5 > b ? c : b < 2 / 3 ? a + (c - a) * (2 / 3 - b) * 6 : a;
    }var d = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a = parseInt(d[1]) / 360;var b = parseInt(d[2]) / 100,
        f = parseInt(d[3]) / 100,
        d = d[4] || 1;if (0 == b) f = b = a = f;else {
      var n = .5 > f ? f * (1 + b) : f + b - f * b,
          k = 2 * f - n,
          f = c(k, n, a + 1 / 3),
          b = c(k, n, a);a = c(k, n, a - 1 / 3);
    }return "rgba(" + 255 * f + "," + 255 * b + "," + 255 * a + "," + d + ")";
  }function y(a) {
    if (a = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a)) return a[2];
  }function V(a) {
    if (-1 < a.indexOf("translate") || "perspective" === a) return "px";if (-1 < a.indexOf("rotate") || -1 < a.indexOf("skew")) return "deg";
  }function I(a, c) {
    return h.fnc(a) ? a(c.target, c.id, c.total) : a;
  }function E(a, c) {
    if (c in a.style) return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()) || "0";
  }function J(a, c) {
    if (h.dom(a) && u(W, c)) return "transform";if (h.dom(a) && (a.getAttribute(c) || h.svg(a) && a[c])) return "attribute";if (h.dom(a) && "transform" !== c && E(a, c)) return "css";if (null != a[c]) return "object";
  }function X(a, c) {
    var d = V(c),
        d = -1 < c.indexOf("scale") ? 1 : 0 + d;a = a.style.transform;if (!a) return d;for (var b = [], f = [], n = [], k = /(\w+)\((.+?)\)/g; b = k.exec(a);) {
      f.push(b[1]), n.push(b[2]);
    }a = r(n, function (a, b) {
      return f[b] === c;
    });return a.length ? a[0] : d;
  }function K(a, c) {
    switch (J(a, c)) {case "transform":
        return X(a, c);case "css":
        return E(a, c);case "attribute":
        return a.getAttribute(c);}return a[c] || 0;
  }function L(a, c) {
    var d = /^(\*=|\+=|-=)/.exec(a);if (!d) return a;var b = y(a) || 0;c = parseFloat(c);a = parseFloat(a.replace(d[0], ""));switch (d[0][0]) {case "+":
        return c + a + b;case "-":
        return c - a + b;case "*":
        return c * a + b;}
  }function F(a, c) {
    return Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
  }function M(a) {
    a = a.points;for (var c = 0, d, b = 0; b < a.numberOfItems; b++) {
      var f = a.getItem(b);0 < b && (c += F(d, f));d = f;
    }return c;
  }function N(a) {
    if (a.getTotalLength) return a.getTotalLength();switch (a.tagName.toLowerCase()) {case "circle":
        return 2 * Math.PI * a.getAttribute("r");case "rect":
        return 2 * a.getAttribute("width") + 2 * a.getAttribute("height");case "line":
        return F({ x: a.getAttribute("x1"), y: a.getAttribute("y1") }, { x: a.getAttribute("x2"), y: a.getAttribute("y2") });case "polyline":
        return M(a);case "polygon":
        var c = a.points;return M(a) + F(c.getItem(c.numberOfItems - 1), c.getItem(0));}
  }function Y(a, c) {
    function d(b) {
      b = void 0 === b ? 0 : b;return a.el.getPointAtLength(1 <= c + b ? c + b : 0);
    }var b = d(),
        f = d(-1),
        n = d(1);switch (a.property) {case "x":
        return b.x;case "y":
        return b.y;
      case "angle":
        return 180 * Math.atan2(n.y - f.y, n.x - f.x) / Math.PI;}
  }function O(a, c) {
    var d = /-?\d*\.?\d+/g,
        b;b = h.pth(a) ? a.totalLength : a;if (h.col(b)) {
      if (h.rgb(b)) {
        var f = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b = f ? "rgba(" + f[1] + ",1)" : b;
      } else b = h.hex(b) ? T(b) : h.hsl(b) ? U(b) : void 0;
    } else f = (f = y(b)) ? b.substr(0, b.length - f.length) : b, b = c && !/\s/g.test(b) ? f + c : f;b += "";return { original: b, numbers: b.match(d) ? b.match(d).map(Number) : [0], strings: h.str(a) || c ? b.split(d) : [] };
  }function P(a) {
    a = a ? p(h.arr(a) ? a.map(m) : m(a)) : [];return r(a, function (a, d, b) {
      return b.indexOf(a) === d;
    });
  }function Z(a) {
    var c = P(a);return c.map(function (a, b) {
      return { target: a, id: b, total: c.length };
    });
  }function aa(a, c) {
    var d = C(c);if (h.arr(a)) {
      var b = a.length;2 !== b || h.obj(a[0]) ? h.fnc(c.duration) || (d.duration = c.duration / b) : a = { value: a };
    }return m(a).map(function (a, b) {
      b = b ? 0 : c.delay;a = h.obj(a) && !h.pth(a) ? a : { value: a };h.und(a.delay) && (a.delay = b);return a;
    }).map(function (a) {
      return z(a, d);
    });
  }function ba(a, c) {
    var d = {},
        b;for (b in a) {
      var f = I(a[b], c);h.arr(f) && (f = f.map(function (a) {
        return I(a, c);
      }), 1 === f.length && (f = f[0]));d[b] = f;
    }d.duration = parseFloat(d.duration);d.delay = parseFloat(d.delay);return d;
  }function ca(a) {
    return h.arr(a) ? A.apply(this, a) : Q[a];
  }function da(a, c) {
    var d;return a.tweens.map(function (b) {
      b = ba(b, c);var f = b.value,
          e = K(c.target, a.name),
          k = d ? d.to.original : e,
          k = h.arr(f) ? f[0] : k,
          w = L(h.arr(f) ? f[1] : f, k),
          e = y(w) || y(k) || y(e);b.from = O(k, e);b.to = O(w, e);b.start = d ? d.end : a.offset;b.end = b.start + b.delay + b.duration;b.easing = ca(b.easing);b.elasticity = (1E3 - Math.min(Math.max(b.elasticity, 1), 999)) / 1E3;b.isPath = h.pth(f);b.isColor = h.col(b.from.original);b.isColor && (b.round = 1);return d = b;
    });
  }function ea(a, c) {
    return r(p(a.map(function (a) {
      return c.map(function (b) {
        var c = J(a.target, b.name);if (c) {
          var d = da(b, a);b = { type: c, property: b.name, animatable: a, tweens: d, duration: d[d.length - 1].end, delay: d[0].delay };
        } else b = void 0;return b;
      });
    })), function (a) {
      return !h.und(a);
    });
  }function R(a, c, d, b) {
    var f = "delay" === a;return c.length ? (f ? Math.min : Math.max).apply(Math, c.map(function (b) {
      return b[a];
    })) : f ? b.delay : d.offset + b.delay + b.duration;
  }function fa(a) {
    var c = D(ga, a),
        d = D(S, a),
        b = Z(a.targets),
        f = [],
        e = z(c, d),
        k;for (k in a) {
      e.hasOwnProperty(k) || "targets" === k || f.push({ name: k, offset: e.offset, tweens: aa(a[k], d) });
    }a = ea(b, f);return z(c, { children: [], animatables: b, animations: a, duration: R("duration", a, c, d), delay: R("delay", a, c, d) });
  }function q(a) {
    function c() {
      return window.Promise && new Promise(function (a) {
        return p = a;
      });
    }function d(a) {
      return g.reversed ? g.duration - a : a;
    }function b(a) {
      for (var b = 0, c = {}, d = g.animations, f = d.length; b < f;) {
        var e = d[b],
            k = e.animatable,
            h = e.tweens,
            n = h.length - 1,
            l = h[n];n && (l = r(h, function (b) {
          return a < b.end;
        })[0] || l);for (var h = Math.min(Math.max(a - l.start - l.delay, 0), l.duration) / l.duration, w = isNaN(h) ? 1 : l.easing(h, l.elasticity), h = l.to.strings, p = l.round, n = [], m = void 0, m = l.to.numbers.length, t = 0; t < m; t++) {
          var x = void 0,
              x = l.to.numbers[t],
              q = l.from.numbers[t],
              x = l.isPath ? Y(l.value, w * x) : q + w * (x - q);p && (l.isColor && 2 < t || (x = Math.round(x * p) / p));n.push(x);
        }if (l = h.length) for (m = h[0], w = 0; w < l; w++) {
          p = h[w + 1], t = n[w], isNaN(t) || (m = p ? m + (t + p) : m + (t + " "));
        } else m = n[0];ha[e.type](k.target, e.property, m, c, k.id);e.currentValue = m;b++;
      }if (b = Object.keys(c).length) for (d = 0; d < b; d++) {
        H || (H = E(document.body, "transform") ? "transform" : "-webkit-transform"), g.animatables[d].target.style[H] = c[d].join(" ");
      }g.currentTime = a;g.progress = a / g.duration * 100;
    }function f(a) {
      if (g[a]) g[a](g);
    }function e() {
      g.remaining && !0 !== g.remaining && g.remaining--;
    }function k(a) {
      var k = g.duration,
          n = g.offset,
          w = n + g.delay,
          r = g.currentTime,
          x = g.reversed,
          q = d(a);if (g.children.length) {
        var u = g.children,
            v = u.length;
        if (q >= g.currentTime) for (var G = 0; G < v; G++) {
          u[G].seek(q);
        } else for (; v--;) {
          u[v].seek(q);
        }
      }if (q >= w || !k) g.began || (g.began = !0, f("begin")), f("run");if (q > n && q < k) b(q);else if (q <= n && 0 !== r && (b(0), x && e()), q >= k && r !== k || !k) b(k), x || e();f("update");a >= k && (g.remaining ? (t = h, "alternate" === g.direction && (g.reversed = !g.reversed)) : (g.pause(), g.completed || (g.completed = !0, f("complete"), "Promise" in window && (p(), m = c()))), l = 0);
    }a = void 0 === a ? {} : a;var h,
        t,
        l = 0,
        p = null,
        m = c(),
        g = fa(a);g.reset = function () {
      var a = g.direction,
          c = g.loop;g.currentTime = 0;g.progress = 0;g.paused = !0;g.began = !1;g.completed = !1;g.reversed = "reverse" === a;g.remaining = "alternate" === a && 1 === c ? 2 : c;b(0);for (a = g.children.length; a--;) {
        g.children[a].reset();
      }
    };g.tick = function (a) {
      h = a;t || (t = h);k((l + h - t) * q.speed);
    };g.seek = function (a) {
      k(d(a));
    };g.pause = function () {
      var a = v.indexOf(g);-1 < a && v.splice(a, 1);g.paused = !0;
    };g.play = function () {
      g.paused && (g.paused = !1, t = 0, l = d(g.currentTime), v.push(g), B || ia());
    };g.reverse = function () {
      g.reversed = !g.reversed;t = 0;l = d(g.currentTime);
    };g.restart = function () {
      g.pause();
      g.reset();g.play();
    };g.finished = m;g.reset();g.autoplay && g.play();return g;
  }var ga = { update: void 0, begin: void 0, run: void 0, complete: void 0, loop: 1, direction: "normal", autoplay: !0, offset: 0 },
      S = { duration: 1E3, delay: 0, easing: "easeOutElastic", elasticity: 500, round: 0 },
      W = "translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),
      H,
      h = { arr: function (a) {
      return Array.isArray(a);
    }, obj: function (a) {
      return -1 < Object.prototype.toString.call(a).indexOf("Object");
    },
    pth: function (a) {
      return h.obj(a) && a.hasOwnProperty("totalLength");
    }, svg: function (a) {
      return a instanceof SVGElement;
    }, dom: function (a) {
      return a.nodeType || h.svg(a);
    }, str: function (a) {
      return "string" === typeof a;
    }, fnc: function (a) {
      return "function" === typeof a;
    }, und: function (a) {
      return "undefined" === typeof a;
    }, hex: function (a) {
      return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
      );
    }, rgb: function (a) {
      return (/^rgb/.test(a)
      );
    }, hsl: function (a) {
      return (/^hsl/.test(a)
      );
    }, col: function (a) {
      return h.hex(a) || h.rgb(a) || h.hsl(a);
    } },
      A = function () {
    function a(a, d, b) {
      return (((1 - 3 * b + 3 * d) * a + (3 * b - 6 * d)) * a + 3 * d) * a;
    }return function (c, d, b, f) {
      if (0 <= c && 1 >= c && 0 <= b && 1 >= b) {
        var e = new Float32Array(11);if (c !== d || b !== f) for (var k = 0; 11 > k; ++k) {
          e[k] = a(.1 * k, c, b);
        }return function (k) {
          if (c === d && b === f) return k;if (0 === k) return 0;if (1 === k) return 1;for (var h = 0, l = 1; 10 !== l && e[l] <= k; ++l) {
            h += .1;
          }--l;var l = h + (k - e[l]) / (e[l + 1] - e[l]) * .1,
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (.001 <= n) {
            for (h = 0; 4 > h; ++h) {
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (0 === n) break;var m = a(l, c, b) - k,
                  l = l - m / n;
            }k = l;
          } else if (0 === n) k = l;else {
            var l = h,
                h = h + .1,
                g = 0;do {
              m = l + (h - l) / 2, n = a(m, c, b) - k, 0 < n ? h = m : l = m;
            } while (1e-7 < Math.abs(n) && 10 > ++g);k = m;
          }return a(k, d, f);
        };
      }
    };
  }(),
      Q = function () {
    function a(a, b) {
      return 0 === a || 1 === a ? a : -Math.pow(2, 10 * (a - 1)) * Math.sin(2 * (a - 1 - b / (2 * Math.PI) * Math.asin(1)) * Math.PI / b);
    }var c = "Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),
        d = { In: [[.55, .085, .68, .53], [.55, .055, .675, .19], [.895, .03, .685, .22], [.755, .05, .855, .06], [.47, 0, .745, .715], [.95, .05, .795, .035], [.6, .04, .98, .335], [.6, -.28, .735, .045], a], Out: [[.25, .46, .45, .94], [.215, .61, .355, 1], [.165, .84, .44, 1], [.23, 1, .32, 1], [.39, .575, .565, 1], [.19, 1, .22, 1], [.075, .82, .165, 1], [.175, .885, .32, 1.275], function (b, c) {
        return 1 - a(1 - b, c);
      }], InOut: [[.455, .03, .515, .955], [.645, .045, .355, 1], [.77, 0, .175, 1], [.86, 0, .07, 1], [.445, .05, .55, .95], [1, 0, 0, 1], [.785, .135, .15, .86], [.68, -.55, .265, 1.55], function (b, c) {
        return .5 > b ? a(2 * b, c) / 2 : 1 - a(-2 * b + 2, c) / 2;
      }] },
        b = { linear: A(.25, .25, .75, .75) },
        f = {},
        e;for (e in d) {
      f.type = e, d[f.type].forEach(function (a) {
        return function (d, f) {
          b["ease" + a.type + c[f]] = h.fnc(d) ? d : A.apply($jscomp$this, d);
        };
      }(f)), f = { type: f.type };
    }return b;
  }(),
      ha = { css: function (a, c, d) {
      return a.style[c] = d;
    }, attribute: function (a, c, d) {
      return a.setAttribute(c, d);
    }, object: function (a, c, d) {
      return a[c] = d;
    }, transform: function (a, c, d, b, f) {
      b[f] || (b[f] = []);b[f].push(c + "(" + d + ")");
    } },
      v = [],
      B = 0,
      ia = function () {
    function a() {
      B = requestAnimationFrame(c);
    }function c(c) {
      var b = v.length;if (b) {
        for (var d = 0; d < b;) {
          v[d] && v[d].tick(c), d++;
        }a();
      } else cancelAnimationFrame(B), B = 0;
    }return a;
  }();q.version = "2.2.0";q.speed = 1;q.running = v;q.remove = function (a) {
    a = P(a);for (var c = v.length; c--;) {
      for (var d = v[c], b = d.animations, f = b.length; f--;) {
        u(a, b[f].animatable.target) && (b.splice(f, 1), b.length || d.pause());
      }
    }
  };q.getValue = K;q.path = function (a, c) {
    var d = h.str(a) ? e(a)[0] : a,
        b = c || 100;return function (a) {
      return { el: d, property: a, totalLength: N(d) * (b / 100) };
    };
  };q.setDashoffset = function (a) {
    var c = N(a);a.setAttribute("stroke-dasharray", c);return c;
  };q.bezier = A;q.easings = Q;q.timeline = function (a) {
    var c = q(a);c.pause();c.duration = 0;c.add = function (d) {
      c.children.forEach(function (a) {
        a.began = !0;a.completed = !0;
      });m(d).forEach(function (b) {
        var d = z(b, D(S, a || {}));d.targets = d.targets || a.targets;b = c.duration;var e = d.offset;d.autoplay = !1;d.direction = c.direction;d.offset = h.und(e) ? b : L(e, b);c.began = !0;c.completed = !0;c.seek(d.offset);d = q(d);d.began = !0;d.completed = !0;d.duration > b && (c.duration = d.duration);c.children.push(d);
      });c.seek(0);c.reset();c.autoplay && c.restart();return c;
    };return c;
  };q.random = function (a, c) {
    return Math.floor(Math.random() * (c - a + 1)) + a;
  };return q;
});
;(function ($, anim) {
  'use strict';

  var _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };

  /**
   * @class
   *
   */

  var Collapsible = function (_Component) {
    _inherits(Collapsible, _Component);

    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Collapsible(el, options) {
      _classCallCheck(this, Collapsible);

      var _this3 = _possibleConstructorReturn(this, (Collapsible.__proto__ || Object.getPrototypeOf(Collapsible)).call(this, Collapsible, el, options));

      _this3.el.M_Collapsible = _this3;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      _this3.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      _this3.$headers = _this3.$el.children('li').children('.collapsible-header');
      _this3.$headers.attr('tabindex', 0);

      _this3._setupEventHandlers();

      // Open first active
      var $activeBodies = _this3.$el.children('li.active').children('.collapsible-body');
      if (_this3.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css('display', 'block');
      } else {
        // Handle Expandables
        $activeBodies.css('display', 'block');
      }
      return _this3;
    }

    _createClass(Collapsible, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Collapsible = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this4 = this;

        this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
        this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
        this.el.addEventListener('click', this._handleCollapsibleClickBound);
        this.$headers.each(function (header) {
          header.addEventListener('keydown', _this4._handleCollapsibleKeydownBound);
        });
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this5 = this;

        this.el.removeEventListener('click', this._handleCollapsibleClickBound);
        this.$headers.each(function (header) {
          header.removeEventListener('keydown', _this5._handleCollapsibleKeydownBound);
        });
      }

      /**
       * Handle Collapsible Click
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleClick",
      value: function _handleCollapsibleClick(e) {
        var $header = $(e.target).closest('.collapsible-header');
        if (e.target && $header.length) {
          var $collapsible = $header.closest('.collapsible');
          if ($collapsible[0] === this.el) {
            var $collapsibleLi = $header.closest('li');
            var $collapsibleLis = $collapsible.children('li');
            var isActive = $collapsibleLi[0].classList.contains('active');
            var index = $collapsibleLis.index($collapsibleLi);

            if (isActive) {
              this.close(index);
            } else {
              this.open(index);
            }
          }
        }
      }

      /**
       * Handle Collapsible Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleKeydown",
      value: function _handleCollapsibleKeydown(e) {
        if (e.keyCode === 13) {
          this._handleCollapsibleClickBound(e);
        }
      }

      /**
       * Animate in collapsible slide
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "_animateIn",
      value: function _animateIn(index) {
        var _this6 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');

          anim.remove($body[0]);
          $body.css({
            display: 'block',
            overflow: 'hidden',
            height: 0,
            paddingTop: '',
            paddingBottom: ''
          });

          var pTop = $body.css('padding-top');
          var pBottom = $body.css('padding-bottom');
          var finalHeight = $body[0].scrollHeight;
          $body.css({
            paddingTop: 0,
            paddingBottom: 0
          });

          anim({
            targets: $body[0],
            height: finalHeight,
            paddingTop: pTop,
            paddingBottom: pBottom,
            duration: this.options.inDuration,
            easing: 'easeInOutCubic',
            complete: function (anim) {
              $body.css({
                overflow: '',
                paddingTop: '',
                paddingBottom: '',
                height: ''
              });

              // onOpenEnd callback
              if (typeof _this6.options.onOpenEnd === 'function') {
                _this6.options.onOpenEnd.call(_this6, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Animate out collapsible slide
       * @param {Number} index - 0th index of slide to open
       */

    }, {
      key: "_animateOut",
      value: function _animateOut(index) {
        var _this7 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');
          anim.remove($body[0]);
          $body.css('overflow', 'hidden');
          anim({
            targets: $body[0],
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: this.options.outDuration,
            easing: 'easeInOutCubic',
            complete: function () {
              $body.css({
                height: '',
                overflow: '',
                padding: '',
                display: ''
              });

              // onCloseEnd callback
              if (typeof _this7.options.onCloseEnd === 'function') {
                _this7.options.onCloseEnd.call(_this7, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Open Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "open",
      value: function open(index) {
        var _this8 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
          // onOpenStart callback
          if (typeof this.options.onOpenStart === 'function') {
            this.options.onOpenStart.call(this, $collapsibleLi[0]);
          }

          // Handle accordion behavior
          if (this.options.accordion) {
            var $collapsibleLis = this.$el.children('li');
            var $activeLis = this.$el.children('li.active');
            $activeLis.each(function (el) {
              var index = $collapsibleLis.index($(el));
              _this8.close(index);
            });
          }

          // Animate in
          $collapsibleLi[0].classList.add('active');
          this._animateIn(index);
        }
      }

      /**
       * Close Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "close",
      value: function close(index) {
        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
          // onCloseStart callback
          if (typeof this.options.onCloseStart === 'function') {
            this.options.onCloseStart.call(this, $collapsibleLi[0]);
          }

          // Animate out
          $collapsibleLi[0].classList.remove('active');
          this._animateOut(index);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Collapsible.__proto__ || Object.getPrototypeOf(Collapsible), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Collapsible;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Collapsible;
  }(Component);

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    alignment: 'left',
    autoFocus: true,
    constrainWidth: true,
    container: null,
    coverTrigger: true,
    closeOnClick: true,
    hover: false,
    inDuration: 150,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onItemClick: null
  };

  /**
   * @class
   */

  var Dropdown = function (_Component2) {
    _inherits(Dropdown, _Component2);

    function Dropdown(el, options) {
      _classCallCheck(this, Dropdown);

      var _this9 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

      _this9.el.M_Dropdown = _this9;
      Dropdown._dropdowns.push(_this9);

      _this9.id = M.getIdFromTrigger(el);
      _this9.dropdownEl = document.getElementById(_this9.id);
      _this9.$dropdownEl = $(_this9.dropdownEl);

      /**
       * Options for the dropdown
       * @member Dropdown#options
       * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
       * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
       * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
       * @prop {Element} container - Container element to attach dropdown to (optional)
       * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
       * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
       * @prop {Boolean} [hover=false] - Open dropdown on hover
       * @prop {Number} [inDuration=150] - Duration of open animation in ms
       * @prop {Number} [outDuration=250] - Duration of close animation in ms
       * @prop {Function} onOpenStart - Function called when dropdown starts opening
       * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
       * @prop {Function} onCloseStart - Function called when dropdown starts closing
       * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
       */
      _this9.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      _this9.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      _this9.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      _this9.isTouchMoving = false;

      _this9.focusedIndex = -1;
      _this9.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!_this9.options.container) {
        $(_this9.options.container).append(_this9.dropdownEl);
      } else {
        _this9.$el.after(_this9.dropdownEl);
      }

      _this9._makeDropdownFocusable();
      _this9._resetFilterQueryBound = _this9._resetFilterQuery.bind(_this9);
      _this9._handleDocumentClickBound = _this9._handleDocumentClick.bind(_this9);
      _this9._handleDocumentTouchmoveBound = _this9._handleDocumentTouchmove.bind(_this9);
      _this9._handleDropdownClickBound = _this9._handleDropdownClick.bind(_this9);
      _this9._handleDropdownKeydownBound = _this9._handleDropdownKeydown.bind(_this9);
      _this9._handleTriggerKeydownBound = _this9._handleTriggerKeydown.bind(_this9);
      _this9._setupEventHandlers();
      return _this9;
    }

    _createClass(Dropdown, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._resetDropdownStyles();
        this._removeEventHandlers();
        Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
        this.el.M_Dropdown = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        // Trigger keydown handler
        this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

        // Item click handler
        this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

        // Hover event handlers
        if (this.options.hover) {
          this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
          this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
          this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
          this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

          // Click event handlers
        } else {
          this._handleClickBound = this._handleClick.bind(this);
          this.el.addEventListener('click', this._handleClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
        this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

        if (this.options.hover) {
          this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
          this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        } else {
          this.el.removeEventListener('click', this._handleClickBound);
        }
      }
    }, {
      key: "_setupTemporaryEventHandlers",
      value: function _setupTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
        document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_removeTemporaryEventHandlers",
      value: function _removeTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
        document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(e) {
        e.preventDefault();
        this.open();
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.open();
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave(e) {
        var toEl = e.toElement || e.relatedTarget;
        var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
        var leaveToActiveDropdownTrigger = false;

        var $closestTrigger = $(toEl).closest('.dropdown-trigger');
        if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
          leaveToActiveDropdownTrigger = true;
        }

        // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
        if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
          this.close();
        }
      }
    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        var _this10 = this;

        var $target = $(e.target);
        if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
          // isTouchMoving to check if scrolling on mobile.
          setTimeout(function () {
            _this10.close();
          }, 0);
        } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
          setTimeout(function () {
            _this10.close();
          }, 0);
        }
        this.isTouchMoving = false;
      }
    }, {
      key: "_handleTriggerKeydown",
      value: function _handleTriggerKeydown(e) {
        // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
        if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      }

      /**
       * Handle Document Touchmove
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentTouchmove",
      value: function _handleDocumentTouchmove(e) {
        var $target = $(e.target);
        if ($target.closest('.dropdown-content').length) {
          this.isTouchMoving = true;
        }
      }

      /**
       * Handle Dropdown Click
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownClick",
      value: function _handleDropdownClick(e) {
        // onItemClick callback
        if (typeof this.options.onItemClick === 'function') {
          var itemEl = $(e.target).closest('li')[0];
          this.options.onItemClick.call(this, itemEl);
        }
      }

      /**
       * Handle Dropdown Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownKeydown",
      value: function _handleDropdownKeydown(e) {
        if (e.which === M.keys.TAB) {
          e.preventDefault();
          this.close();

          // Navigate down dropdown list
        } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
          e.preventDefault();
          var direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
          var newFocusedIndex = this.focusedIndex;
          var foundNewIndex = false;
          do {
            newFocusedIndex = newFocusedIndex + direction;

            if (!!this.dropdownEl.children[newFocusedIndex] && this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
              foundNewIndex = true;
              break;
            }
          } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

          if (foundNewIndex) {
            this.focusedIndex = newFocusedIndex;
            this._focusFocusedItem();
          }

          // ENTER selects choice on focused item
        } else if (e.which === M.keys.ENTER && this.isOpen) {
          // Search for <a> and <button>
          var focusedElement = this.dropdownEl.children[this.focusedIndex];
          var $activatableElement = $(focusedElement).find('a, button').first();

          // Click a or button tag if exists, otherwise click li tag
          if (!!$activatableElement.length) {
            $activatableElement[0].click();
          } else if (!!focusedElement) {
            focusedElement.click();
          }

          // Close dropdown on ESC
        } else if (e.which === M.keys.ESC && this.isOpen) {
          e.preventDefault();
          this.close();
        }

        // CASE WHEN USER TYPE LETTERS
        var letter = String.fromCharCode(e.which).toLowerCase(),
            nonLetters = [9, 13, 27, 38, 40];
        if (letter && nonLetters.indexOf(e.which) === -1) {
          this.filterQuery.push(letter);

          var string = this.filterQuery.join(''),
              newOptionEl = $(this.dropdownEl).find('li').filter(function (el) {
            return $(el).text().toLowerCase().indexOf(string) === 0;
          })[0];

          if (newOptionEl) {
            this.focusedIndex = $(newOptionEl).index();
            this._focusFocusedItem();
          }
        }

        this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_resetFilterQuery",
      value: function _resetFilterQuery() {
        this.filterQuery = [];
      }
    }, {
      key: "_resetDropdownStyles",
      value: function _resetDropdownStyles() {
        this.$dropdownEl.css({
          display: '',
          width: '',
          height: '',
          left: '',
          top: '',
          'transform-origin': '',
          transform: '',
          opacity: ''
        });
      }
    }, {
      key: "_makeDropdownFocusable",
      value: function _makeDropdownFocusable() {
        // Needed for arrow key navigation
        this.dropdownEl.tabIndex = 0;

        // Only set tabindex if it hasn't been set by user
        $(this.dropdownEl).children().each(function (el) {
          if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', 0);
          }
        });
      }
    }, {
      key: "_focusFocusedItem",
      value: function _focusFocusedItem() {
        if (this.focusedIndex >= 0 && this.focusedIndex < this.dropdownEl.children.length && this.options.autoFocus) {
          this.dropdownEl.children[this.focusedIndex].focus();
        }
      }
    }, {
      key: "_getDropdownPosition",
      value: function _getDropdownPosition() {
        var offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
        var triggerBRect = this.el.getBoundingClientRect();
        var dropdownBRect = this.dropdownEl.getBoundingClientRect();

        var idealHeight = dropdownBRect.height;
        var idealWidth = dropdownBRect.width;
        var idealXPos = triggerBRect.left - dropdownBRect.left;
        var idealYPos = triggerBRect.top - dropdownBRect.top;

        var dropdownBounds = {
          left: idealXPos,
          top: idealYPos,
          height: idealHeight,
          width: idealWidth
        };

        // Countainer here will be closest ancestor with overflow: hidden
        var closestOverflowParent = !!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode;

        var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

        var verticalAlignment = 'top';
        var horizontalAlignment = this.options.alignment;
        idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

        // Reset isScrollable
        this.isScrollable = false;

        if (!alignments.top) {
          if (alignments.bottom) {
            verticalAlignment = 'bottom';
          } else {
            this.isScrollable = true;

            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnTop > alignments.spaceOnBottom) {
              verticalAlignment = 'bottom';
              idealHeight += alignments.spaceOnTop;
              idealYPos -= alignments.spaceOnTop;
            } else {
              idealHeight += alignments.spaceOnBottom;
            }
          }
        }

        // If preferred horizontal alignment is possible
        if (!alignments[horizontalAlignment]) {
          var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
          if (alignments[oppositeAlignment]) {
            horizontalAlignment = oppositeAlignment;
          } else {
            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnLeft > alignments.spaceOnRight) {
              horizontalAlignment = 'right';
              idealWidth += alignments.spaceOnLeft;
              idealXPos -= alignments.spaceOnLeft;
            } else {
              horizontalAlignment = 'left';
              idealWidth += alignments.spaceOnRight;
            }
          }
        }

        if (verticalAlignment === 'bottom') {
          idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
        }
        if (horizontalAlignment === 'right') {
          idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
        }
        return {
          x: idealXPos,
          y: idealYPos,
          verticalAlignment: verticalAlignment,
          horizontalAlignment: horizontalAlignment,
          height: idealHeight,
          width: idealWidth
        };
      }

      /**
       * Animate in dropdown
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this11 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: [0, 1],
            easing: 'easeOutQuad'
          },
          scaleX: [0.3, 1],
          scaleY: [0.3, 1],
          duration: this.options.inDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            if (_this11.options.autoFocus) {
              _this11.dropdownEl.focus();
            }

            // onOpenEnd callback
            if (typeof _this11.options.onOpenEnd === 'function') {
              _this11.options.onOpenEnd.call(_this11, _this11.el);
            }
          }
        });
      }

      /**
       * Animate out dropdown
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this12 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: 0,
            easing: 'easeOutQuint'
          },
          scaleX: 0.3,
          scaleY: 0.3,
          duration: this.options.outDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            _this12._resetDropdownStyles();

            // onCloseEnd callback
            if (typeof _this12.options.onCloseEnd === 'function') {
              _this12.options.onCloseEnd.call(_this12, _this12.el);
            }
          }
        });
      }

      /**
       * Place dropdown
       */

    }, {
      key: "_placeDropdown",
      value: function _placeDropdown() {
        // Set width before calculating positionInfo
        var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
        this.dropdownEl.style.width = idealWidth + 'px';

        var positionInfo = this._getDropdownPosition();
        this.dropdownEl.style.left = positionInfo.x + 'px';
        this.dropdownEl.style.top = positionInfo.y + 'px';
        this.dropdownEl.style.height = positionInfo.height + 'px';
        this.dropdownEl.style.width = positionInfo.width + 'px';
        this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
      }

      /**
       * Open Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }
        this.isOpen = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Reset styles
        this._resetDropdownStyles();
        this.dropdownEl.style.display = 'block';

        this._placeDropdown();
        this._animateIn();
        this._setupTemporaryEventHandlers();
      }

      /**
       * Close Dropdown
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }
        this.isOpen = false;
        this.focusedIndex = -1;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this._animateOut();
        this._removeTemporaryEventHandlers();

        if (this.options.autoFocus) {
          this.el.focus();
        }
      }

      /**
       * Recalculate dimensions
       */

    }, {
      key: "recalculateDimensions",
      value: function recalculateDimensions() {
        if (this.isOpen) {
          this.$dropdownEl.css({
            width: '',
            height: '',
            left: '',
            top: '',
            'transform-origin': ''
          });
          this._placeDropdown();
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Dropdown;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Dropdown;
  }(Component);

  /**
   * @static
   * @memberof Dropdown
   */


  Dropdown._dropdowns = [];

  M.Dropdown = Dropdown;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };

  /**
   * @class
   *
   */

  var Modal = function (_Component3) {
    _inherits(Modal, _Component3);

    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Modal(el, options) {
      _classCallCheck(this, Modal);

      var _this13 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, Modal, el, options));

      _this13.el.M_Modal = _this13;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      _this13.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      _this13.isOpen = false;

      _this13.id = _this13.$el.attr('id');
      _this13._openingTrigger = undefined;
      _this13.$overlay = $('<div class="modal-overlay"></div>');
      _this13.el.tabIndex = 0;
      _this13._nthModalOpened = 0;

      Modal._count++;
      _this13._setupEventHandlers();
      return _this13;
    }

    _createClass(Modal, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Modal._count--;
        this._removeEventHandlers();
        this.el.removeAttribute('style');
        this.$overlay.remove();
        this.el.M_Modal = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
        this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

        if (Modal._count === 1) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
        this.el.addEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Modal._count === 0) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
        this.el.removeEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.modal-trigger');
        if ($trigger.length) {
          var modalId = M.getIdFromTrigger($trigger[0]);
          var modalInstance = document.getElementById(modalId).M_Modal;
          if (modalInstance) {
            modalInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Handle Overlay Click
       */

    }, {
      key: "_handleOverlayClick",
      value: function _handleOverlayClick() {
        if (this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Modal Close Click
       * @param {Event} e
       */

    }, {
      key: "_handleModalCloseClick",
      value: function _handleModalCloseClick(e) {
        var $closeTrigger = $(e.target).closest('.modal-close');
        if ($closeTrigger.length) {
          this.close();
        }
      }

      /**
       * Handle Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleKeydown",
      value: function _handleKeydown(e) {
        // ESC key
        if (e.keyCode === 27 && this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Focus
       * @param {Event} e
       */

    }, {
      key: "_handleFocus",
      value: function _handleFocus(e) {
        // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
        if (!this.el.contains(e.target) && this._nthModalOpened === Modal._modalsOpen) {
          this.el.focus();
        }
      }

      /**
       * Animate in modal
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this14 = this;

        // Set initial styles
        $.extend(this.el.style, {
          display: 'block',
          opacity: 0
        });
        $.extend(this.$overlay[0].style, {
          display: 'block',
          opacity: 0
        });

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: this.options.opacity,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Define modal animation options
        var enterAnimOptions = {
          targets: this.el,
          duration: this.options.inDuration,
          easing: 'easeOutCubic',
          // Handle modal onOpenEnd callback
          complete: function () {
            if (typeof _this14.options.onOpenEnd === 'function') {
              _this14.options.onOpenEnd.call(_this14, _this14.el, _this14._openingTrigger);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(enterAnimOptions, {
            bottom: 0,
            opacity: 1
          });
          anim(enterAnimOptions);

          // Normal modal animation
        } else {
          $.extend(enterAnimOptions, {
            top: [this.options.startingTop, this.options.endingTop],
            opacity: 1,
            scaleX: [0.8, 1],
            scaleY: [0.8, 1]
          });
          anim(enterAnimOptions);
        }
      }

      /**
       * Animate out modal
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this15 = this;

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuart'
        });

        // Define modal animation options
        var exitAnimOptions = {
          targets: this.el,
          duration: this.options.outDuration,
          easing: 'easeOutCubic',
          // Handle modal ready callback
          complete: function () {
            _this15.el.style.display = 'none';
            _this15.$overlay.remove();

            // Call onCloseEnd callback
            if (typeof _this15.options.onCloseEnd === 'function') {
              _this15.options.onCloseEnd.call(_this15, _this15.el);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(exitAnimOptions, {
            bottom: '-100%',
            opacity: 0
          });
          anim(exitAnimOptions);

          // Normal modal animation
        } else {
          $.extend(exitAnimOptions, {
            top: [this.options.endingTop, this.options.startingTop],
            opacity: 0,
            scaleX: 0.8,
            scaleY: 0.8
          });
          anim(exitAnimOptions);
        }
      }

      /**
       * Open Modal
       * @param {cash} [$trigger]
       */

    }, {
      key: "open",
      value: function open($trigger) {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        Modal._modalsOpen++;
        this._nthModalOpened = Modal._modalsOpen;

        // Set Z-Index based on number of currently open modals
        this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
        this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

        // Set opening trigger, undefined indicates modal was opened by javascript
        this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el, this._openingTrigger);
        }

        if (this.options.preventScrolling) {
          document.body.style.overflow = 'hidden';
        }

        this.el.classList.add('open');
        this.el.insertAdjacentElement('afterend', this.$overlay[0]);

        if (this.options.dismissible) {
          this._handleKeydownBound = this._handleKeydown.bind(this);
          this._handleFocusBound = this._handleFocus.bind(this);
          document.addEventListener('keydown', this._handleKeydownBound);
          document.addEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateIn();

        // Focus modal
        this.el.focus();

        return this;
      }

      /**
       * Close Modal
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        Modal._modalsOpen--;
        this._nthModalOpened = 0;

        // Call onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this.el.classList.remove('open');

        // Enable body scrolling only if there are no more modals open.
        if (Modal._modalsOpen === 0) {
          document.body.style.overflow = '';
        }

        if (this.options.dismissible) {
          document.removeEventListener('keydown', this._handleKeydownBound);
          document.removeEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateOut();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Modal.__proto__ || Object.getPrototypeOf(Modal), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Modal;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Modal;
  }(Component);

  /**
   * @static
   * @memberof Modal
   */


  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */

  var Materialbox = function (_Component4) {
    _inherits(Materialbox, _Component4);

    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Materialbox(el, options) {
      _classCallCheck(this, Materialbox);

      var _this16 = _possibleConstructorReturn(this, (Materialbox.__proto__ || Object.getPrototypeOf(Materialbox)).call(this, Materialbox, el, options));

      _this16.el.M_Materialbox = _this16;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      _this16.options = $.extend({}, Materialbox.defaults, options);

      _this16.overlayActive = false;
      _this16.doneAnimating = true;
      _this16.placeholder = $('<div></div>').addClass('material-placeholder');
      _this16.originalWidth = 0;
      _this16.originalHeight = 0;
      _this16.originInlineStyles = _this16.$el.attr('style');
      _this16.caption = _this16.el.getAttribute('data-caption') || '';

      // Wrap
      _this16.$el.before(_this16.placeholder);
      _this16.placeholder.append(_this16.$el);

      _this16._setupEventHandlers();
      return _this16;
    }

    _createClass(Materialbox, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Materialbox = undefined;

        // Unwrap image
        $(this.placeholder).after(this.el).remove();

        this.$el.removeAttr('style');
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
        this.el.addEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Handle Materialbox Click
       * @param {Event} e
       */

    }, {
      key: "_handleMaterialboxClick",
      value: function _handleMaterialboxClick(e) {
        // If already modal, return to original
        if (this.doneAnimating === false || this.overlayActive && this.doneAnimating) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       * @param {Event} e
       */

    }, {
      key: "_handleWindowEscape",
      value: function _handleWindowEscape(e) {
        // ESC key
        if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
          this.close();
        }
      }

      /**
       * Find ancestors with overflow: hidden; and make visible
       */

    }, {
      key: "_makeAncestorsOverflowVisible",
      value: function _makeAncestorsOverflowVisible() {
        this.ancestorsChanged = $();
        var ancestor = this.placeholder[0].parentNode;
        while (ancestor !== null && !$(ancestor).is(document)) {
          var curr = $(ancestor);
          if (curr.css('overflow') !== 'visible') {
            curr.css('overflow', 'visible');
            if (this.ancestorsChanged === undefined) {
              this.ancestorsChanged = curr;
            } else {
              this.ancestorsChanged = this.ancestorsChanged.add(curr);
            }
          }
          ancestor = ancestor.parentNode;
        }
      }

      /**
       * Animate image in
       */

    }, {
      key: "_animateImageIn",
      value: function _animateImageIn() {
        var _this17 = this;

        var animOptions = {
          targets: this.el,
          height: [this.originalHeight, this.newHeight],
          width: [this.originalWidth, this.newWidth],
          left: M.getDocumentScrollLeft() + this.windowWidth / 2 - this.placeholder.offset().left - this.newWidth / 2,
          top: M.getDocumentScrollTop() + this.windowHeight / 2 - this.placeholder.offset().top - this.newHeight / 2,
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this17.doneAnimating = true;

            // onOpenEnd callback
            if (typeof _this17.options.onOpenEnd === 'function') {
              _this17.options.onOpenEnd.call(_this17, _this17.el);
            }
          }
        };

        // Override max-width or max-height if needed
        this.maxWidth = this.$el.css('max-width');
        this.maxHeight = this.$el.css('max-height');
        if (this.maxWidth !== 'none') {
          animOptions.maxWidth = this.newWidth;
        }
        if (this.maxHeight !== 'none') {
          animOptions.maxHeight = this.newHeight;
        }

        anim(animOptions);
      }

      /**
       * Animate image out
       */

    }, {
      key: "_animateImageOut",
      value: function _animateImageOut() {
        var _this18 = this;

        var animOptions = {
          targets: this.el,
          width: this.originalWidth,
          height: this.originalHeight,
          left: 0,
          top: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this18.placeholder.css({
              height: '',
              width: '',
              position: '',
              top: '',
              left: ''
            });

            // Revert to width or height attribute
            if (_this18.attrWidth) {
              _this18.$el.attr('width', _this18.attrWidth);
            }
            if (_this18.attrHeight) {
              _this18.$el.attr('height', _this18.attrHeight);
            }

            _this18.$el.removeAttr('style');
            _this18.originInlineStyles && _this18.$el.attr('style', _this18.originInlineStyles);

            // Remove class
            _this18.$el.removeClass('active');
            _this18.doneAnimating = true;

            // Remove overflow overrides on ancestors
            if (_this18.ancestorsChanged.length) {
              _this18.ancestorsChanged.css('overflow', '');
            }

            // onCloseEnd callback
            if (typeof _this18.options.onCloseEnd === 'function') {
              _this18.options.onCloseEnd.call(_this18, _this18.el);
            }
          }
        };

        anim(animOptions);
      }

      /**
       * Update open and close vars
       */

    }, {
      key: "_updateVars",
      value: function _updateVars() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.caption = this.el.getAttribute('data-caption') || '';
      }

      /**
       * Open Materialbox
       */

    }, {
      key: "open",
      value: function open() {
        var _this19 = this;

        this._updateVars();
        this.originalWidth = this.el.getBoundingClientRect().width;
        this.originalHeight = this.el.getBoundingClientRect().height;

        // Set states
        this.doneAnimating = false;
        this.$el.addClass('active');
        this.overlayActive = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Set positioning for placeholder
        this.placeholder.css({
          width: this.placeholder[0].getBoundingClientRect().width + 'px',
          height: this.placeholder[0].getBoundingClientRect().height + 'px',
          position: 'relative',
          top: 0,
          left: 0
        });

        this._makeAncestorsOverflowVisible();

        // Set css on origin
        this.$el.css({
          position: 'absolute',
          'z-index': 1000,
          'will-change': 'left, top, width, height'
        });

        // Change from width or height attribute to css
        this.attrWidth = this.$el.attr('width');
        this.attrHeight = this.$el.attr('height');
        if (this.attrWidth) {
          this.$el.css('width', this.attrWidth + 'px');
          this.$el.removeAttr('width');
        }
        if (this.attrHeight) {
          this.$el.css('width', this.attrHeight + 'px');
          this.$el.removeAttr('height');
        }

        // Add overlay
        this.$overlay = $('<div id="materialbox-overlay"></div>').css({
          opacity: 0
        }).one('click', function () {
          if (_this19.doneAnimating) {
            _this19.close();
          }
        });

        // Put before in origin image to preserve z-index layering.
        this.$el.before(this.$overlay);

        // Set dimensions if needed
        var overlayOffset = this.$overlay[0].getBoundingClientRect();
        this.$overlay.css({
          width: this.windowWidth + 'px',
          height: this.windowHeight + 'px',
          left: -1 * overlayOffset.left + 'px',
          top: -1 * overlayOffset.top + 'px'
        });

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        // Animate Overlay
        anim({
          targets: this.$overlay[0],
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Add and animate caption if it exists
        if (this.caption !== '') {
          if (this.$photocaption) {
            anim.remove(this.$photoCaption[0]);
          }
          this.$photoCaption = $('<div class="materialbox-caption"></div>');
          this.$photoCaption.text(this.caption);
          $('body').append(this.$photoCaption);
          this.$photoCaption.css({ display: 'inline' });

          anim({
            targets: this.$photoCaption[0],
            opacity: 1,
            duration: this.options.inDuration,
            easing: 'easeOutQuad'
          });
        }

        // Resize Image
        var ratio = 0;
        var widthPercent = this.originalWidth / this.windowWidth;
        var heightPercent = this.originalHeight / this.windowHeight;
        this.newWidth = 0;
        this.newHeight = 0;

        if (widthPercent > heightPercent) {
          ratio = this.originalHeight / this.originalWidth;
          this.newWidth = this.windowWidth * 0.9;
          this.newHeight = this.windowWidth * 0.9 * ratio;
        } else {
          ratio = this.originalWidth / this.originalHeight;
          this.newWidth = this.windowHeight * 0.9 * ratio;
          this.newHeight = this.windowHeight * 0.9;
        }

        this._animateImageIn();

        // Handle Exit triggers
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

        window.addEventListener('scroll', this._handleWindowScrollBound);
        window.addEventListener('resize', this._handleWindowResizeBound);
        window.addEventListener('keyup', this._handleWindowEscapeBound);
      }

      /**
       * Close Materialbox
       */

    }, {
      key: "close",
      value: function close() {
        var _this20 = this;

        this._updateVars();
        this.doneAnimating = false;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        if (this.caption !== '') {
          anim.remove(this.$photoCaption[0]);
        }

        // disable exit handlers
        window.removeEventListener('scroll', this._handleWindowScrollBound);
        window.removeEventListener('resize', this._handleWindowResizeBound);
        window.removeEventListener('keyup', this._handleWindowEscapeBound);

        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this20.overlayActive = false;
            _this20.$overlay.remove();
          }
        });

        this._animateImageOut();

        // Remove Caption + reset css settings on image
        if (this.caption !== '') {
          anim({
            targets: this.$photoCaption[0],
            opacity: 0,
            duration: this.options.outDuration,
            easing: 'easeOutQuad',
            complete: function () {
              _this20.$photoCaption.remove();
            }
          });
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Materialbox.__proto__ || Object.getPrototypeOf(Materialbox), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Materialbox;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Materialbox;
  }(Component);

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    responsiveThreshold: 0 // breakpoint for swipeable
  };

  var Parallax = function (_Component5) {
    _inherits(Parallax, _Component5);

    function Parallax(el, options) {
      _classCallCheck(this, Parallax);

      var _this21 = _possibleConstructorReturn(this, (Parallax.__proto__ || Object.getPrototypeOf(Parallax)).call(this, Parallax, el, options));

      _this21.el.M_Parallax = _this21;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      _this21.options = $.extend({}, Parallax.defaults, options);
      _this21._enabled = window.innerWidth > _this21.options.responsiveThreshold;

      _this21.$img = _this21.$el.find('img').first();
      _this21.$img.each(function () {
        var el = this;
        if (el.complete) $(el).trigger('load');
      });

      _this21._updateParallax();
      _this21._setupEventHandlers();
      _this21._setupStyles();

      Parallax._parallaxes.push(_this21);
      return _this21;
    }

    _createClass(Parallax, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
        this.$img[0].style.transform = '';
        this._removeEventHandlers();

        this.$el[0].M_Parallax = undefined;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleImageLoadBound = this._handleImageLoad.bind(this);
        this.$img[0].addEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
          window.addEventListener('scroll', Parallax._handleScrollThrottled);

          Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
          window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.$img[0].removeEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          window.removeEventListener('scroll', Parallax._handleScrollThrottled);
          window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_setupStyles",
      value: function _setupStyles() {
        this.$img[0].style.opacity = 1;
      }
    }, {
      key: "_handleImageLoad",
      value: function _handleImageLoad() {
        this._updateParallax();
      }
    }, {
      key: "_updateParallax",
      value: function _updateParallax() {
        var containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
        var imgHeight = this.$img[0].offsetHeight;
        var parallaxDist = imgHeight - containerHeight;
        var bottom = this.$el.offset().top + containerHeight;
        var top = this.$el.offset().top;
        var scrollTop = M.getDocumentScrollTop();
        var windowHeight = window.innerHeight;
        var windowBottom = scrollTop + windowHeight;
        var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
        var parallax = parallaxDist * percentScrolled;

        if (!this._enabled) {
          this.$img[0].style.transform = '';
        } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
          this.$img[0].style.transform = "translate3D(-50%, " + parallax + "px, 0)";
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Parallax.__proto__ || Object.getPrototypeOf(Parallax), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Parallax;
      }
    }, {
      key: "_handleScroll",
      value: function _handleScroll() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._updateParallax.call(parallaxInstance);
        }
      }
    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Parallax;
  }(Component);

  /**
   * @static
   * @memberof Parallax
   */


  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  /**
   * @class
   *
   */

  var Tabs = function (_Component6) {
    _inherits(Tabs, _Component6);

    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tabs(el, options) {
      _classCallCheck(this, Tabs);

      var _this22 = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, Tabs, el, options));

      _this22.el.M_Tabs = _this22;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      _this22.options = $.extend({}, Tabs.defaults, options);

      // Setup
      _this22.$tabLinks = _this22.$el.children('li.tab').children('a');
      _this22.index = 0;
      _this22._setupActiveTabLink();

      // Setup tabs content
      if (_this22.options.swipeable) {
        _this22._setupSwipeableTabs();
      } else {
        _this22._setupNormalTabs();
      }

      // Setup tabs indicator after content to ensure accurate widths
      _this22._setTabsAndTabWidth();
      _this22._createIndicator();

      _this22._setupEventHandlers();
      return _this22;
    }

    _createClass(Tabs, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._indicator.parentNode.removeChild(this._indicator);

        if (this.options.swipeable) {
          this._teardownSwipeableTabs();
        } else {
          this._teardownNormalTabs();
        }

        this.$el[0].M_Tabs = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);

        this._handleTabClickBound = this._handleTabClick.bind(this);
        this.el.addEventListener('click', this._handleTabClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        window.removeEventListener('resize', this._handleWindowResizeBound);
        this.el.removeEventListener('click', this._handleTabClickBound);
      }

      /**
       * Handle window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        this._setTabsAndTabWidth();

        if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
          this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
          this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
        }
      }

      /**
       * Handle tab click
       * @param {Event} e
       */

    }, {
      key: "_handleTabClick",
      value: function _handleTabClick(e) {
        var _this23 = this;

        var tab = $(e.target).closest('li.tab');
        var tabLink = $(e.target).closest('a');

        // Handle click on tab link only
        if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
          return;
        }

        if (tab.hasClass('disabled')) {
          e.preventDefault();
          return;
        }

        // Act as regular link if target attribute is specified.
        if (!!tabLink.attr('target')) {
          return;
        }

        // Make the old tab inactive.
        this.$activeTabLink.removeClass('active');
        var $oldContent = this.$content;

        // Update the variables with the new link and content
        this.$activeTabLink = tabLink;
        this.$content = $(M.escapeHash(tabLink[0].hash));
        this.$tabLinks = this.$el.children('li.tab').children('a');

        // Make the tab active.
        this.$activeTabLink.addClass('active');
        var prevIndex = this.index;
        this.index = Math.max(this.$tabLinks.index(tabLink), 0);

        // Swap content
        if (this.options.swipeable) {
          if (this._tabsCarousel) {
            this._tabsCarousel.set(this.index, function () {
              if (typeof _this23.options.onShow === 'function') {
                _this23.options.onShow.call(_this23, _this23.$content[0]);
              }
            });
          }
        } else {
          if (this.$content.length) {
            this.$content[0].style.display = 'block';
            this.$content.addClass('active');
            if (typeof this.options.onShow === 'function') {
              this.options.onShow.call(this, this.$content[0]);
            }

            if ($oldContent.length && !$oldContent.is(this.$content)) {
              $oldContent[0].style.display = 'none';
              $oldContent.removeClass('active');
            }
          }
        }

        // Update widths after content is swapped (scrollbar bugfix)
        this._setTabsAndTabWidth();

        // Update indicator
        this._animateIndicator(prevIndex);

        // Prevent the anchor's default click action
        e.preventDefault();
      }

      /**
       * Generate elements for tab indicator.
       */

    }, {
      key: "_createIndicator",
      value: function _createIndicator() {
        var _this24 = this;

        var indicator = document.createElement('li');
        indicator.classList.add('indicator');

        this.el.appendChild(indicator);
        this._indicator = indicator;

        setTimeout(function () {
          _this24._indicator.style.left = _this24._calcLeftPos(_this24.$activeTabLink) + 'px';
          _this24._indicator.style.right = _this24._calcRightPos(_this24.$activeTabLink) + 'px';
        }, 0);
      }

      /**
       * Setup first active tab link.
       */

    }, {
      key: "_setupActiveTabLink",
      value: function _setupActiveTabLink() {
        // If the location.hash matches one of the links, use that as the active tab.
        this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

        // If no match is found, use the first link or any with class 'active' as the initial active tab.
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
        }
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a').first();
        }

        this.$tabLinks.removeClass('active');
        this.$activeTabLink[0].classList.add('active');

        this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

        if (this.$activeTabLink.length) {
          this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
          this.$content.addClass('active');
        }
      }

      /**
       * Setup swipeable tabs
       */

    }, {
      key: "_setupSwipeableTabs",
      value: function _setupSwipeableTabs() {
        var _this25 = this;

        // Change swipeable according to responsive threshold
        if (window.innerWidth > this.options.responsiveThreshold) {
          this.options.swipeable = false;
        }

        var $tabsContent = $();
        this.$tabLinks.each(function (link) {
          var $currContent = $(M.escapeHash(link.hash));
          $currContent.addClass('carousel-item');
          $tabsContent = $tabsContent.add($currContent);
        });

        var $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
        $tabsContent.first().before($tabsWrapper);
        $tabsWrapper.append($tabsContent);
        $tabsContent[0].style.display = '';

        // Keep active tab index to set initial carousel slide
        var activeTabIndex = this.$activeTabLink.closest('.tab').index();

        this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
          fullWidth: true,
          noWrap: true,
          onCycleTo: function (item) {
            var prevIndex = _this25.index;
            _this25.index = $(item).index();
            _this25.$activeTabLink.removeClass('active');
            _this25.$activeTabLink = _this25.$tabLinks.eq(_this25.index);
            _this25.$activeTabLink.addClass('active');
            _this25._animateIndicator(prevIndex);
            if (typeof _this25.options.onShow === 'function') {
              _this25.options.onShow.call(_this25, _this25.$content[0]);
            }
          }
        });

        // Set initial carousel slide to active tab
        this._tabsCarousel.set(activeTabIndex);
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownSwipeableTabs",
      value: function _teardownSwipeableTabs() {
        var $tabsWrapper = this._tabsCarousel.$el;
        this._tabsCarousel.destroy();

        // Unwrap
        $tabsWrapper.after($tabsWrapper.children());
        $tabsWrapper.remove();
      }

      /**
       * Setup normal tabs.
       */

    }, {
      key: "_setupNormalTabs",
      value: function _setupNormalTabs() {
        // Hide Tabs Content
        this.$tabLinks.not(this.$activeTabLink).each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = 'none';
            }
          }
        });
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownNormalTabs",
      value: function _teardownNormalTabs() {
        // show Tabs Content
        this.$tabLinks.each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = '';
            }
          }
        });
      }

      /**
       * set tabs and tab width
       */

    }, {
      key: "_setTabsAndTabWidth",
      value: function _setTabsAndTabWidth() {
        this.tabsWidth = this.$el.width();
        this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
      }

      /**
       * Finds right attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcRightPos",
      value: function _calcRightPos(el) {
        return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
      }

      /**
       * Finds left attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcLeftPos",
      value: function _calcLeftPos(el) {
        return Math.floor(el.position().left);
      }
    }, {
      key: "updateTabIndicator",
      value: function updateTabIndicator() {
        this._setTabsAndTabWidth();
        this._animateIndicator(this.index);
      }

      /**
       * Animates Indicator to active tab.
       * @param {Number} prevIndex
       */

    }, {
      key: "_animateIndicator",
      value: function _animateIndicator(prevIndex) {
        var leftDelay = 0,
            rightDelay = 0;

        if (this.index - prevIndex >= 0) {
          leftDelay = 90;
        } else {
          rightDelay = 90;
        }

        // Animate
        var animOptions = {
          targets: this._indicator,
          left: {
            value: this._calcLeftPos(this.$activeTabLink),
            delay: leftDelay
          },
          right: {
            value: this._calcRightPos(this.$activeTabLink),
            delay: rightDelay
          },
          duration: this.options.duration,
          easing: 'easeOutQuad'
        };
        anim.remove(this._indicator);
        anim(animOptions);
      }

      /**
       * Select tab.
       * @param {String} tabId
       */

    }, {
      key: "select",
      value: function select(tabId) {
        var tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
        if (tab.length) {
          tab.trigger('click');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tabs.__proto__ || Object.getPrototypeOf(Tabs), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tabs;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tabs;
  }(Component);

  M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };

  /**
   * @class
   *
   */

  var Tooltip = function (_Component7) {
    _inherits(Tooltip, _Component7);

    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tooltip(el, options) {
      _classCallCheck(this, Tooltip);

      var _this26 = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, Tooltip, el, options));

      _this26.el.M_Tooltip = _this26;
      _this26.options = $.extend({}, Tooltip.defaults, options);

      _this26.isOpen = false;
      _this26.isHovered = false;
      _this26.isFocused = false;
      _this26._appendTooltipEl();
      _this26._setupEventHandlers();
      return _this26;
    }

    _createClass(Tooltip, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        $(this.tooltipEl).remove();
        this._removeEventHandlers();
        this.el.M_Tooltip = undefined;
      }
    }, {
      key: "_appendTooltipEl",
      value: function _appendTooltipEl() {
        var tooltipEl = document.createElement('div');
        tooltipEl.classList.add('material-tooltip');
        this.tooltipEl = tooltipEl;

        var tooltipContentEl = document.createElement('div');
        tooltipContentEl.classList.add('tooltip-content');
        tooltipContentEl.innerHTML = this.options.html;
        tooltipEl.appendChild(tooltipContentEl);
        document.body.appendChild(tooltipEl);
      }
    }, {
      key: "_updateTooltipContent",
      value: function _updateTooltipContent() {
        this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        this._handleBlurBound = this._handleBlur.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.addEventListener('focus', this._handleFocusBound, true);
        this.el.addEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.removeEventListener('focus', this._handleFocusBound, true);
        this.el.removeEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "open",
      value: function open(isManual) {
        if (this.isOpen) {
          return;
        }
        isManual = isManual === undefined ? true : undefined; // Default value true
        this.isOpen = true;
        // Update tooltip content with HTML attribute options
        this.options = $.extend({}, this.options, this._getAttributeOptions());
        this._updateTooltipContent();
        this._setEnterDelayTimeout(isManual);
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isHovered = false;
        this.isFocused = false;
        this.isOpen = false;
        this._setExitDelayTimeout();
      }

      /**
       * Create timeout which delays when the tooltip closes
       */

    }, {
      key: "_setExitDelayTimeout",
      value: function _setExitDelayTimeout() {
        var _this27 = this;

        clearTimeout(this._exitDelayTimeout);

        this._exitDelayTimeout = setTimeout(function () {
          if (_this27.isHovered || _this27.isFocused) {
            return;
          }

          _this27._animateOut();
        }, this.options.exitDelay);
      }

      /**
       * Create timeout which delays when the toast closes
       */

    }, {
      key: "_setEnterDelayTimeout",
      value: function _setEnterDelayTimeout(isManual) {
        var _this28 = this;

        clearTimeout(this._enterDelayTimeout);

        this._enterDelayTimeout = setTimeout(function () {
          if (!_this28.isHovered && !_this28.isFocused && !isManual) {
            return;
          }

          _this28._animateIn();
        }, this.options.enterDelay);
      }
    }, {
      key: "_positionTooltip",
      value: function _positionTooltip() {
        var origin = this.el,
            tooltip = this.tooltipEl,
            originHeight = origin.offsetHeight,
            originWidth = origin.offsetWidth,
            tooltipHeight = tooltip.offsetHeight,
            tooltipWidth = tooltip.offsetWidth,
            newCoordinates = void 0,
            margin = this.options.margin,
            targetTop = void 0,
            targetLeft = void 0;

        this.xMovement = 0, this.yMovement = 0;

        targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
        targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

        if (this.options.position === 'top') {
          targetTop += -tooltipHeight - margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = -this.options.transitionMovement;
        } else if (this.options.position === 'right') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += originWidth + margin;
          this.xMovement = this.options.transitionMovement;
        } else if (this.options.position === 'left') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += -tooltipWidth - margin;
          this.xMovement = -this.options.transitionMovement;
        } else {
          targetTop += originHeight + margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = this.options.transitionMovement;
        }

        newCoordinates = this._repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
        $(tooltip).css({
          top: newCoordinates.y + 'px',
          left: newCoordinates.x + 'px'
        });
      }
    }, {
      key: "_repositionWithinScreen",
      value: function _repositionWithinScreen(x, y, width, height) {
        var scrollLeft = M.getDocumentScrollLeft();
        var scrollTop = M.getDocumentScrollTop();
        var newX = x - scrollLeft;
        var newY = y - scrollTop;

        var bounding = {
          left: newX,
          top: newY,
          width: width,
          height: height
        };

        var offset = this.options.margin + this.options.transitionMovement;
        var edges = M.checkWithinContainer(document.body, bounding, offset);

        if (edges.left) {
          newX = offset;
        } else if (edges.right) {
          newX -= newX + width - window.innerWidth;
        }

        if (edges.top) {
          newY = offset;
        } else if (edges.bottom) {
          newY -= newY + height - window.innerHeight;
        }

        return {
          x: newX + scrollLeft,
          y: newY + scrollTop
        };
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._positionTooltip();
        this.tooltipEl.style.visibility = 'visible';
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 1,
          translateX: this.xMovement,
          translateY: this.yMovement,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 0,
          translateX: 0,
          translateY: 0,
          duration: this.options.outDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.isHovered = true;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.open(false);
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave() {
        this.isHovered = false;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.close();
      }
    }, {
      key: "_handleFocus",
      value: function _handleFocus() {
        if (M.tabPressed) {
          this.isFocused = true;
          this.open(false);
        }
      }
    }, {
      key: "_handleBlur",
      value: function _handleBlur() {
        this.isFocused = false;
        this.close();
      }
    }, {
      key: "_getAttributeOptions",
      value: function _getAttributeOptions() {
        var attributeOptions = {};
        var tooltipTextOption = this.el.getAttribute('data-tooltip');
        var positionOption = this.el.getAttribute('data-position');

        if (tooltipTextOption) {
          attributeOptions.html = tooltipTextOption;
        }

        if (positionOption) {
          attributeOptions.position = positionOption;
        }
        return attributeOptions;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tooltip.__proto__ || Object.getPrototypeOf(Tooltip), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tooltip;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tooltip;
  }(Component);

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }
})(cash, M.anime);
; /*!
  * Waves v0.6.4
  * http://fian.my.id/Waves
  *
  * Copyright 2014 Alfiana E. Sibuea and other contributors
  * Released under the MIT license
  * https://github.com/fians/Waves/blob/master/LICENSE
  */

;(function (window) {
  'use strict';

  var Waves = Waves || {};
  var $$ = document.querySelectorAll.bind(document);

  // Find exact position of element
  function isWindow(obj) {
    return obj !== null && obj === obj.window;
  }

  function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }

  function offset(elem) {
    var docElem,
        win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    docElem = doc.documentElement;

    if (typeof elem.getBoundingClientRect !== typeof undefined) {
      box = elem.getBoundingClientRect();
    }
    win = getWindow(doc);
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  }

  function convertStyle(obj) {
    var style = '';

    for (var a in obj) {
      if (obj.hasOwnProperty(a)) {
        style += a + ':' + obj[a] + ';';
      }
    }

    return style;
  }

  var Effect = {

    // Effect delay
    duration: 750,

    show: function (e, element) {

      // Disable right click
      if (e.button === 2) {
        return false;
      }

      var el = element || this;

      // Create ripple
      var ripple = document.createElement('div');
      ripple.className = 'waves-ripple';
      el.appendChild(ripple);

      // Get click coordinate and element witdh
      var pos = offset(el);
      var relativeY = e.pageY - pos.top;
      var relativeX = e.pageX - pos.left;
      var scale = 'scale(' + el.clientWidth / 100 * 10 + ')';

      // Support for touch devices
      if ('touches' in e) {
        relativeY = e.touches[0].pageY - pos.top;
        relativeX = e.touches[0].pageX - pos.left;
      }

      // Attach data to element
      ripple.setAttribute('data-hold', Date.now());
      ripple.setAttribute('data-scale', scale);
      ripple.setAttribute('data-x', relativeX);
      ripple.setAttribute('data-y', relativeY);

      // Set ripple position
      var rippleStyle = {
        'top': relativeY + 'px',
        'left': relativeX + 'px'
      };

      ripple.className = ripple.className + ' waves-notransition';
      ripple.setAttribute('style', convertStyle(rippleStyle));
      ripple.className = ripple.className.replace('waves-notransition', '');

      // Scale the ripple
      rippleStyle['-webkit-transform'] = scale;
      rippleStyle['-moz-transform'] = scale;
      rippleStyle['-ms-transform'] = scale;
      rippleStyle['-o-transform'] = scale;
      rippleStyle.transform = scale;
      rippleStyle.opacity = '1';

      rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-moz-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-o-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['transition-duration'] = Effect.duration + 'ms';

      rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-moz-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-o-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

      ripple.setAttribute('style', convertStyle(rippleStyle));
    },

    hide: function (e) {
      TouchHandler.touchup(e);

      var el = this;
      var width = el.clientWidth * 1.4;

      // Get first ripple
      var ripple = null;
      var ripples = el.getElementsByClassName('waves-ripple');
      if (ripples.length > 0) {
        ripple = ripples[ripples.length - 1];
      } else {
        return false;
      }

      var relativeX = ripple.getAttribute('data-x');
      var relativeY = ripple.getAttribute('data-y');
      var scale = ripple.getAttribute('data-scale');

      // Get delay beetween mousedown and mouse leave
      var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
      var delay = 350 - diff;

      if (delay < 0) {
        delay = 0;
      }

      // Fade out ripple after delay
      setTimeout(function () {
        var style = {
          'top': relativeY + 'px',
          'left': relativeX + 'px',
          'opacity': '0',

          // Duration
          '-webkit-transition-duration': Effect.duration + 'ms',
          '-moz-transition-duration': Effect.duration + 'ms',
          '-o-transition-duration': Effect.duration + 'ms',
          'transition-duration': Effect.duration + 'ms',
          '-webkit-transform': scale,
          '-moz-transform': scale,
          '-ms-transform': scale,
          '-o-transform': scale,
          'transform': scale
        };

        ripple.setAttribute('style', convertStyle(style));

        setTimeout(function () {
          try {
            el.removeChild(ripple);
          } catch (e) {
            return false;
          }
        }, Effect.duration);
      }, delay);
    },

    // Little hack to make <input> can perform waves effect
    wrapInput: function (elements) {
      for (var a = 0; a < elements.length; a++) {
        var el = elements[a];

        if (el.tagName.toLowerCase() === 'input') {
          var parent = el.parentNode;

          // If input already have parent just pass through
          if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
            continue;
          }

          // Put element class and style to the specified parent
          var wrapper = document.createElement('i');
          wrapper.className = el.className + ' waves-input-wrapper';

          var elementStyle = el.getAttribute('style');

          if (!elementStyle) {
            elementStyle = '';
          }

          wrapper.setAttribute('style', elementStyle);

          el.className = 'waves-button-input';
          el.removeAttribute('style');

          // Put element as child
          parent.replaceChild(wrapper, el);
          wrapper.appendChild(el);
        }
      }
    }
  };

  /**
   * Disable mousedown event for 500ms during and after touch
   */
  var TouchHandler = {
    /* uses an integer rather than bool so there's no issues with
     * needing to clear timeouts if another touch event occurred
     * within the 500ms. Cannot mouseup between touchstart and
     * touchend, nor in the 500ms after touchend. */
    touches: 0,
    allowEvent: function (e) {
      var allow = true;

      if (e.type === 'touchstart') {
        TouchHandler.touches += 1; //push
      } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        setTimeout(function () {
          if (TouchHandler.touches > 0) {
            TouchHandler.touches -= 1; //pop after 500ms
          }
        }, 500);
      } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
        allow = false;
      }

      return allow;
    },
    touchup: function (e) {
      TouchHandler.allowEvent(e);
    }
  };

  /**
   * Delegated click handler for .waves-effect element.
   * returns null when .waves-effect element not in "click tree"
   */
  function getWavesEffectElement(e) {
    if (TouchHandler.allowEvent(e) === false) {
      return null;
    }

    var element = null;
    var target = e.target || e.srcElement;

    while (target.parentNode !== null) {
      if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
        element = target;
        break;
      }
      target = target.parentNode;
    }
    return element;
  }

  /**
   * Bubble the click and show effect if .waves-effect elem was found
   */
  function showEffect(e) {
    var element = getWavesEffectElement(e);

    if (element !== null) {
      Effect.show(e, element);

      if ('ontouchstart' in window) {
        element.addEventListener('touchend', Effect.hide, false);
        element.addEventListener('touchcancel', Effect.hide, false);
      }

      element.addEventListener('mouseup', Effect.hide, false);
      element.addEventListener('mouseleave', Effect.hide, false);
      element.addEventListener('dragend', Effect.hide, false);
    }
  }

  Waves.displayEffect = function (options) {
    options = options || {};

    if ('duration' in options) {
      Effect.duration = options.duration;
    }

    //Wrap input inside <i> tag
    Effect.wrapInput($$('.waves-effect'));

    if ('ontouchstart' in window) {
      document.body.addEventListener('touchstart', showEffect, false);
    }

    document.body.addEventListener('mousedown', showEffect, false);
  };

  /**
   * Attach Waves to an input element (or any element which doesn't
   * bubble mouseup/mousedown events).
   *   Intended to be used with dynamically loaded forms/inputs, or
   * where the user doesn't want a delegated click handler.
   */
  Waves.attach = function (element) {
    //FUTURE: automatically add waves classes and allow users
    // to specify them with an options param? Eg. light/classic/button
    if (element.tagName.toLowerCase() === 'input') {
      Effect.wrapInput([element]);
      element = element.parentNode;
    }

    if ('ontouchstart' in window) {
      element.addEventListener('touchstart', showEffect, false);
    }

    element.addEventListener('mousedown', showEffect, false);
  };

  window.Waves = Waves;

  document.addEventListener('DOMContentLoaded', function () {
    Waves.displayEffect();
  }, false);
})(window);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  var Toast = function () {
    function Toast(options) {
      _classCallCheck(this, Toast);

      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      var toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this.$el = $(toastElement);
      this._animateIn();
      this._setTimer();
    }

    _createClass(Toast, [{
      key: "_createToast",


      /**
       * Create toast and append it to toast container
       */
      value: function _createToast() {
        var toast = document.createElement('div');
        toast.classList.add('toast');

        // Add custom classes onto toast
        if (!!this.options.classes.length) {
          $(toast).addClass(this.options.classes);
        }

        // Set content
        if (typeof HTMLElement === 'object' ? this.message instanceof HTMLElement : this.message && typeof this.message === 'object' && this.message !== null && this.message.nodeType === 1 && typeof this.message.nodeName === 'string') {
          toast.appendChild(this.message);

          // Check if it is jQuery object
        } else if (!!this.message.jquery) {
          $(toast).append(this.message[0]);

          // Insert as html;
        } else {
          toast.innerHTML = this.message;
        }

        // Append toasft
        Toast._container.appendChild(toast);
        return toast;
      }

      /**
       * Animate in toast
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        // Animate toast in
        anim({
          targets: this.el,
          top: 0,
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }

      /**
       * Create setInterval which automatically removes toast when timeRemaining >= 0
       * has been reached
       */

    }, {
      key: "_setTimer",
      value: function _setTimer() {
        var _this29 = this;

        if (this.timeRemaining !== Infinity) {
          this.counterInterval = setInterval(function () {
            // If toast is not being dragged, decrease its time remaining
            if (!_this29.panning) {
              _this29.timeRemaining -= 20;
            }

            // Animate toast out
            if (_this29.timeRemaining <= 0) {
              _this29.dismiss();
            }
          }, 20);
        }
      }

      /**
       * Dismiss toast with animation
       */

    }, {
      key: "dismiss",
      value: function dismiss() {
        var _this30 = this;

        window.clearInterval(this.counterInterval);
        var activationDistance = this.el.offsetWidth * this.options.activationPercent;

        if (this.wasSwiped) {
          this.el.style.transition = 'transform .05s, opacity .05s';
          this.el.style.transform = "translateX(" + activationDistance + "px)";
          this.el.style.opacity = 0;
        }

        anim({
          targets: this.el,
          opacity: 0,
          marginTop: -40,
          duration: this.options.outDuration,
          easing: 'easeOutExpo',
          complete: function () {
            // Call the optional callback
            if (typeof _this30.options.completeCallback === 'function') {
              _this30.options.completeCallback();
            }
            // Remove toast from DOM
            _this30.$el.remove();
            Toast._toasts.splice(Toast._toasts.indexOf(_this30), 1);
            if (Toast._toasts.length === 0) {
              Toast._removeContainer();
            }
          }
        });
      }
    }], [{
      key: "getInstance",


      /**
       * Get Instance
       */
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Toast;
      }

      /**
       * Append toast container and add event handlers
       */

    }, {
      key: "_createContainer",
      value: function _createContainer() {
        var container = document.createElement('div');
        container.setAttribute('id', 'toast-container');

        // Add event handler
        container.addEventListener('touchstart', Toast._onDragStart);
        container.addEventListener('touchmove', Toast._onDragMove);
        container.addEventListener('touchend', Toast._onDragEnd);

        container.addEventListener('mousedown', Toast._onDragStart);
        document.addEventListener('mousemove', Toast._onDragMove);
        document.addEventListener('mouseup', Toast._onDragEnd);

        document.body.appendChild(container);
        Toast._container = container;
      }

      /**
       * Remove toast container and event handlers
       */

    }, {
      key: "_removeContainer",
      value: function _removeContainer() {
        // Add event handler
        document.removeEventListener('mousemove', Toast._onDragMove);
        document.removeEventListener('mouseup', Toast._onDragEnd);

        $(Toast._container).remove();
        Toast._container = null;
      }

      /**
       * Begin drag handler
       * @param {Event} e
       */

    }, {
      key: "_onDragStart",
      value: function _onDragStart(e) {
        if (e.target && $(e.target).closest('.toast').length) {
          var $toast = $(e.target).closest('.toast');
          var toast = $toast[0].M_Toast;
          toast.panning = true;
          Toast._draggedToast = toast;
          toast.el.classList.add('panning');
          toast.el.style.transition = '';
          toast.startingXPos = Toast._xPos(e);
          toast.time = Date.now();
          toast.xPos = Toast._xPos(e);
        }
      }

      /**
       * Drag move handler
       * @param {Event} e
       */

    }, {
      key: "_onDragMove",
      value: function _onDragMove(e) {
        if (!!Toast._draggedToast) {
          e.preventDefault();
          var toast = Toast._draggedToast;
          toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
          toast.xPos = Toast._xPos(e);
          toast.velocityX = toast.deltaX / (Date.now() - toast.time);
          toast.time = Date.now();

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          toast.el.style.transform = "translateX(" + totalDeltaX + "px)";
          toast.el.style.opacity = 1 - Math.abs(totalDeltaX / activationDistance);
        }
      }

      /**
       * End drag handler
       */

    }, {
      key: "_onDragEnd",
      value: function _onDragEnd() {
        if (!!Toast._draggedToast) {
          var toast = Toast._draggedToast;
          toast.panning = false;
          toast.el.classList.remove('panning');

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          var shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

          // Remove toast
          if (shouldBeDismissed) {
            toast.wasSwiped = true;
            toast.dismiss();

            // Animate toast back to original position
          } else {
            toast.el.style.transition = 'transform .2s, opacity .2s';
            toast.el.style.transform = '';
            toast.el.style.opacity = '';
          }
          Toast._draggedToast = null;
        }
      }

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       */

    }, {
      key: "_xPos",
      value: function _xPos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }
        // mouse event
        return e.clientX;
      }

      /**
       * Remove all toasts
       */

    }, {
      key: "dismissAll",
      value: function dismissAll() {
        for (var toastIndex in Toast._toasts) {
          Toast._toasts[toastIndex].dismiss();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Toast;
  }();

  /**
   * @static
   * @memberof Toast
   * @type {Array.<Toast>}
   */


  Toast._toasts = [];

  /**
   * @static
   * @memberof Toast
   */
  Toast._container = null;

  /**
   * @static
   * @memberof Toast
   * @type {Toast}
   */
  Toast._draggedToast = null;

  M.Toast = Toast;
  M.toast = function (options) {
    return new Toast(options);
  };
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    edge: 'left',
    draggable: true,
    inDuration: 250,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true
  };

  /**
   * @class
   */

  var Sidenav = function (_Component8) {
    _inherits(Sidenav, _Component8);

    /**
     * Construct Sidenav instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Sidenav(el, options) {
      _classCallCheck(this, Sidenav);

      var _this31 = _possibleConstructorReturn(this, (Sidenav.__proto__ || Object.getPrototypeOf(Sidenav)).call(this, Sidenav, el, options));

      _this31.el.M_Sidenav = _this31;
      _this31.id = _this31.$el.attr('id');

      /**
       * Options for the Sidenav
       * @member Sidenav#options
       * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
       * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Function called when sidenav starts entering
       * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
       * @prop {Function} onCloseStart - Function called when sidenav starts exiting
       * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
       */
      _this31.options = $.extend({}, Sidenav.defaults, options);

      /**
       * Describes open/close state of Sidenav
       * @type {Boolean}
       */
      _this31.isOpen = false;

      /**
       * Describes if Sidenav is fixed
       * @type {Boolean}
       */
      _this31.isFixed = _this31.el.classList.contains('sidenav-fixed');

      /**
       * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      _this31.isDragged = false;

      // Window size variables for window resize checks
      _this31.lastWindowWidth = window.innerWidth;
      _this31.lastWindowHeight = window.innerHeight;

      _this31._createOverlay();
      _this31._createDragTarget();
      _this31._setupEventHandlers();
      _this31._setupClasses();
      _this31._setupFixed();

      Sidenav._sidenavs.push(_this31);
      return _this31;
    }

    _createClass(Sidenav, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._enableBodyScrolling();
        this._overlay.parentNode.removeChild(this._overlay);
        this.dragTarget.parentNode.removeChild(this.dragTarget);
        this.el.M_Sidenav = undefined;
        this.el.style.transform = '';

        var index = Sidenav._sidenavs.indexOf(this);
        if (index >= 0) {
          Sidenav._sidenavs.splice(index, 1);
        }
      }
    }, {
      key: "_createOverlay",
      value: function _createOverlay() {
        var overlay = document.createElement('div');
        this._closeBound = this.close.bind(this);
        overlay.classList.add('sidenav-overlay');

        overlay.addEventListener('click', this._closeBound);

        document.body.appendChild(overlay);
        this._overlay = overlay;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        if (Sidenav._sidenavs.length === 0) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }

        this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
        this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
        this._handleCloseDragBound = this._handleCloseDrag.bind(this);
        this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
        this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

        this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('touchmove', this._handleCloseDragBound);
        this.el.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('click', this._handleCloseTriggerClickBound);

        // Add resize for side nav fixed
        if (this.isFixed) {
          this._handleWindowResizeBound = this._handleWindowResize.bind(this);
          window.addEventListener('resize', this._handleWindowResizeBound);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Sidenav._sidenavs.length === 1) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }

        this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('touchmove', this._handleCloseDragBound);
        this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

        // Remove resize for side nav fixed
        if (this.isFixed) {
          window.removeEventListener('resize', this._handleWindowResizeBound);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.sidenav-trigger');
        if (e.target && $trigger.length) {
          var sidenavId = M.getIdFromTrigger($trigger[0]);

          var sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
          if (sidenavInstance) {
            sidenavInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Set variables needed at the beggining of drag
       * and stop any current transition.
       * @param {Event} e
       */

    }, {
      key: "_startDrag",
      value: function _startDrag(e) {
        var clientX = e.targetTouches[0].clientX;
        this.isDragged = true;
        this._startingXpos = clientX;
        this._xPos = this._startingXpos;
        this._time = Date.now();
        this._width = this.el.getBoundingClientRect().width;
        this._overlay.style.display = 'block';
        this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this._verticallyScrolling = false;
        anim.remove(this.el);
        anim.remove(this._overlay);
      }

      /**
       * Set variables needed at each drag move update tick
       * @param {Event} e
       */

    }, {
      key: "_dragMoveUpdate",
      value: function _dragMoveUpdate(e) {
        var clientX = e.targetTouches[0].clientX;
        var currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this.deltaX = Math.abs(this._xPos - clientX);
        this._xPos = clientX;
        this.velocityX = this.deltaX / (Date.now() - this._time);
        this._time = Date.now();
        if (this._initialScrollTop !== currentScrollTop) {
          this._verticallyScrolling = true;
        }
      }

      /**
       * Handles Dragging of Sidenav
       * @param {Event} e
       */

    }, {
      key: "_handleDragTargetDrag",
      value: function _handleDragTargetDrag(e) {
        // Check if draggable
        if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
          return;
        }

        // If not being dragged, set initial drag start variables
        if (!this.isDragged) {
          this._startDrag(e);
        }

        // Run touchmove updates
        this._dragMoveUpdate(e);

        // Calculate raw deltaX
        var totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

        // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
        totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
        if (this.options.edge === dragDirection) {
          totalDeltaX = 0;
        }

        /**
         * transformX is the drag displacement
         * transformPrefix is the initial transform placement
         * Invert values if Sidenav is right edge
         */
        var transformX = totalDeltaX;
        var transformPrefix = 'translateX(-100%)';
        if (this.options.edge === 'right') {
          transformPrefix = 'translateX(100%)';
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = transformPrefix + " translateX(" + transformX + "px)";
        this._overlay.style.opacity = this.percentOpen;
      }

      /**
       * Handle Drag Target Release
       */

    }, {
      key: "_handleDragTargetRelease",
      value: function _handleDragTargetRelease() {
        if (this.isDragged) {
          if (this.percentOpen > 0.2) {
            this.open();
          } else {
            this._animateOut();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handle Close Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCloseDrag",
      value: function _handleCloseDrag(e) {
        if (this.isOpen) {
          // Check if draggable
          if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
            return;
          }

          // If not being dragged, set initial drag start variables
          if (!this.isDragged) {
            this._startDrag(e);
          }

          // Run touchmove updates
          this._dragMoveUpdate(e);

          // Calculate raw deltaX
          var totalDeltaX = this._xPos - this._startingXpos;

          // dragDirection is the attempted user drag direction
          var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

          // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
          totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
          if (this.options.edge !== dragDirection) {
            totalDeltaX = 0;
          }

          var transformX = -totalDeltaX;
          if (this.options.edge === 'right') {
            transformX = -transformX;
          }

          // Calculate open/close percentage of sidenav, with open = 1 and close = 0
          this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

          // Set transform and opacity styles
          this.el.style.transform = "translateX(" + transformX + "px)";
          this._overlay.style.opacity = this.percentOpen;
        }
      }

      /**
       * Handle Close Release
       */

    }, {
      key: "_handleCloseRelease",
      value: function _handleCloseRelease() {
        if (this.isOpen && this.isDragged) {
          if (this.percentOpen > 0.8) {
            this._animateIn();
          } else {
            this.close();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handles closing of Sidenav when element with class .sidenav-close
       */

    }, {
      key: "_handleCloseTriggerClick",
      value: function _handleCloseTriggerClick(e) {
        var $closeTrigger = $(e.target).closest('.sidenav-close');
        if ($closeTrigger.length && !this._isCurrentlyFixed()) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        // Only handle horizontal resizes
        if (this.lastWindowWidth !== window.innerWidth) {
          if (window.innerWidth > 992) {
            this.open();
          } else {
            this.close();
          }
        }

        this.lastWindowWidth = window.innerWidth;
        this.lastWindowHeight = window.innerHeight;
      }
    }, {
      key: "_setupClasses",
      value: function _setupClasses() {
        if (this.options.edge === 'right') {
          this.el.classList.add('right-aligned');
          this.dragTarget.classList.add('right-aligned');
        }
      }
    }, {
      key: "_removeClasses",
      value: function _removeClasses() {
        this.el.classList.remove('right-aligned');
        this.dragTarget.classList.remove('right-aligned');
      }
    }, {
      key: "_setupFixed",
      value: function _setupFixed() {
        if (this._isCurrentlyFixed()) {
          this.open();
        }
      }
    }, {
      key: "_isCurrentlyFixed",
      value: function _isCurrentlyFixed() {
        return this.isFixed && window.innerWidth > 992;
      }
    }, {
      key: "_createDragTarget",
      value: function _createDragTarget() {
        var dragTarget = document.createElement('div');
        dragTarget.classList.add('drag-target');
        document.body.appendChild(dragTarget);
        this.dragTarget = dragTarget;
      }
    }, {
      key: "_preventBodyScrolling",
      value: function _preventBodyScrolling() {
        var body = document.body;
        body.style.overflow = 'hidden';
      }
    }, {
      key: "_enableBodyScrolling",
      value: function _enableBodyScrolling() {
        var body = document.body;
        body.style.overflow = '';
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen === true) {
          return;
        }

        this.isOpen = true;

        // Run onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Handle fixed Sidenav
        if (this._isCurrentlyFixed()) {
          anim.remove(this.el);
          anim({
            targets: this.el,
            translateX: 0,
            duration: 0,
            easing: 'easeOutQuad'
          });
          this._enableBodyScrolling();
          this._overlay.style.display = 'none';

          // Handle non-fixed Sidenav
        } else {
          if (this.options.preventScrolling) {
            this._preventBodyScrolling();
          }

          if (!this.isDragged || this.percentOpen != 1) {
            this._animateIn();
          }
        }
      }
    }, {
      key: "close",
      value: function close() {
        if (this.isOpen === false) {
          return;
        }

        this.isOpen = false;

        // Run onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        // Handle fixed Sidenav
        if (this._isCurrentlyFixed()) {
          var transformX = this.options.edge === 'left' ? '-105%' : '105%';
          this.el.style.transform = "translateX(" + transformX + ")";

          // Handle non-fixed Sidenav
        } else {
          this._enableBodyScrolling();

          if (!this.isDragged || this.percentOpen != 0) {
            this._animateOut();
          } else {
            this._overlay.style.display = 'none';
          }
        }
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._animateSidenavIn();
        this._animateOverlayIn();
      }
    }, {
      key: "_animateSidenavIn",
      value: function _animateSidenavIn() {
        var _this32 = this;

        var slideOutPercent = this.options.edge === 'left' ? -1 : 1;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? slideOutPercent + this.percentOpen : slideOutPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", 0],
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this32.options.onOpenEnd === 'function') {
              _this32.options.onOpenEnd.call(_this32, _this32.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayIn",
      value: function _animateOverlayIn() {
        var start = 0;
        if (this.isDragged) {
          start = this.percentOpen;
        } else {
          $(this._overlay).css({
            display: 'block'
          });
        }

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: [start, 1],
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        this._animateSidenavOut();
        this._animateOverlayOut();
      }
    }, {
      key: "_animateSidenavOut",
      value: function _animateSidenavOut() {
        var _this33 = this;

        var endPercent = this.options.edge === 'left' ? -1 : 1;
        var slideOutPercent = 0;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", endPercent * 105 + "%"],
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this33.options.onCloseEnd === 'function') {
              _this33.options.onCloseEnd.call(_this33, _this33.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayOut",
      value: function _animateOverlayOut() {
        var _this34 = this;

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            $(_this34._overlay).css('display', 'none');
          }
        });
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Sidenav.__proto__ || Object.getPrototypeOf(Sidenav), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Sidenav;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Sidenav;
  }(Component);

  /**
   * @static
   * @memberof Sidenav
   * @type {Array.<Sidenav>}
   */


  Sidenav._sidenavs = [];

  M.Sidenav = Sidenav;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function (id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */

  var ScrollSpy = function (_Component9) {
    _inherits(ScrollSpy, _Component9);

    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function ScrollSpy(el, options) {
      _classCallCheck(this, ScrollSpy);

      var _this35 = _possibleConstructorReturn(this, (ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy)).call(this, ScrollSpy, el, options));

      _this35.el.M_ScrollSpy = _this35;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      _this35.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(_this35);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      _this35.tickId = -1;
      _this35.id = ScrollSpy._increment;
      _this35._setupEventHandlers();
      _this35._handleWindowScroll();
      return _this35;
    }

    _createClass(ScrollSpy, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
        ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
        ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
        ScrollSpy._count--;
        this._removeEventHandlers();
        $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
        this.el.M_ScrollSpy = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var throttledResize = M.throttle(this._handleWindowScroll, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        if (ScrollSpy._count === 1) {
          window.addEventListener('scroll', this._handleWindowScrollBound);
          window.addEventListener('resize', this._handleThrottledResizeBound);
          document.body.addEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (ScrollSpy._count === 0) {
          window.removeEventListener('scroll', this._handleWindowScrollBound);
          window.removeEventListener('resize', this._handleThrottledResizeBound);
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target);
        for (var i = ScrollSpy._elements.length - 1; i >= 0; i--) {
          var scrollspy = ScrollSpy._elements[i];
          if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
            e.preventDefault();
            var offset = scrollspy.$el.offset().top + 1;

            anim({
              targets: [document.documentElement, document.body],
              scrollTop: offset - scrollspy.options.scrollOffset,
              duration: 400,
              easing: 'easeOutCubic'
            });
            break;
          }
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        // unique tick id
        ScrollSpy._ticks++;

        // viewport rectangle
        var top = M.getDocumentScrollTop(),
            left = M.getDocumentScrollLeft(),
            right = left + window.innerWidth,
            bottom = top + window.innerHeight;

        // determine which elements are in view
        var intersections = ScrollSpy._findElements(top, right, bottom, left);
        for (var i = 0; i < intersections.length; i++) {
          var scrollspy = intersections[i];
          var lastTick = scrollspy.tickId;
          if (lastTick < 0) {
            // entered into view
            scrollspy._enter();
          }

          // update tick id
          scrollspy.tickId = ScrollSpy._ticks;
        }

        for (var _i = 0; _i < ScrollSpy._elementsInView.length; _i++) {
          var _scrollspy = ScrollSpy._elementsInView[_i];
          var _lastTick = _scrollspy.tickId;
          if (_lastTick >= 0 && _lastTick !== ScrollSpy._ticks) {
            // exited from view
            _scrollspy._exit();
            _scrollspy.tickId = -1;
          }
        }

        // remember elements in view for next tick
        ScrollSpy._elementsInView = intersections;
      }

      /**
       * Find elements that are within the boundary
       * @param {number} top
       * @param {number} right
       * @param {number} bottom
       * @param {number} left
       * @return {Array.<ScrollSpy>}   A collection of elements
       */

    }, {
      key: "_enter",
      value: function _enter() {
        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
          if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
            ScrollSpy._visibleElements.unshift(this.$el);
          } else {
            ScrollSpy._visibleElements.push(this.$el);
          }
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }

        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
      }
    }, {
      key: "_exit",
      value: function _exit() {
        var _this36 = this;

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

          ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (el) {
            return el.attr('id') != _this36.$el.attr('id');
          });
          if (ScrollSpy._visibleElements[0]) {
            // Check if empty
            $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
          }
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_ScrollSpy;
      }
    }, {
      key: "_findElements",
      value: function _findElements(top, right, bottom, left) {
        var hits = [];
        for (var i = 0; i < ScrollSpy._elements.length; i++) {
          var scrollspy = ScrollSpy._elements[i];
          var currTop = top + scrollspy.options.scrollOffset || 200;

          if (scrollspy.$el.height() > 0) {
            var elTop = scrollspy.$el.offset().top,
                elLeft = scrollspy.$el.offset().left,
                elRight = elLeft + scrollspy.$el.width(),
                elBottom = elTop + scrollspy.$el.height();

            var isIntersect = !(elLeft > right || elRight < left || elTop > bottom || elBottom < currTop);

            if (isIntersect) {
              hits.push(scrollspy);
            }
          }
        }
        return hits;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return ScrollSpy;
  }(Component);

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */


  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;

  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function (a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };

  /**
   * @class
   *
   */

  var Autocomplete = function (_Component10) {
    _inherits(Autocomplete, _Component10);

    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Autocomplete(el, options) {
      _classCallCheck(this, Autocomplete);

      var _this37 = _possibleConstructorReturn(this, (Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete)).call(this, Autocomplete, el, options));

      _this37.el.M_Autocomplete = _this37;

      /**
       * Options for the autocomplete
       * @member Autocomplete#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {number} shift
       * @prop {number} padding
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this37.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      _this37.isOpen = false;
      _this37.count = 0;
      _this37.activeIndex = -1;
      _this37.oldVal;
      _this37.$inputField = _this37.$el.closest('.input-field');
      _this37.$active = $();
      _this37._mousedown = false;
      _this37._setupDropdown();

      _this37._setupEventHandlers();
      return _this37;
    }

    _createClass(Autocomplete, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_Autocomplete = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputBlurBound = this._handleInputBlur.bind(this);
        this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(this);
        this._handleContainerMouseupAndTouchendBound = this._handleContainerMouseupAndTouchend.bind(this);

        this.el.addEventListener('blur', this._handleInputBlurBound);
        this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.el.addEventListener('click', this._handleInputClickBound);
        this.container.addEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
        this.container.addEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.addEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
          this.container.addEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('blur', this._handleInputBlurBound);
        this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.container.removeEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
        this.container.removeEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.removeEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
          this.container.removeEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this38 = this;

        this.container = document.createElement('ul');
        this.container.id = "autocomplete-options-" + M.guid();
        $(this.container).addClass('autocomplete-content dropdown-content');
        this.$inputField.append(this.container);
        this.el.setAttribute('data-target', this.container.id);

        this.dropdown = M.Dropdown.init(this.el, {
          autoFocus: false,
          closeOnClick: false,
          coverTrigger: false,
          onItemClick: function (itemEl) {
            _this38.selectOption($(itemEl));
          }
        });

        // Sketchy removal of dropdown click handler
        this.el.removeEventListener('click', this.dropdown._handleClickBound);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        this.container.parentNode.removeChild(this.container);
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        if (!this._mousedown) {
          this.close();
          this._resetAutocomplete();
        }
      }

      /**
       * Handle Input Keyup and Focus
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeyupAndFocus",
      value: function _handleInputKeyupAndFocus(e) {
        if (e.type === 'keyup') {
          Autocomplete._keydown = false;
        }

        this.count = 0;
        var val = this.el.value.toLowerCase();

        // Don't capture enter or arrow key usage.
        if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
          return;
        }

        // Check if the input isn't empty
        // Check if focus triggered by tab
        if (this.oldVal !== val && (M.tabPressed || e.type !== 'focus')) {
          this.open();
        }

        // Update oldVal
        this.oldVal = val;
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Autocomplete._keydown = true;

        // Arrow keys and enter key usage
        var keyCode = e.keyCode,
            liElement = void 0,
            numItems = $(this.container).children('li').length;

        // select element on Enter
        if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
          liElement = $(this.container).children('li').eq(this.activeIndex);
          if (liElement.length) {
            this.selectOption(liElement);
            e.preventDefault();
          }
          return;
        }

        // Capture up and down key
        if (keyCode === M.keys.ARROW_UP || keyCode === M.keys.ARROW_DOWN) {
          e.preventDefault();

          if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) {
            this.activeIndex--;
          }

          if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) {
            this.activeIndex++;
          }

          this.$active.removeClass('active');
          if (this.activeIndex >= 0) {
            this.$active = $(this.container).children('li').eq(this.activeIndex);
            this.$active.addClass('active');
          }
        }
      }

      /**
       * Handle Input Click
       * @param {Event} e
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick(e) {
        this.open();
      }

      /**
       * Handle Container Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMousedownAndTouchstart",
      value: function _handleContainerMousedownAndTouchstart(e) {
        this._mousedown = true;
      }

      /**
       * Handle Container Mouseup and Touchend
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMouseupAndTouchend",
      value: function _handleContainerMouseupAndTouchend(e) {
        this._mousedown = false;
      }

      /**
       * Highlight partial match
       */

    }, {
      key: "_highlight",
      value: function _highlight(string, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf('' + string.toLowerCase() + ''),
            matchEnd = matchStart + string.length - 1,
            beforeMatch = $el.text().slice(0, matchStart),
            matchText = $el.text().slice(matchStart, matchEnd + 1),
            afterMatch = $el.text().slice(matchEnd + 1);
        $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
        if (img.length) {
          $el.prepend(img);
        }
      }

      /**
       * Reset current element position
       */

    }, {
      key: "_resetCurrentElement",
      value: function _resetCurrentElement() {
        this.activeIndex = -1;
        this.$active.removeClass('active');
      }

      /**
       * Reset autocomplete elements
       */

    }, {
      key: "_resetAutocomplete",
      value: function _resetAutocomplete() {
        $(this.container).empty();
        this._resetCurrentElement();
        this.oldVal = null;
        this.isOpen = false;
        this._mousedown = false;
      }

      /**
       * Select autocomplete option
       * @param {Element} el  Autocomplete option list item element
       */

    }, {
      key: "selectOption",
      value: function selectOption(el) {
        var text = el.text().trim();
        this.el.value = text;
        this.$el.trigger('change');
        this._resetAutocomplete();
        this.close();

        // Handle onAutocomplete callback.
        if (typeof this.options.onAutocomplete === 'function') {
          this.options.onAutocomplete.call(this, text);
        }
      }

      /**
       * Render dropdown content
       * @param {Object} data  data set
       * @param {String} val  current input value
       */

    }, {
      key: "_renderDropdown",
      value: function _renderDropdown(data, val) {
        var _this39 = this;

        this._resetAutocomplete();

        var matchingData = [];

        // Gather all matching data
        for (var key in data) {
          if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
            // Break if past limit
            if (this.count >= this.options.limit) {
              break;
            }

            var entry = {
              data: data[key],
              key: key
            };
            matchingData.push(entry);

            this.count++;
          }
        }

        // Sort
        if (this.options.sortFunction) {
          var sortFunctionBound = function (a, b) {
            return _this39.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
          };
          matchingData.sort(sortFunctionBound);
        }

        // Render
        for (var i = 0; i < matchingData.length; i++) {
          var _entry = matchingData[i];
          var $autocompleteOption = $('<li></li>');
          if (!!_entry.data) {
            $autocompleteOption.append("<img src=\"" + _entry.data + "\" class=\"right circle\"><span>" + _entry.key + "</span>");
          } else {
            $autocompleteOption.append('<span>' + _entry.key + '</span>');
          }

          $(this.container).append($autocompleteOption);
          this._highlight(val, $autocompleteOption);
        }
      }

      /**
       * Open Autocomplete Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        var val = this.el.value.toLowerCase();

        this._resetAutocomplete();

        if (val.length >= this.options.minLength) {
          this.isOpen = true;
          this._renderDropdown(this.options.data, val);
        }

        // Open dropdown
        if (!this.dropdown.isOpen) {
          this.dropdown.open();
        } else {
          // Recalculate dropdown when its already open
          this.dropdown.recalculateDimensions();
        }
      }

      /**
       * Close Autocomplete Dropdown
       */

    }, {
      key: "close",
      value: function close() {
        this.dropdown.close();
      }

      /**
       * Update Data
       * @param {Object} data
       */

    }, {
      key: "updateData",
      value: function updateData(data) {
        var val = this.el.value.toLowerCase();
        this.options.data = data;

        if (this.isOpen) {
          this._renderDropdown(data, val);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Autocomplete;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Autocomplete;
  }(Component);

  /**
   * @static
   * @memberof Autocomplete
   */


  Autocomplete._keydown = false;

  M.Autocomplete = Autocomplete;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);
;(function ($) {
  // Function to update labels of text fields
  M.updateTextFields = function () {
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function (element, index) {
      var $this = $(this);
      if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function (object) {
    var hasLength = object.attr('data-length') !== null;
    var lenAttr = parseInt(object.attr('data-length'));
    var len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (object.is(':valid') && hasLength && len <= lenAttr || object.is(':valid') && !hasLength) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  M.textareaAutoResize = function ($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    var fontFamily = $textarea.css('font-family');
    var fontSize = $textarea.css('font-size');
    var lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    var paddingTop = $textarea.css('padding-top');
    var paddingRight = $textarea.css('padding-right');
    var paddingBottom = $textarea.css('padding-bottom');
    var paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    var content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  $(document).ready(function () {
    // Text based inputs
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function () {
      if (this.value.length !== 0 || $(this).attr('placeholder') !== null) {
        $(this).siblings('label').addClass('active');
      }
      M.validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function () {
      M.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function (e) {
      var formReset = $(e.target);
      if (formReset.is('form')) {
        formReset.find(input_selector).removeClass('valid').removeClass('invalid');
        formReset.find(input_selector).each(function (e) {
          if (this.value.length) {
            $(this).siblings('label').removeClass('active');
          }
        });

        // Reset select (after native reset)
        setTimeout(function () {
          formReset.find('select').each(function () {
            // check if initialized
            if (this.M_FormSelect) {
              $(this).trigger('change');
            }
          });
        }, 0);
      }
    });

    /**
     * Add active when element has focus
     * @param {Event} e
     */
    document.addEventListener('focus', function (e) {
      if ($(e.target).is(input_selector)) {
        $(e.target).siblings('label, .prefix').addClass('active');
      }
    }, true);

    /**
     * Remove active when element is blurred
     * @param {Event} e
     */
    document.addEventListener('blur', function (e) {
      var $inputElement = $(e.target);
      if ($inputElement.is(input_selector)) {
        var selector = '.prefix';

        if ($inputElement[0].value.length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === null) {
          selector += ', label';
        }
        $inputElement.siblings(selector).removeClass('active');
        M.validate_field($inputElement);
      }
    }, true);

    // Radio and Checkbox focus class
    var radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function (e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        var $this = $(this);
        $this.one('blur', function (e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    var text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function () {
      var $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function () {
      var file_field = $(this).closest('.file-field');
      var path_input = file_field.find('input.file-path');
      var files = $(this)[0].files;
      var file_names = [];
      for (var i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(', ');
      path_input.trigger('change');
    });
  }); // End of $(document).ready
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  /**
   * @class
   *
   */

  var Slider = function (_Component11) {
    _inherits(Slider, _Component11);

    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Slider(el, options) {
      _classCallCheck(this, Slider);

      var _this40 = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, Slider, el, options));

      _this40.el.M_Slider = _this40;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      _this40.options = $.extend({}, Slider.defaults, options);

      // setup
      _this40.$slider = _this40.$el.find('.slides');
      _this40.$slides = _this40.$slider.children('li');
      _this40.activeIndex = _this40.$slides.filter(function (item) {
        return $(item).hasClass('active');
      }).first().index();
      if (_this40.activeIndex != -1) {
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);
      }

      _this40._setSliderHeight();

      // Set initial positions of captions
      _this40.$slides.find('.caption').each(function (el) {
        _this40._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      _this40.$slides.find('img').each(function (el) {
        var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      _this40._setupIndicators();

      // Show active slide
      if (_this40.$active) {
        _this40.$active.css('display', 'block');
      } else {
        _this40.$slides.first().addClass('active');
        anim({
          targets: _this40.$slides.first()[0],
          opacity: 1,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });

        _this40.activeIndex = 0;
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);

        // Update indicators
        if (_this40.options.indicators) {
          _this40.$indicators.eq(_this40.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      _this40.$active.find('img').each(function (el) {
        anim({
          targets: _this40.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });
      });

      _this40._setupEventHandlers();

      // auto scroll
      _this40.start();
      return _this40;
    }

    _createClass(Slider, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.pause();
        this._removeIndicators();
        this._removeEventHandlers();
        this.el.M_Slider = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this41 = this;

        this._handleIntervalBound = this._handleInterval.bind(this);
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.addEventListener('click', _this41._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this42 = this;

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.removeEventListener('click', _this42._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Handle indicator click
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        var currIndex = $(e.target).index();
        this.set(currIndex);
      }

      /**
       * Handle Interval
       */

    }, {
      key: "_handleInterval",
      value: function _handleInterval() {
        var newActiveIndex = this.$slider.find('.active').index();
        if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0;
        // loop to start
        else newActiveIndex += 1;

        this.set(newActiveIndex);
      }

      /**
       * Animate in caption
       * @param {Element} caption
       * @param {Number} duration
       */

    }, {
      key: "_animateCaptionIn",
      value: function _animateCaptionIn(caption, duration) {
        var animOptions = {
          targets: caption,
          opacity: 0,
          duration: duration,
          easing: 'easeOutQuad'
        };

        if ($(caption).hasClass('center-align')) {
          animOptions.translateY = -100;
        } else if ($(caption).hasClass('right-align')) {
          animOptions.translateX = 100;
        } else if ($(caption).hasClass('left-align')) {
          animOptions.translateX = -100;
        }

        anim(animOptions);
      }

      /**
       * Set height of slider
       */

    }, {
      key: "_setSliderHeight",
      value: function _setSliderHeight() {
        // If fullscreen, do nothing
        if (!this.$el.hasClass('fullscreen')) {
          if (this.options.indicators) {
            // Add height if indicators are present
            this.$el.css('height', this.options.height + 40 + 'px');
          } else {
            this.$el.css('height', this.options.height + 'px');
          }
          this.$slider.css('height', this.options.height + 'px');
        }
      }

      /**
       * Setup indicators
       */

    }, {
      key: "_setupIndicators",
      value: function _setupIndicators() {
        var _this43 = this;

        if (this.options.indicators) {
          this.$indicators = $('<ul class="indicators"></ul>');
          this.$slides.each(function (el, index) {
            var $indicator = $('<li class="indicator-item"></li>');
            _this43.$indicators.append($indicator[0]);
          });
          this.$el.append(this.$indicators[0]);
          this.$indicators = this.$indicators.children('li.indicator-item');
        }
      }

      /**
       * Remove indicators
       */

    }, {
      key: "_removeIndicators",
      value: function _removeIndicators() {
        this.$el.find('ul.indicators').remove();
      }

      /**
       * Cycle to nth item
       * @param {Number} index
       */

    }, {
      key: "set",
      value: function set(index) {
        var _this44 = this;

        // Wrap around indices.
        if (index >= this.$slides.length) index = 0;else if (index < 0) index = this.$slides.length - 1;

        // Only do if index changes
        if (this.activeIndex != index) {
          this.$active = this.$slides.eq(this.activeIndex);
          var $caption = this.$active.find('.caption');
          this.$active.removeClass('active');

          anim({
            targets: this.$active[0],
            opacity: 0,
            duration: this.options.duration,
            easing: 'easeOutQuad',
            complete: function () {
              _this44.$slides.not('.active').each(function (el) {
                anim({
                  targets: el,
                  opacity: 0,
                  translateX: 0,
                  translateY: 0,
                  duration: 0,
                  easing: 'easeOutQuad'
                });
              });
            }
          });

          this._animateCaptionIn($caption[0], this.options.duration);

          // Update indicators
          if (this.options.indicators) {
            this.$indicators.eq(this.activeIndex).removeClass('active');
            this.$indicators.eq(index).addClass('active');
          }

          anim({
            targets: this.$slides.eq(index)[0],
            opacity: 1,
            duration: this.options.duration,
            easing: 'easeOutQuad'
          });

          anim({
            targets: this.$slides.eq(index).find('.caption')[0],
            opacity: 1,
            translateX: 0,
            translateY: 0,
            duration: this.options.duration,
            delay: this.options.duration,
            easing: 'easeOutQuad'
          });

          this.$slides.eq(index).addClass('active');
          this.activeIndex = index;

          // Reset interval
          this.start();
        }
      }

      /**
       * Pause slider interval
       */

    }, {
      key: "pause",
      value: function pause() {
        clearInterval(this.interval);
      }

      /**
       * Start slider interval
       */

    }, {
      key: "start",
      value: function start() {
        clearInterval(this.interval);
        this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
      }

      /**
       * Move to next slide
       */

    }, {
      key: "next",
      value: function next() {
        var newIndex = this.activeIndex + 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }

      /**
       * Move to previous slide
       */

    }, {
      key: "prev",
      value: function prev() {
        var newIndex = this.activeIndex - 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Slider.__proto__ || Object.getPrototypeOf(Slider), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Slider;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Slider;
  }(Component);

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }
})(cash, M.anime);
;(function ($, anim) {
  $(document).on('click', '.card', function (e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data('initialOverflow', $card.css('overflow') === undefined ? '' : $card.css('overflow'));
      }
      var $cardReveal = $(this).find('.card-reveal');
      if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            var el = anim.animatables[0].target;
            $(el).css({ display: 'none' });
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block' });
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: [],
    placeholder: '',
    secondaryPlaceholder: '',
    autocompleteOptions: {},
    limit: Infinity,
    onChipAdd: null,
    onChipSelect: null,
    onChipDelete: null
  };

  /**
   * @typedef {Object} chip
   * @property {String} tag  chip tag string
   * @property {String} [image]  chip avatar image string
   */

  /**
   * @class
   *
   */

  var Chips = function (_Component12) {
    _inherits(Chips, _Component12);

    /**
     * Construct Chips instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Chips(el, options) {
      _classCallCheck(this, Chips);

      var _this45 = _possibleConstructorReturn(this, (Chips.__proto__ || Object.getPrototypeOf(Chips)).call(this, Chips, el, options));

      _this45.el.M_Chips = _this45;

      /**
       * Options for the modal
       * @member Chips#options
       * @prop {Array} data
       * @prop {String} placeholder
       * @prop {String} secondaryPlaceholder
       * @prop {Object} autocompleteOptions
       */
      _this45.options = $.extend({}, Chips.defaults, options);

      _this45.$el.addClass('chips input-field');
      _this45.chipsData = [];
      _this45.$chips = $();
      _this45._setupInput();
      _this45.hasAutocomplete = Object.keys(_this45.options.autocompleteOptions).length > 0;

      // Set input id
      if (!_this45.$input.attr('id')) {
        _this45.$input.attr('id', M.guid());
      }

      // Render initial chips
      if (_this45.options.data.length) {
        _this45.chipsData = _this45.options.data;
        _this45._renderChips(_this45.chipsData);
      }

      // Setup autocomplete if needed
      if (_this45.hasAutocomplete) {
        _this45._setupAutocomplete();
      }

      _this45._setPlaceholder();
      _this45._setupLabel();
      _this45._setupEventHandlers();
      return _this45;
    }

    _createClass(Chips, [{
      key: "getData",


      /**
       * Get Chips Data
       */
      value: function getData() {
        return this.chipsData;
      }

      /**
       * Teardown component
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this._removeEventHandlers();
        this.$chips.remove();
        this.el.M_Chips = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleChipClickBound = this._handleChipClick.bind(this);
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputFocusBound = this._handleInputFocus.bind(this);
        this._handleInputBlurBound = this._handleInputBlur.bind(this);

        this.el.addEventListener('click', this._handleChipClickBound);
        document.addEventListener('keydown', Chips._handleChipsKeydown);
        document.addEventListener('keyup', Chips._handleChipsKeyup);
        this.el.addEventListener('blur', Chips._handleChipsBlur, true);
        this.$input[0].addEventListener('focus', this._handleInputFocusBound);
        this.$input[0].addEventListener('blur', this._handleInputBlurBound);
        this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleChipClickBound);
        document.removeEventListener('keydown', Chips._handleChipsKeydown);
        document.removeEventListener('keyup', Chips._handleChipsKeyup);
        this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
        this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
        this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
        this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
      }

      /**
       * Handle Chip Click
       * @param {Event} e
       */

    }, {
      key: "_handleChipClick",
      value: function _handleChipClick(e) {
        var $chip = $(e.target).closest('.chip');
        var clickedClose = $(e.target).is('.close');
        if ($chip.length) {
          var index = $chip.index();
          if (clickedClose) {
            // delete chip
            this.deleteChip(index);
            this.$input[0].focus();
          } else {
            // select chip
            this.selectChip(index);
          }

          // Default handle click to focus on input
        } else {
          this.$input[0].focus();
        }
      }

      /**
       * Handle Chips Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputFocus",


      /**
       * Handle Input Focus
       */
      value: function _handleInputFocus() {
        this.$el.addClass('focus');
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        this.$el.removeClass('focus');
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Chips._keydown = true;

        // enter
        if (e.keyCode === 13) {
          // Override enter if autocompleting.
          if (this.hasAutocomplete && this.autocomplete && this.autocomplete.isOpen) {
            return;
          }

          e.preventDefault();
          this.addChip({
            tag: this.$input[0].value
          });
          this.$input[0].value = '';

          // delete or left
        } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
          e.preventDefault();
          this.selectChip(this.chipsData.length - 1);
        }
      }

      /**
       * Render Chip
       * @param {chip} chip
       * @return {Element}
       */

    }, {
      key: "_renderChip",
      value: function _renderChip(chip) {
        if (!chip.tag) {
          return;
        }

        var renderedChip = document.createElement('div');
        var closeIcon = document.createElement('i');
        renderedChip.classList.add('chip');
        renderedChip.textContent = chip.tag;
        renderedChip.setAttribute('tabindex', 0);
        $(closeIcon).addClass('material-icons close');
        closeIcon.textContent = 'close';

        // attach image if needed
        if (chip.image) {
          var img = document.createElement('img');
          img.setAttribute('src', chip.image);
          renderedChip.insertBefore(img, renderedChip.firstChild);
        }

        renderedChip.appendChild(closeIcon);
        return renderedChip;
      }

      /**
       * Render Chips
       */

    }, {
      key: "_renderChips",
      value: function _renderChips() {
        this.$chips.remove();
        for (var i = 0; i < this.chipsData.length; i++) {
          var chipEl = this._renderChip(this.chipsData[i]);
          this.$el.append(chipEl);
          this.$chips.add(chipEl);
        }

        // move input to end
        this.$el.append(this.$input[0]);
      }

      /**
       * Setup Autocomplete
       */

    }, {
      key: "_setupAutocomplete",
      value: function _setupAutocomplete() {
        var _this46 = this;

        this.options.autocompleteOptions.onAutocomplete = function (val) {
          _this46.addChip({
            tag: val
          });
          _this46.$input[0].value = '';
          _this46.$input[0].focus();
        };

        this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
      }

      /**
       * Setup Input
       */

    }, {
      key: "_setupInput",
      value: function _setupInput() {
        this.$input = this.$el.find('input');
        if (!this.$input.length) {
          this.$input = $('<input></input>');
          this.$el.append(this.$input);
        }

        this.$input.addClass('input');
      }

      /**
       * Setup Label
       */

    }, {
      key: "_setupLabel",
      value: function _setupLabel() {
        this.$label = this.$el.find('label');
        if (this.$label.length) {
          this.$label.setAttribute('for', this.$input.attr('id'));
        }
      }

      /**
       * Set placeholder
       */

    }, {
      key: "_setPlaceholder",
      value: function _setPlaceholder() {
        if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
          $(this.$input).prop('placeholder', this.options.placeholder);
        } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
          $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
        }
      }

      /**
       * Check if chip is valid
       * @param {chip} chip
       */

    }, {
      key: "_isValid",
      value: function _isValid(chip) {
        if (chip.hasOwnProperty('tag') && chip.tag !== '') {
          var exists = false;
          for (var i = 0; i < this.chipsData.length; i++) {
            if (this.chipsData[i].tag === chip.tag) {
              exists = true;
              break;
            }
          }
          return !exists;
        }

        return false;
      }

      /**
       * Add chip
       * @param {chip} chip
       */

    }, {
      key: "addChip",
      value: function addChip(chip) {
        if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
          return;
        }

        var renderedChip = this._renderChip(chip);
        this.$chips.add(renderedChip);
        this.chipsData.push(chip);
        $(this.$input).before(renderedChip);
        this._setPlaceholder();

        // fire chipAdd callback
        if (typeof this.options.onChipAdd === 'function') {
          this.options.onChipAdd.call(this, this.$el, renderedChip);
        }
      }

      /**
       * Delete chip
       * @param {Number} chip
       */

    }, {
      key: "deleteChip",
      value: function deleteChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this.$chips.eq(chipIndex).remove();
        this.$chips = this.$chips.filter(function (el) {
          return $(el).index() >= 0;
        });
        this.chipsData.splice(chipIndex, 1);
        this._setPlaceholder();

        // fire chipDelete callback
        if (typeof this.options.onChipDelete === 'function') {
          this.options.onChipDelete.call(this, this.$el, $chip[0]);
        }
      }

      /**
       * Select chip
       * @param {Number} chip
       */

    }, {
      key: "selectChip",
      value: function selectChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this._selectedChip = $chip;
        $chip[0].focus();

        // fire chipSelect callback
        if (typeof this.options.onChipSelect === 'function') {
          this.options.onChipSelect.call(this, this.$el, $chip[0]);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Chips.__proto__ || Object.getPrototypeOf(Chips), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Chips;
      }
    }, {
      key: "_handleChipsKeydown",
      value: function _handleChipsKeydown(e) {
        Chips._keydown = true;

        var $chips = $(e.target).closest('.chips');
        var chipsKeydown = e.target && $chips.length;

        // Don't handle keydown inputs on input and textarea
        if ($(e.target).is('input, textarea') || !chipsKeydown) {
          return;
        }

        var currChips = $chips[0].M_Chips;

        // backspace and delete
        if (e.keyCode === 8 || e.keyCode === 46) {
          e.preventDefault();

          var selectIndex = currChips.chipsData.length;
          if (currChips._selectedChip) {
            var index = currChips._selectedChip.index();
            currChips.deleteChip(index);
            currChips._selectedChip = null;

            // Make sure selectIndex doesn't go negative
            selectIndex = Math.max(index - 1, 0);
          }

          if (currChips.chipsData.length) {
            currChips.selectChip(selectIndex);
          }

          // left arrow key
        } else if (e.keyCode === 37) {
          if (currChips._selectedChip) {
            var _selectIndex = currChips._selectedChip.index() - 1;
            if (_selectIndex < 0) {
              return;
            }
            currChips.selectChip(_selectIndex);
          }

          // right arrow key
        } else if (e.keyCode === 39) {
          if (currChips._selectedChip) {
            var _selectIndex2 = currChips._selectedChip.index() + 1;

            if (_selectIndex2 >= currChips.chipsData.length) {
              currChips.$input[0].focus();
            } else {
              currChips.selectChip(_selectIndex2);
            }
          }
        }
      }

      /**
       * Handle Chips Keyup
       * @param {Event} e
       */

    }, {
      key: "_handleChipsKeyup",
      value: function _handleChipsKeyup(e) {
        Chips._keydown = false;
      }

      /**
       * Handle Chips Blur
       * @param {Event} e
       */

    }, {
      key: "_handleChipsBlur",
      value: function _handleChipsBlur(e) {
        if (!Chips._keydown) {
          var $chips = $(e.target).closest('.chips');
          var currChips = $chips[0].M_Chips;

          currChips._selectedChip = null;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Chips;
  }(Component);

  /**
   * @static
   * @memberof Chips
   */


  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function () {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function () {
      var $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };

  /**
   * @class
   *
   */

  var Pushpin = function (_Component13) {
    _inherits(Pushpin, _Component13);

    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Pushpin(el, options) {
      _classCallCheck(this, Pushpin);

      var _this47 = _possibleConstructorReturn(this, (Pushpin.__proto__ || Object.getPrototypeOf(Pushpin)).call(this, Pushpin, el, options));

      _this47.el.M_Pushpin = _this47;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      _this47.options = $.extend({}, Pushpin.defaults, options);

      _this47.originalOffset = _this47.el.offsetTop;
      Pushpin._pushpins.push(_this47);
      _this47._setupEventHandlers();
      _this47._updatePosition();
      return _this47;
    }

    _createClass(Pushpin, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.el.style.top = null;
        this._removePinClasses();
        this._removeEventHandlers();

        // Remove pushpin Inst
        var index = Pushpin._pushpins.indexOf(this);
        Pushpin._pushpins.splice(index, 1);
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        document.addEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        document.removeEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_updatePosition",
      value: function _updatePosition() {
        var scrolled = M.getDocumentScrollTop() + this.options.offset;

        if (this.options.top <= scrolled && this.options.bottom >= scrolled && !this.el.classList.contains('pinned')) {
          this._removePinClasses();
          this.el.style.top = this.options.offset + "px";
          this.el.classList.add('pinned');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pinned');
          }
        }

        // Add pin-top (when scrolled position is above top)
        if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
          this._removePinClasses();
          this.el.style.top = 0;
          this.el.classList.add('pin-top');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-top');
          }
        }

        // Add pin-bottom (when scrolled position is below bottom)
        if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
          this._removePinClasses();
          this.el.classList.add('pin-bottom');
          this.el.style.top = this.options.bottom - this.originalOffset + "px";

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-bottom');
          }
        }
      }
    }, {
      key: "_removePinClasses",
      value: function _removePinClasses() {
        // IE 11 bug (can't remove multiple classes in one line)
        this.el.classList.remove('pin-top');
        this.el.classList.remove('pinned');
        this.el.classList.remove('pin-bottom');
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Pushpin.__proto__ || Object.getPrototypeOf(Pushpin), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Pushpin;
      }
    }, {
      key: "_updateElements",
      value: function _updateElements() {
        for (var elIndex in Pushpin._pushpins) {
          var pInstance = Pushpin._pushpins[elIndex];
          pInstance._updatePosition();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Pushpin;
  }(Component);

  /**
   * @static
   * @memberof Pushpin
   */


  Pushpin._pushpins = [];

  M.Pushpin = Pushpin;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  /**
   * @class
   *
   */

  var FloatingActionButton = function (_Component14) {
    _inherits(FloatingActionButton, _Component14);

    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FloatingActionButton(el, options) {
      _classCallCheck(this, FloatingActionButton);

      var _this48 = _possibleConstructorReturn(this, (FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton)).call(this, FloatingActionButton, el, options));

      _this48.el.M_FloatingActionButton = _this48;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      _this48.options = $.extend({}, FloatingActionButton.defaults, options);

      _this48.isOpen = false;
      _this48.$anchor = _this48.$el.children('a').first();
      _this48.$menu = _this48.$el.children('ul').first();
      _this48.$floatingBtns = _this48.$el.find('ul .btn-floating');
      _this48.$floatingBtnsReverse = _this48.$el.find('ul .btn-floating').reverse();
      _this48.offsetY = 0;
      _this48.offsetX = 0;

      _this48.$el.addClass("direction-" + _this48.options.direction);
      if (_this48.options.direction === 'top') {
        _this48.offsetY = 40;
      } else if (_this48.options.direction === 'right') {
        _this48.offsetX = -40;
      } else if (_this48.options.direction === 'bottom') {
        _this48.offsetY = -40;
      } else {
        _this48.offsetX = 40;
      }
      _this48._setupEventHandlers();
      return _this48;
    }

    _createClass(FloatingActionButton, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_FloatingActionButton = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleFABClickBound = this._handleFABClick.bind(this);
        this._handleOpenBound = this.open.bind(this);
        this._handleCloseBound = this.close.bind(this);

        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.addEventListener('mouseenter', this._handleOpenBound);
          this.el.addEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.addEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.removeEventListener('mouseenter', this._handleOpenBound);
          this.el.removeEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.removeEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Handle FAB Click
       */

    }, {
      key: "_handleFABClick",
      value: function _handleFABClick() {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Document Click
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest(this.$menu).length) {
          this.close();
        }
      }

      /**
       * Open FAB
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          this._animateInToolbar();
        } else {
          this._animateInFAB();
        }
        this.isOpen = true;
      }

      /**
       * Close FAB
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          window.removeEventListener('scroll', this._handleCloseBound, true);
          document.body.removeEventListener('click', this._handleDocumentClickBound, true);
          this._animateOutToolbar();
        } else {
          this._animateOutFAB();
        }
        this.isOpen = false;
      }

      /**
       * Classic FAB Menu open
       */

    }, {
      key: "_animateInFAB",
      value: function _animateInFAB() {
        var _this49 = this;

        this.$el.addClass('active');

        var time = 0;
        this.$floatingBtnsReverse.each(function (el) {
          anim({
            targets: el,
            opacity: 1,
            scale: [0.4, 1],
            translateY: [_this49.offsetY, 0],
            translateX: [_this49.offsetX, 0],
            duration: 275,
            delay: time,
            easing: 'easeInOutQuad'
          });
          time += 40;
        });
      }

      /**
       * Classic FAB Menu close
       */

    }, {
      key: "_animateOutFAB",
      value: function _animateOutFAB() {
        var _this50 = this;

        this.$floatingBtnsReverse.each(function (el) {
          anim.remove(el);
          anim({
            targets: el,
            opacity: 0,
            scale: 0.4,
            translateY: _this50.offsetY,
            translateX: _this50.offsetX,
            duration: 175,
            easing: 'easeOutQuad',
            complete: function () {
              _this50.$el.removeClass('active');
            }
          });
        });
      }

      /**
       * Toolbar transition Menu open
       */

    }, {
      key: "_animateInToolbar",
      value: function _animateInToolbar() {
        var _this51 = this;

        var scaleFactor = void 0;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var btnRect = this.el.getBoundingClientRect();
        var backdrop = $('<div class="fab-backdrop"></div>');
        var fabColor = this.$anchor.css('background-color');
        this.$anchor.append(backdrop);

        this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
        this.offsetY = windowHeight - btnRect.bottom;
        scaleFactor = windowWidth / backdrop[0].clientWidth;
        this.btnBottom = btnRect.bottom;
        this.btnLeft = btnRect.left;
        this.btnWidth = btnRect.width;

        // Set initial state
        this.$el.addClass('active');
        this.$el.css({
          'text-align': 'center',
          width: '100%',
          bottom: 0,
          left: 0,
          transform: 'translateX(' + this.offsetX + 'px)',
          transition: 'none'
        });
        this.$anchor.css({
          transform: 'translateY(' + -this.offsetY + 'px)',
          transition: 'none'
        });
        backdrop.css({
          'background-color': fabColor
        });

        setTimeout(function () {
          _this51.$el.css({
            transform: '',
            transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
          });
          _this51.$anchor.css({
            overflow: 'visible',
            transform: '',
            transition: 'transform .2s'
          });

          setTimeout(function () {
            _this51.$el.css({
              overflow: 'hidden',
              'background-color': fabColor
            });
            backdrop.css({
              transform: 'scale(' + scaleFactor + ')',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
            _this51.$menu.children('li').children('a').css({
              opacity: 1
            });

            // Scroll to close.
            _this51._handleDocumentClickBound = _this51._handleDocumentClick.bind(_this51);
            window.addEventListener('scroll', _this51._handleCloseBound, true);
            document.body.addEventListener('click', _this51._handleDocumentClickBound, true);
          }, 100);
        }, 0);
      }

      /**
       * Toolbar transition Menu close
       */

    }, {
      key: "_animateOutToolbar",
      value: function _animateOutToolbar() {
        var _this52 = this;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var backdrop = this.$el.find('.fab-backdrop');
        var fabColor = this.$anchor.css('background-color');

        this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
        this.offsetY = windowHeight - this.btnBottom;

        // Hide backdrop
        this.$el.removeClass('active');
        this.$el.css({
          'background-color': 'transparent',
          transition: 'none'
        });
        this.$anchor.css({
          transition: 'none'
        });
        backdrop.css({
          transform: 'scale(0)',
          'background-color': fabColor
        });
        this.$menu.children('li').children('a').css({
          opacity: ''
        });

        setTimeout(function () {
          backdrop.remove();

          // Set initial state.
          _this52.$el.css({
            'text-align': '',
            width: '',
            bottom: '',
            left: '',
            overflow: '',
            'background-color': '',
            transform: 'translate3d(' + -_this52.offsetX + 'px,0,0)'
          });
          _this52.$anchor.css({
            overflow: '',
            transform: 'translate3d(0,' + _this52.offsetY + 'px,0)'
          });

          setTimeout(function () {
            _this52.$el.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s'
            });
            _this52.$anchor.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
          }, 20);
        }, 200);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FloatingActionButton;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FloatingActionButton;
  }(Component);

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    // Close when date is selected
    autoClose: false,

    // the default output format for the input field value
    format: 'mmm dd, yyyy',

    // Used to create date object from current input string
    parse: null,

    // The initial date to view when first opened
    defaultDate: null,

    // Make the `defaultDate` the initial selected value
    setDefaultDate: false,

    disableWeekends: false,

    disableDayFn: null,

    // First day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // The earliest date that can be selected
    minDate: null,
    // Thelatest date that can be selected
    maxDate: null,

    // Number of years either side, or array of upper/lower range
    yearRange: 10,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // Specify a DOM element to render the calendar in
    container: null,

    // Show clear button
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok',
      previousMonth: '‹',
      nextMonth: '›',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    },

    // events array
    events: [],

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null
  };

  /**
   * @class
   *
   */

  var Datepicker = function (_Component15) {
    _inherits(Datepicker, _Component15);

    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Datepicker(el, options) {
      _classCallCheck(this, Datepicker);

      var _this53 = _possibleConstructorReturn(this, (Datepicker.__proto__ || Object.getPrototypeOf(Datepicker)).call(this, Datepicker, el, options));

      _this53.el.M_Datepicker = _this53;

      _this53.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
        _this53.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
      }

      // Remove time component from minDate and maxDate options
      if (_this53.options.minDate) _this53.options.minDate.setHours(0, 0, 0, 0);
      if (_this53.options.maxDate) _this53.options.maxDate.setHours(0, 0, 0, 0);

      _this53.id = M.guid();

      _this53._setupVariables();
      _this53._insertHTMLIntoDOM();
      _this53._setupModal();

      _this53._setupEventHandlers();

      if (!_this53.options.defaultDate) {
        _this53.options.defaultDate = new Date(Date.parse(_this53.el.value));
      }

      var defDate = _this53.options.defaultDate;
      if (Datepicker._isDate(defDate)) {
        if (_this53.options.setDefaultDate) {
          _this53.setDate(defDate, true);
          _this53.setInputValue();
        } else {
          _this53.gotoDate(defDate);
        }
      } else {
        _this53.gotoDate(new Date());
      }

      /**
       * Describes open/close state of datepicker
       * @type {Boolean}
       */
      _this53.isOpen = false;
      return _this53;
    }

    _createClass(Datepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.destroySelects();
        this.el.M_Datepicker = undefined;
      }
    }, {
      key: "destroySelects",
      value: function destroySelects() {
        var oldYearSelect = this.calendarEl.querySelector('.orig-select-year');
        if (oldYearSelect) {
          M.FormSelect.getInstance(oldYearSelect).destroy();
        }
        var oldMonthSelect = this.calendarEl.querySelector('.orig-select-month');
        if (oldMonthSelect) {
          M.FormSelect.getInstance(oldMonthSelect).destroy();
        }
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
        if (this.options.showClearBtn) {
          $(this.clearBtn).css({ visibility: '' });
          this.clearBtn.innerHTML = this.options.i18n.clear;
        }

        this.doneBtn.innerHTML = this.options.i18n.done;
        this.cancelBtn.innerHTML = this.options.i18n.cancel;

        if (this.options.container) {
          this.$modalEl.appendTo(this.options.container);
        } else {
          this.$modalEl.insertBefore(this.el);
        }
      }
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this54 = this;

        this.modalEl.id = 'modal-' + this.id;
        this.modal = M.Modal.init(this.modalEl, {
          onCloseEnd: function () {
            _this54.isOpen = false;
          }
        });
      }
    }, {
      key: "toString",
      value: function toString(format) {
        var _this55 = this;

        format = format || this.options.format;
        if (!Datepicker._isDate(this.date)) {
          return '';
        }

        var formatArray = format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g);
        var formattedDate = formatArray.map(function (label) {
          if (_this55.formats[label]) {
            return _this55.formats[label]();
          }

          return label;
        }).join('');
        return formattedDate;
      }
    }, {
      key: "setDate",
      value: function setDate(date, preventOnSelect) {
        if (!date) {
          this.date = null;
          this._renderDateDisplay();
          return this.draw();
        }
        if (typeof date === 'string') {
          date = new Date(Date.parse(date));
        }
        if (!Datepicker._isDate(date)) {
          return;
        }

        var min = this.options.minDate,
            max = this.options.maxDate;

        if (Datepicker._isDate(min) && date < min) {
          date = min;
        } else if (Datepicker._isDate(max) && date > max) {
          date = max;
        }

        this.date = new Date(date.getTime());

        this._renderDateDisplay();

        Datepicker._setToStartOfDay(this.date);
        this.gotoDate(this.date);

        if (!preventOnSelect && typeof this.options.onSelect === 'function') {
          this.options.onSelect.call(this, this.date);
        }
      }
    }, {
      key: "setInputValue",
      value: function setInputValue() {
        this.el.value = this.toString();
        this.$el.trigger('change', { firedBy: this });
      }
    }, {
      key: "_renderDateDisplay",
      value: function _renderDateDisplay() {
        var displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
        var i18n = this.options.i18n;
        var day = i18n.weekdaysShort[displayDate.getDay()];
        var month = i18n.monthsShort[displayDate.getMonth()];
        var date = displayDate.getDate();
        this.yearTextEl.innerHTML = displayDate.getFullYear();
        this.dateTextEl.innerHTML = day + ", " + month + " " + date;
      }

      /**
       * change view to a specific date
       */

    }, {
      key: "gotoDate",
      value: function gotoDate(date) {
        var newCalendar = true;

        if (!Datepicker._isDate(date)) {
          return;
        }

        if (this.calendars) {
          var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
              lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
              visibleDate = date.getTime();
          // get the end of the month
          lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
          lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
          newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
        }

        if (newCalendar) {
          this.calendars = [{
            month: date.getMonth(),
            year: date.getFullYear()
          }];
        }

        this.adjustCalendars();
      }
    }, {
      key: "adjustCalendars",
      value: function adjustCalendars() {
        this.calendars[0] = this.adjustCalendar(this.calendars[0]);
        this.draw();
      }
    }, {
      key: "adjustCalendar",
      value: function adjustCalendar(calendar) {
        if (calendar.month < 0) {
          calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
          calendar.month += 12;
        }
        if (calendar.month > 11) {
          calendar.year += Math.floor(Math.abs(calendar.month) / 12);
          calendar.month -= 12;
        }
        return calendar;
      }
    }, {
      key: "nextMonth",
      value: function nextMonth() {
        this.calendars[0].month++;
        this.adjustCalendars();
      }
    }, {
      key: "prevMonth",
      value: function prevMonth() {
        this.calendars[0].month--;
        this.adjustCalendars();
      }
    }, {
      key: "render",
      value: function render(year, month, randId) {
        var opts = this.options,
            now = new Date(),
            days = Datepicker._getDaysInMonth(year, month),
            before = new Date(year, month, 1).getDay(),
            data = [],
            row = [];
        Datepicker._setToStartOfDay(now);
        if (opts.firstDay > 0) {
          before -= opts.firstDay;
          if (before < 0) {
            before += 7;
          }
        }
        var previousMonth = month === 0 ? 11 : month - 1,
            nextMonth = month === 11 ? 0 : month + 1,
            yearOfPreviousMonth = month === 0 ? year - 1 : year,
            yearOfNextMonth = month === 11 ? year + 1 : year,
            daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
        var cells = days + before,
            after = cells;
        while (after > 7) {
          after -= 7;
        }
        cells += 7 - after;
        var isWeekSelected = false;
        for (var i = 0, r = 0; i < cells; i++) {
          var day = new Date(year, month, 1 + (i - before)),
              isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
              isToday = Datepicker._compareDates(day, now),
              hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
              isEmpty = i < before || i >= days + before,
              dayNumber = 1 + (i - before),
              monthNumber = month,
              yearNumber = year,
              isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
              isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
              isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
              isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && Datepicker._isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

          if (isEmpty) {
            if (i < before) {
              dayNumber = daysInPreviousMonth + dayNumber;
              monthNumber = previousMonth;
              yearNumber = yearOfPreviousMonth;
            } else {
              dayNumber = dayNumber - days;
              monthNumber = nextMonth;
              yearNumber = yearOfNextMonth;
            }
          }

          var dayConfig = {
            day: dayNumber,
            month: monthNumber,
            year: yearNumber,
            hasEvent: hasEvent,
            isSelected: isSelected,
            isToday: isToday,
            isDisabled: isDisabled,
            isEmpty: isEmpty,
            isStartRange: isStartRange,
            isEndRange: isEndRange,
            isInRange: isInRange,
            showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
          };

          row.push(this.renderDay(dayConfig));

          if (++r === 7) {
            data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
            row = [];
            r = 0;
            isWeekSelected = false;
          }
        }
        return this.renderTable(opts, data, randId);
      }
    }, {
      key: "renderDay",
      value: function renderDay(opts) {
        var arr = [];
        var ariaSelected = 'false';
        if (opts.isEmpty) {
          if (opts.showDaysInNextAndPreviousMonths) {
            arr.push('is-outside-current-month');
            arr.push('is-selection-disabled');
          } else {
            return '<td class="is-empty"></td>';
          }
        }
        if (opts.isDisabled) {
          arr.push('is-disabled');
        }

        if (opts.isToday) {
          arr.push('is-today');
        }
        if (opts.isSelected) {
          arr.push('is-selected');
          ariaSelected = 'true';
        }
        if (opts.hasEvent) {
          arr.push('has-event');
        }
        if (opts.isInRange) {
          arr.push('is-inrange');
        }
        if (opts.isStartRange) {
          arr.push('is-startrange');
        }
        if (opts.isEndRange) {
          arr.push('is-endrange');
        }
        return "<td data-day=\"" + opts.day + "\" class=\"" + arr.join(' ') + "\" aria-selected=\"" + ariaSelected + "\">" + ("<button class=\"datepicker-day-button\" type=\"button\" data-year=\"" + opts.year + "\" data-month=\"" + opts.month + "\" data-day=\"" + opts.day + "\">" + opts.day + "</button>") + '</td>';
      }
    }, {
      key: "renderRow",
      value: function renderRow(days, isRTL, isRowSelected) {
        return '<tr class="datepicker-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
      }
    }, {
      key: "renderTable",
      value: function renderTable(opts, data, randId) {
        return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' + randId + '">' + this.renderHead(opts) + this.renderBody(data) + '</table></div>';
      }
    }, {
      key: "renderHead",
      value: function renderHead(opts) {
        var i = void 0,
            arr = [];
        for (i = 0; i < 7; i++) {
          arr.push("<th scope=\"col\"><abbr title=\"" + this.renderDayName(opts, i) + "\">" + this.renderDayName(opts, i, true) + "</abbr></th>");
        }
        return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
      }
    }, {
      key: "renderBody",
      value: function renderBody(rows) {
        return '<tbody>' + rows.join('') + '</tbody>';
      }
    }, {
      key: "renderTitle",
      value: function renderTitle(instance, c, year, month, refYear, randId) {
        var i = void 0,
            j = void 0,
            arr = void 0,
            opts = this.options,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
            monthHtml = void 0,
            yearHtml = void 0,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
          arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
        }

        monthHtml = '<select class="datepicker-select orig-select-month" tabindex="-1">' + arr.join('') + '</select>';

        if ($.isArray(opts.yearRange)) {
          i = opts.yearRange[0];
          j = opts.yearRange[1] + 1;
        } else {
          i = year - opts.yearRange;
          j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
          if (i >= opts.minYear) {
            arr.push("<option value=\"" + i + "\" " + (i === year ? 'selected="selected"' : '') + ">" + i + "</option>");
          }
        }

        yearHtml = "<select class=\"datepicker-select orig-select-year\" tabindex=\"-1\">" + arr.join('') + "</select>";

        var leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-prev" + (prev ? '' : ' is-disabled') + "\" type=\"button\">" + leftArrow + "</button>";

        html += '<div class="selects-container">';
        if (opts.showMonthAfterYear) {
          html += yearHtml + monthHtml;
        } else {
          html += monthHtml + yearHtml;
        }
        html += '</div>';

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
          prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
          next = false;
        }

        var rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-next" + (next ? '' : ' is-disabled') + "\" type=\"button\">" + rightArrow + "</button>";

        return html += '</div>';
      }

      /**
       * refresh the HTML
       */

    }, {
      key: "draw",
      value: function draw(force) {
        if (!this.isOpen && !force) {
          return;
        }
        var opts = this.options,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '',
            randId = void 0;

        if (this._y <= minYear) {
          this._y = minYear;
          if (!isNaN(minMonth) && this._m < minMonth) {
            this._m = minMonth;
          }
        }
        if (this._y >= maxYear) {
          this._y = maxYear;
          if (!isNaN(maxMonth) && this._m > maxMonth) {
            this._m = maxMonth;
          }
        }

        randId = 'datepicker-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

        for (var c = 0; c < 1; c++) {
          this._renderDateDisplay();
          html += this.renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
        }

        this.destroySelects();

        this.calendarEl.innerHTML = html;

        // Init Materialize Select
        var yearSelect = this.calendarEl.querySelector('.orig-select-year');
        var monthSelect = this.calendarEl.querySelector('.orig-select-month');
        M.FormSelect.init(yearSelect, {
          classes: 'select-year',
          dropdownOptions: { container: document.body, constrainWidth: false }
        });
        M.FormSelect.init(monthSelect, {
          classes: 'select-month',
          dropdownOptions: { container: document.body, constrainWidth: false }
        });

        // Add change handlers for select
        yearSelect.addEventListener('change', this._handleYearChange.bind(this));
        monthSelect.addEventListener('change', this._handleMonthChange.bind(this));

        if (typeof this.options.onDraw === 'function') {
          this.options.onDraw(this);
        }
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleInputChangeBound = this._handleInputChange.bind(this);
        this._handleCalendarClickBound = this._handleCalendarClick.bind(this);
        this._finishSelectionBound = this._finishSelection.bind(this);
        this._handleMonthChange = this._handleMonthChange.bind(this);
        this._closeBound = this.close.bind(this);

        this.el.addEventListener('click', this._handleInputClickBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.el.addEventListener('change', this._handleInputChangeBound);
        this.calendarEl.addEventListener('click', this._handleCalendarClickBound);
        this.doneBtn.addEventListener('click', this._finishSelectionBound);
        this.cancelBtn.addEventListener('click', this._closeBound);

        if (this.options.showClearBtn) {
          this._handleClearClickBound = this._handleClearClick.bind(this);
          this.clearBtn.addEventListener('click', this._handleClearClickBound);
        }
      }
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        var _this56 = this;

        this.$modalEl = $(Datepicker._template);
        this.modalEl = this.$modalEl[0];

        this.calendarEl = this.modalEl.querySelector('.datepicker-calendar');

        this.yearTextEl = this.modalEl.querySelector('.year-text');
        this.dateTextEl = this.modalEl.querySelector('.date-text');
        if (this.options.showClearBtn) {
          this.clearBtn = this.modalEl.querySelector('.datepicker-clear');
        }
        this.doneBtn = this.modalEl.querySelector('.datepicker-done');
        this.cancelBtn = this.modalEl.querySelector('.datepicker-cancel');

        this.formats = {
          d: function () {
            return _this56.date.getDate();
          },
          dd: function () {
            var d = _this56.date.getDate();
            return (d < 10 ? '0' : '') + d;
          },
          ddd: function () {
            return _this56.options.i18n.weekdaysShort[_this56.date.getDay()];
          },
          dddd: function () {
            return _this56.options.i18n.weekdays[_this56.date.getDay()];
          },
          m: function () {
            return _this56.date.getMonth() + 1;
          },
          mm: function () {
            var m = _this56.date.getMonth() + 1;
            return (m < 10 ? '0' : '') + m;
          },
          mmm: function () {
            return _this56.options.i18n.monthsShort[_this56.date.getMonth()];
          },
          mmmm: function () {
            return _this56.options.i18n.months[_this56.date.getMonth()];
          },
          yy: function () {
            return ('' + _this56.date.getFullYear()).slice(2);
          },
          yyyy: function () {
            return _this56.date.getFullYear();
          }
        };
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('change', this._handleInputChangeBound);
        this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleCalendarClick",
      value: function _handleCalendarClick(e) {
        if (!this.isOpen) {
          return;
        }

        var $target = $(e.target);
        if (!$target.hasClass('is-disabled')) {
          if ($target.hasClass('datepicker-day-button') && !$target.hasClass('is-empty') && !$target.parent().hasClass('is-disabled')) {
            this.setDate(new Date(e.target.getAttribute('data-year'), e.target.getAttribute('data-month'), e.target.getAttribute('data-day')));
            if (this.options.autoClose) {
              this._finishSelection();
            }
          } else if ($target.closest('.month-prev').length) {
            this.prevMonth();
          } else if ($target.closest('.month-next').length) {
            this.nextMonth();
          }
        }
      }
    }, {
      key: "_handleClearClick",
      value: function _handleClearClick() {
        this.date = null;
        this.setInputValue();
        this.close();
      }
    }, {
      key: "_handleMonthChange",
      value: function _handleMonthChange(e) {
        this.gotoMonth(e.target.value);
      }
    }, {
      key: "_handleYearChange",
      value: function _handleYearChange(e) {
        this.gotoYear(e.target.value);
      }

      /**
       * change view to a specific month (zero-index, e.g. 0: January)
       */

    }, {
      key: "gotoMonth",
      value: function gotoMonth(month) {
        if (!isNaN(month)) {
          this.calendars[0].month = parseInt(month, 10);
          this.adjustCalendars();
        }
      }

      /**
       * change view to a specific full year (e.g. "2012")
       */

    }, {
      key: "gotoYear",
      value: function gotoYear(year) {
        if (!isNaN(year)) {
          this.calendars[0].year = parseInt(year, 10);
          this.adjustCalendars();
        }
      }
    }, {
      key: "_handleInputChange",
      value: function _handleInputChange(e) {
        var date = void 0;

        // Prevent change event from being fired when triggered by the plugin
        if (e.firedBy === this) {
          return;
        }
        if (this.options.parse) {
          date = this.options.parse(this.el.value, this.options.format);
        } else {
          date = new Date(Date.parse(this.el.value));
        }

        if (Datepicker._isDate(date)) {
          this.setDate(date);
        }
      }
    }, {
      key: "renderDayName",
      value: function renderDayName(opts, day, abbr) {
        day += opts.firstDay;
        while (day >= 7) {
          day -= 7;
        }
        return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
      }

      /**
       * Set input value to the selected date and close Datepicker
       */

    }, {
      key: "_finishSelection",
      value: function _finishSelection() {
        this.setInputValue();
        this.close();
      }

      /**
       * Open Datepicker
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this);
        }
        this.draw();
        this.modal.open();
        return this;
      }

      /**
       * Close Datepicker
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this);
        }
        this.modal.close();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Datepicker.__proto__ || Object.getPrototypeOf(Datepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_isDate",
      value: function _isDate(obj) {
        return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
        );
      }
    }, {
      key: "_isWeekend",
      value: function _isWeekend(date) {
        var day = date.getDay();
        return day === 0 || day === 6;
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }
    }, {
      key: "_getDaysInMonth",
      value: function _getDaysInMonth(year, month) {
        return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      }
    }, {
      key: "_isLeapYear",
      value: function _isLeapYear(year) {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
    }, {
      key: "_compareDates",
      value: function _compareDates(a, b) {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Datepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Datepicker;
  }(Component);

  Datepicker._template = ['<div class= "modal datepicker-modal">', '<div class="modal-content datepicker-container">', '<div class="datepicker-date-display">', '<span class="year-text"></span>', '<span class="date-text"></span>', '</div>', '<div class="datepicker-calendar-container">', '<div class="datepicker-calendar"></div>', '<div class="datepicker-footer">', '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>', '<div class="confirmation-btns">', '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>', '<button class="btn-flat datepicker-done waves-effect" type="button"></button>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    dialRadius: 135,
    outerRadius: 105,
    innerRadius: 70,
    tickRadius: 20,
    duration: 350,
    container: null,
    defaultTime: 'now', // default time, 'now' or '13:14' e.g.
    fromNow: 0, // Millisecond offset from the defaultTime
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok'
    },

    autoClose: false, // auto close when minute is selected
    twelveHour: true, // change to 12 hour AM/PM clock from 24 hour
    vibrate: true, // vibrate the device when dragging clock hand

    // Callbacks
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onSelect: null
  };

  /**
   * @class
   *
   */

  var Timepicker = function (_Component16) {
    _inherits(Timepicker, _Component16);

    function Timepicker(el, options) {
      _classCallCheck(this, Timepicker);

      var _this57 = _possibleConstructorReturn(this, (Timepicker.__proto__ || Object.getPrototypeOf(Timepicker)).call(this, Timepicker, el, options));

      _this57.el.M_Timepicker = _this57;

      _this57.options = $.extend({}, Timepicker.defaults, options);

      _this57.id = M.guid();
      _this57._insertHTMLIntoDOM();
      _this57._setupModal();
      _this57._setupVariables();
      _this57._setupEventHandlers();

      _this57._clockSetup();
      _this57._pickerSetup();
      return _this57;
    }

    _createClass(Timepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.el.M_Timepicker = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
        this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
        this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

        this.el.addEventListener('click', this._handleInputClickBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
        this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

        $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
        $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleClockClickStart",
      value: function _handleClockClickStart(e) {
        e.preventDefault();
        var clockPlateBR = this.plate.getBoundingClientRect();
        var offset = { x: clockPlateBR.left, y: clockPlateBR.top };

        this.x0 = offset.x + this.options.dialRadius;
        this.y0 = offset.y + this.options.dialRadius;
        this.moved = false;
        var clickPos = Timepicker._Pos(e);
        this.dx = clickPos.x - this.x0;
        this.dy = clickPos.y - this.y0;

        // Set clock hands
        this.setHand(this.dx, this.dy, false);

        // Mousemove on document
        document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

        // Mouseup on document
        document.addEventListener('mouseup', this._handleDocumentClickEndBound);
        document.addEventListener('touchend', this._handleDocumentClickEndBound);
      }
    }, {
      key: "_handleDocumentClickMove",
      value: function _handleDocumentClickMove(e) {
        e.preventDefault();
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        this.moved = true;
        this.setHand(x, y, false, true);
      }
    }, {
      key: "_handleDocumentClickEnd",
      value: function _handleDocumentClickEnd(e) {
        var _this58 = this;

        e.preventDefault();
        document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
        document.removeEventListener('touchend', this._handleDocumentClickEndBound);
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        if (this.moved && x === this.dx && y === this.dy) {
          this.setHand(x, y);
        }

        if (this.currentView === 'hours') {
          this.showView('minutes', this.options.duration / 2);
        } else if (this.options.autoClose) {
          $(this.minutesView).addClass('timepicker-dial-out');
          setTimeout(function () {
            _this58.done();
          }, this.options.duration / 2);
        }

        if (typeof this.options.onSelect === 'function') {
          this.options.onSelect.call(this, this.hours, this.minutes);
        }

        // Unbind mousemove event
        document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
        this.$modalEl = $(Timepicker._template);
        this.modalEl = this.$modalEl[0];
        this.modalEl.id = 'modal-' + this.id;

        // Append popover to input by default
        var containerEl = document.querySelector(this.options.container);
        if (this.options.container && !!containerEl) {
          this.$modalEl.appendTo(containerEl);
        } else {
          this.$modalEl.insertBefore(this.el);
        }
      }
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this59 = this;

        this.modal = M.Modal.init(this.modalEl, {
          onOpenStart: this.options.onOpenStart,
          onOpenEnd: this.options.onOpenEnd,
          onCloseStart: this.options.onCloseStart,
          onCloseEnd: function () {
            if (typeof _this59.options.onCloseEnd === 'function') {
              _this59.options.onCloseEnd.call(_this59);
            }
            _this59.isOpen = false;
          }
        });
      }
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        this.currentView = 'hours';
        this.vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

        this._canvas = this.modalEl.querySelector('.timepicker-canvas');
        this.plate = this.modalEl.querySelector('.timepicker-plate');

        this.hoursView = this.modalEl.querySelector('.timepicker-hours');
        this.minutesView = this.modalEl.querySelector('.timepicker-minutes');
        this.spanHours = this.modalEl.querySelector('.timepicker-span-hours');
        this.spanMinutes = this.modalEl.querySelector('.timepicker-span-minutes');
        this.spanAmPm = this.modalEl.querySelector('.timepicker-span-am-pm');
        this.footer = this.modalEl.querySelector('.timepicker-footer');
        this.amOrPm = 'PM';
      }
    }, {
      key: "_pickerSetup",
      value: function _pickerSetup() {
        var $clearBtn = $("<button class=\"btn-flat timepicker-clear waves-effect\" style=\"visibility: hidden;\" type=\"button\" tabindex=\"" + (this.options.twelveHour ? '3' : '1') + "\">" + this.options.i18n.clear + "</button>").appendTo(this.footer).on('click', this.clear.bind(this));
        if (this.options.showClearBtn) {
          $clearBtn.css({ visibility: '' });
        }

        var confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.cancel + '</button>').appendTo(confirmationBtnsContainer).on('click', this.close.bind(this));
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.done + '</button>').appendTo(confirmationBtnsContainer).on('click', this.done.bind(this));
        confirmationBtnsContainer.appendTo(this.footer);
      }
    }, {
      key: "_clockSetup",
      value: function _clockSetup() {
        if (this.options.twelveHour) {
          this.$amBtn = $('<div class="am-btn">AM</div>');
          this.$pmBtn = $('<div class="pm-btn">PM</div>');
          this.$amBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
          this.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
        }

        this._buildHoursView();
        this._buildMinutesView();
        this._buildSVGClock();
      }
    }, {
      key: "_buildSVGClock",
      value: function _buildSVGClock() {
        // Draw clock hands and others
        var dialRadius = this.options.dialRadius;
        var tickRadius = this.options.tickRadius;
        var diameter = dialRadius * 2;

        var svg = Timepicker._createSVGEl('svg');
        svg.setAttribute('class', 'timepicker-svg');
        svg.setAttribute('width', diameter);
        svg.setAttribute('height', diameter);
        var g = Timepicker._createSVGEl('g');
        g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
        var bearing = Timepicker._createSVGEl('circle');
        bearing.setAttribute('class', 'timepicker-canvas-bearing');
        bearing.setAttribute('cx', 0);
        bearing.setAttribute('cy', 0);
        bearing.setAttribute('r', 4);
        var hand = Timepicker._createSVGEl('line');
        hand.setAttribute('x1', 0);
        hand.setAttribute('y1', 0);
        var bg = Timepicker._createSVGEl('circle');
        bg.setAttribute('class', 'timepicker-canvas-bg');
        bg.setAttribute('r', tickRadius);
        g.appendChild(hand);
        g.appendChild(bg);
        g.appendChild(bearing);
        svg.appendChild(g);
        this._canvas.appendChild(svg);

        this.hand = hand;
        this.bg = bg;
        this.bearing = bearing;
        this.g = g;
      }
    }, {
      key: "_buildHoursView",
      value: function _buildHoursView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Hours view
        if (this.options.twelveHour) {
          for (var i = 1; i < 13; i += 1) {
            var tick = $tick.clone();
            var radian = i / 6 * Math.PI;
            var radius = this.options.outerRadius;
            tick.css({
              left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
            });
            tick.html(i === 0 ? '00' : i);
            this.hoursView.appendChild(tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        } else {
          for (var _i2 = 0; _i2 < 24; _i2 += 1) {
            var _tick = $tick.clone();
            var _radian = _i2 / 6 * Math.PI;
            var inner = _i2 > 0 && _i2 < 13;
            var _radius = inner ? this.options.innerRadius : this.options.outerRadius;
            _tick.css({
              left: this.options.dialRadius + Math.sin(_radian) * _radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(_radian) * _radius - this.options.tickRadius + 'px'
            });
            _tick.html(_i2 === 0 ? '00' : _i2);
            this.hoursView.appendChild(_tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        }
      }
    }, {
      key: "_buildMinutesView",
      value: function _buildMinutesView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Minutes view
        for (var i = 0; i < 60; i += 5) {
          var tick = $tick.clone();
          var radian = i / 30 * Math.PI;
          tick.css({
            left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
            top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
          });
          tick.html(Timepicker._addLeadingZero(i));
          this.minutesView.appendChild(tick[0]);
        }
      }
    }, {
      key: "_handleAmPmClick",
      value: function _handleAmPmClick(e) {
        var $btnClicked = $(e.target);
        this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
        this._updateAmPmView();
      }
    }, {
      key: "_updateAmPmView",
      value: function _updateAmPmView() {
        if (this.options.twelveHour) {
          this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
          this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
        }
      }
    }, {
      key: "_updateTimeFromInput",
      value: function _updateTimeFromInput() {
        // Get the time
        var value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
        if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
          if (value[1].toUpperCase().indexOf('AM') > 0) {
            this.amOrPm = 'AM';
          } else {
            this.amOrPm = 'PM';
          }
          value[1] = value[1].replace('AM', '').replace('PM', '');
        }
        if (value[0] === 'now') {
          var now = new Date(+new Date() + this.options.fromNow);
          value = [now.getHours(), now.getMinutes()];
          if (this.options.twelveHour) {
            this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
          }
        }
        this.hours = +value[0] || 0;
        this.minutes = +value[1] || 0;
        this.spanHours.innerHTML = this.hours;
        this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

        this._updateAmPmView();
      }
    }, {
      key: "showView",
      value: function showView(view, delay) {
        if (view === 'minutes' && $(this.hoursView).css('visibility') === 'visible') {
          // raiseCallback(this.options.beforeHourSelect);
        }
        var isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;
        this.currentView = view;

        $(this.spanHours).toggleClass('text-primary', isHours);
        $(this.spanMinutes).toggleClass('text-primary', !isHours);

        // Transition view
        hideView.classList.add('timepicker-dial-out');
        $(nextView).css('visibility', 'visible').removeClass('timepicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);

        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(function () {
          $(hideView).css('visibility', 'hidden');
        }, this.options.duration);
      }
    }, {
      key: "resetClock",
      value: function resetClock(delay) {
        var view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius,
            self = this;

        if (delay) {
          $(this.canvas).addClass('timepicker-canvas-out');
          setTimeout(function () {
            $(self.canvas).removeClass('timepicker-canvas-out');
            self.setHand(x, y);
          }, delay);
        } else {
          this.setHand(x, y);
        }
      }
    }, {
      key: "setHand",
      value: function setHand(x, y, roundBy5) {
        var _this60 = this;

        var radian = Math.atan2(x, -y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
            radius = inner ? this.options.innerRadius : this.options.outerRadius;

        if (this.options.twelveHour) {
          radius = this.options.outerRadius;
        }

        // Radian should in range [0, 2PI]
        if (radian < 0) {
          radian = Math.PI * 2 + radian;
        }

        // Get the round value
        var value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        if (this.options.twelveHour) {
          if (isHours) {
            if (value === 0) value = 12;
          } else {
            if (roundBy5) value *= 5;
            if (value === 60) value = 0;
          }
        } else {
          if (isHours) {
            if (value === 12) {
              value = 0;
            }
            value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
          } else {
            if (roundBy5) {
              value *= 5;
            }
            if (value === 60) {
              value = 0;
            }
          }
        }

        // Once hours or minutes changed, vibrate the device
        if (this[this.currentView] !== value) {
          if (this.vibrate && this.options.vibrate) {
            // Do not vibrate too frequently
            if (!this.vibrateTimer) {
              navigator[this.vibrate](10);
              this.vibrateTimer = setTimeout(function () {
                _this60.vibrateTimer = null;
              }, 100);
            }
          }
        }

        this[this.currentView] = value;
        if (isHours) {
          this['spanHours'].innerHTML = value;
        } else {
          this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
        }

        // Set clock hand and others' position
        var cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
            cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
            cx2 = Math.sin(radian) * radius,
            cy2 = -Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx1);
        this.hand.setAttribute('y2', cy1);
        this.bg.setAttribute('cx', cx2);
        this.bg.setAttribute('cy', cy2);
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        this._updateTimeFromInput();
        this.showView('hours');

        this.modal.open();
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        this.modal.close();
      }

      /**
       * Finish timepicker selection.
       */

    }, {
      key: "done",
      value: function done(e, clearValue) {
        // Set input value
        var last = this.el.value;
        var value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
        this.time = value;
        if (!clearValue && this.options.twelveHour) {
          value = value + " " + this.amOrPm;
        }
        this.el.value = value;

        // Trigger change event
        if (value !== last) {
          this.$el.trigger('change');
        }

        this.close();
        this.el.focus();
      }
    }, {
      key: "clear",
      value: function clear() {
        this.done(null, true);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Timepicker.__proto__ || Object.getPrototypeOf(Timepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_addLeadingZero",
      value: function _addLeadingZero(num) {
        return (num < 10 ? '0' : '') + num;
      }
    }, {
      key: "_createSVGEl",
      value: function _createSVGEl(name) {
        var svgNS = 'http://www.w3.org/2000/svg';
        return document.createElementNS(svgNS, name);
      }

      /**
       * @typedef {Object} Point
       * @property {number} x The X Coordinate
       * @property {number} y The Y Coordinate
       */

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       * @return {Point} x and y location
       */

    }, {
      key: "_Pos",
      value: function _Pos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        }
        // mouse event
        return { x: e.clientX, y: e.clientY };
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Timepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Timepicker;
  }(Component);

  Timepicker._template = ['<div class= "modal timepicker-modal">', '<div class="modal-content timepicker-container">', '<div class="timepicker-digital-display">', '<div class="timepicker-text-container">', '<div class="timepicker-display-column">', '<span class="timepicker-span-hours text-primary"></span>', ':', '<span class="timepicker-span-minutes"></span>', '</div>', '<div class="timepicker-display-column timepicker-display-am-pm">', '<div class="timepicker-span-am-pm"></div>', '</div>', '</div>', '</div>', '<div class="timepicker-analog-display">', '<div class="timepicker-plate">', '<div class="timepicker-canvas"></div>', '<div class="timepicker-dial timepicker-hours"></div>', '<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>', '</div>', '<div class="timepicker-footer"></div>', '</div>', '</div>', '</div>'].join('');

  M.Timepicker = Timepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var CharacterCounter = function (_Component17) {
    _inherits(CharacterCounter, _Component17);

    /**
     * Construct CharacterCounter instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function CharacterCounter(el, options) {
      _classCallCheck(this, CharacterCounter);

      var _this61 = _possibleConstructorReturn(this, (CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter)).call(this, CharacterCounter, el, options));

      _this61.el.M_CharacterCounter = _this61;

      /**
       * Options for the character counter
       */
      _this61.options = $.extend({}, CharacterCounter.defaults, options);

      _this61.isInvalid = false;
      _this61.isValidLength = false;
      _this61._setupCounter();
      _this61._setupEventHandlers();
      return _this61;
    }

    _createClass(CharacterCounter, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.CharacterCounter = undefined;
        this._removeCounter();
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleUpdateCounterBound = this.updateCounter.bind(this);

        this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.addEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Setup counter element
       */

    }, {
      key: "_setupCounter",
      value: function _setupCounter() {
        this.counterEl = document.createElement('span');
        $(this.counterEl).addClass('character-counter').css({
          float: 'right',
          'font-size': '12px',
          height: 1
        });

        this.$el.parent().append(this.counterEl);
      }

      /**
       * Remove counter element
       */

    }, {
      key: "_removeCounter",
      value: function _removeCounter() {
        $(this.counterEl).remove();
      }

      /**
       * Update counter
       */

    }, {
      key: "updateCounter",
      value: function updateCounter() {
        var maxLength = +this.$el.attr('data-length'),
            actualLength = this.el.value.length;
        this.isValidLength = actualLength <= maxLength;
        var counterString = actualLength;

        if (maxLength) {
          counterString += '/' + maxLength;
          this._validateInput();
        }

        $(this.counterEl).html(counterString);
      }

      /**
       * Add validation classes
       */

    }, {
      key: "_validateInput",
      value: function _validateInput() {
        if (this.isValidLength && this.isInvalid) {
          this.isInvalid = false;
          this.$el.removeClass('invalid');
        } else if (!this.isValidLength && !this.isInvalid) {
          this.isInvalid = true;
          this.$el.removeClass('valid');
          this.$el.addClass('invalid');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_CharacterCounter;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return CharacterCounter;
  }(Component);

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };

  /**
   * @class
   *
   */

  var Carousel = function (_Component18) {
    _inherits(Carousel, _Component18);

    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Carousel(el, options) {
      _classCallCheck(this, Carousel);

      var _this62 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, Carousel, el, options));

      _this62.el.M_Carousel = _this62;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this62.options = $.extend({}, Carousel.defaults, options);

      // Setup
      _this62.hasMultipleSlides = _this62.$el.find('.carousel-item').length > 1;
      _this62.showIndicators = _this62.options.indicators && _this62.hasMultipleSlides;
      _this62.noWrap = _this62.options.noWrap || !_this62.hasMultipleSlides;
      _this62.pressed = false;
      _this62.dragged = false;
      _this62.offset = _this62.target = 0;
      _this62.images = [];
      _this62.itemWidth = _this62.$el.find('.carousel-item').first().innerWidth();
      _this62.itemHeight = _this62.$el.find('.carousel-item').first().innerHeight();
      _this62.dim = _this62.itemWidth * 2 + _this62.options.padding || 1; // Make sure dim is non zero for divisions.
      _this62._autoScrollBound = _this62._autoScroll.bind(_this62);
      _this62._trackBound = _this62._track.bind(_this62);

      // Full Width carousel setup
      if (_this62.options.fullWidth) {
        _this62.options.dist = 0;
        _this62._setCarouselHeight();

        // Offset fixed items when indicators.
        if (_this62.showIndicators) {
          _this62.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      _this62.$indicators = $('<ul class="indicators"></ul>');
      _this62.$el.find('.carousel-item').each(function (el, i) {
        _this62.images.push(el);
        if (_this62.showIndicators) {
          var $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          _this62.$indicators.append($indicator);
        }
      });
      if (_this62.showIndicators) {
        _this62.$el.append(_this62.$indicators);
      }
      _this62.count = _this62.images.length;

      // Cap numVisible at count
      _this62.options.numVisible = Math.min(_this62.count, _this62.options.numVisible);

      // Setup cross browser string
      _this62.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          _this62.xform = e;
          return false;
        }
        return true;
      });

      _this62._setupEventHandlers();
      _this62._scroll(_this62.offset);
      return _this62;
    }

    _createClass(Carousel, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Carousel = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this63 = this;

        this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
        this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
        this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
        this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.addEventListener('touchstart', this._handleCarouselTapBound);
          this.el.addEventListener('touchmove', this._handleCarouselDragBound);
          this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
        }

        this.el.addEventListener('mousedown', this._handleCarouselTapBound);
        this.el.addEventListener('mousemove', this._handleCarouselDragBound);
        this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.addEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.addEventListener('click', _this63._handleIndicatorClickBound);
          });
        }

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this64 = this;

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
          this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
          this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
        }
        this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
        this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
        this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.removeEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.removeEventListener('click', _this64._handleIndicatorClickBound);
          });
        }

        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Carousel Tap
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselTap",
      value: function _handleCarouselTap(e) {
        // Fixes firefox draggable image bug
        if (e.type === 'mousedown' && $(e.target).is('img')) {
          e.preventDefault();
        }
        this.pressed = true;
        this.dragged = false;
        this.verticalDragged = false;
        this.reference = this._xpos(e);
        this.referenceY = this._ypos(e);

        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this._trackBound, 100);
      }

      /**
       * Handle Carousel Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselDrag",
      value: function _handleCarouselDrag(e) {
        var x = void 0,
            y = void 0,
            delta = void 0,
            deltaY = void 0;
        if (this.pressed) {
          x = this._xpos(e);
          y = this._ypos(e);
          delta = this.reference - x;
          deltaY = Math.abs(this.referenceY - y);
          if (deltaY < 30 && !this.verticalDragged) {
            // If vertical scrolling don't allow dragging.
            if (delta > 2 || delta < -2) {
              this.dragged = true;
              this.reference = x;
              this._scroll(this.offset + delta);
            }
          } else if (this.dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          } else {
            // Vertical scrolling.
            this.verticalDragged = true;
          }
        }

        if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      /**
       * Handle Carousel Release
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselRelease",
      value: function _handleCarouselRelease(e) {
        if (this.pressed) {
          this.pressed = false;
        } else {
          return;
        }

        clearInterval(this.ticker);
        this.target = this.offset;
        if (this.velocity > 10 || this.velocity < -10) {
          this.amplitude = 0.9 * this.velocity;
          this.target = this.offset + this.amplitude;
        }
        this.target = Math.round(this.target / this.dim) * this.dim;

        // No wrap of items.
        if (this.noWrap) {
          if (this.target >= this.dim * (this.count - 1)) {
            this.target = this.dim * (this.count - 1);
          } else if (this.target < 0) {
            this.target = 0;
          }
        }
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);

        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }

      /**
       * Handle Carousel CLick
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselClick",
      value: function _handleCarouselClick(e) {
        // Disable clicks if carousel was dragged.
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else if (!this.options.fullWidth) {
          var clickedIndex = $(e.target).closest('.carousel-item').index();
          var diff = this._wrap(this.center) - clickedIndex;

          // Disable clicks if carousel was shifted by click
          if (diff !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._cycleTo(clickedIndex);
        }
      }

      /**
       * Handle Indicator CLick
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        e.stopPropagation();

        var indicator = $(e.target).closest('.indicator-item');
        if (indicator.length) {
          this._cycleTo(indicator.index());
        }
      }

      /**
       * Handle Throttle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        if (this.options.fullWidth) {
          this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
          this.imageHeight = this.$el.find('.carousel-item.active').height();
          this.dim = this.itemWidth * 2 + this.options.padding;
          this.offset = this.center * 2 * this.itemWidth;
          this.target = this.offset;
          this._setCarouselHeight(true);
        } else {
          this._scroll();
        }
      }

      /**
       * Set carousel height based on first slide
       * @param {Booleam} imageOnly - true for image slides
       */

    }, {
      key: "_setCarouselHeight",
      value: function _setCarouselHeight(imageOnly) {
        var _this65 = this;

        var firstSlide = this.$el.find('.carousel-item.active').length ? this.$el.find('.carousel-item.active').first() : this.$el.find('.carousel-item').first();
        var firstImage = firstSlide.find('img').first();
        if (firstImage.length) {
          if (firstImage[0].complete) {
            // If image won't trigger the load event
            var imageHeight = firstImage.height();
            if (imageHeight > 0) {
              this.$el.css('height', imageHeight + 'px');
            } else {
              // If image still has no height, use the natural dimensions to calculate
              var naturalWidth = firstImage[0].naturalWidth;
              var naturalHeight = firstImage[0].naturalHeight;
              var adjustedHeight = this.$el.width() / naturalWidth * naturalHeight;
              this.$el.css('height', adjustedHeight + 'px');
            }
          } else {
            // Get height when image is loaded normally
            firstImage.one('load', function (el, i) {
              _this65.$el.css('height', el.offsetHeight + 'px');
            });
          }
        } else if (!imageOnly) {
          var slideHeight = firstSlide.height();
          this.$el.css('height', slideHeight + 'px');
        }
      }

      /**
       * Get x position from event
       * @param {Event} e
       */

    }, {
      key: "_xpos",
      value: function _xpos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }

        // mouse event
        return e.clientX;
      }

      /**
       * Get y position from event
       * @param {Event} e
       */

    }, {
      key: "_ypos",
      value: function _ypos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
      }

      /**
       * Wrap index
       * @param {Number} x
       */

    }, {
      key: "_wrap",
      value: function _wrap(x) {
        return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
      }

      /**
       * Tracks scrolling information
       */

    }, {
      key: "_track",
      value: function _track() {
        var now = void 0,
            elapsed = void 0,
            delta = void 0,
            v = void 0;

        now = Date.now();
        elapsed = now - this.timestamp;
        this.timestamp = now;
        delta = this.offset - this.frame;
        this.frame = this.offset;

        v = 1000 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
      }

      /**
       * Auto scrolls to nearest carousel item.
       */

    }, {
      key: "_autoScroll",
      value: function _autoScroll() {
        var elapsed = void 0,
            delta = void 0;

        if (this.amplitude) {
          elapsed = Date.now() - this.timestamp;
          delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
          if (delta > 2 || delta < -2) {
            this._scroll(this.target - delta);
            requestAnimationFrame(this._autoScrollBound);
          } else {
            this._scroll(this.target);
          }
        }
      }

      /**
       * Scroll to target
       * @param {Number} x
       */

    }, {
      key: "_scroll",
      value: function _scroll(x) {
        var _this66 = this;

        // Track scrolling state
        if (!this.$el.hasClass('scrolling')) {
          this.el.classList.add('scrolling');
        }
        if (this.scrollingTimeout != null) {
          window.clearTimeout(this.scrollingTimeout);
        }
        this.scrollingTimeout = window.setTimeout(function () {
          _this66.$el.removeClass('scrolling');
        }, this.options.duration);

        // Start actual scroll
        var i = void 0,
            half = void 0,
            delta = void 0,
            dir = void 0,
            tween = void 0,
            el = void 0,
            alignment = void 0,
            zTranslation = void 0,
            tweenedOpacity = void 0,
            centerTweenedOpacity = void 0;
        var lastCenter = this.center;
        var numVisibleOffset = 1 / this.options.numVisible;

        this.offset = typeof x === 'number' ? x : this.offset;
        this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
        delta = this.offset - this.center * this.dim;
        dir = delta < 0 ? 1 : -1;
        tween = -dir * delta * 2 / this.dim;
        half = this.count >> 1;

        if (this.options.fullWidth) {
          alignment = 'translateX(0)';
          centerTweenedOpacity = 1;
        } else {
          alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
          alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
          centerTweenedOpacity = 1 - numVisibleOffset * tween;
        }

        // Set indicator active
        if (this.showIndicators) {
          var diff = this.center % this.count;
          var activeIndicator = this.$indicators.find('.indicator-item.active');
          if (activeIndicator.index() !== diff) {
            activeIndicator.removeClass('active');
            this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];

          // Add active class to center item.
          if (!$(el).hasClass('active')) {
            this.$el.find('.carousel-item').removeClass('active');
            el.classList.add('active');
          }
          var transformString = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween * i + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }

        for (i = 1; i <= half; ++i) {
          // right side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 + tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center + i < this.count) {
            el = this.images[this._wrap(this.center + i)];
            var _transformString = alignment + " translateX(" + (this.options.shift + (this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString);
          }

          // left side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 - tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center - i >= 0) {
            el = this.images[this._wrap(this.center - i)];
            var _transformString2 = alignment + " translateX(" + (-this.options.shift + (-this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString2);
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];
          var _transformString3 = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, _transformString3);
        }

        // onCycleTo callback
        var $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
        if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
          this.options.onCycleTo.call(this, $currItem[0], this.dragged);
        }

        // One time callback
        if (typeof this.oneTimeCallback === 'function') {
          this.oneTimeCallback.call(this, $currItem[0], this.dragged);
          this.oneTimeCallback = null;
        }
      }

      /**
       * Cycle to target
       * @param {Element} el
       * @param {Number} opacity
       * @param {Number} zIndex
       * @param {String} transform
       */

    }, {
      key: "_updateItemStyle",
      value: function _updateItemStyle(el, opacity, zIndex, transform) {
        el.style[this.xform] = transform;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.visibility = 'visible';
      }

      /**
       * Cycle to target
       * @param {Number} n
       * @param {Function} callback
       */

    }, {
      key: "_cycleTo",
      value: function _cycleTo(n, callback) {
        var diff = this.center % this.count - n;

        // Account for wraparound.
        if (!this.noWrap) {
          if (diff < 0) {
            if (Math.abs(diff + this.count) < Math.abs(diff)) {
              diff += this.count;
            }
          } else if (diff > 0) {
            if (Math.abs(diff - this.count) < diff) {
              diff -= this.count;
            }
          }
        }

        this.target = this.dim * Math.round(this.offset / this.dim);
        // Next
        if (diff < 0) {
          this.target += this.dim * Math.abs(diff);

          // Prev
        } else if (diff > 0) {
          this.target -= this.dim * diff;
        }

        // Set one time callback
        if (typeof callback === 'function') {
          this.oneTimeCallback = callback;
        }

        // Scroll
        if (this.offset !== this.target) {
          this.amplitude = this.target - this.offset;
          this.timestamp = Date.now();
          requestAnimationFrame(this._autoScrollBound);
        }
      }

      /**
       * Cycle to next item
       * @param {Number} [n]
       */

    }, {
      key: "next",
      value: function next(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center + n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }
        this._cycleTo(index);
      }

      /**
       * Cycle to previous item
       * @param {Number} [n]
       */

    }, {
      key: "prev",
      value: function prev(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center - n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }

        this._cycleTo(index);
      }

      /**
       * Cycle to nth item
       * @param {Number} [n]
       * @param {Function} callback
       */

    }, {
      key: "set",
      value: function set(n, callback) {
        if (n === undefined || isNaN(n)) {
          n = 0;
        }

        if (n > this.count || n < 0) {
          if (this.noWrap) {
            return;
          }

          n = this._wrap(n);
        }

        this._cycleTo(n, callback);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Carousel.__proto__ || Object.getPrototypeOf(Carousel), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Carousel;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Carousel;
  }(Component);

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    onOpen: undefined,
    onClose: undefined
  };

  /**
   * @class
   *
   */

  var TapTarget = function (_Component19) {
    _inherits(TapTarget, _Component19);

    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function TapTarget(el, options) {
      _classCallCheck(this, TapTarget);

      var _this67 = _possibleConstructorReturn(this, (TapTarget.__proto__ || Object.getPrototypeOf(TapTarget)).call(this, TapTarget, el, options));

      _this67.el.M_TapTarget = _this67;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      _this67.options = $.extend({}, TapTarget.defaults, options);

      _this67.isOpen = false;

      // setup
      _this67.$origin = $('#' + _this67.$el.attr('data-target'));
      _this67._setup();

      _this67._calculatePositioning();
      _this67._setupEventHandlers();
      return _this67;
    }

    _createClass(TapTarget, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.TapTarget = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
        this._handleTargetClickBound = this._handleTargetClick.bind(this);
        this._handleOriginClickBound = this._handleOriginClick.bind(this);

        this.el.addEventListener('click', this._handleTargetClickBound);
        this.originEl.addEventListener('click', this._handleOriginClickBound);

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleTargetClickBound);
        this.originEl.removeEventListener('click', this._handleOriginClickBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Target Click
       * @param {Event} e
       */

    }, {
      key: "_handleTargetClick",
      value: function _handleTargetClick(e) {
        this.open();
      }

      /**
       * Handle Origin Click
       * @param {Event} e
       */

    }, {
      key: "_handleOriginClick",
      value: function _handleOriginClick(e) {
        this.close();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        this._calculatePositioning();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest('.tap-target-wrapper').length) {
          this.close();
          e.preventDefault();
          e.stopPropagation();
        }
      }

      /**
       * Setup Tap Target
       */

    }, {
      key: "_setup",
      value: function _setup() {
        // Creating tap target
        this.wrapper = this.$el.parent()[0];
        this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
        this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
        this.contentEl = this.$el.find('.tap-target-content')[0];

        // Creating wrapper
        if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
          this.wrapper = document.createElement('div');
          this.wrapper.classList.add('tap-target-wrapper');
          this.$el.before($(this.wrapper));
          this.wrapper.append(this.el);
        }

        // Creating content
        if (!this.contentEl) {
          this.contentEl = document.createElement('div');
          this.contentEl.classList.add('tap-target-content');
          this.$el.append(this.contentEl);
        }

        // Creating foreground wave
        if (!this.waveEl) {
          this.waveEl = document.createElement('div');
          this.waveEl.classList.add('tap-target-wave');

          // Creating origin
          if (!this.originEl) {
            this.originEl = this.$origin.clone(true, true);
            this.originEl.addClass('tap-target-origin');
            this.originEl.removeAttr('id');
            this.originEl.removeAttr('style');
            this.originEl = this.originEl[0];
            this.waveEl.append(this.originEl);
          }

          this.wrapper.append(this.waveEl);
        }
      }

      /**
       * Calculate positioning
       */

    }, {
      key: "_calculatePositioning",
      value: function _calculatePositioning() {
        // Element or parent is fixed position?
        var isFixed = this.$origin.css('position') === 'fixed';
        if (!isFixed) {
          var parents = this.$origin.parents();
          for (var i = 0; i < parents.length; i++) {
            isFixed = $(parents[i]).css('position') == 'fixed';
            if (isFixed) {
              break;
            }
          }
        }

        // Calculating origin
        var originWidth = this.$origin.outerWidth();
        var originHeight = this.$origin.outerHeight();
        var originTop = isFixed ? this.$origin.offset().top - M.getDocumentScrollTop() : this.$origin.offset().top;
        var originLeft = isFixed ? this.$origin.offset().left - M.getDocumentScrollLeft() : this.$origin.offset().left;

        // Calculating screen
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var centerX = windowWidth / 2;
        var centerY = windowHeight / 2;
        var isLeft = originLeft <= centerX;
        var isRight = originLeft > centerX;
        var isTop = originTop <= centerY;
        var isBottom = originTop > centerY;
        var isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

        // Calculating tap target
        var tapTargetWidth = this.$el.outerWidth();
        var tapTargetHeight = this.$el.outerHeight();
        var tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
        var tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
        var tapTargetPosition = isFixed ? 'fixed' : 'absolute';

        // Calculating content
        var tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
        var tapTargetTextHeight = tapTargetHeight / 2;
        var tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
        var tapTargetTextBottom = 0;
        var tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
        var tapTargetTextRight = 0;
        var tapTargetTextPadding = originWidth;
        var tapTargetTextAlign = isBottom ? 'bottom' : 'top';

        // Calculating wave
        var tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
        var tapTargetWaveHeight = tapTargetWaveWidth;
        var tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
        var tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

        // Setting tap target
        var tapTargetWrapperCssObj = {};
        tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
        tapTargetWrapperCssObj.right = isRight ? windowWidth - tapTargetLeft - tapTargetWidth + 'px' : '';
        tapTargetWrapperCssObj.bottom = isBottom ? windowHeight - tapTargetTop - tapTargetHeight + 'px' : '';
        tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
        tapTargetWrapperCssObj.position = tapTargetPosition;
        $(this.wrapper).css(tapTargetWrapperCssObj);

        // Setting content
        $(this.contentEl).css({
          width: tapTargetTextWidth + 'px',
          height: tapTargetTextHeight + 'px',
          top: tapTargetTextTop + 'px',
          right: tapTargetTextRight + 'px',
          bottom: tapTargetTextBottom + 'px',
          left: tapTargetTextLeft + 'px',
          padding: tapTargetTextPadding + 'px',
          verticalAlign: tapTargetTextAlign
        });

        // Setting wave
        $(this.waveEl).css({
          top: tapTargetWaveTop + 'px',
          left: tapTargetWaveLeft + 'px',
          width: tapTargetWaveWidth + 'px',
          height: tapTargetWaveHeight + 'px'
        });
      }

      /**
       * Open TapTarget
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        // onOpen callback
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this, this.$origin[0]);
        }

        this.isOpen = true;
        this.wrapper.classList.add('open');

        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
      }

      /**
       * Close Tap Target
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        // onClose callback
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this, this.$origin[0]);
        }

        this.isOpen = false;
        this.wrapper.classList.remove('open');

        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(TapTarget.__proto__ || Object.getPrototypeOf(TapTarget), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_TapTarget;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return TapTarget;
  }(Component);

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  /**
   * @class
   *
   */

  var FormSelect = function (_Component20) {
    _inherits(FormSelect, _Component20);

    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FormSelect(el, options) {
      _classCallCheck(this, FormSelect);

      // Don't init if browser default version
      var _this68 = _possibleConstructorReturn(this, (FormSelect.__proto__ || Object.getPrototypeOf(FormSelect)).call(this, FormSelect, el, options));

      if (_this68.$el.hasClass('browser-default')) {
        return _possibleConstructorReturn(_this68);
      }

      _this68.el.M_FormSelect = _this68;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      _this68.options = $.extend({}, FormSelect.defaults, options);

      _this68.isMultiple = _this68.$el.prop('multiple');

      // Setup
      _this68.el.tabIndex = -1;
      _this68._keysSelected = {};
      _this68._valueDict = {}; // Maps key to original and generated option element.
      _this68._setupDropdown();

      _this68._setupEventHandlers();
      return _this68;
    }

    _createClass(FormSelect, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_FormSelect = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this69 = this;

        this._handleSelectChangeBound = this._handleSelectChange.bind(this);
        this._handleOptionClickBound = this._handleOptionClick.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.addEventListener('click', _this69._handleOptionClickBound);
        });
        this.el.addEventListener('change', this._handleSelectChangeBound);
        this.input.addEventListener('click', this._handleInputClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this70 = this;

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.removeEventListener('click', _this70._handleOptionClickBound);
        });
        this.el.removeEventListener('change', this._handleSelectChangeBound);
        this.input.removeEventListener('click', this._handleInputClickBound);
      }

      /**
       * Handle Select Change
       * @param {Event} e
       */

    }, {
      key: "_handleSelectChange",
      value: function _handleSelectChange(e) {
        this._setValueToInput();
      }

      /**
       * Handle Option Click
       * @param {Event} e
       */

    }, {
      key: "_handleOptionClick",
      value: function _handleOptionClick(e) {
        e.preventDefault();
        var option = $(e.target).closest('li')[0];
        var key = option.id;
        if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
          var selected = true;

          if (this.isMultiple) {
            // Deselect placeholder option if still selected.
            var placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
            if (placeholderOption.length) {
              placeholderOption.removeClass('selected');
              placeholderOption.find('input[type="checkbox"]').prop('checked', false);
              this._toggleEntryFromArray(placeholderOption[0].id);
            }
            selected = this._toggleEntryFromArray(key);
          } else {
            $(this.dropdownOptions).find('li').removeClass('selected');
            $(option).toggleClass('selected', selected);
          }

          // Set selected on original select option
          // Only trigger if selected state changed
          var prevSelected = $(this._valueDict[key].el).prop('selected');
          if (prevSelected !== selected) {
            $(this._valueDict[key].el).prop('selected', selected);
            this.$el.trigger('change');
          }
        }

        e.stopPropagation();
      }

      /**
       * Handle Input Click
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        if (this.dropdown && this.dropdown.isOpen) {
          this._setValueToInput();
          this._setSelectedStates();
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this71 = this;

        this.wrapper = document.createElement('div');
        $(this.wrapper).addClass('select-wrapper ' + this.options.classes);
        this.$el.before($(this.wrapper));
        this.wrapper.appendChild(this.el);

        if (this.el.disabled) {
          this.wrapper.classList.add('disabled');
        }

        // Create dropdown
        this.$selectOptions = this.$el.children('option, optgroup');
        this.dropdownOptions = document.createElement('ul');
        this.dropdownOptions.id = "select-options-" + M.guid();
        $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

        // Create dropdown structure.
        if (this.$selectOptions.length) {
          this.$selectOptions.each(function (el) {
            if ($(el).is('option')) {
              // Direct descendant option.
              var optionEl = void 0;
              if (_this71.isMultiple) {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'multiple');
              } else {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el);
              }

              _this71._addOptionToValueDict(el, optionEl);
            } else if ($(el).is('optgroup')) {
              // Optgroup.
              var selectOptions = $(el).children('option');
              $(_this71.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

              selectOptions.each(function (el) {
                var optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'optgroup-option');
                _this71._addOptionToValueDict(el, optionEl);
              });
            }
          });
        }

        this.$el.after(this.dropdownOptions);

        // Add input dropdown
        this.input = document.createElement('input');
        $(this.input).addClass('select-dropdown dropdown-trigger');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('readonly', 'true');
        this.input.setAttribute('data-target', this.dropdownOptions.id);
        if (this.el.disabled) {
          $(this.input).prop('disabled', 'true');
        }

        this.$el.before(this.input);
        this._setValueToInput();

        // Add caret
        var dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
        this.$el.before(dropdownIcon[0]);

        // Initialize dropdown
        if (!this.el.disabled) {
          var dropdownOptions = $.extend({}, this.options.dropdownOptions);

          // Add callback for centering selected option when dropdown content is scrollable
          dropdownOptions.onOpenEnd = function (el) {
            var selectedOption = $(_this71.dropdownOptions).find('.selected').first();

            if (selectedOption.length) {
              // Focus selected option in dropdown
              M.keyDown = true;
              _this71.dropdown.focusedIndex = selectedOption.index();
              _this71.dropdown._focusFocusedItem();
              M.keyDown = false;

              // Handle scrolling to selected option
              if (_this71.dropdown.isScrollable) {
                var scrollOffset = selectedOption[0].getBoundingClientRect().top - _this71.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
                scrollOffset -= _this71.dropdownOptions.clientHeight / 2; // center in dropdown
                _this71.dropdownOptions.scrollTop = scrollOffset;
              }
            }
          };

          if (this.isMultiple) {
            dropdownOptions.closeOnClick = false;
          }
          this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
        }

        // Add initial selections
        this._setSelectedStates();
      }

      /**
       * Add option to value dict
       * @param {Element} el  original option element
       * @param {Element} optionEl  generated option element
       */

    }, {
      key: "_addOptionToValueDict",
      value: function _addOptionToValueDict(el, optionEl) {
        var index = Object.keys(this._valueDict).length;
        var key = this.dropdownOptions.id + index;
        var obj = {};
        optionEl.id = key;

        obj.el = el;
        obj.optionEl = optionEl;
        this._valueDict[key] = obj;
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        $(this.wrapper).find('.caret').remove();
        $(this.input).remove();
        $(this.dropdownOptions).remove();
        $(this.wrapper).before(this.$el);
        $(this.wrapper).remove();
      }

      /**
       * Setup dropdown
       * @param {Element} select  select element
       * @param {Element} option  option element from select
       * @param {String} type
       * @return {Element}  option element added
       */

    }, {
      key: "_appendOptionWithIcon",
      value: function _appendOptionWithIcon(select, option, type) {
        // Add disabled attr if disabled
        var disabledClass = option.disabled ? 'disabled ' : '';
        var optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
        var multipleCheckbox = this.isMultiple ? "<label><input type=\"checkbox\"" + disabledClass + "\"/><span>" + option.innerHTML + "</span></label>" : option.innerHTML;
        var liEl = $('<li></li>');
        var spanEl = $('<span></span>');
        spanEl.html(multipleCheckbox);
        liEl.addClass(disabledClass + " " + optgroupClass);
        liEl.append(spanEl);

        // add icons
        var iconUrl = option.getAttribute('data-icon');
        if (!!iconUrl) {
          var imgEl = $("<img alt=\"\" src=\"" + iconUrl + "\">");
          liEl.prepend(imgEl);
        }

        // Check for multiple type.
        $(this.dropdownOptions).append(liEl[0]);
        return liEl[0];
      }

      /**
       * Toggle entry from option
       * @param {String} key  Option key
       * @return {Boolean}  if entry was added or removed
       */

    }, {
      key: "_toggleEntryFromArray",
      value: function _toggleEntryFromArray(key) {
        var notAdded = !this._keysSelected.hasOwnProperty(key);
        var $optionLi = $(this._valueDict[key].optionEl);

        if (notAdded) {
          this._keysSelected[key] = true;
        } else {
          delete this._keysSelected[key];
        }

        $optionLi.toggleClass('selected', notAdded);

        // Set checkbox checked value
        $optionLi.find('input[type="checkbox"]').prop('checked', notAdded);

        // use notAdded instead of true (to detect if the option is selected or not)
        $optionLi.prop('selected', notAdded);

        return notAdded;
      }

      /**
       * Set text value to input
       */

    }, {
      key: "_setValueToInput",
      value: function _setValueToInput() {
        var values = [];
        var options = this.$el.find('option');

        options.each(function (el) {
          if ($(el).prop('selected')) {
            var text = $(el).text();
            values.push(text);
          }
        });

        if (!values.length) {
          var firstDisabled = this.$el.find('option:disabled').eq(0);
          if (firstDisabled.length && firstDisabled[0].value === '') {
            values.push(firstDisabled.text());
          }
        }

        this.input.value = values.join(', ');
      }

      /**
       * Set selected state of dropdown to match actual select element
       */

    }, {
      key: "_setSelectedStates",
      value: function _setSelectedStates() {
        this._keysSelected = {};

        for (var key in this._valueDict) {
          var option = this._valueDict[key];
          var optionIsSelected = $(option.el).prop('selected');
          $(option.optionEl).find('input[type="checkbox"]').prop('checked', optionIsSelected);
          if (optionIsSelected) {
            this._activateOption($(this.dropdownOptions), $(option.optionEl));
            this._keysSelected[key] = true;
          } else {
            $(option.optionEl).removeClass('selected');
          }
        }
      }

      /**
       * Make option as selected and scroll to selected position
       * @param {jQuery} collection  Select options jQuery element
       * @param {Element} newOption  element of the new option
       */

    }, {
      key: "_activateOption",
      value: function _activateOption(collection, newOption) {
        if (newOption) {
          if (!this.isMultiple) {
            collection.find('li.selected').removeClass('selected');
          }
          var option = $(newOption);
          option.addClass('selected');
        }
      }

      /**
       * Get Selected Values
       * @return {Array}  Array of selected values
       */

    }, {
      key: "getSelectedValues",
      value: function getSelectedValues() {
        var selectedValues = [];
        for (var key in this._keysSelected) {
          selectedValues.push(this._valueDict[key].el.value);
        }
        return selectedValues;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FormSelect.__proto__ || Object.getPrototypeOf(FormSelect), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FormSelect;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FormSelect;
  }(Component);

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var Range = function (_Component21) {
    _inherits(Range, _Component21);

    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Range(el, options) {
      _classCallCheck(this, Range);

      var _this72 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, el, options));

      _this72.el.M_Range = _this72;

      /**
       * Options for the range
       * @member Range#options
       */
      _this72.options = $.extend({}, Range.defaults, options);

      _this72._mousedown = false;

      // Setup
      _this72._setupThumb();

      _this72._setupEventHandlers();
      return _this72;
    }

    _createClass(Range, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeThumb();
        this.el.M_Range = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleRangeChangeBound = this._handleRangeChange.bind(this);
        this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
        this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
        this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
        this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

        this.el.addEventListener('change', this._handleRangeChangeBound);

        this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('change', this._handleRangeChangeBound);

        this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Handle Range Change
       * @param {Event} e
       */

    }, {
      key: "_handleRangeChange",
      value: function _handleRangeChange() {
        $(this.value).html(this.$el.val());

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        var offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }

      /**
       * Handle Range Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleRangeMousedownTouchstart",
      value: function _handleRangeMousedownTouchstart(e) {
        // Set indicator value
        $(this.value).html(this.$el.val());

        this._mousedown = true;
        this.$el.addClass('active');

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        if (e.type !== 'input') {
          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        }
      }

      /**
       * Handle Range Input, Mousemove and Touchmove
       */

    }, {
      key: "_handleRangeInputMousemoveTouchmove",
      value: function _handleRangeInputMousemoveTouchmove() {
        if (this._mousedown) {
          if (!$(this.thumb).hasClass('active')) {
            this._showRangeBubble();
          }

          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
          $(this.value).html(this.$el.val());
        }
      }

      /**
       * Handle Range Mouseup and Touchend
       */

    }, {
      key: "_handleRangeMouseupTouchend",
      value: function _handleRangeMouseupTouchend() {
        this._mousedown = false;
        this.$el.removeClass('active');
      }

      /**
       * Handle Range Blur, Mouseout and Touchleave
       */

    }, {
      key: "_handleRangeBlurMouseoutTouchleave",
      value: function _handleRangeBlurMouseoutTouchleave() {
        if (!this._mousedown) {
          var paddingLeft = parseInt(this.$el.css('padding-left'));
          var marginLeft = 7 + paddingLeft + 'px';

          if ($(this.thumb).hasClass('active')) {
            anim.remove(this.thumb);
            anim({
              targets: this.thumb,
              height: 0,
              width: 0,
              top: 10,
              easing: 'easeOutQuad',
              marginLeft: marginLeft,
              duration: 100
            });
          }
          $(this.thumb).removeClass('active');
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupThumb",
      value: function _setupThumb() {
        this.thumb = document.createElement('span');
        this.value = document.createElement('span');
        $(this.thumb).addClass('thumb');
        $(this.value).addClass('value');
        $(this.thumb).append(this.value);
        this.$el.after(this.thumb);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeThumb",
      value: function _removeThumb() {
        $(this.thumb).remove();
      }

      /**
       * morph thumb into bubble
       */

    }, {
      key: "_showRangeBubble",
      value: function _showRangeBubble() {
        var paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
        var marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
        anim.remove(this.thumb);
        anim({
          targets: this.thumb,
          height: 30,
          width: 30,
          top: -30,
          marginLeft: marginLeft,
          duration: 300,
          easing: 'easeOutQuint'
        });
      }

      /**
       * Calculate the offset of the thumb
       * @return {Number}  offset in pixels
       */

    }, {
      key: "_calcRangeOffset",
      value: function _calcRangeOffset() {
        var width = this.$el.width() - 15;
        var max = parseFloat(this.$el.attr('max')) || 100; // Range default max
        var min = parseFloat(this.$el.attr('min')) || 0; // Range default min
        var percent = (parseFloat(this.$el.val()) - min) / (max - min);
        return percent * width;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Range.__proto__ || Object.getPrototypeOf(Range), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Range;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Range;
  }(Component);

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
})(cash, M.anime);


/***/ }),

/***/ 2661:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.nestSetup = exports.commonGetServices = void 0;
const simple_stream_1 = __importStar(__webpack_require__(8166));
const util_1 = __webpack_require__(3014);
const assembleInitialState = (nestedComponents) => nestedComponents
    ? Object.keys(nestedComponents).reduce((result, key) => (0, util_1.assoc)(key, Object.assign({}, nestedComponents[key].initial, assembleInitialState(nestedComponents[key].nested)), result), {})
    : {};
const getInitialState = (app) => Object.assign({}, app.initial, assembleInitialState(app.nested));
const assembleView = (nestedComponents) => nestedComponents
    ? Object.keys(nestedComponents).reduce((result, key) => {
        const nestedApp = nestedComponents[key];
        if (nestedApp.view !== undefined) {
            const view = nestedApp.view;
            return (0, util_1.assoc)(key, {
                view: (cell, ...args) => view(cell.nest(key), ...args),
                nested: assembleView(nestedApp.nested)
            }, result);
        }
        return result;
    }, {})
    : {};
const getView = (app) => assembleView(app.nested);
const assembleServices = (nestedComponents, getCell = (cell) => cell, getState = (state) => state) => nestedComponents
    ? Object.keys(nestedComponents).reduce((result, key) => {
        var _a;
        const nextGetCell = (cell) => getCell(cell).nest(key);
        const nextGetState = (state) => getState(state)[key];
        const nestedApp = nestedComponents[key];
        return (0, util_1.concatIfPresent)(result, (_a = nestedApp.services) === null || _a === void 0 ? void 0 : _a.map((service) => ({
            onchange: (state) => (service.onchange ? service.onchange(nextGetState(state)) : state),
            run: (cell) => service.run(nextGetCell(cell))
        }))).concat(assembleServices(nestedApp.nested, nextGetCell, nextGetState));
    }, [])
    : [];
/**
 * Internal use only.
 */
const commonGetServices = (app) => (0, util_1.concatIfPresent)([], app.services).concat(assembleServices(app.nested));
exports.commonGetServices = commonGetServices;
const setup = ({ stream, accumulator, app }) => {
    if (!stream) {
        stream = simple_stream_1.default;
    }
    if (!accumulator) {
        throw new Error('No accumulator function was specified.');
    }
    const safeApp = app || {};
    const initial = getInitialState(safeApp);
    const view = getView(safeApp);
    // falsy patches are ignored
    const accumulatorFn = (state, patch) => (patch ? accumulator(state, patch) : state);
    const createStream = typeof stream === 'function' ? stream : stream.stream;
    const scan = stream.scan;
    const update = createStream();
    const states = scan((state, patch) => accumulatorFn(state, patch), initial, update);
    return {
        states,
        update,
        view
    };
};
/**
 * Internal use only.
 */
const nestSetup = ({ accumulator, getServices, nestCell, stream = simple_stream_1.default, app = {} }) => {
    const { states, update, view } = setup({
        stream,
        accumulator,
        app
    });
    const nest = nestCell(states, update, view);
    const getCell = (state) => ({ state, update, nest, nested: view });
    const dropRepeats = (0, simple_stream_1.createDropRepeats)(stream);
    if (app) {
        getServices(app).forEach((service) => {
            dropRepeats(states, service.onchange).map((state) => service.run(getCell(state)));
        });
    }
    const cells = dropRepeats(states).map(getCell);
    return cells;
};
exports.nestSetup = nestSetup;


/***/ }),

/***/ 6562:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setup = exports.combinePatches = void 0;
const mergerino_1 = __importDefault(__webpack_require__(8474));
const common_1 = __webpack_require__(2661);
const util_1 = __webpack_require__(3014);
const nestPatch = (patch, prop) => ({ [prop]: patch });
const nestUpdate = (parentUpdate, prop) => (patch) => parentUpdate(nestPatch(patch, prop));
const nestCell = (getState, parentUpdate, components) => (prop) => {
    const getNestedState = () => getState()[prop];
    const nestedUpdate = nestUpdate(parentUpdate, prop);
    const nestedComponents = (0, util_1.get)(components, [prop, 'nested']);
    return {
        state: getNestedState(),
        update: nestedUpdate,
        nest: nestCell(getNestedState, nestedUpdate, nestedComponents),
        nested: nestedComponents
    };
};
/**
 * Combines an array of patches into a single patch.
 *
 * @template S the State type.
 */
const combinePatches = (patches) => patches;
exports.combinePatches = combinePatches;
const getServices = (component) => (0, common_1.commonGetServices)(component);
/**
 * Helper to setup the Meiosis pattern with [Mergerino](https://github.com/fuzetsu/mergerino).
 *
 * @template S the State type.
 *
 * @param {MeiosisConfig<S>} config the Meiosis config for use with Mergerino
 *
 * @returns {Meiosis<S, Patch<S>>} `{ cells }`.
 */
const setup = (config) => (0, common_1.nestSetup)({
    accumulator: mergerino_1.default,
    getServices,
    nestCell,
    stream: config === null || config === void 0 ? void 0 : config.stream,
    app: config === null || config === void 0 ? void 0 : config.app
});
exports.setup = setup;
exports["default"] = exports.setup;


/***/ }),

/***/ 8166:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dropRepeats = exports.createDropRepeats = exports.scan = exports.stream = void 0;
/**
 * Creates a stream.
 *
 * @template T the type of the stream's values.
 *
 * @param initial the stream's initial value.
 *
 * @returns the created stream.
 */
const stream = (initial) => {
    const mapFunctions = [];
    let latestValue = initial;
    const createdStream = function (value) {
        if (arguments.length > 0 && !createdStream.ended) {
            latestValue = value;
            for (const i in mapFunctions) {
                // credit @cmnstmntmn for discovering this bug.
                // Make sure to send the latest value.
                // Otherwise, if f1 triggers another update, f2 will be called with value2 then value1 (old value).
                mapFunctions[i](latestValue);
            }
        }
        return latestValue;
    };
    createdStream.map = (mapFunction) => {
        const newStream = (0, exports.stream)();
        const mappedFunction = (value) => {
            newStream(mapFunction(value));
        };
        mapFunctions.push(mappedFunction);
        newStream.end = (_value) => {
            const idx = mapFunctions.indexOf(mappedFunction);
            newStream.ended = true;
            mapFunctions.splice(idx, 1);
        };
        if (latestValue !== undefined) {
            newStream(mapFunction(latestValue));
        }
        return newStream;
    };
    createdStream.end = (_value) => {
        createdStream.ended = true;
    };
    return createdStream;
};
exports.stream = stream;
/**
 * Creates a new stream that starts with the initial value and, for each value arriving onto the
 * source stream, emits the result of calling the accumulator function with the latest result and
 * the source stream value.
 */
const scan = (accumulator, initial, sourceStream) => {
    const newStream = (0, exports.stream)(initial);
    let accumulated = initial;
    sourceStream.map((value) => {
        accumulated = accumulator(accumulated, value);
        newStream(accumulated);
    });
    return newStream;
};
exports.scan = scan;
const simpleStream = {
    stream: exports.stream,
    scan: exports.scan
};
exports["default"] = simpleStream;
/**
 * Credit: James Forbes (https://james-forbes.com/)
 *
 * Creates a `dropRepeats` function, which returns new stream that drops repeated values from the
 * source stream.
 *
 * @param stream the stream library, defaults to simpleStream.
 */
const createDropRepeats = (stream = simpleStream) => 
/**
 * @param source the source stream.
 * @param onchange function that receives the current state of the source stream and returns the
 * value for which changes will emit onto the returned stream.
 * @returns a stream that does not emit repeated values.
 */
(source, onchange = (state) => state) => {
    const createStream = typeof stream === 'function' ? stream : stream.stream;
    let prev = undefined;
    const result = createStream();
    source.map((state) => {
        const next = onchange(state);
        if (next !== prev) {
            prev = next;
            result(state);
        }
    });
    return result;
};
exports.createDropRepeats = createDropRepeats;
/**
 * `dropRepeats` function that uses `simpleStream`.
 */
exports.dropRepeats = (0, exports.createDropRepeats)();


/***/ }),

/***/ 3014:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.concatIfPresent = exports.assoc = exports.get = void 0;
/**
 * Safely gets a property path from an object. The path is an array. If any property along the path
 * is `undefined`, the function returns `undefined`.
 *
 * @param {*} object the object on which to get the property.
 * @param {Array<string>} path the property path.
 *
 * @returns {*} the property value, or `undefined` if any property along the path is `undefined`.
 */
const get = (object, path) => path.reduce((obj, key) => (obj == undefined ? undefined : obj[key]), object);
exports.get = get;
/**
 * Associates a property value to a target object.
 *
 * @param prop the property name
 * @param value the property value
 * @param result the target object
 * @returns the target object with the associated property
 */
const assoc = (prop, value, target) => {
    target[prop] = value;
    return target;
};
exports.assoc = assoc;
/**
 * Concatenates a source array to a target array only if the source array is present.
 *
 * @param target the target array
 * @param source the source array
 * @returns the target array with the source concatenated if the source is present, otherwise the
 * target array unchanged.
 */
const concatIfPresent = (target, source) => source ? target.concat(source) : target;
exports.concatIfPresent = concatIfPresent;


/***/ }),

/***/ 8474:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const e=Object.assign||((e,t)=>(t&&Object.keys(t).forEach(o=>e[o]=t[o]),e)),t=(e,r,s)=>{const c=typeof s;if(s&&"object"===c)if(Array.isArray(s))for(const o of s)r=t(e,r,o);else for(const c of Object.keys(s)){const f=s[c];"function"==typeof f?r[c]=f(r[c],o):void 0===f?e&&!isNaN(c)?r.splice(c,1):delete r[c]:null===f||"object"!=typeof f||Array.isArray(f)?r[c]=f:"object"==typeof r[c]?r[c]=f===r[c]?f:o(r[c],f):r[c]=t(!1,{},f)}else"function"===c&&(r=s(r,o));return r},o=(o,...r)=>{const s=Array.isArray(o);return t(s,s?o.slice():e({},o),r)};/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (o);
//# sourceMappingURL=mergerino.min.js.map

/***/ }),

/***/ 4428:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 4381:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 7579:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 9989:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnchorItem": () => (/* binding */ Ee),
/* harmony export */   "Autocomplete": () => (/* binding */ ie),
/* harmony export */   "Button": () => (/* binding */ ce),
/* harmony export */   "ButtonFactory": () => (/* binding */ se),
/* harmony export */   "Carousel": () => (/* binding */ ve),
/* harmony export */   "CarouselItem": () => (/* binding */ he),
/* harmony export */   "Chips": () => (/* binding */ ge),
/* harmony export */   "CodeBlock": () => (/* binding */ ye),
/* harmony export */   "Collapsible": () => (/* binding */ we),
/* harmony export */   "CollapsibleItem": () => (/* binding */ be),
/* harmony export */   "Collection": () => (/* binding */ je),
/* harmony export */   "CollectionMode": () => (/* binding */ $e),
/* harmony export */   "ColorInput": () => (/* binding */ He),
/* harmony export */   "DatePicker": () => (/* binding */ We),
/* harmony export */   "Dropdown": () => (/* binding */ Le),
/* harmony export */   "EmailInput": () => (/* binding */ Ye),
/* harmony export */   "FileInput": () => (/* binding */ Qe),
/* harmony export */   "FlatButton": () => (/* binding */ fe),
/* harmony export */   "FloatingActionButton": () => (/* binding */ De),
/* harmony export */   "HelperText": () => (/* binding */ ae),
/* harmony export */   "Icon": () => (/* binding */ re),
/* harmony export */   "InputCheckbox": () => (/* binding */ et),
/* harmony export */   "Kanban": () => (/* binding */ ct),
/* harmony export */   "Label": () => (/* binding */ ne),
/* harmony export */   "LargeButton": () => (/* binding */ de),
/* harmony export */   "LayoutForm": () => (/* binding */ lt),
/* harmony export */   "ListItem": () => (/* binding */ Ae),
/* harmony export */   "Mandatory": () => (/* binding */ te),
/* harmony export */   "MapEditor": () => (/* binding */ dt),
/* harmony export */   "MaterialBox": () => (/* binding */ ut),
/* harmony export */   "ModalPanel": () => (/* binding */ st),
/* harmony export */   "NumberInput": () => (/* binding */ Ke),
/* harmony export */   "Options": () => (/* binding */ tt),
/* harmony export */   "Pagination": () => (/* binding */ mt),
/* harmony export */   "Parallax": () => (/* binding */ pt),
/* harmony export */   "PasswordInput": () => (/* binding */ qe),
/* harmony export */   "RadioButton": () => (/* binding */ it),
/* harmony export */   "RadioButtons": () => (/* binding */ at),
/* harmony export */   "RangeInput": () => (/* binding */ Je),
/* harmony export */   "RoundIconButton": () => (/* binding */ me),
/* harmony export */   "SecondaryContent": () => (/* binding */ Se),
/* harmony export */   "Select": () => (/* binding */ nt),
/* harmony export */   "SmallButton": () => (/* binding */ ue),
/* harmony export */   "SubmitButton": () => (/* binding */ pe),
/* harmony export */   "Switch": () => (/* binding */ ht),
/* harmony export */   "Tabs": () => (/* binding */ vt),
/* harmony export */   "TextArea": () => (/* binding */ Pe),
/* harmony export */   "TextInput": () => (/* binding */ Ue),
/* harmony export */   "TimePicker": () => (/* binding */ Xe),
/* harmony export */   "Timeline": () => (/* binding */ yt),
/* harmony export */   "UrlInput": () => (/* binding */ Be),
/* harmony export */   "camelToSnake": () => (/* binding */ P),
/* harmony export */   "compose": () => (/* binding */ D),
/* harmony export */   "disable": () => (/* binding */ K),
/* harmony export */   "fieldToComponent": () => (/* binding */ rt),
/* harmony export */   "isNumeric": () => (/* binding */ J),
/* harmony export */   "join": () => (/* binding */ z),
/* harmony export */   "map": () => (/* binding */ R),
/* harmony export */   "move": () => (/* binding */ G),
/* harmony export */   "padLeft": () => (/* binding */ Q),
/* harmony export */   "pipe": () => (/* binding */ Y),
/* harmony export */   "req": () => (/* binding */ B),
/* harmony export */   "swap": () => (/* binding */ Z),
/* harmony export */   "toAttributeString": () => (/* binding */ F),
/* harmony export */   "toAttrs": () => (/* binding */ H),
/* harmony export */   "uniqueId": () => (/* binding */ L),
/* harmony export */   "uuid4": () => (/* binding */ V)
/* harmony export */ });
/* harmony import */ var materialize_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1413);
/* harmony import */ var materialize_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(materialize_css__WEBPACK_IMPORTED_MODULE_0__);
function t(e,t,n,a,i,o){return{tag:e,key:t,attrs:n,children:a,text:i,dom:o,domSize:void 0,state:void 0,events:void 0,instance:void 0}}t.normalize=function(e){return Array.isArray(e)?t("[",void 0,void 0,t.normalizeChildren(e),void 0,void 0):null==e||"boolean"==typeof e?null:"object"==typeof e?e:t("#",void 0,void 0,String(e),void 0,void 0)},t.normalizeChildren=function(e){var n=[];if(e.length){for(var a=null!=e[0]&&null!=e[0].key,i=1;i<e.length;i++)if((null!=e[i]&&null!=e[i].key)!==a)throw new TypeError(!a||null==e[i]&&"boolean"!=typeof e[i]?"In fragments, vnodes must either all have keys or none have keys.":"In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole.");for(i=0;i<e.length;i++)n[i]=t.normalize(e[i])}return n};var n=t,a=function(){var e,t=arguments[this],a=this+1;if(null==t?t={}:("object"!=typeof t||null!=t.tag||Array.isArray(t))&&(t={},a=this),arguments.length===a+1)e=arguments[a],Array.isArray(e)||(e=[e]);else for(e=[];a<arguments.length;)e.push(arguments[a++]);return n("",t.key,t,e)},i={}.hasOwnProperty,o=/(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,r={};function l(e){for(var t in e)if(i.call(e,t))return!1;return!0}function s(e){for(var t,n="div",a=[],i={};t=o.exec(e);){var l=t[1],s=t[2];if(""===l&&""!==s)n=s;else if("#"===l)i.id=s;else if("."===l)a.push(s);else if("["===t[3][0]){var c=t[6];c&&(c=c.replace(/\\(["'])/g,"$1").replace(/\\\\/g,"\\")),"class"===t[4]?a.push(c):i[t[4]]=""===c?c:c||!0}}return a.length>0&&(i.className=a.join(" ")),r[e]={tag:n,attrs:i}}function c(e,t){var n=t.attrs,a=i.call(n,"class"),o=a?n.class:n.className;if(t.tag=e.tag,t.attrs={},!l(e.attrs)&&!l(n)){var r={};for(var s in n)i.call(n,s)&&(r[s]=n[s]);n=r}for(var s in e.attrs)i.call(e.attrs,s)&&"className"!==s&&!i.call(n,s)&&(n[s]=e.attrs[s]);for(var s in null==o&&null==e.attrs.className||(n.className=null!=o?null!=e.attrs.className?String(e.attrs.className)+" "+String(o):o:null!=e.attrs.className?e.attrs.className:null),a&&(n.class=null),n)if(i.call(n,s)&&"key"!==s){t.attrs=n;break}return t}var d=function(e){if(null==e||"string"!=typeof e&&"function"!=typeof e&&"function"!=typeof e.view)throw Error("The selector must be either a string or a component.");var t=a.apply(1,arguments);return"string"==typeof e&&(t.children=n.normalizeChildren(t.children),"["!==e)?c(r[e]||s(e),t):(t.tag=e,t)};d.trust=function(e){return null==e&&(e=""),n("<",void 0,void 0,e,void 0,void 0)},d.fragment=function(){var e=a.apply(0,arguments);return e.tag="[",e.children=n.normalizeChildren(e.children),e};var u=d,f="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:{},m=function(e){if(!(this instanceof m))throw new Error("Promise must be called with 'new'.");if("function"!=typeof e)throw new TypeError("executor must be a function.");var t=this,n=[],a=[],i=s(n,!0),o=s(a,!1),r=t._instance={resolvers:n,rejectors:a},l="function"==typeof setImmediate?setImmediate:setTimeout;function s(e,i){return function s(d){var u;try{if(!i||null==d||"object"!=typeof d&&"function"!=typeof d||"function"!=typeof(u=d.then))l(function(){i||0!==e.length||console.error("Possible unhandled promise rejection:",d);for(var t=0;t<e.length;t++)e[t](d);n.length=0,a.length=0,r.state=i,r.retry=function(){s(d)}});else{if(d===t)throw new TypeError("Promise can't be resolved with itself.");c(u.bind(d))}}catch(e){o(e)}}}function c(e){var t=0;function n(e){return function(n){t++>0||e(n)}}var a=n(o);try{e(n(i),a)}catch(e){a(e)}}c(e)};m.prototype.then=function(e,t){var n,a,i=this._instance;function o(e,t,o,r){t.push(function(t){if("function"!=typeof e)o(t);else try{n(e(t))}catch(e){a&&a(e)}}),"function"==typeof i.retry&&r===i.state&&i.retry()}var r=new m(function(e,t){n=e,a=t});return o(e,i.resolvers,n,!0),o(t,i.rejectors,a,!1),r},m.prototype.catch=function(e){return this.then(null,e)},m.prototype.finally=function(e){return this.then(function(t){return m.resolve(e()).then(function(){return t})},function(t){return m.resolve(e()).then(function(){return m.reject(t)})})},m.resolve=function(e){return e instanceof m?e:new m(function(t){t(e)})},m.reject=function(e){return new m(function(t,n){n(e)})},m.all=function(e){return new m(function(t,n){var a=e.length,i=0,o=[];if(0===e.length)t([]);else for(var r=0;r<e.length;r++)!function(r){function l(e){i++,o[r]=e,i===a&&t(o)}null==e[r]||"object"!=typeof e[r]&&"function"!=typeof e[r]||"function"!=typeof e[r].then?l(e[r]):e[r].then(l,n)}(r)})},m.race=function(e){return new m(function(t,n){for(var a=0;a<e.length;a++)e[a].then(t,n)})};var p,h,v=m,g=(p=function(e){"undefined"!=typeof window?(void 0===window.Promise?window.Promise=v:window.Promise.prototype.finally||(window.Promise.prototype.finally=v.prototype.finally),e.exports=window.Promise):void 0!==f?(void 0===f.Promise?f.Promise=v:f.Promise.prototype.finally||(f.Promise.prototype.finally=v.prototype.finally),e.exports=f.Promise):e.exports=v},p(h={exports:{}}),h.exports),y=function(e){var t,a=e&&e.document,i={svg:"http://www.w3.org/2000/svg",math:"http://www.w3.org/1998/Math/MathML"};function o(e){return e.attrs&&e.attrs.xmlns||i[e.tag]}function r(e,t){if(e.state!==t)throw new Error("'vnode.state' must not be modified.")}function l(e){var t=e.state;try{return this.apply(t,arguments)}finally{r(e,t)}}function s(){try{return a.activeElement}catch(e){return null}}function c(e,t,n,a,i,o,r){for(var l=n;l<a;l++){var s=t[l];null!=s&&d(e,s,i,r,o)}}function d(e,t,n,i,r){var l=t.tag;if("string"==typeof l)switch(t.state={},null!=t.attrs&&P(t.attrs,t,n),l){case"#":!function(e,t,n){t.dom=a.createTextNode(t.children),x(e,t.dom,n)}(e,t,r);break;case"<":f(e,t,i,r);break;case"[":!function(e,t,n,i,o){var r=a.createDocumentFragment();if(null!=t.children){var l=t.children;c(r,l,0,l.length,n,null,i)}t.dom=r.firstChild,t.domSize=r.childNodes.length,x(e,r,o)}(e,t,n,i,r);break;default:!function(e,t,n,i,r){var l=t.tag,s=t.attrs,d=s&&s.is,u=(i=o(t)||i)?d?a.createElementNS(i,l,{is:d}):a.createElementNS(i,l):d?a.createElement(l,{is:d}):a.createElement(l);if(t.dom=u,null!=s&&function(e,t,n){"input"===e.tag&&null!=t.type&&e.dom.setAttribute("type",t.type);var a=null!=t&&"input"===e.tag&&"file"===t.type;for(var i in t)A(e,i,null,t[i],n,a)}(t,s,i),x(e,u,r),!N(t)&&null!=t.children){var f=t.children;c(u,f,0,f.length,n,null,i),"select"===t.tag&&null!=s&&function(e,t){if("value"in t)if(null===t.value)-1!==e.dom.selectedIndex&&(e.dom.value=null);else{var n=""+t.value;e.dom.value===n&&-1!==e.dom.selectedIndex||(e.dom.value=n)}"selectedIndex"in t&&A(e,"selectedIndex",null,t.selectedIndex,void 0)}(t,s)}}(e,t,n,i,r)}else!function(e,t,n,a,i){m(t,n),null!=t.instance?(d(e,t.instance,n,a,i),t.dom=t.instance.dom,t.domSize=null!=t.dom?t.instance.domSize:0):t.domSize=0}(e,t,n,i,r)}var u={caption:"table",thead:"table",tbody:"table",tfoot:"table",tr:"tbody",th:"tr",td:"tr",colgroup:"table",col:"colgroup"};function f(e,t,n,i){var o=t.children.match(/^\s*?<(\w+)/im)||[],r=a.createElement(u[o[1]]||"div");"http://www.w3.org/2000/svg"===n?(r.innerHTML='<svg xmlns="http://www.w3.org/2000/svg">'+t.children+"</svg>",r=r.firstChild):r.innerHTML=t.children,t.dom=r.firstChild,t.domSize=r.childNodes.length,t.instance=[];for(var l,s=a.createDocumentFragment();l=r.firstChild;)t.instance.push(l),s.appendChild(l);x(e,s,i)}function m(e,t){var a;if("function"==typeof e.tag.view){if(e.state=Object.create(e.tag),null!=(a=e.state.view).$$reentrantLock$$)return;a.$$reentrantLock$$=!0}else{if(e.state=void 0,null!=(a=e.tag).$$reentrantLock$$)return;a.$$reentrantLock$$=!0,e.state=null!=e.tag.prototype&&"function"==typeof e.tag.prototype.view?new e.tag(e):e.tag(e)}if(P(e.state,e,t),null!=e.attrs&&P(e.attrs,e,t),e.instance=n.normalize(l.call(e.state.view,e)),e.instance===e)throw Error("A view cannot return the vnode it received as argument");a.$$reentrantLock$$=null}function p(e,t,n,a,i,o){if(t!==n&&(null!=t||null!=n))if(null==t||0===t.length)c(e,n,0,n.length,a,i,o);else if(null==n||0===n.length)I(e,t,0,t.length);else{var r=null!=t[0]&&null!=t[0].key,l=null!=n[0]&&null!=n[0].key,s=0,u=0;if(!r)for(;u<t.length&&null==t[u];)u++;if(!l)for(;s<n.length&&null==n[s];)s++;if(r!==l)I(e,t,u,t.length),c(e,n,s,n.length,a,i,o);else if(l){for(var f,m,p,v,k,x=t.length-1,N=n.length-1;x>=u&&N>=s&&(p=t[x]).key===(v=n[N]).key;)p!==v&&h(e,p,v,a,i,o),null!=v.dom&&(i=v.dom),x--,N--;for(;x>=u&&N>=s&&(f=t[u]).key===(m=n[s]).key;)u++,s++,f!==m&&h(e,f,m,a,b(t,u,i),o);for(;x>=u&&N>=s&&s!==N&&f.key===v.key&&p.key===m.key;)w(e,p,k=b(t,u,i)),p!==m&&h(e,p,m,a,k,o),++s<=--N&&w(e,f,i),f!==v&&h(e,f,v,a,i,o),null!=v.dom&&(i=v.dom),u++,p=t[--x],v=n[N],f=t[u],m=n[s];for(;x>=u&&N>=s&&p.key===v.key;)p!==v&&h(e,p,v,a,i,o),null!=v.dom&&(i=v.dom),N--,p=t[--x],v=n[N];if(s>N)I(e,t,u,x+1);else if(u>x)c(e,n,s,N+1,a,i,o);else{var C,S,T=i,A=N-s+1,M=new Array(A),E=0,_=0,j=2147483647,O=0;for(_=0;_<A;_++)M[_]=-1;for(_=N;_>=s;_--){null==C&&(C=g(t,u,x+1));var L=C[(v=n[_]).key];null!=L&&(j=L<j?L:-1,M[_-s]=L,p=t[L],t[L]=null,p!==v&&h(e,p,v,a,i,o),null!=v.dom&&(i=v.dom),O++)}if(i=T,O!==x-u+1&&I(e,t,u,x+1),0===O)c(e,n,s,N+1,a,i,o);else if(-1===j)for(S=function(e){var t=[0],n=0,a=0,i=0,o=y.length=e.length;for(i=0;i<o;i++)y[i]=e[i];for(i=0;i<o;++i)if(-1!==e[i]){var r=t[t.length-1];if(e[r]<e[i])y[i]=r,t.push(i);else{for(n=0,a=t.length-1;n<a;){var l=(n>>>1)+(a>>>1)+(n&a&1);e[t[l]]<e[i]?n=l+1:a=l}e[i]<e[t[n]]&&(n>0&&(y[i]=t[n-1]),t[n]=i)}}for(a=t[(n=t.length)-1];n-- >0;)t[n]=a,a=y[a];return y.length=0,t}(M),E=S.length-1,_=N;_>=s;_--)m=n[_],-1===M[_-s]?d(e,m,a,o,i):S[E]===_-s?E--:w(e,m,i),null!=m.dom&&(i=n[_].dom);else for(_=N;_>=s;_--)m=n[_],-1===M[_-s]&&d(e,m,a,o,i),null!=m.dom&&(i=n[_].dom)}}else{var V=t.length<n.length?t.length:n.length;for(s=s<u?s:u;s<V;s++)(f=t[s])===(m=n[s])||null==f&&null==m||(null==f?d(e,m,a,o,b(t,s+1,i)):null==m?$(e,f):h(e,f,m,a,b(t,s+1,i),o));t.length>V&&I(e,t,s,t.length),n.length>V&&c(e,n,s,n.length,a,i,o)}}}function h(e,t,n,a,i,r){var s=t.tag;if(s===n.tag){if(n.state=t.state,n.events=t.events,function(e,t){do{var n;if(null!=e.attrs&&"function"==typeof e.attrs.onbeforeupdate&&void 0!==(n=l.call(e.attrs.onbeforeupdate,e,t))&&!n)break;if("string"!=typeof e.tag&&"function"==typeof e.state.onbeforeupdate&&void 0!==(n=l.call(e.state.onbeforeupdate,e,t))&&!n)break;return!1}while(0);return e.dom=t.dom,e.domSize=t.domSize,e.instance=t.instance,e.attrs=t.attrs,e.children=t.children,e.text=t.text,!0}(n,t))return;if("string"==typeof s)switch(null!=n.attrs&&F(n.attrs,n,a),s){case"#":!function(e,t){e.children.toString()!==t.children.toString()&&(e.dom.nodeValue=t.children),t.dom=e.dom}(t,n);break;case"<":!function(e,t,n,a,i){t.children!==n.children?(C(e,t),f(e,n,a,i)):(n.dom=t.dom,n.domSize=t.domSize,n.instance=t.instance)}(e,t,n,r,i);break;case"[":!function(e,t,n,a,i,o){p(e,t.children,n.children,a,i,o);var r=0,l=n.children;if(n.dom=null,null!=l){for(var s=0;s<l.length;s++){var c=l[s];null!=c&&null!=c.dom&&(null==n.dom&&(n.dom=c.dom),r+=c.domSize||1)}1!==r&&(n.domSize=r)}}(e,t,n,a,i,r);break;default:!function(e,t,n,a){var i=t.dom=e.dom;a=o(t)||a,"textarea"===t.tag&&null==t.attrs&&(t.attrs={}),function(e,t,n,a){if(t&&t===n&&console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major"),null!=n){"input"===e.tag&&null!=n.type&&e.dom.setAttribute("type",n.type);var i="input"===e.tag&&"file"===n.type;for(var o in n)A(e,o,t&&t[o],n[o],a,i)}var r;if(null!=t)for(var o in t)null==(r=t[o])||null!=n&&null!=n[o]||M(e,o,r,a)}(t,e.attrs,t.attrs,a),N(t)||p(i,e.children,t.children,n,null,a)}(t,n,a,r)}else v(e,t,n,a,i,r)}else $(e,t),d(e,n,a,r,i)}function v(e,t,a,i,o,r){if(a.instance=n.normalize(l.call(a.state.view,a)),a.instance===a)throw Error("A view cannot return the vnode it received as argument");F(a.state,a,i),null!=a.attrs&&F(a.attrs,a,i),null!=a.instance?(null==t.instance?d(e,a.instance,i,r,o):h(e,t.instance,a.instance,i,o,r),a.dom=a.instance.dom,a.domSize=a.instance.domSize):null!=t.instance?($(e,t.instance),a.dom=void 0,a.domSize=0):(a.dom=t.dom,a.domSize=t.domSize)}function g(e,t,n){for(var a=Object.create(null);t<n;t++){var i=e[t];if(null!=i){var o=i.key;null!=o&&(a[o]=t)}}return a}var y=[];function b(e,t,n){for(;t<e.length;t++)if(null!=e[t]&&null!=e[t].dom)return e[t].dom;return n}function w(e,t,n){var i=a.createDocumentFragment();k(e,i,t),x(e,i,n)}function k(e,t,n){for(;null!=n.dom&&n.dom.parentNode===e;){if("string"!=typeof n.tag){if(null!=(n=n.instance))continue}else if("<"===n.tag)for(var a=0;a<n.instance.length;a++)t.appendChild(n.instance[a]);else if("["!==n.tag)t.appendChild(n.dom);else if(1===n.children.length){if(null!=(n=n.children[0]))continue}else for(a=0;a<n.children.length;a++){var i=n.children[a];null!=i&&k(e,t,i)}break}}function x(e,t,n){null!=n?e.insertBefore(t,n):e.appendChild(t)}function N(e){if(null==e.attrs||null==e.attrs.contenteditable&&null==e.attrs.contentEditable)return!1;var t=e.children;if(null!=t&&1===t.length&&"<"===t[0].tag){var n=t[0].children;e.dom.innerHTML!==n&&(e.dom.innerHTML=n)}else if(null!=t&&0!==t.length)throw new Error("Child node of a contenteditable must be trusted.");return!0}function I(e,t,n,a){for(var i=n;i<a;i++){var o=t[i];null!=o&&$(e,o)}}function $(e,t){var n,a,i,o,s=0,c=t.state;function d(){r(t,c),T(t),S(e,t)}"string"!=typeof t.tag&&"function"==typeof t.state.onbeforeremove&&null!=(i=l.call(t.state.onbeforeremove,t))&&"function"==typeof i.then&&(s=1,n=i),t.attrs&&"function"==typeof t.attrs.onbeforeremove&&null!=(i=l.call(t.attrs.onbeforeremove,t))&&"function"==typeof i.then&&(s|=2,a=i),r(t,c),s?(null!=n&&n.then(o=function(){1&s&&((s&=2)||d())},o),null!=a&&a.then(o=function(){2&s&&((s&=1)||d())},o)):(T(t),S(e,t))}function C(e,t){for(var n=0;n<t.instance.length;n++)e.removeChild(t.instance[n])}function S(e,t){for(;null!=t.dom&&t.dom.parentNode===e;){if("string"!=typeof t.tag){if(null!=(t=t.instance))continue}else if("<"===t.tag)C(e,t);else{if("["!==t.tag&&(e.removeChild(t.dom),!Array.isArray(t.children)))break;if(1===t.children.length){if(null!=(t=t.children[0]))continue}else for(var n=0;n<t.children.length;n++){var a=t.children[n];null!=a&&S(e,a)}}break}}function T(e){if("string"!=typeof e.tag&&"function"==typeof e.state.onremove&&l.call(e.state.onremove,e),e.attrs&&"function"==typeof e.attrs.onremove&&l.call(e.attrs.onremove,e),"string"!=typeof e.tag)null!=e.instance&&T(e.instance);else{var t=e.children;if(Array.isArray(t))for(var n=0;n<t.length;n++){var a=t[n];null!=a&&T(a)}}}function A(e,t,n,i,o,r){if(!("key"===t||"is"===t||null==i||E(t)||n===i&&!function(e,t){return"value"===t||"checked"===t||"selectedIndex"===t||"selected"===t&&e.dom===s()||"option"===e.tag&&e.dom.parentNode===a.activeElement}(e,t)&&"object"!=typeof i||"type"===t&&"input"===e.tag)){if("o"===t[0]&&"n"===t[1])return z(e,t,i);if("xlink:"===t.slice(0,6))e.dom.setAttributeNS("http://www.w3.org/1999/xlink",t.slice(6),i);else if("style"===t)D(e.dom,n,i);else if(_(e,t,o)){if("value"===t){if(("input"===e.tag||"textarea"===e.tag)&&e.dom.value===""+i&&(r||e.dom===s()))return;if("select"===e.tag&&null!==n&&e.dom.value===""+i)return;if("option"===e.tag&&null!==n&&e.dom.value===""+i)return;if(r&&""+i!="")return void console.error("`value` is read-only on file inputs!")}e.dom[t]=i}else"boolean"==typeof i?i?e.dom.setAttribute(t,""):e.dom.removeAttribute(t):e.dom.setAttribute("className"===t?"class":t,i)}}function M(e,t,n,a){if("key"!==t&&"is"!==t&&null!=n&&!E(t))if("o"===t[0]&&"n"===t[1])z(e,t,void 0);else if("style"===t)D(e.dom,n,null);else if(!_(e,t,a)||"className"===t||"title"===t||"value"===t&&("option"===e.tag||"select"===e.tag&&-1===e.dom.selectedIndex&&e.dom===s())||"input"===e.tag&&"type"===t){var i=t.indexOf(":");-1!==i&&(t=t.slice(i+1)),!1!==n&&e.dom.removeAttribute("className"===t?"class":t)}else e.dom[t]=null}function E(e){return"oninit"===e||"oncreate"===e||"onupdate"===e||"onremove"===e||"onbeforeremove"===e||"onbeforeupdate"===e}function _(e,t,n){return void 0===n&&(e.tag.indexOf("-")>-1||null!=e.attrs&&e.attrs.is||"href"!==t&&"list"!==t&&"form"!==t&&"width"!==t&&"height"!==t)&&t in e.dom}var j,O=/[A-Z]/g;function L(e){return"-"+e.toLowerCase()}function V(e){return"-"===e[0]&&"-"===e[1]?e:"cssFloat"===e?"float":e.replace(O,L)}function D(e,t,n){if(t===n);else if(null==n)e.style.cssText="";else if("object"!=typeof n)e.style.cssText=n;else if(null==t||"object"!=typeof t)for(var a in e.style.cssText="",n)null!=(i=n[a])&&e.style.setProperty(V(a),String(i));else{for(var a in n){var i;null!=(i=n[a])&&(i=String(i))!==String(t[a])&&e.style.setProperty(V(a),i)}for(var a in t)null!=t[a]&&null==n[a]&&e.style.removeProperty(V(a))}}function R(){this._=t}function z(e,n,a){if(null!=e.events){if(e.events._=t,e.events[n]===a)return;null==a||"function"!=typeof a&&"object"!=typeof a?(null!=e.events[n]&&e.dom.removeEventListener(n.slice(2),e.events,!1),e.events[n]=void 0):(null==e.events[n]&&e.dom.addEventListener(n.slice(2),e.events,!1),e.events[n]=a)}else null==a||"function"!=typeof a&&"object"!=typeof a||(e.events=new R,e.dom.addEventListener(n.slice(2),e.events,!1),e.events[n]=a)}function P(e,t,n){"function"==typeof e.oninit&&l.call(e.oninit,t),"function"==typeof e.oncreate&&n.push(l.bind(e.oncreate,t))}function F(e,t,n){"function"==typeof e.onupdate&&n.push(l.bind(e.onupdate,t))}return(R.prototype=Object.create(null)).handleEvent=function(e){var t,n=this["on"+e.type];"function"==typeof n?t=n.call(e.currentTarget,e):"function"==typeof n.handleEvent&&n.handleEvent(e),this._&&!1!==e.redraw&&(0,this._)(),!1===t&&(e.preventDefault(),e.stopPropagation())},function(e,a,i){if(!e)throw new TypeError("DOM element being rendered to does not exist.");if(null!=j&&e.contains(j))throw new TypeError("Node is currently being rendered to and thus is locked.");var o=t,r=j,l=[],c=s(),d=e.namespaceURI;j=e,t="function"==typeof i?i:void 0;try{null==e.vnodes&&(e.textContent=""),a=n.normalizeChildren(Array.isArray(a)?a:[a]),p(e,e.vnodes,a,l,null,"http://www.w3.org/1999/xhtml"===d?void 0:d),e.vnodes=a,null!=c&&s()!==c&&"function"==typeof c.focus&&c.focus();for(var u=0;u<l.length;u++)l[u]()}finally{t=o,j=r}}}("undefined"!=typeof window?window:null),b=function(e,t,a){var i=[],o=!1,r=-1;function l(){for(r=0;r<i.length;r+=2)try{e(i[r],n(i[r+1]),s)}catch(e){a.error(e)}r=-1}function s(){o||(o=!0,t(function(){o=!1,l()}))}return s.sync=l,{mount:function(t,a){if(null!=a&&null==a.view&&"function"!=typeof a)throw new TypeError("m.mount expects a component, not a vnode.");var o=i.indexOf(t);o>=0&&(i.splice(o,2),o<=r&&(r-=2),e(t,[])),null!=a&&(i.push(t,a),e(t,n(a),s))},redraw:s}}(y,"undefined"!=typeof requestAnimationFrame?requestAnimationFrame:null,"undefined"!=typeof console?console:null),w=function(e){if("[object Object]"!==Object.prototype.toString.call(e))return"";var t=[];for(var n in e)a(n,e[n]);return t.join("&");function a(e,n){if(Array.isArray(n))for(var i=0;i<n.length;i++)a(e+"["+i+"]",n[i]);else if("[object Object]"===Object.prototype.toString.call(n))for(var i in n)a(e+"["+i+"]",n[i]);else t.push(encodeURIComponent(e)+(null!=n&&""!==n?"="+encodeURIComponent(n):""))}},k=Object.assign||function(e,t){for(var n in t)i.call(t,n)&&(e[n]=t[n])},x=function(e,t){if(/:([^\/\.-]+)(\.{3})?:/.test(e))throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");if(null==t)return e;var n=e.indexOf("?"),a=e.indexOf("#"),i=a<0?e.length:a,o=e.slice(0,n<0?i:n),r={};k(r,t);var l=o.replace(/:([^\/\.-]+)(\.{3})?/g,function(e,n,a){return delete r[n],null==t[n]?e:a?t[n]:encodeURIComponent(String(t[n]))}),s=l.indexOf("?"),c=l.indexOf("#"),d=c<0?l.length:c,u=l.slice(0,s<0?d:s);n>=0&&(u+=e.slice(n,i)),s>=0&&(u+=(n<0?"?":"&")+l.slice(s,d));var f=w(r);return f&&(u+=(n<0&&s<0?"?":"&")+f),a>=0&&(u+=e.slice(a)),c>=0&&(u+=(a<0?"":"&")+l.slice(c)),u},N=function(e,t,n){var a=0;function o(e){return new t(e)}function r(e){return function(a,i){"string"!=typeof a?(i=a,a=a.url):null==i&&(i={});var r=new t(function(t,n){e(x(a,i.params),i,function(e){if("function"==typeof i.type)if(Array.isArray(e))for(var n=0;n<e.length;n++)e[n]=new i.type(e[n]);else e=new i.type(e);t(e)},n)});if(!0===i.background)return r;var l=0;function s(){0==--l&&"function"==typeof n&&n()}return function e(t){var n=t.then;return t.constructor=o,t.then=function(){l++;var a=n.apply(t,arguments);return a.then(s,function(e){if(s(),0===l)throw e}),e(a)},t}(r)}}function l(e,t){for(var n in e.headers)if(i.call(e.headers,n)&&n.toLowerCase()===t)return!0;return!1}return o.prototype=t.prototype,o.__proto__=t,{request:r(function(t,n,a,o){var r,s=null!=n.method?n.method.toUpperCase():"GET",c=n.body,d=(null==n.serialize||n.serialize===JSON.serialize)&&!(c instanceof e.FormData||c instanceof e.URLSearchParams),u=n.responseType||("function"==typeof n.extract?"":"json"),f=new e.XMLHttpRequest,m=!1,p=!1,h=f,v=f.abort;for(var g in f.abort=function(){m=!0,v.call(this)},f.open(s,t,!1!==n.async,"string"==typeof n.user?n.user:void 0,"string"==typeof n.password?n.password:void 0),d&&null!=c&&!l(n,"content-type")&&f.setRequestHeader("Content-Type","application/json; charset=utf-8"),"function"==typeof n.deserialize||l(n,"accept")||f.setRequestHeader("Accept","application/json, text/*"),n.withCredentials&&(f.withCredentials=n.withCredentials),n.timeout&&(f.timeout=n.timeout),f.responseType=u,n.headers)i.call(n.headers,g)&&f.setRequestHeader(g,n.headers[g]);f.onreadystatechange=function(e){if(!m&&4===e.target.readyState)try{var i,r=e.target.status>=200&&e.target.status<300||304===e.target.status||/^file:\/\//i.test(t),l=e.target.response;if("json"===u){if(!e.target.responseType&&"function"!=typeof n.extract)try{l=JSON.parse(e.target.responseText)}catch(e){l=null}}else u&&"text"!==u||null==l&&(l=e.target.responseText);if("function"==typeof n.extract?(l=n.extract(e.target,n),r=!0):"function"==typeof n.deserialize&&(l=n.deserialize(l)),r)a(l);else{var s=function(){try{i=e.target.responseText}catch(e){i=l}var t=new Error(i);t.code=e.target.status,t.response=l,o(t)};0===f.status?setTimeout(function(){p||s()}):s()}}catch(e){o(e)}},f.ontimeout=function(e){p=!0;var t=new Error("Request timed out");t.code=e.target.status,o(t)},"function"==typeof n.config&&(f=n.config(f,n,t)||f)!==h&&(r=f.abort,f.abort=function(){m=!0,r.call(this)}),null==c?f.send():f.send("function"==typeof n.serialize?n.serialize(c):c instanceof e.FormData||c instanceof e.URLSearchParams?c:JSON.stringify(c))}),jsonp:r(function(t,n,i,o){var r=n.callbackName||"_mithril_"+Math.round(1e16*Math.random())+"_"+a++,l=e.document.createElement("script");e[r]=function(t){delete e[r],l.parentNode.removeChild(l),i(t)},l.onerror=function(){delete e[r],l.parentNode.removeChild(l),o(new Error("JSONP request failed"))},l.src=t+(t.indexOf("?")<0?"?":"&")+encodeURIComponent(n.callbackKey||"callback")+"="+encodeURIComponent(r),e.document.documentElement.appendChild(l)})}}("undefined"!=typeof window?window:null,g,b.redraw);function I(e){try{return decodeURIComponent(e)}catch(t){return e}}var $=function(e){if(""===e||null==e)return{};"?"===e.charAt(0)&&(e=e.slice(1));for(var t=e.split("&"),n={},a={},i=0;i<t.length;i++){var o=t[i].split("="),r=I(o[0]),l=2===o.length?I(o[1]):"";"true"===l?l=!0:"false"===l&&(l=!1);var s=r.split(/\]\[?|\[/),c=a;r.indexOf("[")>-1&&s.pop();for(var d=0;d<s.length;d++){var u=s[d],f=s[d+1],m=""==f||!isNaN(parseInt(f,10));if(""===u)null==n[r=s.slice(0,d).join()]&&(n[r]=Array.isArray(c)?c.length:0),u=n[r]++;else if("__proto__"===u)break;if(d===s.length-1)c[u]=l;else{var p=Object.getOwnPropertyDescriptor(c,u);null!=p&&(p=p.value),null==p&&(c[u]=p=m?[]:{}),c=p}}}return a},C=function(e){var t=e.indexOf("?"),n=e.indexOf("#"),a=n<0?e.length:n,i=e.slice(0,t<0?a:t).replace(/\/{2,}/g,"/");return i?("/"!==i[0]&&(i="/"+i),i.length>1&&"/"===i[i.length-1]&&(i=i.slice(0,-1))):i="/",{path:i,params:t<0?{}:$(e.slice(t+1,a))}},S=new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$"),T=function(e,t){var n={};if(null!=t)for(var a in e)i.call(e,a)&&!S.test(a)&&t.indexOf(a)<0&&(n[a]=e[a]);else for(var a in e)i.call(e,a)&&!S.test(a)&&(n[a]=e[a]);return n},A={};function E(e){try{return decodeURIComponent(e)}catch(t){return e}}var _=function(e,t){var a,i,o,r,l,s,c=null==e?null:"function"==typeof e.setImmediate?e.setImmediate:e.setTimeout,u=g.resolve(),f=!1,m=!1,p=0,h=A,v={onbeforeupdate:function(){return!(!(p=p?2:1)||A===h)},onremove:function(){e.removeEventListener("popstate",w,!1),e.removeEventListener("hashchange",b,!1)},view:function(){if(p&&A!==h){var e=[n(o,r.key,r)];return h&&(e=h.render(e[0])),e}}},y=I.SKIP={};function b(){f=!1;var n=e.location.hash;"#"!==I.prefix[0]&&(n=e.location.search+n,"?"!==I.prefix[0]&&"/"!==(n=e.location.pathname+n)[0]&&(n="/"+n));var c=n.concat().replace(/(?:%[a-f89][a-f0-9])+/gim,E).slice(I.prefix.length),d=C(c);function m(e){console.error(e),N(i,null,{replace:!0})}k(d.params,e.history.state),function e(n){for(;n<a.length;n++)if(a[n].check(d)){var f=a[n].component,v=a[n].route,g=f,b=s=function(a){if(b===s){if(a===y)return e(n+1);o=null==a||"function"!=typeof a.view&&"function"!=typeof a?"div":a,r=d.params,l=c,s=null,h=f.render?f:null,2===p?t.redraw():(p=2,t.redraw.sync())}};return void(f.view||"function"==typeof f?(f={},b(g)):f.onmatch?u.then(function(){return f.onmatch(d.params,c,v)}).then(b,c===i?null:m):b("div"))}if(c===i)throw new Error("Could not resolve default route "+i+".");N(i,null,{replace:!0})}(0)}function w(){f||(f=!0,c(b))}function N(t,n,a){if(t=x(t,n),m){w();var i=a?a.state:null,o=a?a.title:null;a&&a.replace?e.history.replaceState(i,o,I.prefix+t):e.history.pushState(i,o,I.prefix+t)}else e.location.href=I.prefix+t}function I(n,o,r){if(!n)throw new TypeError("DOM element being rendered to does not exist.");if(a=Object.keys(r).map(function(e){if("/"!==e[0])throw new SyntaxError("Routes must start with a '/'.");if(/:([^\/\.-]+)(\.{3})?:/.test(e))throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");return{route:e,component:r[e],check:(t=e,n=C(t),a=Object.keys(n.params),i=[],o=new RegExp("^"+n.path.replace(/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,function(e,t,n){return null==t?"\\"+e:(i.push({k:t,r:"..."===n}),"..."===n?"(.*)":"."===n?"([^/]+)\\.":"([^/]+)"+(n||""))})+"$"),function(e){for(var t=0;t<a.length;t++)if(n.params[a[t]]!==e.params[a[t]])return!1;if(!i.length)return o.test(e.path);var r=o.exec(e.path);if(null==r)return!1;for(t=0;t<i.length;t++)e.params[i[t].k]=i[t].r?r[t+1]:decodeURIComponent(r[t+1]);return!0})};var t,n,a,i,o}),i=o,null!=o){var l=C(o);if(!a.some(function(e){return e.check(l)}))throw new ReferenceError("Default route doesn't match any known routes.")}"function"==typeof e.history.pushState?e.addEventListener("popstate",w,!1):"#"===I.prefix[0]&&e.addEventListener("hashchange",b,!1),m=!0,t.mount(n,v),b()}return I.set=function(e,t,n){null!=s&&((n=n||{}).replace=!0),s=null,N(e,t,n)},I.get=function(){return l},I.prefix="#!",I.Link={view:function(e){var t,n,a,i=d(e.attrs.selector||"a",T(e.attrs,["options","params","selector","onclick"]),e.children);return(i.attrs.disabled=Boolean(i.attrs.disabled))?(i.attrs.href=null,i.attrs["aria-disabled"]="true"):(t=e.attrs.options,n=e.attrs.onclick,a=x(i.attrs.href,e.attrs.params),i.attrs.href=I.prefix+a,i.attrs.onclick=function(e){var i;"function"==typeof n?i=n.call(e.currentTarget,e):null==n||"object"!=typeof n||"function"==typeof n.handleEvent&&n.handleEvent(e),!1===i||e.defaultPrevented||0!==e.button&&0!==e.which&&1!==e.which||e.currentTarget.target&&"_self"!==e.currentTarget.target||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||(e.preventDefault(),e.redraw=!1,I.set(a,null,t))}),i}},I.param=function(e){return r&&null!=e?r[e]:r},I}("undefined"!=typeof window?window:null,b),j=function(){return u.apply(this,arguments)};j.m=u,j.trust=u.trust,j.fragment=u.fragment,j.Fragment="[",j.mount=b.mount,j.route=_,j.render=y,j.redraw=b.redraw,j.request=N.request,j.jsonp=N.jsonp,j.parseQueryString=$,j.buildQueryString=w,j.parsePathname=C,j.buildPathname=x,j.vnode=n,j.PromisePolyfill=v,j.censor=T;var O=j;const L=()=>"idxxxxxxxx".replace(/[x]/g,()=>(16*Math.random()|0).toString(16)),V=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}),D=(...e)=>t=>e.reduceRight((e,t)=>t(e),t),R=e=>t=>Array.prototype.map.call(t,e),z=e=>t=>Array.prototype.join.call(t,e),P=e=>e.replace(/([A-Z])/g,e=>"-"+e.toLowerCase()),F=e=>e?D(z(""),R(t=>`[${P(t)}="${((e="")=>e.toString().replace(/"/g,"&quot;"))(e[t])}"]`),Object.keys)(e):"",U=["min","max","minLength","maxLength","rows","cols","placeholder","autocomplete","pattern","readOnly","step"],q=e=>U.indexOf(e)>=0,K=({disabled:e})=>e?"[disabled]":"",B=({required:e,isMandatory:t})=>e||t?"[required][aria-required=true]":"",H=e=>(e=>{const t=(n=e,e=>void 0!==n[e]);var n;return Object.keys(e).filter(q).filter(t).reduce((t,n)=>{const a=e[n];return t.push(`[${n.toLowerCase()}=${a}]`),t},[]).join("")})(e)+(e=>e.maxLength?`[data-length=${e.maxLength}]`:"")(e)+K(e)+B(e)+(({autofocus:e})=>"boolean"==typeof e&&e||e&&e()?"[autofocus]":"")(e),J=e=>!isNaN(parseFloat(e))&&isFinite(e),Y=(...e)=>t=>e.reduce((e,t)=>t(e),t),Q=(e,t=2,n="0")=>(e+="").length>=t?e:new Array(t-e.length+1).join(n)+e,Z=(e,t,n)=>{const a=e[t];e[t]=e[n],e[n]=a},G=(e,t,n)=>{const a=e[t];e.splice(t,1),e.splice(n,0,a)};function W(){return W=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},W.apply(this,arguments)}function X(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)t.indexOf(n=o[a])>=0||(i[n]=e[n]);return i}const ee=["label","id","isMandatory","isActive"],te={view:({attrs:e})=>O("span.mandatory",e,"*")},ne=()=>({view:e=>{let{attrs:{label:t,id:n,isMandatory:a,isActive:i}}=e,o=X(e.attrs,ee);return t?O(`label${i?".active":""}${n?`[for=${n}]`:""}`,o,[O.trust(t),a?O(te):void 0]):void 0}}),ae=()=>({view:({attrs:{helperText:e,dataError:t,dataSuccess:n}})=>{const a=t||n?F({dataError:t,dataSuccess:n}):"";return e||a?O(`span.helper-text${a}`,e?O.trust(e):""):void 0}}),ie=()=>{const e={id:L()};return{view:({attrs:t})=>{const n=t.id||e.id,a=H(t),{label:i,helperText:o,initialValue:r,onchange:l,newRow:s,className:c="col s12",style:d,iconName:u,isMandatory:f}=t;return O(".input-field"+(s?".clear":""),{className:c,style:d},[u?O("i.material-icons.prefix",u):"",O(`input.autocomplete[type=text][tabindex=0][id=${n}]${a}`,{oncreate:({dom:e})=>{M.Autocomplete.init(e,t)},onchange:l?e=>{e.target&&e.target.value&&l(e.target.value)}:void 0,value:r}),O(ne,{label:i,id:n,isMandatory:f,isActive:r}),O(ae,{helperText:o})])}}},oe=["iconName"],re=()=>({view:e=>{let{attrs:{iconName:t}}=e,n=X(e.attrs,oe);return O("i.material-icons",n,t)}}),le=["modalId","tooltip","tooltipPostion","iconName","iconClass","label","attr"],se=(e,t="")=>()=>{const n=`${e}${t}`;return{view:({attrs:e})=>{const{modalId:t,tooltip:a,tooltipPostion:i,iconName:o,iconClass:r,label:l,attr:s}=e,c=X(e,le);return O(`${n}${t?`.modal-trigger[href=#${t}]`:""}${a?`.tooltipped[data-position=${i||"top"}][data-tooltip=${a}]`:""}${F(s)}`,c,o?O(re,{iconName:o,className:r||"left"}):void 0,l||void 0)}}},ce=se("a.waves-effect.waves-light.btn"),de=se("a.waves-effect.waves-light.btn-large"),ue=se("a.waves-effect.waves-light.btn-small"),fe=se("a.waves-effect.waves-teal.btn-flat"),me=se("button.btn-floating.btn-large.waves-effect.waves-light"),pe=se("button.btn.waves-effect.waves-light","[type=submit]"),he=()=>({view:({attrs:{href:e,src:t}})=>O("a.carousel-item",{href:e},O(`img[src=${t}]`))}),ve=()=>({view:({attrs:e})=>{const{items:t}=e;return t&&t.length>0?O(".carousel",{oncreate:({dom:t})=>{M.Carousel.init(t,e)}},t.map(e=>O(he,e))):void 0}}),ge=()=>({oncreate:({attrs:e,dom:t})=>{const{onchange:n,onChipAdd:a,onChipDelete:i}=e,o=M.Chips.getInstance(t.children[0]),r=a?a.bind(o):void 0;e.onChipAdd=function(e,t){n&&n(this.chipsData),r&&r(e,t)};const l=i?i.bind(o):void 0;e.onChipDelete=function(e,t){n&&n(this.chipsData),l&&l(e,t)},M.Chips.init(t.children[0],e)},onupdate:({dom:e,attrs:{data:t}})=>{if(!t||0===t.length)return;const n=M.Chips.getInstance(e.children[0]);t.forEach(e=>n.addChip(e))},view:({attrs:{placeholder:e,required:t,isMandatory:n=t,data:a,className:i="col s12",label:o,helperText:r}})=>O(".input-field",{className:i},[O(`.chips.chips-autocomplete${e?".chips-placeholder":""}${a?".chips-initial":""}`),o?O(ne,{label:o,isMandatory:n,className:"active"}):void 0,r?O(ae,{helperText:r}):void 0])}),ye=()=>({view:({attrs:e})=>{const{newRow:t,code:n,language:a}=e,i=a||"lang-TypeScript",o=i.replace("lang-",""),r=n instanceof Array?n.join("\n"):n;return O("pre.codeblock"+(t?".clear":""),e,[O("div",O("label",o)),O(`code.${i}`,r)])}}),be=()=>({view:({attrs:{header:e,body:t,active:n,iconName:a}})=>O(n?"li.active":"li",[e||a?O(".collapsible-header",[a?O("i.material-icons",a):void 0,e?"string"==typeof e?O("span",e):e:void 0]):void 0,t?O(".collapsible-body",t):void 0])}),we=()=>({oncreate:({dom:e,attrs:t})=>{M.Collapsible.init(e,t)},view:({attrs:e})=>{const{items:t,class:n,className:a,style:i,id:o}=e;return t&&t.length>0?O("ul.collapsible",{class:n||a,style:i,id:o},t.map(e=>O(be,e))):void 0}}),ke=["header","items","mode"],xe=["title","active","href"],Ne=["items","header"],Ie=["items","header","mode"];var $e;!function(e){e[e.BASIC=0]="BASIC",e[e.LINKS=1]="LINKS",e[e.AVATAR=2]="AVATAR"}($e||($e={}));const Ce=e=>e&&/https?:\/\//.test(e),Se=()=>({view:({attrs:e})=>{const{href:t,iconName:n="send",onclick:a,style:i={cursor:"pointer"}}=e,o={href:t,style:i,className:"secondary-content",onclick:a?()=>a(e):void 0};return Ce(t)||!t?O("a[target=_]",o,O(re,{iconName:n})):O(O.route.Link,o,O(re,{iconName:n}))}}),Te=(e="")=>/\./.test(e),Ae=()=>({view:({attrs:{item:e,mode:t}})=>{const{title:n,content:a="",active:i,iconName:o,avatar:r,className:l,onclick:s}=e;return t===$e.AVATAR?O("li.collection-item.avatar"+(i?".active":""),{onclick:s?()=>s(e):void 0},[Te(r)?O("img.circle",{src:r}):O("i.material-icons.circle",{className:l},r),O("span.title",n),O("p",O.trust(a)),O(Se,e)]):O("li.collection-item"+(i?".active":""),o?O("div",[n,O(Se,e)]):n)}}),Me=()=>({view:e=>{let{attrs:{header:t,items:n,mode:a=$e.BASIC}}=e,i=X(e.attrs,ke);const o=n.map(e=>O(Ae,{key:e.id,item:e,mode:a}));return t?O("ul.collection.with-header",i,[O("li.collection-header",O("h4",t)),o]):O("ul.collection",i,o)}}),Ee=()=>({view:({attrs:{item:e}})=>{const{title:t,active:n,href:a}=e,i=W({},X(e,xe),{className:"collection-item "+(n?"active":""),href:a});return Ce(a)||!a?O("a[target=_]",i,t):O(O.route.Link,i,t)}}),_e=()=>({view:e=>{let{attrs:{items:t,header:n}}=e,a=X(e.attrs,Ne);return n?O(".collection.with-header",a,[O(".collection-header",O("h4",n)),t.map(e=>O(Ee,{key:e.id,item:e}))]):O(".collection",a,t.map(e=>O(Ee,{key:e.id,item:e})))}}),je=()=>({view:e=>{let{attrs:{items:t,header:n,mode:a=$e.BASIC}}=e,i=X(e.attrs,Ie);return n||t&&t.length>0?a===$e.LINKS?O(_e,W({header:n,items:t},i)):O(Me,W({header:n,items:t,mode:a},i)):void 0}}),Oe=["key","label","onchange","disabled","items","iconName","helperText","style","className"],Le=()=>{const e={};return{oninit:({attrs:{id:t=L(),initialValue:n,checkedId:a}})=>{e.id=t,e.initialValue=n||a},view:t=>{let{attrs:{key:n,label:a,onchange:i,disabled:o=!1,items:r,iconName:l,helperText:s,style:c,className:d="col s12"}}=t,u=X(t.attrs,Oe);const{id:f,initialValue:m}=e,p=m?r.filter(e=>e.id?e.id===m:e.label===m).shift():void 0,h=p?p.label:a||"Select";return O(".input-field",{className:d,key:n,style:c},[l?O("i.material-icons.prefix",l):void 0,O(ae,{helperText:s}),O(`a.dropdown-trigger.btn.truncate[href=#][data-target=${f}]${o?"[disabled]":""}`,{className:"col s12",style:c||(l?"margin: 0.2em 0 0 3em;":void 0),oncreate:({dom:e})=>{M.Dropdown.init(e,u)}},h),O(`ul.dropdown-content[id=${f}]`,r.map(t=>O("li"+(t.divider?".divider[tabindex=-1]":""),t.divider?void 0:O("a",{onclick:i?()=>{e.initialValue=t.id||t.label,i(e.initialValue)}:void 0},[t.iconName?O("i.material-icons",t.iconName):void 0,t.label]))))])}}},Ve=["className","iconName","iconClass","position","style","buttons"],De=()=>({view:e=>{let{attrs:{className:t,iconName:n,iconClass:a="large",position:i,style:o=("left"===i||"inline-left"===i?"position: absolute; display: inline-block; left: 24px;":"right"===i||"inline-right"===i?"position: absolute; display: inline-block; right: 24px;":void 0),buttons:r}}=e,l=X(e.attrs,Ve);const s=O(".fixed-action-btn",{style:o,oncreate:({dom:e})=>M.FloatingActionButton.init(e,l)},[O("a.btn-floating.btn-large",{className:t},O("i.material-icons",{classNames:a},n)),r?O("ul",r.map(e=>O("li",O("a.btn-floating",{className:e.className,onclick:t=>e.onClick&&e.onClick(t)},O("i.material-icons",{className:e.iconClass},e.iconName))))):void 0]);return"inline-right"===i||"inline-left"===i?O("div",{style:"position: relative; height: 70px;"},s):s}}),Re=["className","helperText","iconName","id","initialValue","isMandatory","label","onchange","style"],ze=["className","dataError","dataSuccess","helperText","iconName","id","initialValue","isMandatory","label","maxLength","newRow","onchange","onkeydown","onkeypress","onkeyup","style","validate"],Pe=()=>{const t={id:L()};return{view:({attrs:n})=>{const{className:a="col s12",helperText:i,iconName:o,id:r=t.id,initialValue:l,isMandatory:s,label:c,onchange:d,style:u}=n,f=X(n,Re),m=H(f);return O(".input-field",{className:a,style:u},[o?O("i.material-icons.prefix",o):"",O(`textarea.materialize-textarea[tabindex=0][id=${r}]${m}`,{oncreate:({dom:t})=>{materialize_css__WEBPACK_IMPORTED_MODULE_0___default().textareaAutoResize(t),n.maxLength&&materialize_css__WEBPACK_IMPORTED_MODULE_0___default().CharacterCounter.init(t)},onchange:d?e=>{const t=e.target;d(t&&"string"==typeof t.value?t.value:"")}:void 0,value:l}),O(ne,{label:c,id:r,isMandatory:s,isActive:l||n.placeholder}),O(ae,{helperText:i})])}}},Fe=(t,n="")=>()=>{const a={id:L()},i=e=>{const n=e.value;return!n||"number"!==t&&"range"!==t?n:+n},o=(e,t)=>{e.setCustomValidity("boolean"==typeof t?t?"":"Custom validation failed":t)};return{view:({attrs:r})=>{const{className:l="col s12",dataError:s,dataSuccess:c,helperText:d,iconName:u,id:f=a.id,initialValue:m,isMandatory:p,label:h,maxLength:v,newRow:g,onchange:y,onkeydown:b,onkeypress:w,onkeyup:k,style:x,validate:N}=r,I=X(r,ze),$=H(I);return O(`.input-field${g?".clear":""}${n}`,{className:l,style:x},[u?O("i.material-icons.prefix",u):void 0,O(`input.validate[type=${t}][tabindex=0][id=${f}]${$}`,{oncreate:({dom:n})=>{(({autofocus:e})=>!!e&&("boolean"==typeof e?e:e()))(r)&&n.focus(),v&&materialize_css__WEBPACK_IMPORTED_MODULE_0___default().CharacterCounter.init(n),"range"===t&&materialize_css__WEBPACK_IMPORTED_MODULE_0___default().Range.init(n)},onkeyup:k?e=>{k(e,i(e.target))}:void 0,onkeydown:b?e=>{b(e,i(e.target))}:void 0,onkeypress:w?e=>{w(e,i(e.target))}:void 0,onupdate:N?({dom:e})=>{const t=e;o(t,N(i(t),t))}:void 0,onchange:e=>{const t=e.target;if(t){const e=i(t);y&&y(e),N&&o(t,N(e,t))}},value:m}),O(ne,{label:h,id:f,isMandatory:p,isActive:!(void 0===m&&!r.placeholder&&"number"!==t&&"color"!==t&&"range"!==t)}),O(ae,{helperText:d,dataError:s,dataSuccess:c})])}}},Ue=Fe("text"),qe=Fe("password"),Ke=Fe("number"),Be=Fe("url"),He=Fe("color"),Je=Fe("range",".range-field"),Ye=Fe("email"),Qe=()=>{let e,t=!1;return{view:({attrs:n})=>{const{multiple:a,disabled:i,initialValue:o,placeholder:r,onchange:l,className:s="col s12",accept:c,label:d="File"}=n,u=c?c instanceof Array?c.join(", "):c:void 0,f=u?`[accept=${u}]`:"",m=a?"[multiple]":"",p=i?"[disabled]":"",h=r?`[placeholder=${r}]`:"";return O(".file-field.input-field",{className:n.class||s},[O(".btn",[O("span",d),O(`input[type=file]${m}${p}${f}`,{onchange:l?e=>{const n=e.target;n&&n.files&&l&&(t=!0,l(n.files))}:void 0})]),O(".file-path-wrapper",O(`input.file-path.validate${h}[type=text]`,{oncreate:({dom:t})=>{e=t,o&&(e.value=o)}})),(t||o)&&O("a.waves-effect.waves-teal.btn-flat",{style:"float: right;position: relative;top: -3rem; padding: 0",onclick:()=>{t=!1,e.value="",l&&l({})}},O("i.material-icons","clear"))])}}},Ze=["label","helperText","initialValue","newRow","className","iconName","isMandatory","onchange","disabled"],Ge=["label","helperText","initialValue","newRow","className","iconName","isMandatory","onchange","disabled"],We=()=>{const e={id:L()};return{view:t=>{let{attrs:{label:n,helperText:a,initialValue:i,newRow:o,className:r="col s12",iconName:l,isMandatory:s,onchange:c,disabled:d}}=t,u=X(t.attrs,Ze);const f=e.id,m=H(u),p=c?()=>e.dp&&c(e.dp.date):void 0;return O(".input-field"+(o?".clear":""),{className:r,onremove:()=>e.dp&&e.dp.destroy()},[l?O("i.material-icons.prefix",l):"",O(`input.datepicker[type=text][tabindex=0][id=${f}]${m}${d?"[disabled]":""}`,{oncreate:({dom:t})=>{e.dp=M.Datepicker.init(t,W({format:"yyyy/mm/dd",showClearBtn:!0,setDefaultDate:!0,defaultDate:i?new Date(i):new Date},u,{onClose:p}))}}),O(ne,{label:n,id:f,isMandatory:s,isActive:!!i}),O(ae,{helperText:a})])}}},Xe=()=>{const e={id:L()};return{view:t=>{let{attrs:{label:n,helperText:a,initialValue:i,newRow:o,className:r="col s12",iconName:l,isMandatory:s,onchange:c,disabled:d}}=t,u=X(t.attrs,Ge);const f=e.id,m=H(u),p=o?".clear":"",h=new Date,v=c?()=>e.tp&&c(e.tp.time||i||`${h.getHours()}:${h.getMinutes()}`):void 0;return O(`.input-field.timepicker${p}`,{className:r,onremove:()=>e.tp&&e.tp.destroy()},[l?O("i.material-icons.prefix",l):"",O(`input[type=text][tabindex=0][id=${f}]${m}${d?"[disabled]":""}`,{value:i,oncreate:({dom:t})=>{e.tp=M.Timepicker.init(t,W({twelveHour:!1,showClearBtn:!0,defaultTime:i},u,{onCloseEnd:v}))}}),O(ne,{label:n,id:f,isMandatory:s,isActive:i}),O(ae,{helperText:a})])}}},et=()=>({view:({attrs:{className:e="col s12",onchange:t,label:n,checked:a,disabled:i}})=>O("div",{className:e},O("label",[O(`input[type=checkbox][tabindex=0]${a?"[checked]":""}${i?"[disabled]":""}`,{onclick:t?e=>{e.target&&void 0!==e.target.checked&&t(e.target.checked)}:void 0}),n?"string"==typeof n?O("span",n):n:void 0]))}),tt=()=>{const e={},t=t=>e.checkedIds.indexOf(t)>=0;return{oninit:({attrs:{initialValue:t,checkedId:n}})=>{const a=n||t;e.checkedId=n,e.checkedIds=a?a instanceof Array?[...a]:[a]:[]},view:({attrs:{label:n,id:a,options:i,checkedId:o,description:r,className:l="col s12",disabled:s,checkboxClass:c,newRow:d,isMandatory:u,onchange:f}})=>{o&&e.checkedId!==o&&(e.checkedId=o,e.checkedIds=o instanceof Array?o:[o]);const m=f?(t,n)=>{const a=e.checkedIds.filter(e=>e!==t);n&&a.push(t),e.checkedIds=a,f(a)}:void 0;return O("div"+(d?".clear":""),{className:l},[O("div",{className:"input-field options"},O(ne,{id:a,label:n,isMandatory:u})),O(ae,{helperText:r}),...i.map(e=>O(et,{disabled:s||e.disabled,label:e.label,onchange:m?t=>m(e.id,t):void 0,className:c,checked:t(e.id)}))])}}},nt=()=>{const e={},t=e=>e.map(e=>e.id).join(""),n=(e,t,n=!1)=>n||(t instanceof Array&&(e||"number"==typeof e)?t.indexOf(e)>=0:t===e);return{oninit:({attrs:{checkedId:n,initialValue:a,options:i}})=>{e.ids=t(i);const o=n||a;e.checkedId=n,e.initialValue=o?o instanceof Array?[...o.filter(e=>null!==e)]:[o]:[]},view:({attrs:{id:a,newRow:i,className:o="col s12",checkedId:r,key:l,options:s,multiple:c,label:d,helperText:u,placeholder:f,isMandatory:m,iconName:p,disabled:h,classes:v,dropdownOptions:g,onchange:y}})=>{e.checkedId!==r&&(e.initialValue=r?r instanceof Array?r:[r]:void 0);const{initialValue:b}=e,w=y?c?()=>{const t=e.instance&&e.instance.getSelectedValues(),n=t?t.length>0&&J(t[0])?t.map(e=>+e):t.filter(e=>null!==e||void 0!==e):void 0;e.initialValue=n||[],y(e.initialValue)}:t=>{if(t&&t.currentTarget){const n=t.currentTarget,a=J(n.value)?+n.value:n.value;e.initialValue=void 0!==typeof a?[a]:[]}e.initialValue&&y(e.initialValue)}:void 0,k=i?".clear":"",x=h?"[disabled]":"",N=c?"[multiple]":"",I=0===s.filter(e=>n(e.id,b)).length;return O(`.input-field.select-space${k}`,{className:o,key:l},[p&&O("i.material-icons.prefix",p),O(`select[id=${a}]${x}${N}`,{oncreate:({dom:t})=>{e.instance=M.FormSelect.init(t,{classes:v,dropdownOptions:g})},onupdate:({dom:n})=>{const a=t(s);let i=r&&e.checkedId!==r.toString();e.ids!==a&&(e.ids=a,i=!0),e.checkedId!==r&&(e.checkedId=r,i=!0),i&&(e.instance=M.FormSelect.init(n,{classes:v,dropdownOptions:g}))},onchange:w},f?O("option[disabled]"+(I?"[selected]":""),f):"",s.map((e,t)=>O(`option[value=${e.id}]${e.title?`[title=${e.title}]`:""}${e.disabled?"[disabled]":""}${n(e.id,b,0===t&&I&&!f)?"[selected]":""}`,e.label.replace("&amp;","&")))),O(ne,{label:d,isMandatory:m}),O(ae,{helperText:u})])}}},at=()=>{const e={groupId:L()};return{oninit:({attrs:{checkedId:t,initialValue:n}})=>{e.oldCheckedId=t,e.checkedId=t||n},view:({attrs:{id:t,checkedId:n,newRow:a,className:i="col s12",label:o="",disabled:r,description:l,options:s,isMandatory:c,checkboxClass:d,onchange:u}})=>{e.oldCheckedId!==n&&(e.oldCheckedId=e.checkedId=n);const{groupId:f,checkedId:m}=e,p=t=>{e.checkedId=t,u&&u(t)};return O(`div${t?`[id=${t}]`:""}${a?".clear":""}`,{className:i},[O("div",{className:"input-field options"},O(ne,{id:t,label:o,isMandatory:c})),l?O("p.helper-text",O.trust(l)):"",...s.map(e=>O(it,W({},e,{onchange:p,groupId:f,disabled:r,className:d,checked:e.id===m})))])}}},it=()=>({view:({attrs:{id:e,groupId:t,label:n,onchange:a,className:i="col s12",checked:o,disabled:r}})=>O("div",{className:i},O("label",[O(`input[type=radio][tabindex=0][name=${t}]${o?"[checked=checked]":""}${r?"[disabled]":""}`,{onclick:a?()=>a(e):void 0}),O("span",O.trust(n))]))}),ot=["component","required","options","autogenerate"],rt=(e,t,n={})=>{let{component:a,required:i,options:o,autogenerate:r}=e,l=X(e,ot);const{containerId:s,autofocus:c,disabled:d=!1,onchange:u,multiline:f,key:m}=n;r&&u&&u("id"===r?L():V(),!1);const p=i?e=>e instanceof Array?e&&e.length>0:void 0!==typeof e:void 0;switch(a){case"text":return O(f?Pe:Ue,W({},l,{key:m,isMandatory:i,validate:p,autofocus:c,disabled:d,onchange:u,initialValue:t}));case"number":return O(Ke,W({},l,{key:m,isMandatory:i,validate:p,autofocus:c,disabled:d,onchange:u,initialValue:t}));case"url":return O(Be,W({},l,{key:m,isMandatory:i,validate:p,autofocus:c,disabled:d,onchange:u,initialValue:t}));case"email":return O(Ye,W({},l,{key:m,isMandatory:i,validate:p,autofocus:c,disabled:d,onchange:u,initialValue:t}));case"checkbox":return O(et,W({},l,{validate:p,disabled:d,onchange:u,checked:t}));case"select":return O(nt,W({},l,{key:m,options:o||[{id:"none",label:"Unspecified"}],disabled:d,isMandatory:i,validate:p,onchange:e=>e&&u&&u(e),checkedId:t}));case"options":return O(tt,W({},l,{key:m,options:o||[{id:"none",label:"Unspecified"}],disabled:d,isMandatory:i,validate:p,onchange:e=>u&&u(e),checkedId:t}));case"radios":return O(at,W({},l,{key:m,options:o||[{id:"none",label:"Unspecified"}],disabled:d,isMandatory:i,validate:p,onchange:e=>e&&u&&u(e),checkedId:t}));case"date":const e=t||new Date;return!t&&u&&u(e),O(We,W({},l,{key:m,isMandatory:i,autofocus:c,disabled:d,onchange:u,initialValue:e,container:s?document.getElementById(s):document.body}));case"time":const n=t||"00:00";return!t&&u&&u(n),O(Xe,W({},l,{key:m,isMandatory:i,autofocus:c,disabled:d,onchange:u,initialValue:n,container:s||document.body.id}));default:return}},lt=()=>{const e={};return{view:({attrs:{el:t=".row",model:n,item:a,containerId:i,disabled:o=!1,editableIds:r=[],onchange:l}})=>(e.item=a,e.model=n,l&&l(!1),O(t,{style:"margin-bottom: -15px;",key:a.id},n.map((t,n)=>rt(t,a[t.id],{containerId:i,autofocus:0===n,disabled:o&&r.indexOf(t.id)<0,onchange:o&&r.indexOf(t.id)<0?void 0:(n,a=!0)=>{(a||void 0===e.item[t.id])&&(e.item[t.id]=n,l&&l((()=>{const{model:t,item:n}=e;return t.filter(e=>e.required).reduce((e,t)=>e&&!(void 0===n[t.id]||n[t.id]instanceof Array&&0===n[t.id].length||"string"==typeof n[t.id]&&0===n[t.id].length),!0)})()))}}))))}},st=()=>({oncreate:({dom:e,attrs:{options:t,onCreate:n}})=>{const a=M.Modal.init(e,t);n&&n(a)},view:({attrs:{id:e,title:t,description:n,fixedFooter:a,bottomSheet:i,buttons:o,richContent:r}})=>O(`.modal${a?".modal-fixed-footer":""}${i?".bottom-sheet":""}[id=${e}]`,[O(".modal-content",[O("h4",t),r&&"string"==typeof n?O.trust(n||""):"string"==typeof n?O("p",n):n]),o?O(".modal-footer",o.map(e=>O(fe,W({},e,{className:"modal-close"})))):void 0])}),ct=()=>{const e={id:L()},t=()=>e.onchange&&e.onchange(e.items),n=(e,t)=>{const{top:n,height:a}=e.getBoundingClientRect();return t.clientY-n<a/2?"above":"below"},a=e=>{const t=e.getAttribute("data-kanban-index");return t?+t:e.parentElement?a(e.parentElement):-1},i=e=>!!/kanban__item/.test(e.className)||!!e.parentElement&&i(e.parentElement),o=e=>/kanban__item/.test(e.className)?e:e.parentElement?o(e.parentElement):null,r=(t,n,a)=>e.moveBetweenList?"above"===t?n:n+1:a<n?"above"===t?n-1:n:"above"===t?n:n-1,l={draggable:!0,ondrop:i=>{i.preventDefault();const{dragIndex:l,moveBetweenList:s,copying:c}=e,d=i.target,u=o(d);if(u){u.classList.remove("kanban__above","kanban__below");const o=n(d,i),f=a(d),m=r(o,f,l);if(m<l&&e.dragIndex++,s&&i.dataTransfer){const t=JSON.parse(i.dataTransfer.getData("application/json"));c&&(t=>{const{model:n}=e;n.filter(e=>e.autogenerate).forEach(({id:e,autogenerate:n})=>{t[e]="id"===n?L():V()})})(t),e.items.splice(m,0,t)}else G(e.items,l,m);t()}},ondragstart:t=>{const n=t.target;if(t.dataTransfer){const{items:i}=e;t.dataTransfer.effectAllowed="copyMove",e.dragIndex=a(n),t.dataTransfer.setData("application/json",JSON.stringify(i[e.dragIndex],null,2))}},ondragover:t=>{t.redraw=!1,t.preventDefault();const l=o(t.target);if(l&&t.dataTransfer){const o=t.getModifierState("Control");l.classList.remove("kanban__above","kanban__below");const s=n(l,t);((t,n)=>{if(!i(t))return!1;const{dragIndex:o,moveBetweenList:l}=e;if(l)return!0;const s=a(t),c=r(n,s,o);return o!==s&&c!==o})(l,s)?(l.classList.add("kanban__"+s),e.copying=o,t.dataTransfer.dropEffect=o?"copy":"move"):t.dataTransfer.dropEffect="none"}},ondragleave:e=>{e.redraw=!1;const t=o(e.target);t&&t.classList.remove("kanban__above","kanban__below")},ondragend:n=>{n.dataTransfer&&"move"===n.dataTransfer.dropEffect&&(e.items.splice(e.dragIndex,1),t())}};return{oninit:({attrs:{items:t=[],canEdit:n=!0,canSort:a=!0,canDrag:i=!1,sortDirection:o="asc",model:r=[],label:l="item",i18n:s={newItem:`New ${l}`,modalDeleteItem:`Delete ${l}`,modalCreateNewItem:`Create new ${l}`,modalEditNewItem:`Edit new ${l}`},containerId:c,editableIds:d=[],fixedFooter:u=!1,moveBetweenList:f=!1}})=>{e.items=t.map(e=>W({},e)),e.model=r,e.i18n=s,e.canEdit=n,e.canSort=a,e.canDrag=i,e.sortDirection=o,e.containerId=c,e.fixedFooter=u,e.editId=`edit_item_${e.id}`,e.deleteId=`delete_item_${e.id}`,e.moveBetweenList=f,e.editableIds=d,e.sortableIds=[{label:"None"},...r.filter(e=>e.label).map(e=>({label:e.label,id:e.id}))]},view:({attrs:{disabled:n,onchange:a}})=>{const{model:i,items:o,canSort:r,sortDirection:s,curSortId:c,i18n:d,containerId:u,fixedFooter:f,canDrag:m,canEdit:p,moveBetweenList:h,sortableIds:v,editableIds:g}=e;if(!i)return;e.onchange=a;const y="asc"===s?1:-1,b=r&&c?o.sort((e,t)=>e[c]>t[c]?y:e[c]<t[c]?-y:0):o;return O(".kanban",[O(".row.kanban__menu",{style:"margin-bottom: 0;"},[p&&!n?O(fe,{label:d.newItem,modalId:e.editId,iconName:"add",onclick:()=>{e.curItem=void 0,e.updatedItem={}}}):void 0,r&&!m&&v&&o.length>1?[O(fe,{iconName:"sort",iconClass:"asc"===s?"left twist":"",className:"right",onclick:()=>{e.sortDirection="asc"===e.sortDirection?"desc":"asc"}}),O(Le,{items:v,checkedId:c,className:"right",style:"margin: 0 auto;",onchange:t=>e.curSortId=t})]:void 0]),O(".row.kanban__items",O(".col.s12",b.length>0||!h?b.map((t,o)=>O(`.card-panel.kanban__item[data-kanban-index=${o}]${n?".disabled":""}`,m&&!n?W({key:t.id},l):{key:t.id},[O(".card-content",O(lt,{model:i,item:t,containerId:u,disabled:!0,editableIds:g,onchange:t=>{e.canSave=t,t&&a&&a(e.items)}})),p&&!n?O(".card-action.row",O(".col.s12",[O(fe,{iconName:"edit",modalId:e.editId,onclick:()=>{e.curItem=t,e.updatedItem=W({},t)}}),O(fe,{iconName:"delete",modalId:e.deleteId,onclick:()=>e.curItem=t})])):void 0])):O(".card-panel.kanban__item",W({},l)))),O(st,{id:e.editId,title:d.modalCreateNewItem,fixedFooter:f,description:e.updatedItem?O(lt,{model:i,item:e.updatedItem||{},containerId:u,onchange:t=>{e.canSave=t}}):void 0,buttons:[{iconName:"cancel",label:"Cancel"},{iconName:"save",label:"Save",disabled:!e.canSave,onclick:()=>{if(e.curItem){const t=e.curItem;i.forEach(n=>{t[n.id]=e.updatedItem[n.id]})}else e.updatedItem&&e.items.push(e.updatedItem);t()}}]}),O(st,{id:e.deleteId,title:d.modalDeleteItem,description:"Are you sure?",buttons:[{label:"No"},{label:"Yes",onclick:()=>{e.items=e.items.filter(t=>t!==e.curItem),t()}}]})])}}},dt=()=>{const e=e=>t.curKey=t.id=e,t={elementId:L(),id:"",curKey:"",kvc:(e,t,n)=>{const{keyClass:a=".col.s4",valueClass:i=".col.s8"}=n,o=t instanceof Array?t.join(", "):"boolean"==typeof t?O(et,{label:" ",checked:t,disabled:!0,className:"checkbox-in-collection"}):t.toString();return{title:O(".row",{style:"margin-bottom: 0"},[O(a,O("b",e)),O(i,o)])}}},n=()=>{t.id="",t.curKey=""};return{oninit:({attrs:{keyValueConverter:e,id:n}})=>{e&&(t.kvc=e),n&&(t.elementId=n)},view:({attrs:{className:a="col s12",disabled:i,disallowArrays:o,header:r,iconName:l,iconNameKey:s=(l?"label":void 0),isMandatory:c,label:d,labelKey:u="Key",labelValue:f="Value",properties:m,keyClass:p,valueClass:h,onchange:v,falsy:g=["false"],truthy:y=["true"]}})=>{const b=()=>v?v(m):void 0,w=((n,a)=>Object.keys(n).map(e=>({key:e,value:n[e]})).map(n=>((n,a)=>{const i=a.onclick;return a.id=a.id||n,a.active=n===t.curKey,a.onclick=i?()=>e(n)&&i(a):()=>e(n),a})(n.key,t.kvc(n.key,n.value,{keyClass:a.keyClass,valueClass:a.valueClass}))))(m,{keyClass:p,valueClass:h}),k=t.curKey,x=m[k],N="boolean"==typeof x||"number"==typeof x?x:x?x instanceof Array?`[${x.join(", ")}]`:x:"",I=t.elementId;return[O(".map-editor",O(".input-field",{className:a,style:"min-height: 1.5em;"},[l?O("i.material-icons.prefix",l):"",O(ne,{label:d,isMandatory:c,isActive:w.length>0}),O(je,{id:I,items:w,mode:$e.LINKS,header:r})])),i?void 0:[O(Ue,{label:u,iconName:s,className:"col s5",initialValue:k,onchange:e=>{t.curKey=e,t.id&&(delete m[t.id],m[e]=x,t.id=e),b()}}),"string"==typeof N?O(Pe,{label:f,initialValue:N,className:"col s7",onchange:e=>{const t=(a=g,y.indexOf(n=e)>=0||!(a.indexOf(n)>=0)&&void 0);var n,a;const i=void 0===t&&/^\s*\d+\s*$/i.test(e)?+e:void 0;m[k]="boolean"==typeof t?t:"number"==typeof i?i:((e,t=!1)=>{if(t)return e;if(!e)return;const n=/\s*\[(.*)\]\s*/gi.exec(e);return n&&2===n.length?n[1].split(",").map(e=>e.trim()).map(e=>/^\d+$/g.test(e)?+e:e):void 0})(e,o)||e,b()}}):"number"==typeof N?O(Ke,{label:f,initialValue:N,className:"col s7",onchange:e=>{m[k]=e,b()}}):O(et,{label:f,checked:N,className:"input-field col s7",onchange:e=>{m[k]=e,b()}}),O(".col.s12.right-align",[O(fe,{iconName:"add",onclick:n}),O(fe,{iconName:"delete",disabled:!k,onclick:()=>{delete m[k],n(),b()}})])]]}}},ut=()=>({oncreate:({dom:e,attrs:t})=>{M.Materialbox.init(e,t)},view:({attrs:e})=>{const{src:t,width:n,height:a}=e;return O(`img.materialboxed[src=${t}]${n?`[width=${n}]`:""}${a?`[height=${a}]`:""}`,e)}}),ft=()=>({view:({attrs:{title:e,href:t,active:n,disabled:a}})=>O("li",{className:n?"active":a?"disabled":"waves-effect"},"number"==typeof e?O(O.route.Link,{href:t},e):e)}),mt=()=>{const e={pagIndex:0};return{view:({attrs:{items:t,curPage:n=1,size:a=Math.min(9,t.length)}})=>{const{pagIndex:i}=e,o=i*a,r=o+a,l=i>0,s=r<t.length,c=[{title:O("a",{onclick:()=>l&&e.pagIndex--},O("i.material-icons","chevron_left")),disabled:!l},...t.filter((e,t)=>o<=t&&t<r),{title:O("a",{onclick:()=>s&&e.pagIndex++},O("i.material-icons","chevron_right")),disabled:!s}];return O("ul.pagination",c.map((e,t)=>O(ft,W({title:o+t},e,{active:o+t===n}))))}}},pt=()=>({oncreate:({dom:e,attrs:t})=>{M.Parallax.init(e,t)},view:({attrs:{src:e}})=>e?O(".parallax-container",O(".parallax",O(`img[src=${e}]`))):void 0}),ht=()=>{const e={id:L()};return{view:({attrs:t})=>{const n=t.id||e.id,{label:a,left:i,right:o,disabled:r,newRow:l,onchange:s,checked:c,isMandatory:d,className:u="col s12"}=t;return O("div"+(l?".clear":""),{className:u},[a?O(ne,{label:a||"",id:n,isMandatory:d}):void 0,O(".switch",O("label",[i||"Off",O(`input[id=${n}][type=checkbox]${K({disabled:r})}${c?"[checked]":""}`,{onclick:s?e=>{e.target&&void 0!==e.target.checked&&s(e.target.checked)}:void 0}),O("span.lever"),o||"On"]))])}}},vt=()=>{const e={},t=(e,t)=>t||e.replace(/ /g,"").toLowerCase();return{view:({attrs:{tabWidth:n,selectedTabId:a,tabs:i,className:o,style:r,duration:l,onShow:s,swipeable:c,responsiveThreshold:d}})=>{const u=i.filter(e=>e.active).shift(),f=a||(u?t(u.title,u.id):"");return O(".row",[O(".col.s12",O("ul.tabs"+("fill"===n?".tabs-fixed-width":""),{className:o,style:r,oncreate:({dom:t})=>{e.instance=M.Tabs.init(t,{duration:l,onShow:s,responsiveThreshold:d,swipeable:c})},onupdate:()=>{if(f){const e=document.getElementById(`tab_${f}`);e&&e.click()}},onremove:()=>e.instance.destroy()},i.map(({className:e,title:a,id:o,active:r,disabled:l,target:s,href:c})=>O(`li.tab${l?".disabled":""}${"fixed"===n?`.col.s${Math.floor(12/i.length)}`:""}`,{className:e},O(`a[id=tab_${t(a,o)}]${r?".active":""}`,{target:s,href:c||`#${t(a,o)}`},a))))),i.filter(({href:e})=>void 0===e).map(({id:e,title:n,vnode:a,contentClass:i})=>O(`.col.s12[id=${t(n,e)}]`,{className:i},a))])}}},gt=()=>({view:({attrs:{id:e,title:t,datetime:n,active:a,content:i,iconName:o,dateFormatter:r,timeFormatter:l,onSelect:s}})=>O(`li${a?".active":""}${e?`[id=${e}]`:""}`,{onclick:s?()=>s({id:e,title:t,datetime:n,active:a,content:i}):void 0,style:s?"cursor: pointer;":void 0},[O(".mm_time",{datetime:n},[O("span",r(n)),O("span",l(n))]),o?O(".mm_icon",O("i.material-icons",o)):void 0,O(".mm_label",[t?"string"==typeof t?O("h5",t):t:void 0,i?"string"==typeof i?O("p",i):i:void 0])])}),yt=()=>{const e=e=>`${e.getUTCDate()}/${e.getUTCMonth()+1}/${e.getUTCFullYear()}`,t=e=>`${Q(e.getUTCHours())}:${Q(e.getUTCMinutes())}`;return{view:({attrs:{items:n,onSelect:a,timeFormatter:i=t,dateFormatter:o=e}})=>O("ul.mm_timeline",n.map(e=>O(gt,W({onSelect:a,dateFormatter:o,timeFormatter:i},e))))}};
//# sourceMappingURL=index.modern.js.map


/***/ }),

/***/ 2603:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LayoutForm": () => (/* binding */ _e),
/* harmony export */   "ReadonlyComponent": () => (/* binding */ Ce),
/* harmony export */   "RepeatList": () => (/* binding */ Te),
/* harmony export */   "SlimdownView": () => (/* binding */ Ae),
/* harmony export */   "addRule": () => (/* binding */ le),
/* harmony export */   "capitalizeFirstLetter": () => (/* binding */ ce),
/* harmony export */   "deepCopy": () => (/* binding */ Se),
/* harmony export */   "formFieldFactory": () => (/* binding */ Ee),
/* harmony export */   "isComponentType": () => (/* binding */ ue),
/* harmony export */   "labelResolver": () => (/* binding */ Oe),
/* harmony export */   "padLeft": () => (/* binding */ se),
/* harmony export */   "range": () => (/* binding */ Ie),
/* harmony export */   "registerPlugin": () => (/* binding */ ze),
/* harmony export */   "render": () => (/* binding */ ae),
/* harmony export */   "resolveExpression": () => (/* binding */ ge),
/* harmony export */   "stripSpaces": () => (/* binding */ je),
/* harmony export */   "toHourMin": () => (/* binding */ fe)
/* harmony export */ });
/* harmony import */ var mithril_materialized__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9989);
function O(e,t,n,r,o,i){return{tag:e,key:t,attrs:n,children:r,text:o,dom:i,domSize:void 0,state:void 0,events:void 0,instance:void 0}}O.normalize=function(e){return Array.isArray(e)?O("[",void 0,void 0,O.normalizeChildren(e),void 0,void 0):null==e||"boolean"==typeof e?null:"object"==typeof e?e:O("#",void 0,void 0,String(e),void 0,void 0)},O.normalizeChildren=function(e){var t=[];if(e.length){for(var n=null!=e[0]&&null!=e[0].key,r=1;r<e.length;r++)if((null!=e[r]&&null!=e[r].key)!==n)throw new TypeError(!n||null==e[r]&&"boolean"!=typeof e[r]?"In fragments, vnodes must either all have keys or none have keys.":"In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole.");for(r=0;r<e.length;r++)t[r]=O.normalize(e[r])}return t};var j=O,I=function(){var e,t=arguments[this],n=this+1;if(null==t?t={}:("object"!=typeof t||null!=t.tag||Array.isArray(t))&&(t={},n=this),arguments.length===n+1)e=arguments[n],Array.isArray(e)||(e=[e]);else for(e=[];n<arguments.length;)e.push(arguments[n++]);return j("",t.key,t,e)},N={}.hasOwnProperty,A=/(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,C={};function D(e){for(var t in e)if(N.call(e,t))return!1;return!0}function E(e){for(var t,n="div",r=[],o={};t=A.exec(e);){var i=t[1],a=t[2];if(""===i&&""!==a)n=a;else if("#"===i)o.id=a;else if("."===i)r.push(a);else if("["===t[3][0]){var l=t[6];l&&(l=l.replace(/\\(["'])/g,"$1").replace(/\\\\/g,"\\")),"class"===t[4]?r.push(l):o[t[4]]=""===l?l:l||!0}}return r.length>0&&(o.className=r.join(" ")),C[e]={tag:n,attrs:o}}function T(e,t){var n=t.attrs,r=N.call(n,"class"),o=r?n.class:n.className;if(t.tag=e.tag,t.attrs={},!D(e.attrs)&&!D(n)){var i={};for(var a in n)N.call(n,a)&&(i[a]=n[a]);n=i}for(var a in e.attrs)N.call(e.attrs,a)&&"className"!==a&&!N.call(n,a)&&(n[a]=e.attrs[a]);for(var a in null==o&&null==e.attrs.className||(n.className=null!=o?null!=e.attrs.className?String(e.attrs.className)+" "+String(o):o:null!=e.attrs.className?e.attrs.className:null),r&&(n.class=null),n)if(N.call(n,a)&&"key"!==a){t.attrs=n;break}return t}var P=function(e){if(null==e||"string"!=typeof e&&"function"!=typeof e&&"function"!=typeof e.view)throw Error("The selector must be either a string or a component.");var t=I.apply(1,arguments);return"string"==typeof e&&(t.children=j.normalizeChildren(t.children),"["!==e)?T(C[e]||E(e),t):(t.tag=e,t)};P.trust=function(e){return null==e&&(e=""),j("<",void 0,void 0,e,void 0,void 0)},P.fragment=function(){var e=I.apply(0,arguments);return e.tag="[",e.children=j.normalizeChildren(e.children),e};var $=P,L="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:{},z=function(e){if(!(this instanceof z))throw new Error("Promise must be called with 'new'.");if("function"!=typeof e)throw new TypeError("executor must be a function.");var t=this,n=[],r=[],o=c(n,!0),i=c(r,!1),a=t._instance={resolvers:n,rejectors:r},l="function"==typeof setImmediate?setImmediate:setTimeout;function c(e,o){return function c(s){var f;try{if(!o||null==s||"object"!=typeof s&&"function"!=typeof s||"function"!=typeof(f=s.then))l(function(){o||0!==e.length||console.error("Possible unhandled promise rejection:",s);for(var t=0;t<e.length;t++)e[t](s);n.length=0,r.length=0,a.state=o,a.retry=function(){c(s)}});else{if(s===t)throw new TypeError("Promise can't be resolved with itself.");u(f.bind(s))}}catch(e){i(e)}}}function u(e){var t=0;function n(e){return function(n){t++>0||e(n)}}var r=n(i);try{e(n(o),r)}catch(e){r(e)}}u(e)};z.prototype.then=function(e,t){var n,r,o=this._instance;function i(e,t,i,a){t.push(function(t){if("function"!=typeof e)i(t);else try{n(e(t))}catch(e){r&&r(e)}}),"function"==typeof o.retry&&a===o.state&&o.retry()}var a=new z(function(e,t){n=e,r=t});return i(e,o.resolvers,n,!0),i(t,o.rejectors,r,!1),a},z.prototype.catch=function(e){return this.then(null,e)},z.prototype.finally=function(e){return this.then(function(t){return z.resolve(e()).then(function(){return t})},function(t){return z.resolve(e()).then(function(){return z.reject(t)})})},z.resolve=function(e){return e instanceof z?e:new z(function(t){t(e)})},z.reject=function(e){return new z(function(t,n){n(e)})},z.all=function(e){return new z(function(t,n){var r=e.length,o=0,i=[];if(0===e.length)t([]);else for(var a=0;a<e.length;a++)!function(a){function l(e){o++,i[a]=e,o===r&&t(i)}null==e[a]||"object"!=typeof e[a]&&"function"!=typeof e[a]||"function"!=typeof e[a].then?l(e[a]):e[a].then(l,n)}(a)})},z.race=function(e){return new z(function(t,n){for(var r=0;r<e.length;r++)e[r].then(t,n)})};var _,R,V=z,F=(_=function(e){"undefined"!=typeof window?(void 0===window.Promise?window.Promise=V:window.Promise.prototype.finally||(window.Promise.prototype.finally=V.prototype.finally),e.exports=window.Promise):void 0!==L?(void 0===L.Promise?L.Promise=V:L.Promise.prototype.finally||(L.Promise.prototype.finally=V.prototype.finally),e.exports=L.Promise):e.exports=V},_(R={exports:{}}),R.exports),M=function(e){var t,n=e&&e.document,r={svg:"http://www.w3.org/2000/svg",math:"http://www.w3.org/1998/Math/MathML"};function o(e){return e.attrs&&e.attrs.xmlns||r[e.tag]}function i(e,t){if(e.state!==t)throw new Error("'vnode.state' must not be modified.")}function a(e){var t=e.state;try{return this.apply(t,arguments)}finally{i(e,t)}}function l(){try{return n.activeElement}catch(e){return null}}function c(e,t,n,r,o,i,a){for(var l=n;l<r;l++){var c=t[l];null!=c&&u(e,c,o,a,i)}}function u(e,t,r,i,a){var l=t.tag;if("string"==typeof l)switch(t.state={},null!=t.attrs&&F(t.attrs,t,r),l){case"#":!function(e,t,r){t.dom=n.createTextNode(t.children),x(e,t.dom,r)}(e,t,a);break;case"<":f(e,t,i,a);break;case"[":!function(e,t,r,o,i){var a=n.createDocumentFragment();if(null!=t.children){var l=t.children;c(a,l,0,l.length,r,null,o)}t.dom=a.firstChild,t.domSize=a.childNodes.length,x(e,a,i)}(e,t,r,i,a);break;default:!function(e,t,r,i,a){var l=t.tag,u=t.attrs,s=u&&u.is,f=(i=o(t)||i)?s?n.createElementNS(i,l,{is:s}):n.createElementNS(i,l):s?n.createElement(l,{is:s}):n.createElement(l);if(t.dom=f,null!=u&&function(e,t,n){"input"===e.tag&&null!=t.type&&e.dom.setAttribute("type",t.type);var r=null!=t&&"input"===e.tag&&"file"===t.type;for(var o in t)C(e,o,null,t[o],n,r)}(t,u,i),x(e,f,a),!k(t)&&null!=t.children){var d=t.children;c(f,d,0,d.length,r,null,i),"select"===t.tag&&null!=u&&function(e,t){if("value"in t)if(null===t.value)-1!==e.dom.selectedIndex&&(e.dom.value=null);else{var n=""+t.value;e.dom.value===n&&-1!==e.dom.selectedIndex||(e.dom.value=n)}"selectedIndex"in t&&C(e,"selectedIndex",null,t.selectedIndex,void 0)}(t,u)}}(e,t,r,i,a)}else!function(e,t,n,r,o){d(t,n),null!=t.instance?(u(e,t.instance,n,r,o),t.dom=t.instance.dom,t.domSize=null!=t.dom?t.instance.domSize:0):t.domSize=0}(e,t,r,i,a)}var s={caption:"table",thead:"table",tbody:"table",tfoot:"table",tr:"tbody",th:"tr",td:"tr",colgroup:"table",col:"colgroup"};function f(e,t,r,o){var i=t.children.match(/^\s*?<(\w+)/im)||[],a=n.createElement(s[i[1]]||"div");"http://www.w3.org/2000/svg"===r?(a.innerHTML='<svg xmlns="http://www.w3.org/2000/svg">'+t.children+"</svg>",a=a.firstChild):a.innerHTML=t.children,t.dom=a.firstChild,t.domSize=a.childNodes.length,t.instance=[];for(var l,c=n.createDocumentFragment();l=a.firstChild;)t.instance.push(l),c.appendChild(l);x(e,c,o)}function d(e,t){var n;if("function"==typeof e.tag.view){if(e.state=Object.create(e.tag),null!=(n=e.state.view).$$reentrantLock$$)return;n.$$reentrantLock$$=!0}else{if(e.state=void 0,null!=(n=e.tag).$$reentrantLock$$)return;n.$$reentrantLock$$=!0,e.state=null!=e.tag.prototype&&"function"==typeof e.tag.prototype.view?new e.tag(e):e.tag(e)}if(F(e.state,e,t),null!=e.attrs&&F(e.attrs,e,t),e.instance=j.normalize(a.call(e.state.view,e)),e.instance===e)throw Error("A view cannot return the vnode it received as argument");n.$$reentrantLock$$=null}function p(e,t,n,r,o,i){if(t!==n&&(null!=t||null!=n))if(null==t||0===t.length)c(e,n,0,n.length,r,o,i);else if(null==n||0===n.length)S(e,t,0,t.length);else{var a=null!=t[0]&&null!=t[0].key,l=null!=n[0]&&null!=n[0].key,s=0,f=0;if(!a)for(;f<t.length&&null==t[f];)f++;if(!l)for(;s<n.length&&null==n[s];)s++;if(a!==l)S(e,t,f,t.length),c(e,n,s,n.length,r,o,i);else if(l){for(var d,p,h,w,x,k=t.length-1,j=n.length-1;k>=f&&j>=s&&(h=t[k]).key===(w=n[j]).key;)h!==w&&m(e,h,w,r,o,i),null!=w.dom&&(o=w.dom),k--,j--;for(;k>=f&&j>=s&&(d=t[f]).key===(p=n[s]).key;)f++,s++,d!==p&&m(e,d,p,r,y(t,f,o),i);for(;k>=f&&j>=s&&s!==j&&d.key===w.key&&h.key===p.key;)b(e,h,x=y(t,f,o)),h!==p&&m(e,h,p,r,x,i),++s<=--j&&b(e,d,o),d!==w&&m(e,d,w,r,o,i),null!=w.dom&&(o=w.dom),f++,h=t[--k],w=n[j],d=t[f],p=n[s];for(;k>=f&&j>=s&&h.key===w.key;)h!==w&&m(e,h,w,r,o,i),null!=w.dom&&(o=w.dom),j--,h=t[--k],w=n[j];if(s>j)S(e,t,f,k+1);else if(f>k)c(e,n,s,j+1,r,o,i);else{var I,N,A=o,C=j-s+1,D=new Array(C),E=0,T=0,P=2147483647,$=0;for(T=0;T<C;T++)D[T]=-1;for(T=j;T>=s;T--){null==I&&(I=v(t,f,k+1));var L=I[(w=n[T]).key];null!=L&&(P=L<P?L:-1,D[T-s]=L,h=t[L],t[L]=null,h!==w&&m(e,h,w,r,o,i),null!=w.dom&&(o=w.dom),$++)}if(o=A,$!==k-f+1&&S(e,t,f,k+1),0===$)c(e,n,s,j+1,r,o,i);else if(-1===P)for(N=function(e){var t=[0],n=0,r=0,o=0,i=g.length=e.length;for(o=0;o<i;o++)g[o]=e[o];for(o=0;o<i;++o)if(-1!==e[o]){var a=t[t.length-1];if(e[a]<e[o])g[o]=a,t.push(o);else{for(n=0,r=t.length-1;n<r;){var l=(n>>>1)+(r>>>1)+(n&r&1);e[t[l]]<e[o]?n=l+1:r=l}e[o]<e[t[n]]&&(n>0&&(g[o]=t[n-1]),t[n]=o)}}for(r=t[(n=t.length)-1];n-- >0;)t[n]=r,r=g[r];return g.length=0,t}(D),E=N.length-1,T=j;T>=s;T--)p=n[T],-1===D[T-s]?u(e,p,r,i,o):N[E]===T-s?E--:b(e,p,o),null!=p.dom&&(o=n[T].dom);else for(T=j;T>=s;T--)p=n[T],-1===D[T-s]&&u(e,p,r,i,o),null!=p.dom&&(o=n[T].dom)}}else{var z=t.length<n.length?t.length:n.length;for(s=s<f?s:f;s<z;s++)(d=t[s])===(p=n[s])||null==d&&null==p||(null==d?u(e,p,r,i,y(t,s+1,o)):null==p?O(e,d):m(e,d,p,r,y(t,s+1,o),i));t.length>z&&S(e,t,s,t.length),n.length>z&&c(e,n,s,n.length,r,o,i)}}}function m(e,t,n,r,i,l){var c=t.tag;if(c===n.tag){if(n.state=t.state,n.events=t.events,function(e,t){do{var n;if(null!=e.attrs&&"function"==typeof e.attrs.onbeforeupdate&&void 0!==(n=a.call(e.attrs.onbeforeupdate,e,t))&&!n)break;if("string"!=typeof e.tag&&"function"==typeof e.state.onbeforeupdate&&void 0!==(n=a.call(e.state.onbeforeupdate,e,t))&&!n)break;return!1}while(0);return e.dom=t.dom,e.domSize=t.domSize,e.instance=t.instance,e.attrs=t.attrs,e.children=t.children,e.text=t.text,!0}(n,t))return;if("string"==typeof c)switch(null!=n.attrs&&M(n.attrs,n,r),c){case"#":!function(e,t){e.children.toString()!==t.children.toString()&&(e.dom.nodeValue=t.children),t.dom=e.dom}(t,n);break;case"<":!function(e,t,n,r,o){t.children!==n.children?(I(e,t),f(e,n,r,o)):(n.dom=t.dom,n.domSize=t.domSize,n.instance=t.instance)}(e,t,n,l,i);break;case"[":!function(e,t,n,r,o,i){p(e,t.children,n.children,r,o,i);var a=0,l=n.children;if(n.dom=null,null!=l){for(var c=0;c<l.length;c++){var u=l[c];null!=u&&null!=u.dom&&(null==n.dom&&(n.dom=u.dom),a+=u.domSize||1)}1!==a&&(n.domSize=a)}}(e,t,n,r,i,l);break;default:!function(e,t,n,r){var i=t.dom=e.dom;r=o(t)||r,"textarea"===t.tag&&null==t.attrs&&(t.attrs={}),function(e,t,n,r){if(t&&t===n&&console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major"),null!=n){"input"===e.tag&&null!=n.type&&e.dom.setAttribute("type",n.type);var o="input"===e.tag&&"file"===n.type;for(var i in n)C(e,i,t&&t[i],n[i],r,o)}var a;if(null!=t)for(var i in t)null==(a=t[i])||null!=n&&null!=n[i]||D(e,i,a,r)}(t,e.attrs,t.attrs,r),k(t)||p(i,e.children,t.children,n,null,r)}(t,n,r,l)}else h(e,t,n,r,i,l)}else O(e,t),u(e,n,r,l,i)}function h(e,t,n,r,o,i){if(n.instance=j.normalize(a.call(n.state.view,n)),n.instance===n)throw Error("A view cannot return the vnode it received as argument");M(n.state,n,r),null!=n.attrs&&M(n.attrs,n,r),null!=n.instance?(null==t.instance?u(e,n.instance,r,i,o):m(e,t.instance,n.instance,r,o,i),n.dom=n.instance.dom,n.domSize=n.instance.domSize):null!=t.instance?(O(e,t.instance),n.dom=void 0,n.domSize=0):(n.dom=t.dom,n.domSize=t.domSize)}function v(e,t,n){for(var r=Object.create(null);t<n;t++){var o=e[t];if(null!=o){var i=o.key;null!=i&&(r[i]=t)}}return r}var g=[];function y(e,t,n){for(;t<e.length;t++)if(null!=e[t]&&null!=e[t].dom)return e[t].dom;return n}function b(e,t,r){var o=n.createDocumentFragment();w(e,o,t),x(e,o,r)}function w(e,t,n){for(;null!=n.dom&&n.dom.parentNode===e;){if("string"!=typeof n.tag){if(null!=(n=n.instance))continue}else if("<"===n.tag)for(var r=0;r<n.instance.length;r++)t.appendChild(n.instance[r]);else if("["!==n.tag)t.appendChild(n.dom);else if(1===n.children.length){if(null!=(n=n.children[0]))continue}else for(r=0;r<n.children.length;r++){var o=n.children[r];null!=o&&w(e,t,o)}break}}function x(e,t,n){null!=n?e.insertBefore(t,n):e.appendChild(t)}function k(e){if(null==e.attrs||null==e.attrs.contenteditable&&null==e.attrs.contentEditable)return!1;var t=e.children;if(null!=t&&1===t.length&&"<"===t[0].tag){var n=t[0].children;e.dom.innerHTML!==n&&(e.dom.innerHTML=n)}else if(null!=t&&0!==t.length)throw new Error("Child node of a contenteditable must be trusted.");return!0}function S(e,t,n,r){for(var o=n;o<r;o++){var i=t[o];null!=i&&O(e,i)}}function O(e,t){var n,r,o,l,c=0,u=t.state;function s(){i(t,u),A(t),N(e,t)}"string"!=typeof t.tag&&"function"==typeof t.state.onbeforeremove&&null!=(o=a.call(t.state.onbeforeremove,t))&&"function"==typeof o.then&&(c=1,n=o),t.attrs&&"function"==typeof t.attrs.onbeforeremove&&null!=(o=a.call(t.attrs.onbeforeremove,t))&&"function"==typeof o.then&&(c|=2,r=o),i(t,u),c?(null!=n&&n.then(l=function(){1&c&&((c&=2)||s())},l),null!=r&&r.then(l=function(){2&c&&((c&=1)||s())},l)):(A(t),N(e,t))}function I(e,t){for(var n=0;n<t.instance.length;n++)e.removeChild(t.instance[n])}function N(e,t){for(;null!=t.dom&&t.dom.parentNode===e;){if("string"!=typeof t.tag){if(null!=(t=t.instance))continue}else if("<"===t.tag)I(e,t);else{if("["!==t.tag&&(e.removeChild(t.dom),!Array.isArray(t.children)))break;if(1===t.children.length){if(null!=(t=t.children[0]))continue}else for(var n=0;n<t.children.length;n++){var r=t.children[n];null!=r&&N(e,r)}}break}}function A(e){if("string"!=typeof e.tag&&"function"==typeof e.state.onremove&&a.call(e.state.onremove,e),e.attrs&&"function"==typeof e.attrs.onremove&&a.call(e.attrs.onremove,e),"string"!=typeof e.tag)null!=e.instance&&A(e.instance);else{var t=e.children;if(Array.isArray(t))for(var n=0;n<t.length;n++){var r=t[n];null!=r&&A(r)}}}function C(e,t,r,o,i,a){if(!("key"===t||"is"===t||null==o||E(t)||r===o&&!function(e,t){return"value"===t||"checked"===t||"selectedIndex"===t||"selected"===t&&e.dom===l()||"option"===e.tag&&e.dom.parentNode===n.activeElement}(e,t)&&"object"!=typeof o||"type"===t&&"input"===e.tag)){if("o"===t[0]&&"n"===t[1])return V(e,t,o);if("xlink:"===t.slice(0,6))e.dom.setAttributeNS("http://www.w3.org/1999/xlink",t.slice(6),o);else if("style"===t)_(e.dom,r,o);else if(T(e,t,i)){if("value"===t){if(("input"===e.tag||"textarea"===e.tag)&&e.dom.value===""+o&&(a||e.dom===l()))return;if("select"===e.tag&&null!==r&&e.dom.value===""+o)return;if("option"===e.tag&&null!==r&&e.dom.value===""+o)return;if(a&&""+o!="")return void console.error("`value` is read-only on file inputs!")}e.dom[t]=o}else"boolean"==typeof o?o?e.dom.setAttribute(t,""):e.dom.removeAttribute(t):e.dom.setAttribute("className"===t?"class":t,o)}}function D(e,t,n,r){if("key"!==t&&"is"!==t&&null!=n&&!E(t))if("o"===t[0]&&"n"===t[1])V(e,t,void 0);else if("style"===t)_(e.dom,n,null);else if(!T(e,t,r)||"className"===t||"title"===t||"value"===t&&("option"===e.tag||"select"===e.tag&&-1===e.dom.selectedIndex&&e.dom===l())||"input"===e.tag&&"type"===t){var o=t.indexOf(":");-1!==o&&(t=t.slice(o+1)),!1!==n&&e.dom.removeAttribute("className"===t?"class":t)}else e.dom[t]=null}function E(e){return"oninit"===e||"oncreate"===e||"onupdate"===e||"onremove"===e||"onbeforeremove"===e||"onbeforeupdate"===e}function T(e,t,n){return void 0===n&&(e.tag.indexOf("-")>-1||null!=e.attrs&&e.attrs.is||"href"!==t&&"list"!==t&&"form"!==t&&"width"!==t&&"height"!==t)&&t in e.dom}var P,$=/[A-Z]/g;function L(e){return"-"+e.toLowerCase()}function z(e){return"-"===e[0]&&"-"===e[1]?e:"cssFloat"===e?"float":e.replace($,L)}function _(e,t,n){if(t===n);else if(null==n)e.style.cssText="";else if("object"!=typeof n)e.style.cssText=n;else if(null==t||"object"!=typeof t)for(var r in e.style.cssText="",n)null!=(o=n[r])&&e.style.setProperty(z(r),String(o));else{for(var r in n){var o;null!=(o=n[r])&&(o=String(o))!==String(t[r])&&e.style.setProperty(z(r),o)}for(var r in t)null!=t[r]&&null==n[r]&&e.style.removeProperty(z(r))}}function R(){this._=t}function V(e,n,r){if(null!=e.events){if(e.events._=t,e.events[n]===r)return;null==r||"function"!=typeof r&&"object"!=typeof r?(null!=e.events[n]&&e.dom.removeEventListener(n.slice(2),e.events,!1),e.events[n]=void 0):(null==e.events[n]&&e.dom.addEventListener(n.slice(2),e.events,!1),e.events[n]=r)}else null==r||"function"!=typeof r&&"object"!=typeof r||(e.events=new R,e.dom.addEventListener(n.slice(2),e.events,!1),e.events[n]=r)}function F(e,t,n){"function"==typeof e.oninit&&a.call(e.oninit,t),"function"==typeof e.oncreate&&n.push(a.bind(e.oncreate,t))}function M(e,t,n){"function"==typeof e.onupdate&&n.push(a.bind(e.onupdate,t))}return(R.prototype=Object.create(null)).handleEvent=function(e){var t,n=this["on"+e.type];"function"==typeof n?t=n.call(e.currentTarget,e):"function"==typeof n.handleEvent&&n.handleEvent(e),this._&&!1!==e.redraw&&(0,this._)(),!1===t&&(e.preventDefault(),e.stopPropagation())},function(e,n,r){if(!e)throw new TypeError("DOM element being rendered to does not exist.");if(null!=P&&e.contains(P))throw new TypeError("Node is currently being rendered to and thus is locked.");var o=t,i=P,a=[],c=l(),u=e.namespaceURI;P=e,t="function"==typeof r?r:void 0;try{null==e.vnodes&&(e.textContent=""),n=j.normalizeChildren(Array.isArray(n)?n:[n]),p(e,e.vnodes,n,a,null,"http://www.w3.org/1999/xhtml"===u?void 0:u),e.vnodes=n,null!=c&&l()!==c&&"function"==typeof c.focus&&c.focus();for(var s=0;s<a.length;s++)a[s]()}finally{t=o,P=i}}}("undefined"!=typeof window?window:null),q=function(e,t,n){var r=[],o=!1,i=-1;function a(){for(i=0;i<r.length;i+=2)try{e(r[i],j(r[i+1]),l)}catch(e){n.error(e)}i=-1}function l(){o||(o=!0,t(function(){o=!1,a()}))}return l.sync=a,{mount:function(t,n){if(null!=n&&null==n.view&&"function"!=typeof n)throw new TypeError("m.mount expects a component, not a vnode.");var o=r.indexOf(t);o>=0&&(r.splice(o,2),o<=i&&(i-=2),e(t,[])),null!=n&&(r.push(t,n),e(t,j(n),l))},redraw:l}}(M,"undefined"!=typeof requestAnimationFrame?requestAnimationFrame:null,"undefined"!=typeof console?console:null),U=function(e){if("[object Object]"!==Object.prototype.toString.call(e))return"";var t=[];for(var n in e)r(n,e[n]);return t.join("&");function r(e,n){if(Array.isArray(n))for(var o=0;o<n.length;o++)r(e+"["+o+"]",n[o]);else if("[object Object]"===Object.prototype.toString.call(n))for(var o in n)r(e+"["+o+"]",n[o]);else t.push(encodeURIComponent(e)+(null!=n&&""!==n?"="+encodeURIComponent(n):""))}},H=Object.assign||function(e,t){for(var n in t)N.call(t,n)&&(e[n]=t[n])},J=function(e,t){if(/:([^\/\.-]+)(\.{3})?:/.test(e))throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");if(null==t)return e;var n=e.indexOf("?"),r=e.indexOf("#"),o=r<0?e.length:r,i=e.slice(0,n<0?o:n),a={};H(a,t);var l=i.replace(/:([^\/\.-]+)(\.{3})?/g,function(e,n,r){return delete a[n],null==t[n]?e:r?t[n]:encodeURIComponent(String(t[n]))}),c=l.indexOf("?"),u=l.indexOf("#"),s=u<0?l.length:u,f=l.slice(0,c<0?s:c);n>=0&&(f+=e.slice(n,o)),c>=0&&(f+=(n<0?"?":"&")+l.slice(c,s));var d=U(a);return d&&(f+=(n<0&&c<0?"?":"&")+d),r>=0&&(f+=e.slice(r)),u>=0&&(f+=(r<0?"":"&")+l.slice(u)),f},K=function(e,t,n){var r=0;function o(e){return new t(e)}function i(e){return function(r,i){"string"!=typeof r?(i=r,r=r.url):null==i&&(i={});var a=new t(function(t,n){e(J(r,i.params),i,function(e){if("function"==typeof i.type)if(Array.isArray(e))for(var n=0;n<e.length;n++)e[n]=new i.type(e[n]);else e=new i.type(e);t(e)},n)});if(!0===i.background)return a;var l=0;function c(){0==--l&&"function"==typeof n&&n()}return function e(t){var n=t.then;return t.constructor=o,t.then=function(){l++;var r=n.apply(t,arguments);return r.then(c,function(e){if(c(),0===l)throw e}),e(r)},t}(a)}}function a(e,t){for(var n in e.headers)if(N.call(e.headers,n)&&n.toLowerCase()===t)return!0;return!1}return o.prototype=t.prototype,o.__proto__=t,{request:i(function(t,n,r,o){var i,l=null!=n.method?n.method.toUpperCase():"GET",c=n.body,u=(null==n.serialize||n.serialize===JSON.serialize)&&!(c instanceof e.FormData||c instanceof e.URLSearchParams),s=n.responseType||("function"==typeof n.extract?"":"json"),f=new e.XMLHttpRequest,d=!1,p=!1,m=f,h=f.abort;for(var v in f.abort=function(){d=!0,h.call(this)},f.open(l,t,!1!==n.async,"string"==typeof n.user?n.user:void 0,"string"==typeof n.password?n.password:void 0),u&&null!=c&&!a(n,"content-type")&&f.setRequestHeader("Content-Type","application/json; charset=utf-8"),"function"==typeof n.deserialize||a(n,"accept")||f.setRequestHeader("Accept","application/json, text/*"),n.withCredentials&&(f.withCredentials=n.withCredentials),n.timeout&&(f.timeout=n.timeout),f.responseType=s,n.headers)N.call(n.headers,v)&&f.setRequestHeader(v,n.headers[v]);f.onreadystatechange=function(e){if(!d&&4===e.target.readyState)try{var i,a=e.target.status>=200&&e.target.status<300||304===e.target.status||/^file:\/\//i.test(t),l=e.target.response;if("json"===s){if(!e.target.responseType&&"function"!=typeof n.extract)try{l=JSON.parse(e.target.responseText)}catch(e){l=null}}else s&&"text"!==s||null==l&&(l=e.target.responseText);if("function"==typeof n.extract?(l=n.extract(e.target,n),a=!0):"function"==typeof n.deserialize&&(l=n.deserialize(l)),a)r(l);else{var c=function(){try{i=e.target.responseText}catch(e){i=l}var t=new Error(i);t.code=e.target.status,t.response=l,o(t)};0===f.status?setTimeout(function(){p||c()}):c()}}catch(e){o(e)}},f.ontimeout=function(e){p=!0;var t=new Error("Request timed out");t.code=e.target.status,o(t)},"function"==typeof n.config&&(f=n.config(f,n,t)||f)!==m&&(i=f.abort,f.abort=function(){d=!0,i.call(this)}),null==c?f.send():f.send("function"==typeof n.serialize?n.serialize(c):c instanceof e.FormData||c instanceof e.URLSearchParams?c:JSON.stringify(c))}),jsonp:i(function(t,n,o,i){var a=n.callbackName||"_mithril_"+Math.round(1e16*Math.random())+"_"+r++,l=e.document.createElement("script");e[a]=function(t){delete e[a],l.parentNode.removeChild(l),o(t)},l.onerror=function(){delete e[a],l.parentNode.removeChild(l),i(new Error("JSONP request failed"))},l.src=t+(t.indexOf("?")<0?"?":"&")+encodeURIComponent(n.callbackKey||"callback")+"="+encodeURIComponent(a),e.document.documentElement.appendChild(l)})}}("undefined"!=typeof window?window:null,F,q.redraw);function B(e){try{return decodeURIComponent(e)}catch(t){return e}}var W=function(e){if(""===e||null==e)return{};"?"===e.charAt(0)&&(e=e.slice(1));for(var t=e.split("&"),n={},r={},o=0;o<t.length;o++){var i=t[o].split("="),a=B(i[0]),l=2===i.length?B(i[1]):"";"true"===l?l=!0:"false"===l&&(l=!1);var c=a.split(/\]\[?|\[/),u=r;a.indexOf("[")>-1&&c.pop();for(var s=0;s<c.length;s++){var f=c[s],d=c[s+1],p=""==d||!isNaN(parseInt(d,10));if(""===f)null==n[a=c.slice(0,s).join()]&&(n[a]=Array.isArray(u)?u.length:0),f=n[a]++;else if("__proto__"===f)break;if(s===c.length-1)u[f]=l;else{var m=Object.getOwnPropertyDescriptor(u,f);null!=m&&(m=m.value),null==m&&(u[f]=m=p?[]:{}),u=m}}}return r},Y=function(e){var t=e.indexOf("?"),n=e.indexOf("#"),r=n<0?e.length:n,o=e.slice(0,t<0?r:t).replace(/\/{2,}/g,"/");return o?("/"!==o[0]&&(o="/"+o),o.length>1&&"/"===o[o.length-1]&&(o=o.slice(0,-1))):o="/",{path:o,params:t<0?{}:W(e.slice(t+1,r))}},G=new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$"),Q=function(e,t){var n={};if(null!=t)for(var r in e)N.call(e,r)&&!G.test(r)&&t.indexOf(r)<0&&(n[r]=e[r]);else for(var r in e)N.call(e,r)&&!G.test(r)&&(n[r]=e[r]);return n},Z={};function X(e){try{return decodeURIComponent(e)}catch(t){return e}}var ee=function(e,t){var n,r,o,i,a,l,c=null==e?null:"function"==typeof e.setImmediate?e.setImmediate:e.setTimeout,u=F.resolve(),s=!1,f=!1,d=0,p=Z,m={onbeforeupdate:function(){return!(!(d=d?2:1)||Z===p)},onremove:function(){e.removeEventListener("popstate",g,!1),e.removeEventListener("hashchange",v,!1)},view:function(){if(d&&Z!==p){var e=[j(o,i.key,i)];return p&&(e=p.render(e[0])),e}}},h=b.SKIP={};function v(){s=!1;var c=e.location.hash;"#"!==b.prefix[0]&&(c=e.location.search+c,"?"!==b.prefix[0]&&"/"!==(c=e.location.pathname+c)[0]&&(c="/"+c));var f=c.concat().replace(/(?:%[a-f89][a-f0-9])+/gim,X).slice(b.prefix.length),m=Y(f);function v(e){console.error(e),y(r,null,{replace:!0})}H(m.params,e.history.state),function e(c){for(;c<n.length;c++)if(n[c].check(m)){var s=n[c].component,g=n[c].route,b=s,w=l=function(n){if(w===l){if(n===h)return e(c+1);o=null==n||"function"!=typeof n.view&&"function"!=typeof n?"div":n,i=m.params,a=f,l=null,p=s.render?s:null,2===d?t.redraw():(d=2,t.redraw.sync())}};return void(s.view||"function"==typeof s?(s={},w(b)):s.onmatch?u.then(function(){return s.onmatch(m.params,f,g)}).then(w,f===r?null:v):w("div"))}if(f===r)throw new Error("Could not resolve default route "+r+".");y(r,null,{replace:!0})}(0)}function g(){s||(s=!0,c(v))}function y(t,n,r){if(t=J(t,n),f){g();var o=r?r.state:null,i=r?r.title:null;r&&r.replace?e.history.replaceState(o,i,b.prefix+t):e.history.pushState(o,i,b.prefix+t)}else e.location.href=b.prefix+t}function b(o,i,a){if(!o)throw new TypeError("DOM element being rendered to does not exist.");if(n=Object.keys(a).map(function(e){if("/"!==e[0])throw new SyntaxError("Routes must start with a '/'.");if(/:([^\/\.-]+)(\.{3})?:/.test(e))throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");return{route:e,component:a[e],check:(t=e,n=Y(t),r=Object.keys(n.params),o=[],i=new RegExp("^"+n.path.replace(/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,function(e,t,n){return null==t?"\\"+e:(o.push({k:t,r:"..."===n}),"..."===n?"(.*)":"."===n?"([^/]+)\\.":"([^/]+)"+(n||""))})+"$"),function(e){for(var t=0;t<r.length;t++)if(n.params[r[t]]!==e.params[r[t]])return!1;if(!o.length)return i.test(e.path);var a=i.exec(e.path);if(null==a)return!1;for(t=0;t<o.length;t++)e.params[o[t].k]=o[t].r?a[t+1]:decodeURIComponent(a[t+1]);return!0})};var t,n,r,o,i}),r=i,null!=i){var l=Y(i);if(!n.some(function(e){return e.check(l)}))throw new ReferenceError("Default route doesn't match any known routes.")}"function"==typeof e.history.pushState?e.addEventListener("popstate",g,!1):"#"===b.prefix[0]&&e.addEventListener("hashchange",v,!1),f=!0,t.mount(o,m),v()}return b.set=function(e,t,n){null!=l&&((n=n||{}).replace=!0),l=null,y(e,t,n)},b.get=function(){return a},b.prefix="#!",b.Link={view:function(e){var t,n,r,o=P(e.attrs.selector||"a",Q(e.attrs,["options","params","selector","onclick"]),e.children);return(o.attrs.disabled=Boolean(o.attrs.disabled))?(o.attrs.href=null,o.attrs["aria-disabled"]="true"):(t=e.attrs.options,n=e.attrs.onclick,r=J(o.attrs.href,e.attrs.params),o.attrs.href=b.prefix+r,o.attrs.onclick=function(e){var o;"function"==typeof n?o=n.call(e.currentTarget,e):null==n||"object"!=typeof n||"function"==typeof n.handleEvent&&n.handleEvent(e),!1===o||e.defaultPrevented||0!==e.button&&0!==e.which&&1!==e.which||e.currentTarget.target&&"_self"!==e.currentTarget.target||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||(e.preventDefault(),e.redraw=!1,b.set(r,null,t))}),o}},b.param=function(e){return i&&null!=e?i[e]:i},b}("undefined"!=typeof window?window:null,q),te=function(){return $.apply(this,arguments)};te.m=$,te.trust=$.trust,te.fragment=$.fragment,te.Fragment="[",te.mount=q.mount,te.route=ee,te.render=M,te.redraw=q.redraw,te.request=K.request,te.jsonp=K.jsonp,te.parseQueryString=W,te.buildQueryString=U,te.parsePathname=Y,te.buildPathname=J,te.vnode=j,te.PromisePolyfill=V,te.censor=Q;var ne=te;function re(){return re=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},re.apply(this,arguments)}var oe,ie=[[/\r\n/g,"\n"],[/\n(#+)(.*)/g,function(e,t,n){void 0===n&&(n="");var r=t.length;return"<h"+r+">"+n.trim()+"</h"+r+">"}],[/!\[([^\[]+)\]\((?:javascript:)?([^\)]+)\)/g,'<img src="$2" alt="$1">'],[/\[([^\[]+)\]\((?:javascript:)?([^\)]+)\)/g,'<a href="$2">$1</a>'],[/(\*\*|__)(.*?)\1/g,"<strong>$2</strong>"],[/\\_/g,"&#95;"],[/(\*|_)(.*?)\1/g,"<em>$2</em>"],[/\~\~(.*?)\~\~/g,"<del>$1</del>"],[/\:\"(.*?)\"\:/g,"<q>$1</q>"],[/\n\s*```\n([^]*?)\n\s*```\s*\n/g,"\n<pre>$1</pre>"],[/`(.*?)`/g,function(e,t){return"<code>"+function(e){e=e.replace(/\&/g,"&amp;");for(var t="'#<>`*-~_=:\"![]()nt",n=t.length,r=0;r<n;r++)e=e.replace(RegExp("\\"+t[r],"g"),function(e){return"&#"+e.charCodeAt(0)+";"});return e}(t)+"</code>"}],[/\n(\*|\-|\+)(.*)/g,function(e,t,n){return void 0===n&&(n=""),"<ul>\n\t<li>"+n.trim()+"</li>\n</ul>"}],[/\n[0-9]+\.(.*)/g,function(e,t){return void 0===t&&(t=""),"<ol>\n\t<li>"+t.trim()+"</li>\n</ol>"}],[/\n(&gt;|\>)(.*)/g,function(e,t,n){return void 0===n&&(n=""),"\n<blockquote>"+n.trim()+"</blockquote>"}],[/\n-{5,}/g,"\n<hr />"],[/( *\|[^\n]+\|\r?\n)((?: *\|:?[ -]+:?)+ *\|)(\n(?: *\|[^\n]+\|\r?\n?)*)?/g,function(e,t,n,r){var o=n.split("|").filter(function(e,t,n){return t>0&&t<n.length-1}).map(function(e){return/:-+:/g.test(e)?"center":/-+:/g.test(e)?"right":/:-+/.test(e)?"left":""}),i=function(e){var t=o[e];return t?' align="'+t+'"':""};return"\n<table><tbody><tr>"+t.split("|").map(function(e){return e.trim()}).filter(function(e){return e&&e.length}).map(function(e,t){return"<th"+i(t)+">"+e+"</th>"}).join("")+"</tr>"+r.split("\n").map(function(e){return e.trim()}).filter(function(e){return e&&e.length}).map(function(e){return"<tr>"+e.split("|").filter(function(e,t,n){return t>0&&t<n.length-1}).map(function(e,t){return"<td"+i(t)+">"+e.trim()+"</td>"}).join("")+"</tr>"}).join("")+"</tbody></table>\n"}],[/\n([^\n]+)\n/g,function(e,t){var n=t.trim();return/^<\/?(ul|ol|li|h|p|bl|table|tr|td)/i.test(n)?"\n"+t+"\n":"\n<p>\n"+n+"\n</p>\n"}],[/\s?<\/ul>\s?<ul>/g,""],[/\s?<\/ol>\s?<ol>/g,""],[/<\/blockquote>\n<blockquote>/g,"<br>\n"],[/https?:\/\/[^"']*/g,function(e){return e.replace(/<\/?em>/g,"_")}],[/&#95;/g,"_"]],ae=function(e,t,n){return void 0===t&&(t=!1),void 0===n&&(n=!1),e="\n"+e+"\n",ie.forEach(function(t){e=e.replace(t[0],t[1])}),t?n?e.trim().replace(/^<p>([\s\S]*)<\/p>$/,"$1").replace(/<a href="/,'<a target="_blank" href="'):e.trim().replace(/^<p>([\s\S]*)<\/p>$/,"$1"):n?e.trim().replace(/<a href="/,'<a target="_blank" href="'):e.trim()},le=function(e,t){ie.push([e,t])},ce=function(e){return e.charAt(0).toUpperCase()+e.slice(1)},ue=function(e){return"string"==typeof e},se=function e(t,n,r){return void 0===n&&(n=2),void 0===r&&(r="0"),t.toString().length>=n?t.toString():e(r+t,n,r)},fe=function(e){return se(e.getHours())+":"+se(e.getMinutes())},de=function(e,t){for(var n=(t=(t=t.replace(/\[(\w+)\]/g,".$1")).replace(/^\./,"")).split("."),r=re({},e),o=0,i=n.length;o<i;++o){var a=n[o];if(a in r)r=r[a];else{if(!(r instanceof Array))return;var l=function(){var t=e[a]||a,n=/([A-Z]\w+)/.exec(a),o=n&&n[0][0].toLowerCase()+n[0].substr(1)||a,i=r.filter(function(e){return e[o]===t}).shift();if(!i)return{v:void 0};r=i}();if("object"==typeof l)return l.v}}return r},pe=/([^ =><]*)\s*([=><]*)\s*(\S*)/i,me=/^\s*!\s*/,he=function(e,t){var n=e.split("&");console.log("ANDS: "+n);var r=t.reduce(function(e,t){return[].concat(e,t instanceof Array?t:[t])},[]);return n.reduce(function(e,t){var n=me.test(t);console.log("INVERT: "+n);var o=n?t.replace(me,""):t;return e=e&&r.filter(Boolean).reduce(function(e,t){return e||function(e,t){if(!t||0===Object.keys(t).length)return!1;var n=pe.exec(e);if(n){var r=n[0],o=n[2],i=n[3],a=de(t,n[1].trim()),l="boolean"==typeof a?a?"true":"false":a;if(void 0===l||"string"==typeof l&&0===l.length)return!1;if(!o||!i)return!0;var c=isNaN(+i)?"true"===i||"false"!==i&&i:+i;switch(o){case"=":return l instanceof Array?l.indexOf(c)>=0:l===c;case"<=":return l<=c;case">=":return l>=c;case"<":return l<c;case">":return l>c;default:return console.error("Unrecognized operand ("+o+") in expression: "+r),!1}}return!0}(o.trim(),t)},!1),n?!e:e},!0)},ve=function(e){var t=arguments,n=e instanceof Array?e:[e];return n.some(function(e){return he(e,[].slice.call(t,1))})},ge=function(e,t){return de(t.filter(Boolean).reduceRight(function(e,t){return re({},t,e)}),e.trim())},ye=function(e,t){return void 0!==ge(e,t)},be=/{{\s*([^\s"'`:]*):?([^\s]*)\s*}}/g,we=function(e){var t,n=arguments;if(!be.test(e))return!0;be.lastIndex=0;var r=!0;do{(t=be.exec(e))&&(t.index===be.lastIndex&&be.lastIndex++,t.forEach(function(e,t,o){r=r&&ye(o[1],[].slice.call(n,1))}))}while(r&&null!==t);return r},xe=function e(t,n){if(void 0===t)return"";if(t instanceof Array)return t.map(function(t){return e(t,n)}).join(", ");if(!n)return t.toString();if("boolean"==typeof t){var r=n.indexOf(":");return t?n.substring(0,r):n.substring(r+1)}switch(n){default:return t.toString();case"date":return new Date(t).toLocaleDateString();case"time":return new Date(t).toLocaleTimeString();case"iso":return new Date(t).toISOString();case"utc":return new Date(t).toUTCString()}},ke=function(e){var t,n=arguments;if(!be.test(e))return e;be.lastIndex=0;do{(t=be.exec(e))&&(t.index===be.lastIndex&&be.lastIndex++,t.forEach(function(t,r,o){var i=o[0],a=o[2],l=ge(o[1],[].slice.call(n,1));!l||l instanceof Array||(e=e.replace(i,xe(l,a)))}))}while(null!==t);return e},Se=function e(t){if(null===t)return t;if(t instanceof Date)return new Date(t.getTime());if(t instanceof Array){var n=[];return t.forEach(function(e){n.push(e)}),n.map(function(t){return e(t)})}if("object"==typeof t&&t!=={}){var r=re({},t);return Object.keys(r).forEach(function(t){r[t]=e(r[t])}),r}return t},Oe=function(e){var t=function e(t,n){return void 0===n&&(n=""),t.filter(function(e){return"section"!==e.type&&"md"!==e.type}).reduce(function(t,r){var o=(n?n+".":"")+r.id,i=r.type||(r.options&&r.options.length>0?"select":"text");return"string"==typeof i?t[o]=r:t=re({},t,e(i,o)),t},{})}(e),n=function(e,n){if(!t.hasOwnProperty(e)||void 0===n)return n;var r=t[e],o=n instanceof Array?n.filter(function(e){return null!=e}):[n];switch(r.type||(r.options?"options":"none")){default:return n;case"radio":case"select":case"options":var i="string"==typeof r.options?ge(r.options,[t]):r.options;return o.map(function(e){return i.filter(function(t){return t.id===e}).map(function(e){return e.label||ce(e.id)}).shift()}).filter(function(e){return void 0!==e})}};return function e(t,r){if(void 0===r&&(r=""),t&&("object"!=typeof t||0!==Object.keys(t).length)){if(t instanceof Array)return t.map(function(t){return e(t,r)});var o={};return Object.keys(t).forEach(function(i){var a=r?r+"."+i:i,l=t[i];if("boolean"==typeof l)o[i]=l;else if("number"==typeof l||"string"==typeof l){var c=n(a,l);c&&(o[i]=c instanceof Array&&1===c.length?c[0]:c)}else if(l instanceof Array)if("string"==typeof l[0]||null===l[0]){var u=n(a,l);u&&(o[i]=u)}else o[i]=e(l,i);else"object"==typeof l&&(o[i]=l)}),o}}},je=function(e){return void 0===e&&(e=""),e.replace(/\s|,|\./g,"").toLowerCase()},Ie=function(e,t,n){void 0===n&&(n=1);for(var r=[],o=e;o<=t;o+=n)r.push(o);return r},Ne=function(e){"string"!=typeof e&&(e=JSON.stringify(e));var t=0;if(0===e.length)return t;for(var n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t&=t;return t},Ae=function(){return{view:function(e){var t=e.attrs,n=t.md,r=t.removeParagraphs,o=t.className;return n?ne(".markdown "+(void 0===o?"":o),ne.trust(ae(n,void 0!==r&&r))):void 0}}},Ce=function(){return{view:function(e){var t=e.attrs,n=t.label,r=t.initialValue,o=t.inline,i=void 0!==o&&o,a={className:t.props.className||"col s12"};if(r instanceof Array&&r.length>3)return ne(".readonly",a,[ne("label",n),ne(Ae,{md:"\n- "+r.join("\n- ")})]);if("string"==typeof r)return ne(".readonly",a,[ne("label",n),ne(Ae,{md:r})]);var l=r instanceof Array?r.join(", "):r;return ne(".readonly",a,[n&&ne("label",n),i?ne("span",l?": "+l:ne.trust("&nbsp;")):ne("p",l||ne.trust("&nbsp;"))])}}},De=["label","className","dateTimeSeconds","twelveHour","format"],Ee=function(y,b){void 0===y&&(y={}),void 0===b&&(b={});var w=function(){var w={key:Date.now()};return{view:function(x){var k=x.attrs,S=k.field,O=k.obj,j=k.autofocus,I=k.onchange,N=k.context,A=k.containerId,C=k.disabled,D=S.id,E=void 0===D?"":D,T=S.type,P=S.disabled,$=void 0===P?C:P,L=S.readonly,z=void 0===L?k.readonly:L,_=S.value,R=S.required,V=S.autogenerate,F=S.show,M=S.label,q=S.description,U=S.i18n,H=void 0===U?k.i18n||{}:U,J=S.checkAllOptions,K=S.transform,B=S.effect;if(!(F&&!ve(F,O,N)||M&&!we(M,O,N)||q&&!we(q,O,N))){var W="string"==typeof S.options?ge(S.options,[O].concat(N)):S.options,Y=W&&W instanceof Array?W.filter(function(e){return e.id&&(e.label||!/[0-9]/.test(e.id))&&(!e.show||ve(e.show,O,N))}).map(function(e){return e.label?e:re({},e,{label:ce(e.id)})}):[],G="boolean"==typeof C&&C,Q=function(e,n,r){void 0===n&&(n=!1),void 0===r&&(r=!1);var o=e.id,i=e.label,a=e.description,l=e.required,c=e.multiple,u=e.className,s=e.checkboxClass,f=e.icon,d=e.iconClass,p=e.placeholder,m=e.maxLength,h=e.minLength,v=e.max,g=e.min,y=e.step,b=e.dateTimeOutput,w=e.dateTimeSeconds,x=e.dateFormat,k=e.twelveHour,S={id:o+"-"+(0,mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.uniqueId)(),label:i};return void 0===i&&o&&(S.label=ce(o)),a&&(S.helperText=ae(a,!0)),u&&(S.className=u),f&&(S.iconName=f),d&&(S.iconClass=d),s&&(S.checkboxClass=s),p&&(S.placeholder=p),l&&(S.isMandatory=!0),c&&(S.multiple=c),r&&(S.disabled=!0),n&&(S.autofocus=!0),void 0!==m&&(S.maxLength=m),void 0!==h&&(S.minLength=h),void 0!==v&&(S.max=v),void 0!==g&&(S.min=g),void 0!==y&&(S.step=y),b&&(S.dateTimeOutput=b),w&&(S.dateTimeSeconds=w),x&&(S.dateFormat=x),k&&(S.twelveHour=k),S}(S,j,"boolean"==typeof $||void 0===$?G||$:G||ve($,O,N));M&&(Q.label=ae(ke(Q.label||M,O,N),!0)),q&&(Q.description=ae(ke(Q.description||q,O,N),!0));var Z=R?function(e){return e instanceof Array?e&&e.length>0:void 0!==typeof e}:void 0;if(O instanceof Array)console.warn("Only a repeat list can deal with arrays!");else{var X=function(e){try{return void 0===e||"undefined"===e?(delete O[E],I(O),Promise.resolve()):(O[E]=K?K("to",e):e,B?Promise.resolve(B(O,O[E],N)).then(function(e){I(void 0!==e?e:O)}):Promise.resolve(I(O)))}catch(e){return Promise.reject(e)}};if(T instanceof Array)return E?(O.hasOwnProperty(E)||(O[E]={}),ne(".muf-form",{className:S.className},[ne(".muf-form-header",ne.trust(ae(Q.label||ce(E),!0))),Q.description&&ne("div",ne.trust(ae(Q.description))),ne(".row",ne(_e,re({},Q,{i18n:H,readonly:z,form:T,obj:O[E],context:[O].concat(N),onchange:function(){return I(O)},containerId:A})))])):void console.warn("Missing ID for type "+JSON.stringify(T));V&&!O[E]&&(O[E]="guid"===V?(0,mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.uuid4)():"id"===V?(0,mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.uniqueId)():Date.now());var ee=O.hasOwnProperty(E)&&void 0!==O[E]?K?K("from",O[E]):O[E]:_;E&&_&&ee&&(O[E]=K?K("to",ee):ee);var te=J?J.split("|"):["",""],oe=te[0],ie=te[1],le=Q.className;if(z&&T&&["md","none"].indexOf(T)<0){if(b.hasOwnProperty(T))return ne(b[T],{iv:ee,field:S,props:Q,label:Q.label,obj:O,context:N});if(T&&y.hasOwnProperty(T))return ne(y[T],{iv:ee,field:S,props:Q,label:Q.label,onchange:X,obj:O,context:N});switch(T){case"time":var ue=ee||new Date,se=fe(ue);return ne(Ce,{props:Q,label:Q.label,initialValue:se});case"date":var de="number"==typeof ee||"string"==typeof ee||ee instanceof Date?new Date(ee).toLocaleDateString():"";return ne(Ce,{props:Q,label:Q.label,initialValue:de});case"checkbox":return ne(Ce,{props:Q,label:Q.label,initialValue:ee?"✔":"✘",inline:!0});case"tags":return ne(Ce,{props:Q,label:Q.label,initialValue:ee||[]});case"options":case"select":var pe=ee||[],me=Y.filter(function(e){return pe.indexOf(e.id)>=0}),he=me&&0===me.length?"?":1===me.length?me[0].label:me.map(function(e){return e.label});return ne(Ce,{props:Q,label:Q.label,initialValue:he});case"radio":var ye=ee,be=Y.filter(function(e){return e.id===ye});return ne(Ce,{props:Q,initialValue:be&&be.length?be[0].label:"?"});case"file":return ne("div",Q,(ee instanceof Array?ee:[ee]).map(function(e){var t=/.jpg$|.jpeg$|.png$|.gif$|.svg$|.bmp$|.tif$|.tiff$/i.test(e),n=""+new URL(S.url||"/").origin+e;return ne("a[target=_blank]",{href:n},t?ne("img",{src:n,alt:n,style:"max-height: "+(S.max||50)}):ne(Ce,{props:Q,label:S.placeholder||"File",initialValue:e}))}));case"markdown":var xe="string"==typeof ee&&ee?ae(ee):"";return ne(Ce,{props:Q,label:Q.label,initialValue:xe});default:return ne(Ce,{props:Q,label:Q.label,initialValue:ee})}}else{if(T&&y.hasOwnProperty(T))return ne(y[T],{iv:ee,field:S,props:Q,label:Q.label,onchange:X,obj:O,context:N});switch(T){case"colour":case"color":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.ColorInput,re({},Q,{initialValue:ee,onchange:X}));case"time":var Se=Q.twelveHour,Oe=void 0!==Se&&Se,je=ee?"number"==typeof ee||"string"==typeof ee?new Date(ee):ee:new Date,Ie=fe(je);return O[E]=K?K("to",je):je,ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TimePicker,re({},Q,{twelveHour:Oe,initialValue:Ie,onchange:function(e){var t=e.split(":").map(function(e){return+e});je.setHours(t[0],t[1]),X(je)},container:A}));case"date":var Ne=Q.format,Ee=void 0===Ne?"mmmm d, yyyy":Ne,Te="number"==typeof ee||"string"==typeof ee?new Date(ee):ee;O[E]=Te?K?K("to",Te.valueOf()):Te.valueOf():Te;var Pe=Q.min,$e=Q.max,Le=Pe?!Te||Pe<Te.valueOf()?new Date(Pe):Te:void 0,ze=$e?!Te||$e>Te.valueOf()?new Date($e):Te:void 0;return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.DatePicker,re({},Q,{minDate:Le,maxDate:ze,setDefaultDate:!!Te,format:Ee,initialValue:Te,onchange:function(e){X(new Date(e))},container:A}));case"datetime":var Re=Q.label,Ve=Q.className,Fe=void 0===Ve?"col s12":Ve,Me=Q.dateTimeSeconds,qe=void 0!==Me&&Me,Ue=Q.twelveHour,He=void 0!==Ue&&Ue,Je=Q.format,Ke=void 0===Je?"mmmm d, yyyy":Je,Be=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t.indexOf(n=i[r])>=0||(o[n]=e[n]);return o}(Q,De),We="number"==typeof ee||"string"==typeof ee?new Date(ee):ee,Ye={initialDateTime:We},Ge=We||void 0,Qe=We?fe(We):"",Ze=Q.min,Xe=Q.max,et=Ze?!We||Ze<We.valueOf()?new Date(Ze):We:void 0,tt=Xe?!We||Xe>We.valueOf()?new Date(Xe):We:void 0,nt=Q.dateTimeOutput||"UTC",rt=function(e){Ye.initialDateTime=e,X("UTC"===nt?e.toUTCString():"ISO"===nt?e.toISOString():e.valueOf())};return ne("div",{className:Fe},ne(".row",[ne(qe?".col.s6":".col.s8",{style:"padding-right: 0"},ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.DatePicker,re({},Be,{label:Re,minDate:et,maxDate:tt,setDefaultDate:!!We,format:Ke,initialValue:Ge,container:A,onchange:function(e){var t=new Date(Ye.initialDateTime);t.setFullYear(e.getFullYear()),t.setMonth(e.getMonth()),t.setDate(e.getDate()),rt(t)}}))),ne(".col.s4",{style:"min-width: 6rem; padding-right: 0; padding-left: 0"},ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TimePicker,re({},Be,{label:"",helperText:"",twelveHour:He,initialValue:Qe,container:A,onchange:function(e){var t=e.split(":").map(function(e){return+e}),n=Ye.initialDateTime||new Date((new Date).setSeconds(0,0));n.setHours(t[0],t[1]),rt(n)}}))),qe&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.NumberInput,{style:"min-width: 4rem; padding-right: 0; padding-left: 0",className:"col s2",min:0,max:59,onchange:function(e){var t=Ye.initialDateTime||new Date((new Date).setSeconds(0,0));t.setSeconds(e,0),rt(t)}})]));case"email":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.EmailInput,re({},Q,{validate:Z,autofocus:j,onchange:X,initialValue:ee}));case"number":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.NumberInput,re({},Q,{validate:Z,autofocus:j,onchange:X,initialValue:ee}));case"radio":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.RadioButtons,re({label:""},Q,{options:Y,checkedId:ee,onchange:X}));case"checkbox":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.InputCheckbox,re({},Q,{checked:ee,onchange:X}));case"options":return[ne(".row",[ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Options,re({key:w.key,checkboxClass:"col s6 m4 l3",className:"input-field col s12"},Q,{disabled:Q.disabled||!Y||0===Y.length,options:Y,checkedId:ee,onchange:function(e){return X(1===e.length?e[0]:e.filter(function(e){return null!==e}))}}))],J&&ne(".col.s12.option-buttons",[ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Button,{disabled:Q.disabled,label:oe,iconName:"check",onclick:function(){w.key=Date.now(),X(Y.map(function(e){return e.id}))}}),ie&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Button,{disabled:Q.disabled,label:ie,iconName:"check_box_outline_blank",onclick:function(){var e=O[E]||[];e.length=0,w.key=Date.now(),X(e)}})]))];case"select":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Select,re({placeholder:Q.multiple?H.pickOneOrMore||"Pick one or more":H.pickOne||"Pick one"},Q,{disabled:Q.disabled||!Y||0===Y.length,options:Y,checkedId:ee,onchange:function(e){return X(1!==e.length||Q.multiple?e.filter(function(e){return null!==e||void 0!==e}):e[0])}}));case"md":var ot=ke(E?ee:_||M,O,N);return ne(Ae,{md:ot,className:le});case"section":return ne(".divider");case"switch":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Switch,re({},Q,{left:Y&&Y.length>0?Y[0].label:"",right:Y&&Y.length>1?Y[1].label:"",checked:ee,onchange:X}));case"tags":var it=(ee?ee instanceof Array?ee:[ee]:[]).map(function(e){return{tag:e}}),at=Y&&Y.length>0?{data:Y.reduce(function(e,t){return e[t.id]=null,e},{}),limit:S.maxLength||Infinity,minLenght:S.minLength||1}:{};return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Chips,{className:Q.className,label:Q.label,isMandatory:Q.isMandatory,helperText:Q.helperText,onchange:function(e){return X(e.map(function(e){return e.tag}))},placeholder:S.placeholder||"Add a tag",secondaryPlaceholder:S.secondaryPlaceholder||"+tag",data:it,autocompleteOptions:at});case"markdown":case"textarea":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TextArea,re({},Q,{validate:Z,autofocus:j,onchange:X,initialValue:ee}));case"file":var lt=ee,ct=S.url,ut=S.placeholder;if(!ct)throw Error('Input field "url" not defined, which indicates the URL to the upload folder.');var st=Y?Y.map(function(e){return e.id}):void 0;return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.FileInput,re({},Q,{accept:st,placeholder:ut,onchange:function(e){if(!e||!e.length||e.length<1)X("");else{var t=new FormData;t.append("file",e[0]),ne.request({method:"POST",url:ct,body:t}).then(function(e){return X(e)}).catch(console.error)}},initialValue:lt}));case"url":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.UrlInput,re({placeholder:"http(s)://www.example.com"},Q,{validate:Z,autofocus:j,onchange:X,initialValue:ee}));case"text":return ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TextInput,re({},Q,{validate:Z,autofocus:j,onchange:X,initialValue:ee,tabindex:15}));default:return}}}}}}};return{createFormField:function(){return w}}},Te=function(){var e,r={},o=function(e,t){var n=r.onNewItem?r.onNewItem(e,t):{};e instanceof Array?e.push(n):e.hasOwnProperty(t)?e[t].push(n):e[t]=[n]},i=new RegExp(".*/#!","i");return{oninit:function(t){var n=t.attrs,o=n.i18n,i=void 0===o?{}:o,a=n.field,l=a.id,c=void 0===l?"":l,u=a.sortProperty,s=a.onNewItem;r.editLabel=i.editRepeat||"Edit "+c,r.createLabel=i.createRepeat||"Create new "+c,r.onNewItem=s,e=function(e){if(!e)return function(e,t){return 0};var t="!"===e[0],n=t?e.substring(1):e;return t?function(e,t){return e[n]>t[n]?-1:e[n]<t[n]?1:0}:function(e,t){return e[n]>t[n]?1:e[n]<t[n]?-1:0}}(u)},view:function(a){var l=a.attrs,c=l.field,u=l.obj,s=l.context,f=l.className,d=void 0===f?c.className?"."+c.className.split(" ").join("."):".col.s12":f,p=l.section,m=l.containerId,h=l.disabled,v=void 0===h?"boolean"==typeof c.disabled?c.disabled:void 0:h,g=l.i18n,k=void 0===g?{}:g,S=l.onchange,O=function(e){return S&&S(e)},j=r.modalKey,I=r.filterValue,N=c.id,A=void 0===N?"":N,C=c.label,D=c.type,E=c.min,T=c.max,P=c.pageSize,$=c.propertyFilter,L=c.filterLabel,z=c.readonly,_=void 0===z?l.readonly:z,R=c.repeatItemClass,V=void 0===R?"":R,F="edit_"+(C?C.toLowerCase().replace(/\s/gi,"_"):(0,mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.uniqueId)()),M=function(e,t){return e instanceof Array?e:(e.hasOwnProperty(t)||(e[t]=[]),e[t])}(u,A),q=I?je(I):void 0,U=$&&q&&q.length>2?M.filter(function(e){return je(""+e[$]).indexOf(q)>=0}):M,H=ne.route.param(A)?Math.min(U.length,+ne.route.param(A)):1,J=P&&U&&(H-1)*P<U.length?H:1,K=P?function(e,t){return(J-1)*P<=t&&t<J*P}:function(){return!0},B=new RegExp("\\??\\&?"+A+"=\\d+"),W=window.location.href.replace(i,"").replace(B,""),Y=P?Math.ceil(U.length/P):0,G=!!(T&&U.length>=T),Q=!v&&(!E||U.length>E);return[[ne("#"+A+".mui-repeat-list"+d,[ne(".row.mui-repeat-list-controls",ne(".col.s12",[ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.FlatButton,{iconName:v||G?"":"add",iconClass:"right",label:C,onclick:function(){o(u,A),ne.route.set(W+(W.indexOf("?")>=0?"&":"?")+A+"="+U.length),O(u)},style:"padding: 0",className:"left",disabled:v||G,readonly:_}),Y>1&&ne(".right",ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Pagination,{curPage:J,items:Ie(1,Y).map(function(e){return{href:W+(W.indexOf("?")>=0?"&":"?")+A+"="+e}})})),(U.length>1||I)&&$&&!v&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TextInput,{style:"margin-top: -6px; margin-bottom: -1rem;",iconName:"filter_list",iconClass:"small",placeholder:L,onkeyup:function(e,t){return r.filterValue=t},className:"right",disabled:v,readonly:_})])),U&&U.length>0&&"string"!=typeof D&&U.sort(e).filter(K).map(function(e,t){return[Q&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.RoundIconButton,{iconName:"clear",iconClass:"white black-text",className:"row mui-delete-item btn-small right",style:"padding: 0; margin-top: -10px; margin-right: -25px",disabled:v,readonly:_,onclick:function(){r.curItemIdx=t}}),[ne(".row.repeat-item",{className:V,key:H+Ne(e)},[ne(_e,{form:c.type,obj:e,i18n:k,context:s instanceof Array?[u].concat(s):[u,s],section:p,containerId:m,disabled:v,readonly:_,onchange:function(){return O(u)}})])]]}),!(v||G||_||!U||0===U.length)&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.RoundIconButton,{iconName:"add",iconClass:"white black-text",className:"row mui-add-new-item btn-small right",style:"padding: 0; margin-top: -10px; margin-right: -25px",onclick:function(){o(u,A),ne.route.set(W+(W.indexOf("?")>=0?"&":"?")+A+"="+U.length),O(u)}})])],void 0!==r.curItemIdx&&ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.ModalPanel,{id:"deleteItem",onCreate:function(e){return e.open()},options:{onCloseStart:function(){r.curItemIdx=void 0,ne.redraw()}},fixedFooter:!0,title:k.deleteItem||"Delete item",description:ne(_e,{form:D,obj:U[r.curItemIdx],context:s instanceof Array?[u].concat(s):[u,s],section:p,containerId:m,readonly:!0,i18n:k}),buttons:[{label:k.disagree||"Disagree"},{label:k.agree||"Agree",onclick:function(){void 0!==r.curItemIdx&&(U.splice(r.curItemIdx,1),u instanceof Array?u=[].concat(U):u[A]=[].concat(U),O(u))}}]}),"string"==typeof D||void 0===D?void 0:ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.ModalPanel,{onCreate:function(e){return r.editModal=e},id:F,title:r.editItem?r.editLabel:r.createLabel,fixedFooter:!0,description:ne(".row.form-item",ne(_e,{key:j,form:D,i18n:k,obj:r.editItem||r.newItem||{},onchange:function(e){return r.canSave=e},context:s instanceof Array?[u].concat(s):[u,s],containerId:m,disabled:v})),buttons:[{iconName:"cancel",label:k.cancel||"Cancel"},{iconName:"save",label:k.save||"Save",disabled:!r.canSave,onclick:function(){if(r.editItem&&void 0!==r.curItemIdx){var e=r.editItem,t=r.curItemIdx;D.forEach(function(n){n.id&&(t[n.id]=e[n.id])})}else r.newItem&&U.push(r.newItem);O(u)}}]})]}}},Pe=function(){var e={};return{oninit:function(t){var n=t.attrs.i18n,r=void 0===n?{}:n,o=r.raw,i=r.view,a=void 0===i?"VIEW":i;e.raw=void 0===o?"RAW":o,e.view=a},view:function(t){var n=t.attrs,r=n.field,o=r.id,a=void 0===o?"geojson":o,l=r.type,c=r.onSelect,u=n.obj,s=n.context,f=n.containerId,d=n.disabled,p=n.readonly,m=n.i18n,h=n.onchange;if(!(u instanceof Array)){var v=u[a],g=v?JSON.parse(v):void 0,y=g&&g.features||[],b=[],w={title:e.raw,vnode:ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.TextArea,{class:"col s12",initialValue:g?JSON.stringify(g,null,2):void 0,placeholder:"Enter GeoJSON",onchange:function(e){return u[a]=e}})},x=l,O=x.length>0?x[0].id:void 0,j={title:e.view,vnode:y.length?ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Collapsible,{oncreate:function(t){return e.dom=t.dom},onOpenStart:c?function(t){for(var n=e.dom.children||[],r=0;r<n.length;r++)if(n[r]===t)return void c(r,y[r])}:void 0,className:"geojson-feature-list",items:y.map(function(e,t){return e.properties||(e.properties={}),{id:"erik_"+t,key:t,header:O&&e.properties[O]||e.geometry.type,body:ne(".row",ne(_e,{class:"col s12",form:x,obj:e.properties,i18n:m,context:s instanceof Array?[u].concat(s):[u,s],containerId:f,disabled:d,readonly:p,onchange:function(e,n){n&&(y[t].properties=n),u[a]=JSON.stringify(g,null,2),h&&h(u)}}))}})}):ne("span","...")};return b.push(j),b.push(w),ne(mithril_materialized__WEBPACK_IMPORTED_MODULE_0__.Tabs,{tabs:b,tabWidth:"fill"})}}}},$e={},Le={},ze=function(e,t,n){$e[e]=t,n&&(Le[e]=n)},_e=(oe=function(e,t){return t.filter(function(e){return e.required&&void 0!==typeof e.id}).reduce(function(t,n){return t&&!(n.id&&(void 0===e[n.id]||e[n.id]instanceof Array&&0===e[n.id].length||"string"==typeof e[n.id]&&0===e[n.id].length))},!0)},{createLayoutForm:function(){return function(){var e=Ee($e,Le).createFormField();return{view:function(t){var n=t.attrs,r=n.i18n,o=n.form,i=n.obj,a=n.onchange,l=n.disabled,c=n.readonly,u=n.context,s=n.section,f=function(e){return a&&a(oe(e,o),e)};return o.filter(function(e){if(!e)return function(e){return!0};var t=!1;return function(n){return"section"===n.type?(t=n.id===e,!1):t}}(s)).reduce(function(t,n){return n.type||(n.type=function(e){var t=e.value,n=e.options;return e.autogenerate?"none":t?"string"==typeof t?"md":"number"==typeof t?"number":"boolean"==typeof t?"checkbox":"none":n&&n.length>0?"select":"none"}(n)),[].concat(t,[void 0===n.repeat?ne(e,{i18n:r,field:n,obj:i,onchange:f,disabled:l,readonly:c,context:u,section:s,containerId:"body"}):ne("geojson"===n.repeat?Pe:Te,{obj:i,field:n,onchange:f,context:u,i18n:r,containerId:"body",disabled:l,readonly:c})])},[])}}}},isValid:oe}).createLayoutForm();
//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ 3386:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var pending = false
	var offset = -1

	function sync() {
		for (offset = 0; offset < subscriptions.length; offset += 2) {
			try { render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		offset = -1
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount expects a component, not a vnode.")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			if (index <= offset) offset -= 2
			render(root, [])
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}


/***/ }),

/***/ 6819:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)
var m = __webpack_require__(4941)
var Promise = __webpack_require__(8150)

var buildPathname = __webpack_require__(2953)
var parsePathname = __webpack_require__(3724)
var compileTemplate = __webpack_require__(2809)
var assign = __webpack_require__(9211)
var censor = __webpack_require__(2967)

var sentinel = {}

function decodeURIComponentSave(component) {
	try {
		return decodeURIComponent(component)
	} catch(e) {
		return component
	}
}

module.exports = function($window, mountRedraw) {
	var callAsync = $window == null
		// In case Mithril.js' loaded globally without the DOM, let's not break
		? null
		: typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout
	var p = Promise.resolve()

	var scheduled = false

	// state === 0: init
	// state === 1: scheduled
	// state === 2: done
	var ready = false
	var state = 0

	var compiled, fallbackRoute

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var RouterRoot = {
		onbeforeupdate: function() {
			state = state ? 2 : 1
			return !(!state || sentinel === currentResolver)
		},
		onremove: function() {
			$window.removeEventListener("popstate", fireAsync, false)
			$window.removeEventListener("hashchange", resolveRoute, false)
		},
		view: function() {
			if (!state || sentinel === currentResolver) return
			// Wrap in a fragment to preserve existing key semantics
			var vnode = [Vnode(component, attrs.key, attrs)]
			if (currentResolver) vnode = currentResolver.render(vnode[0])
			return vnode
		},
	}

	var SKIP = route.SKIP = {}

	function resolveRoute() {
		scheduled = false
		// Consider the pathname holistically. The prefix might even be invalid,
		// but that's not our problem.
		var prefix = $window.location.hash
		if (route.prefix[0] !== "#") {
			prefix = $window.location.search + prefix
			if (route.prefix[0] !== "?") {
				prefix = $window.location.pathname + prefix
				if (prefix[0] !== "/") prefix = "/" + prefix
			}
		}
		// This seemingly useless `.concat()` speeds up the tests quite a bit,
		// since the representation is consistently a relatively poorly
		// optimized cons string.
		var path = prefix.concat()
			.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave)
			.slice(route.prefix.length)
		var data = parsePathname(path)

		assign(data.params, $window.history.state)

		function reject(e) {
			console.error(e)
			setPath(fallbackRoute, null, {replace: true})
		}

		loop(0)
		function loop(i) {
			// state === 0: init
			// state === 1: scheduled
			// state === 2: done
			for (; i < compiled.length; i++) {
				if (compiled[i].check(data)) {
					var payload = compiled[i].component
					var matchedRoute = compiled[i].route
					var localComp = payload
					var update = lastUpdate = function(comp) {
						if (update !== lastUpdate) return
						if (comp === SKIP) return loop(i + 1)
						component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
						attrs = data.params, currentPath = path, lastUpdate = null
						currentResolver = payload.render ? payload : null
						if (state === 2) mountRedraw.redraw()
						else {
							state = 2
							mountRedraw.redraw.sync()
						}
					}
					// There's no understating how much I *wish* I could
					// use `async`/`await` here...
					if (payload.view || typeof payload === "function") {
						payload = {}
						update(localComp)
					}
					else if (payload.onmatch) {
						p.then(function () {
							return payload.onmatch(data.params, path, matchedRoute)
						}).then(update, path === fallbackRoute ? null : reject)
					}
					else update("div")
					return
				}
			}

			if (path === fallbackRoute) {
				throw new Error("Could not resolve default route " + fallbackRoute + ".")
			}
			setPath(fallbackRoute, null, {replace: true})
		}
	}

	// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
	// even if neither `pushState` nor `hashchange` are supported. It's
	// cleared if `hashchange` is used, since that makes it automatically
	// async.
	function fireAsync() {
		if (!scheduled) {
			scheduled = true
			// TODO: just do `mountRedraw.redraw()` here and elide the timer
			// dependency. Note that this will muck with tests a *lot*, so it's
			// not as easy of a change as it sounds.
			callAsync(resolveRoute)
		}
	}

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (ready) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	function route(root, defaultRoute, routes) {
		if (!root) throw new TypeError("DOM element being rendered to does not exist.")

		compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a '/'.")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		fallbackRoute = defaultRoute
		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes.")
			}
		}

		if (typeof $window.history.pushState === "function") {
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		ready = true
		mountRedraw.mount(root, RouterRoot)
		resolveRoute()
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			// Omit the used parameters from the rendered element - they are
			// internal. Also, censor the various lifecycle methods.
			//
			// We don't strip the other parameters because for convenience we
			// let them be specified in the selector as well.
			var child = m(
				vnode.attrs.selector || "a",
				censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
				vnode.children
			)
			var options, onclick, href

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want add `onclick` on a disabled link, use
				// an `oncreate` hook to add it.
			} else {
				options = vnode.attrs.options
				onclick = vnode.attrs.onclick
				// Easier to build it now to keep it isomorphic.
				href = buildPathname(child.attrs.href, vnode.attrs.params)
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}


/***/ }),

/***/ 7283:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hyperscript = __webpack_require__(4941)

hyperscript.trust = __webpack_require__(4084)
hyperscript.fragment = __webpack_require__(9329)

module.exports = hyperscript


/***/ }),

/***/ 9402:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hyperscript = __webpack_require__(7283)
var request = __webpack_require__(6440)
var mountRedraw = __webpack_require__(8535)

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = "["
m.mount = mountRedraw.mount
m.route = __webpack_require__(816)
m.render = __webpack_require__(177)
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = __webpack_require__(1761)
m.buildQueryString = __webpack_require__(2460)
m.parsePathname = __webpack_require__(3724)
m.buildPathname = __webpack_require__(2953)
m.vnode = __webpack_require__(6604)
m.PromisePolyfill = __webpack_require__(738)
m.censor = __webpack_require__(2967)

module.exports = m


/***/ }),

/***/ 8535:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var render = __webpack_require__(177)

module.exports = __webpack_require__(3386)(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null)


/***/ }),

/***/ 2953:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var buildQueryString = __webpack_require__(2460)
var assign = __webpack_require__(9211)

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}


/***/ }),

/***/ 2809:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var parsePathname = __webpack_require__(3724)

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}


/***/ }),

/***/ 3724:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var parseQueryString = __webpack_require__(1761)

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}


/***/ }),

/***/ 738:
/***/ ((module) => {

"use strict";

/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with 'new'.")
	if (typeof executor !== "function") throw new TypeError("executor must be a function.")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved with itself.")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill


/***/ }),

/***/ 8150:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* global window */


var PromisePolyfill = __webpack_require__(738)

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof __webpack_require__.g !== "undefined") {
	if (typeof __webpack_require__.g.Promise === "undefined") {
		__webpack_require__.g.Promise = PromisePolyfill
	} else if (!__webpack_require__.g.Promise.prototype.finally) {
		__webpack_require__.g.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = __webpack_require__.g.Promise
} else {
	module.exports = PromisePolyfill
}


/***/ }),

/***/ 2460:
/***/ ((module) => {

"use strict";


module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}


/***/ }),

/***/ 1761:
/***/ ((module) => {

"use strict";


function decodeURIComponentSave(str) {
	try {
		return decodeURIComponent(str)
	} catch(err) {
		return str
	}
}

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponentSave(entry[0])
		var value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}


/***/ }),

/***/ 177:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(3377)(typeof window !== "undefined" ? window : null)


/***/ }),

/***/ 9329:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)
var hyperscriptVnode = __webpack_require__(7357)

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}


/***/ }),

/***/ 4941:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)
var hyperscriptVnode = __webpack_require__(7357)
var hasOwn = __webpack_require__(3368)

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = {}

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript


/***/ }),

/***/ 7357:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril.js requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}


/***/ }),

/***/ 3377:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			updateNodes(element, old.children, vnode.children, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequence
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
		//
		// Also, the DOM does things to inputs based on the value, so it needs set first.
		// See: https://github.com/MithrilJS/mithril.js/issues/2622
		if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type)
		var isFileInput = attrs != null && vnode.tag === "input" && attrs.type === "file"
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns, isFileInput)
		}
	}
	function setAttr(vnode, key, old, value, ns, isFileInput) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object" || key === "type" && vnode.tag === "input") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				//setting input[type=file][value] to same value causes an error to be generated if it's non-empty
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && (isFileInput || vnode.dom === activeElement())) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				//setting input[type=file][value] to different value is an error if it's non-empty
				// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
				if (isFileInput && "" + value !== "") { console.error("`value` is read-only on file inputs!"); return }
				/* eslint-enable no-implicit-coercion */
			}
			vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& key !== "title" // creates "null" as title
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (old && old === attrs) {
			console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major")
		}
		if (attrs != null) {
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			//
			// Also, the DOM does things to inputs based on the value, so it needs set first.
			// See: https://github.com/MithrilJS/mithril.js/issues/2622
			if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type)
			var isFileInput = vnode.tag === "input" && attrs.type === "file"
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns, isFileInput)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			vnode.events._ = currentRedraw
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	var currentDOM

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("DOM element being rendered to does not exist.")
		if (currentDOM != null && dom.contains(currentDOM)) {
			throw new TypeError("Node is currently being rendered to and thus is locked.")
		}
		var prevRedraw = currentRedraw
		var prevDOM = currentDOM
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		currentDOM = dom
		currentRedraw = typeof redraw === "function" ? redraw : undefined
		try {
			// First time rendering into a node clears it out
			if (dom.vnodes == null) dom.textContent = ""
			vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
			dom.vnodes = vnodes
			// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
			if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
			for (var i = 0; i < hooks.length; i++) hooks[i]()
		} finally {
			currentRedraw = prevRedraw
			currentDOM = prevDOM
		}
	}
}


/***/ }),

/***/ 4084:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(6604)

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}


/***/ }),

/***/ 6604:
/***/ ((module) => {

"use strict";


function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError(
					isKeyed && (input[i] != null || typeof input[i] === "boolean")
						? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole."
						: "In fragments, vnodes must either all have keys or none have keys."
				)
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode


/***/ }),

/***/ 6440:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var PromisePolyfill = __webpack_require__(8150)
var mountRedraw = __webpack_require__(8535)

module.exports = __webpack_require__(8370)(typeof window !== "undefined" ? window : null, PromisePolyfill, mountRedraw.redraw)


/***/ }),

/***/ 8370:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var buildPathname = __webpack_require__(2953)
var hasOwn = __webpack_require__(3368)

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if (hasOwn.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") {
								// Handle no-content which will not parse.
								try { response = JSON.parse(ev.target.responseText) }
								catch (e) { response = null }
							}
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							var completeErrorResponse = function() {
								try { message = ev.target.responseText }
								catch (e) { message = response }
								var error = new Error(message)
								error.code = ev.target.status
								error.response = response
								reject(error)
							}

							if (xhr.status === 0) {
								// Use setTimeout to push this code block onto the event queue
								// This allows `xhr.ontimeout` to run in the case that there is a timeout
								// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
								// as `xhr.onreadystatechange` will run before it
								setTimeout(function() {
									if (isTimeout) return
									completeErrorResponse()
								})
							} else completeErrorResponse()
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			xhr.ontimeout = function (ev) {
				isTimeout = true
				var error = new Error("Request timed out")
				error.code = ev.target.status
				reject(error)
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}


/***/ }),

/***/ 816:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var mountRedraw = __webpack_require__(8535)

module.exports = __webpack_require__(6819)(typeof window !== "undefined" ? window : null, mountRedraw)


/***/ }),

/***/ 9211:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// This exists so I'm only saving it once.


var hasOwn = __webpack_require__(3368)

module.exports = Object.assign || function(target, source) {
	for (var key in source) {
		if (hasOwn.call(source, key)) target[key] = source[key]
	}
}


/***/ }),

/***/ 2967:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// Note: this is mildly perf-sensitive.
//
// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
// out into dictionary mode and just generally cause a bunch of optimization
// issues within engines.
//
// Ideally, I would've preferred to do this, if it weren't for the optimization
// issues:
//
// ```js
// const hasOwn = require("./hasOwn")
// const magic = [
//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
//     "onbeforeremove", "onremove",
// ]
// module.exports = (attrs, extras) => {
//     const result = Object.assign(Object.create(null), attrs)
//     for (const key of magic) delete result[key]
//     if (extras != null) for (const key of extras) delete result[key]
//     return result
// }
// ```

var hasOwn = __webpack_require__(3368)
// Words in RegExp literals are sometimes mangled incorrectly by the internal bundler, so use RegExp().
var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$")

module.exports = function(attrs, extras) {
	var result = {}

	if (extras != null) {
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
				result[key] = attrs[key]
			}
		}
	} else {
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && !magic.test(key)) {
				result[key] = attrs[key]
			}
		}
	}

	return result
}


/***/ }),

/***/ 3368:
/***/ ((module) => {

"use strict";
// This exists so I'm only saving it once.


module.exports = {}.hasOwnProperty


/***/ }),

/***/ 2675:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var mithril_1 = __importDefault(__webpack_require__(9402));
__webpack_require__(4428);
__webpack_require__(4381);
__webpack_require__(7579);
var routing_service_1 = __webpack_require__(9259);
mithril_1.default.route(document.body, routing_service_1.routingSvc.defaultRoute, routing_service_1.routingSvc.routingTable());


/***/ }),

/***/ 2817:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.supplement = exports.nutrition = exports.pharma = exports.resolveImg = void 0;
var resolveImg = function (url) {
    return url === 'pharma'
        ? exports.pharma
        : url === 'nutrition'
            ? exports.nutrition
            : url === 'supplement'
                ? exports.supplement
                : url;
};
exports.resolveImg = resolveImg;
exports.pharma = 'data:image/jpeg;base64,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';
exports.nutrition = 'data:image/jpeg;base64,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';
exports.supplement = 'data:image/jpeg;base64,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';


/***/ }),

/***/ 6665:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AboutPage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_ui_form_1 = __webpack_require__(2603);
var models_1 = __webpack_require__(9660);
var md = "#### Human Performance Enhancing Technologies\n\n##### Disclaimer\n\nThe experts of TNO are paying attention to make the information as complete and accurate as possible, but are not responsible for medical correctness, completeness and actuality of the information presented on this platform. The information presented on this platform is explicitly intended for informative purposes. The content can therefore not replace professional medical advice in cases of complaints or prevention of complaints. The use and/or implementation of information presented on this platform is your own responsibility. TNO cannot be held accountable for any damage or consequences caused by the presented content on this platform. ";
var AboutPage = function () {
    return {
        oninit: function (_a) {
            var setPage = _a.attrs.actions.setPage;
            return setPage(models_1.Dashboards.ABOUT);
        },
        view: function () {
            return [(0, mithril_1.default)('.row', mithril_1.default.trust((0, mithril_ui_form_1.render)(md)))];
        },
    };
};
exports.AboutPage = AboutPage;


/***/ }),

/***/ 6632:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HomePage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var lz_string_1 = __importDefault(__webpack_require__(1605));
var mithril_materialized_1 = __webpack_require__(9989);
var background_jpg_1 = __importDefault(__webpack_require__(2868));
var services_1 = __webpack_require__(9035);
var models_1 = __webpack_require__(9660);
var utils_1 = __webpack_require__(8867);
var mithril_ui_form_1 = __webpack_require__(2603);
var HomePage = function () {
    var readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;
    return {
        oninit: function (_a) {
            var _b = _a.attrs.actions, setPage = _b.setPage, saveModel = _b.saveModel, changePage = _b.changePage;
            setPage(models_1.Dashboards.HOME);
            var uriModel = mithril_1.default.route.param('model');
            if (!uriModel) {
                return;
            }
            try {
                var decompressed = lz_string_1.default.decompressFromEncodedURIComponent(uriModel);
                if (!decompressed) {
                    return;
                }
                var model = JSON.parse(decompressed);
                saveModel(model);
                changePage(models_1.Dashboards.OVERVIEW);
            }
            catch (err) {
                console.error(err);
            }
        },
        view: function (_a) {
            var _b = _a.attrs, _c = _b.state.model, model = _c === void 0 ? models_1.defaultModel : _c, saveModel = _b.actions.saveModel;
            return [
                (0, mithril_1.default)('div', { style: 'position: relative;' }, [
                    // m(
                    // 	".overlay.center",
                    // 	{ style: "position: absolute; width: 100%" },
                    // 	[m("h3.bold", "Database for Human Enhancement Interventions")],
                    // ),
                    (0, mithril_1.default)('img.responsive-img.center', { src: background_jpg_1.default }),
                    (0, mithril_1.default)('.buttons.center', { style: 'margin: 10px auto;' }, [
                        (0, mithril_1.default)(mithril_materialized_1.Button, {
                            iconName: 'clear',
                            className: 'btn-large',
                            label: 'Clear',
                            modalId: 'clearAll',
                        }),
                        // typeof model.version === "number" && m(
                        // 	Button,
                        // 	{
                        // 		iconName: "edit",
                        // 		className: "btn-large",
                        // 		label: "Continue",
                        // 		onclick: () => {
                        // 			routingSvc.switchTo(Dashboards.OVERVIEW);
                        // 		},
                        // 	},
                        // ),
                        (0, mithril_1.default)('a#downloadAnchorElem', { style: 'display:none' }),
                        (0, mithril_1.default)(mithril_materialized_1.Button, {
                            iconName: 'download',
                            className: 'btn-large',
                            label: 'Download',
                            onclick: function () {
                                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                                if (!dlAnchorElem) {
                                    return;
                                }
                                var version = typeof model.version === 'undefined' ? 1 : model.version++;
                                var dataStr = 'data:text/json;charset=utf-8,' +
                                    encodeURIComponent(JSON.stringify(__assign(__assign({}, model), { version: version }), null, 2));
                                dlAnchorElem.setAttribute('href', dataStr);
                                dlAnchorElem.setAttribute('download', "".concat((0, utils_1.formatDate)(), "_v").concat((0, mithril_ui_form_1.padLeft)(version, 3), "_hpte_model.json"));
                                dlAnchorElem.click();
                            },
                        }),
                        (0, mithril_1.default)('input#selectFiles[type=file]', { style: 'display:none' }),
                        readerAvailable &&
                            (0, mithril_1.default)(mithril_materialized_1.Button, {
                                iconName: 'upload',
                                className: 'btn-large',
                                label: 'Upload',
                                onclick: function () {
                                    var fileInput = document.getElementById('selectFiles');
                                    fileInput.onchange = function () {
                                        if (!fileInput) {
                                            return;
                                        }
                                        var files = fileInput.files;
                                        if (files && files.length <= 0) {
                                            return;
                                        }
                                        var reader = new FileReader();
                                        reader.onload = function (e) {
                                            var result = e &&
                                                e.target &&
                                                e.target.result &&
                                                JSON.parse(e.target.result.toString());
                                            result && result.version && saveModel(result);
                                        };
                                        var data = files && files.item(0);
                                        data && reader.readAsText(data);
                                        services_1.routingSvc.switchTo(models_1.Dashboards.OVERVIEW);
                                    };
                                    fileInput.click();
                                },
                            }),
                        (0, mithril_1.default)(mithril_materialized_1.Button, {
                            iconName: 'link',
                            className: 'btn-large',
                            label: 'Permalink',
                            onclick: function () {
                                var permLink = document.createElement('input');
                                document.body.appendChild(permLink);
                                if (!permLink) {
                                    return;
                                }
                                var compressed = lz_string_1.default.compressToEncodedURIComponent(JSON.stringify(model));
                                var url = "".concat(window.location.href).concat(/\?/.test(window.location.href) ? '&' : '?', "model=").concat(compressed);
                                permLink.value = url;
                                permLink.select();
                                permLink.setSelectionRange(0, 999999); // For mobile devices
                                try {
                                    var successful = document.execCommand('copy');
                                    if (successful) {
                                        M.toast({
                                            html: 'Copied permanent link to clipboard.',
                                            classes: 'yellow black-text',
                                        });
                                    }
                                }
                                catch (err) {
                                    M.toast({
                                        html: 'Failed copying link to clipboard: ' + err,
                                        classes: 'red',
                                    });
                                }
                                finally {
                                    document.body.removeChild(permLink);
                                }
                            },
                        }),
                    ]),
                    (0, mithril_1.default)('.section.white', (0, mithril_1.default)('.row.container.center', [
                        (0, mithril_1.default)('.row', [
                            (0, mithril_1.default)('.col.s12.m4', (0, mithril_1.default)('.icon-block', [
                                (0, mithril_1.default)('.center', (0, mithril_1.default)(mithril_materialized_1.Icon, { iconName: 'dashboard' })),
                                (0, mithril_1.default)('h5.center', 'Prepare'),
                                (0, mithril_1.default)('p.light', 'Create or select the technologies that are important for your mission.'),
                            ])),
                            (0, mithril_1.default)('.col.s12.m4', (0, mithril_1.default)('.icon-block', [
                                (0, mithril_1.default)('.center', (0, mithril_1.default)(mithril_materialized_1.Icon, { iconName: 'flash_on' })),
                                (0, mithril_1.default)('h5.center', 'Assess'),
                                (0, mithril_1.default)('p.light', "Determine for each technologies how important it is, and your current performance, so you can prioritise and focus on the ones you really need."),
                            ])),
                            (0, mithril_1.default)('.col.s12.m4', (0, mithril_1.default)('.icon-block', [
                                (0, mithril_1.default)('.center', (0, mithril_1.default)(mithril_materialized_1.Icon, { iconName: 'group' })),
                                (0, mithril_1.default)('h5.center', 'Compare'),
                                (0, mithril_1.default)('p.light', 'Compare and select technologies so you can choose the one that fits best with your needs.'),
                            ])),
                        ]),
                    ])),
                    (0, mithril_1.default)(mithril_materialized_1.ModalPanel, {
                        id: 'clearAll',
                        title: 'Do you really want to delete everything?',
                        description: 'Are you sure that you want to delete your model?',
                        buttons: [
                            {
                                label: 'Yes',
                                iconName: 'delete',
                                onclick: function () {
                                    saveModel(models_1.defaultModel);
                                    services_1.routingSvc.switchTo(models_1.Dashboards.OVERVIEW);
                                },
                            },
                            { label: 'No', iconName: 'cancel' },
                        ],
                    }),
                ]),
            ];
        },
    };
};
exports.HomePage = HomePage;


/***/ }),

/***/ 5421:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(6665), exports);
__exportStar(__webpack_require__(6632), exports);
__exportStar(__webpack_require__(7450), exports);
__exportStar(__webpack_require__(3439), exports);
__exportStar(__webpack_require__(9678), exports);
__exportStar(__webpack_require__(9808), exports);
__exportStar(__webpack_require__(7572), exports);


/***/ }),

/***/ 7572:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Layout = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var logo_svg_1 = __importDefault(__webpack_require__(9574));
var routing_service_1 = __webpack_require__(9259);
var Layout = function () { return ({
    view: function (_a) {
        var children = _a.children, _b = _a.attrs, page = _b.state.page, changePage = _b.actions.changePage;
        var isActive = function (d) { return (page === d.id ? '.active' : ''); };
        return (0, mithril_1.default)('.main', { style: 'overflow-x: hidden' }, [
            (0, mithril_1.default)('.navbar-fixed', { style: 'z-index: 1001' }, (0, mithril_1.default)('nav', (0, mithril_1.default)('.nav-wrapper', [
                (0, mithril_1.default)('a.brand-logo[href=#].hide-on-small', { style: 'margin-left: 20px' }, [
                    (0, mithril_1.default)("img[width=50][height=50][src=".concat(logo_svg_1.default, "]"), {
                        style: 'margin-top: 5px; margin-left: -5px;',
                    }),
                    // m(
                    //   'div',
                    //   {
                    //     style:
                    //       'margin-top: 0px; position: absolute; top: 10px; left: 60px; width: 350px;',
                    //   },
                    //   m(
                    //     'h4.center.show-on-med-and-up.black-text',
                    //     { style: 'text-align: left; margin: 0;' },
                    //     'Zicht op overgewicht'
                    //   )
                    // ),
                ]),
                (0, mithril_1.default)(
                // 'a.sidenav-trigger[href=#!/home][data-target=slide-out]',
                // { onclick: (e: UIEvent) => e.preventDefault() },
                mithril_1.default.route.Link, {
                    className: 'sidenav-trigger',
                    'data-target': 'slide-out',
                    href: mithril_1.default.route.get(),
                }, (0, mithril_1.default)(mithril_materialized_1.Icon, {
                    iconName: 'menu',
                    className: 'hide-on-med-and-up black-text',
                    style: 'margin-left: 5px;',
                })),
                (0, mithril_1.default)('ul.right', routing_service_1.routingSvc
                    .getList()
                    .filter(function (d) { return (typeof d.visible === 'boolean' ? d.visible : d.visible()) || isActive(d); })
                    .map(function (d) {
                    return (0, mithril_1.default)("li.tooltip".concat(isActive(d)), [
                        (0, mithril_1.default)(mithril_materialized_1.Icon, {
                            className: 'hoverable' + (d.iconClass ? " ".concat(d.iconClass) : ''),
                            style: 'font-size: 2.2rem; width: 4rem;',
                            iconName: typeof d.icon === 'string' ? d.icon : d.icon(),
                            onclick: function () { return changePage(d.id); },
                        }),
                        (0, mithril_1.default)('span.tooltiptext', (typeof d.title === 'string' ? d.title : d.title()).toUpperCase()),
                    ]);
                })),
            ]))),
            (0, mithril_1.default)('.container', { style: 'padding-top: 1rem' }, children),
        ]);
    },
}); };
exports.Layout = Layout;


/***/ }),

/***/ 9808:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsPage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var mithril_ui_form_1 = __webpack_require__(2603);
var models_1 = __webpack_require__(9660);
var userForm = [
    { id: 'id', type: 'none', autogenerate: 'id' },
    {
        id: 'name',
        label: 'Name',
        icon: 'title',
        type: 'text',
        required: true,
        className: 'col s3',
    },
    {
        id: 'email',
        label: 'Email',
        icon: 'email',
        type: 'email',
        required: true,
        className: 'col s4',
    },
    {
        id: 'phone',
        label: 'Phone',
        icon: 'phone',
        type: 'text',
        required: true,
        className: 'col s3',
    },
    {
        id: 'isAuthor',
        label: 'Author',
        icon: 'edit_note',
        type: 'checkbox',
        required: false,
        className: 'col s2',
    },
    {
        id: 'url',
        label: 'Image link',
        icon: 'link',
        type: 'url',
        required: false,
        className: 'col s12',
    },
];
var SettingsPage = function () {
    var newUser = {};
    var addUser = false;
    var canSaveUser = false;
    return {
        oninit: function (_a) {
            var setPage = _a.attrs.actions.setPage;
            return setPage(models_1.Dashboards.SETTINGS);
        },
        view: function (_a) {
            var _b = _a.attrs, _c = _b.state, _d = _c.model, model = _d === void 0 ? models_1.defaultModel : _d, curUser = _c.curUser, _e = _b.actions, saveModel = _e.saveModel, saveCurUser = _e.saveCurUser;
            var _f = model.users, users = _f === void 0 ? [] : _f;
            return [
                (0, mithril_1.default)('.settings', [
                    (0, mithril_1.default)('.row', [
                        [
                            (0, mithril_1.default)(mithril_materialized_1.Select, {
                                key: curUser,
                                label: 'Current user',
                                initialValue: curUser,
                                placeholder: 'Select user',
                                options: users.map(function (u) { return ({ id: u.id, label: u.name }); }),
                                // data: users.reduce((acc, cur) => {
                                //   acc[cur.name] = cur.url || null;
                                //   return acc;
                                // }, {} as Record<string, string | null>),
                                onchange: function (v) { return v && saveCurUser(v[0]); },
                                className: 'col s6',
                            }),
                        ],
                        (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                            label: 'Logout',
                            onclick: function () { return saveCurUser(''); },
                            iconName: 'logout',
                            className: 'col s6',
                        }),
                    ]),
                    (0, mithril_1.default)('.row.users', [
                        (0, mithril_1.default)('h4', 'Users'),
                        (0, mithril_1.default)(mithril_materialized_1.Collapsible, {
                            items: users.map(function (user) { return ({
                                key: user.id,
                                header: user.name || 'Empty',
                                body: (0, mithril_1.default)('.row', [
                                    (0, mithril_1.default)(mithril_ui_form_1.LayoutForm, {
                                        form: userForm,
                                        obj: user,
                                        onchange: function () { return saveModel(model); },
                                    }),
                                    (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                                        label: 'Delete',
                                        iconName: 'delete',
                                        className: 'right',
                                        onclick: function () {
                                            model.users = users.filter(function (u) { return u.id !== user.id; });
                                            saveModel(model);
                                        },
                                    }),
                                    (0, mithril_1.default)('a.waves-effect.waves-teal.btn-flat.right', { href: "mailto:".concat(user.email) }, (0, mithril_1.default)('i.material-icons left', 'email'), 'Open email'),
                                ]),
                            }); }),
                        }),
                        addUser &&
                            (0, mithril_1.default)(mithril_ui_form_1.LayoutForm, {
                                form: userForm,
                                obj: newUser,
                                onchange: function (isValid) {
                                    canSaveUser = isValid;
                                },
                            }),
                        (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                            label: addUser ? 'Save' : 'Add User',
                            disabled: addUser ? !canSaveUser : false,
                            iconName: addUser ? 'save' : 'add',
                            className: 'right',
                            onclick: function () {
                                if (addUser && canSaveUser) {
                                    model.users.push(newUser);
                                    model.users = model.users.sort(function (a, b) {
                                        return a.name.split(' ').pop().localeCompare(b.name.split(' ').pop());
                                    });
                                    saveModel(model);
                                    newUser = {};
                                    canSaveUser = false;
                                }
                                addUser = !addUser;
                            },
                        }),
                        addUser &&
                            (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                                label: 'Cancel',
                                iconName: 'cancel',
                                className: 'right',
                                onclick: function () {
                                    newUser = {};
                                    canSaveUser = false;
                                    addUser = false;
                                },
                            }),
                    ]),
                ]),
            ];
        },
    };
};
exports.SettingsPage = SettingsPage;


/***/ }),

/***/ 7450:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllWordsPage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_ui_form_1 = __webpack_require__(2603);
var models_1 = __webpack_require__(9660);
var utils_1 = __webpack_require__(8867);
var ui_1 = __webpack_require__(7573);
// const createTextFilter = (txt: string) => {
//   if (!txt) return () => true;
//   const checker = new RegExp(txt, 'i');
//   return ({ a = '', b = '' }: DataItem) => checker.test(a) || checker.test(b);
// };
var md = "#### Glossary";
var lexicon = [
    {
        a: "schulden",
        b: "Het moeten betalen aan een ander van (meestal) een bedrag in geld.",
    },
    { a: "fastfoodconsumptie", b: "Het nuttigen van fastfood" },
].sort(function (a, b) { return a.a.localeCompare(b.a); });
var textFilter = "";
var AllWordsPage = function () { return ({
    oninit: function (_a) {
        var setPage = _a.attrs.actions.setPage;
        return setPage(models_1.Dashboards.TAXONOMY);
    },
    view: function () {
        var regexFilter = textFilter && new RegExp(textFilter.toLowerCase(), "i");
        var filteredLexicon = regexFilter ? lexicon.filter(function (l) { return regexFilter.test(l.a) || regexFilter.test(l.b); }) : lexicon;
        return [
            (0, mithril_1.default)(".row", { style: "height: 100vh" }, [
                (0, mithril_1.default)(ui_1.TextInputWithClear, {
                    label: "Search for a definition",
                    id: "filter",
                    initialValue: textFilter,
                    placeholder: "Part of a word...",
                    iconName: "filter_list",
                    oninput: function (v) {
                        textFilter = v ? v : "";
                        mithril_1.default.redraw();
                    },
                    style: "margin-bottom: -4rem",
                    className: "col s6 offset-m8 m4",
                }),
                (0, mithril_1.default)(".intro.col.s12", mithril_1.default.trust((0, mithril_ui_form_1.render)(md, false))),
                filteredLexicon && (0, mithril_1.default)("table.highlight", { style: "margin-bottom: 3rem" }, [
                    (0, mithril_1.default)("thead", (0, mithril_1.default)("tr", [
                        (0, mithril_1.default)("th", "Term"),
                        (0, mithril_1.default)("th", "Definition"),
                        (0, mithril_1.default)("th.hide-on-med-and-down", "Reference"),
                    ])),
                    (0, mithril_1.default)("tbody", filteredLexicon.map(function (l) {
                        return (0, mithril_1.default)("tr", [
                            (0, mithril_1.default)("td", mithril_1.default.trust((0, mithril_ui_form_1.render)((0, utils_1.subSup)(l.a)))),
                            (0, mithril_1.default)("td", mithril_1.default.trust((0, mithril_ui_form_1.render)((0, utils_1.subSup)(l.b)))),
                            l.ref && (0, mithril_1.default)("td.hide-on-med-and-down", l.url ? (0, mithril_1.default)("a", { target: "_", alt: l.ref, href: l.url }, l.ref) : l.ref),
                        ]);
                    })),
                ]),
            ]),
        ];
    },
}); };
exports.AllWordsPage = AllWordsPage;


/***/ }),

/***/ 9678:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TechnologyOverviewPage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var images_1 = __webpack_require__(2817);
var models_1 = __webpack_require__(9660);
var services_1 = __webpack_require__(9035);
var utils_1 = __webpack_require__(8867);
var ui_1 = __webpack_require__(7573);
var TechnologyOverviewPage = function () {
    var searchFilter = '';
    var mainCapFilter = 0;
    return {
        oninit: function (_a) {
            var setPage = _a.attrs.actions.setPage;
            return setPage(models_1.Dashboards.TECHNOLOGIES);
        },
        view: function (_a) {
            var _b = _a.attrs, _c = _b.state, model = _c.model, curUser = _c.curUser, _d = _c.bookmarks, bookmarks = _d === void 0 ? [] : _d, _e = _b.actions, setTechnology = _e.setTechnology, saveModel = _e.saveModel, changePage = _e.changePage, bookmark = _e.bookmark;
            var technologies = model.technologies;
            var searchRegex = searchFilter ? new RegExp(searchFilter, 'i') : undefined;
            var filteredTechnologies = technologies.filter(function (t) {
                if (searchRegex &&
                    !(searchRegex.test(t.technology || '') || searchRegex.test(t.mechanism || ''))) {
                    return false;
                }
                if (mainCapFilter && t.mainCap !== mainCapFilter) {
                    return false;
                }
                return true;
            });
            return [
                (0, mithril_1.default)('.row.technology-overview-page', { style: 'height: 95vh' }, [
                    (0, mithril_1.default)('.col.s12', (0, mithril_1.default)('.row', (0, mithril_1.default)('.col.s6.m4', (0, mithril_1.default)(ui_1.TextInputWithClear, {
                        label: 'Search',
                        iconName: 'search',
                        className: 'bottom-margin0',
                        oninput: function (s) {
                            searchFilter = s || '';
                            mithril_1.default.redraw();
                        },
                    })), (0, mithril_1.default)('.col.s6.m4', (0, mithril_1.default)(mithril_materialized_1.Select, {
                        label: 'Capability',
                        options: __spreadArray([{ id: 0, label: '-' }], utils_1.mainCapabilityOptions, true),
                        onchange: function (c) { return (mainCapFilter = +c); },
                    })), curUser &&
                        (0, mithril_1.default)('.right-align', (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                            label: 'Add technology',
                            iconName: 'add',
                            className: 'small',
                            onclick: function () {
                                var newTech = { id: (0, mithril_materialized_1.uniqueId)() };
                                model.technologies.push(newTech);
                                saveModel(model);
                                changePage(models_1.Dashboards.TECHNOLOGY, { id: newTech.id, edit: 'true' });
                            },
                        })))),
                    filteredTechnologies.map(function (t) {
                        var isBookmarked = bookmarks.indexOf(t.id) >= 0;
                        return (0, mithril_1.default)('.col.s12.m6.l4', (0, mithril_1.default)('.card.medium', [
                            (0, mithril_1.default)('.card-image', [
                                (0, mithril_1.default)('a', {
                                    href: services_1.routingSvc.href(models_1.Dashboards.TECHNOLOGY, "?id=".concat(t.id)),
                                }, [
                                    (0, mithril_1.default)('img', { src: (0, images_1.resolveImg)(t.url), alt: t.technology }),
                                    (0, mithril_1.default)('span.card-title.bold.sharpen', { className: isBookmarked ? 'amber-text' : 'black-text' }, t.technology),
                                ]),
                            ]),
                            (0, mithril_1.default)('.card-content', (0, mithril_1.default)('p', t.application)),
                            (0, mithril_1.default)('.card-action', (0, mithril_1.default)('a', {
                                href: services_1.routingSvc.href(models_1.Dashboards.TECHNOLOGY, "?id=".concat(t.id)),
                                onclick: function () { return setTechnology(t); },
                            }, (0, mithril_1.default)(mithril_materialized_1.Icon, { iconName: 'visibility' })), (0, mithril_1.default)('a', {
                                href: services_1.routingSvc.href(models_1.Dashboards.TECHNOLOGIES),
                                onclick: function () { return bookmark(t.id); },
                            }, (0, mithril_1.default)(mithril_materialized_1.Icon, {
                                iconName: isBookmarked ? 'star' : 'star_border',
                            }))),
                        ]));
                    }),
                ]),
            ];
        },
    };
};
exports.TechnologyOverviewPage = TechnologyOverviewPage;


/***/ }),

/***/ 3439:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TechnologyPage = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var mithril_ui_form_1 = __webpack_require__(2603);
var images_1 = __webpack_require__(2817);
var models_1 = __webpack_require__(9660);
var services_1 = __webpack_require__(9035);
var utils_1 = __webpack_require__(8867);
var TechnologyPage = function () {
    var id = '';
    var isEditting = false;
    var form = [];
    return {
        oninit: function (_a) {
            var _b = _a.attrs, _c = _b.state, model = _c.model, _d = _c.curTech, curTech = _d === void 0 ? {} : _d, _e = _b.actions, setPage = _e.setPage, setTechnology = _e.setTechnology;
            setPage(models_1.Dashboards.TECHNOLOGY);
            id = mithril_1.default.route.param('id') || curTech.id || '';
            isEditting = mithril_1.default.route.param('edit') === true ? true : false;
            var technologyOptions = model.technologies
                .filter(function (t) { return t.id !== id; })
                .map(function (t) { return ({ id: t.id, label: t.technology }); });
            form = (0, utils_1.technologyForm)(model.users, technologyOptions);
            if (id === curTech.id) {
                return;
            }
            var found = model.technologies.filter(function (t) { return t.id === id; }).shift() || model.technologies[0];
            if (found) {
                setTechnology(found);
            }
        },
        view: function (_a) {
            var _b = _a.attrs, _c = _b.state, _d = _c.curTech, curTech = _d === void 0 ? {} : _d, _e = _c.model, model = _e === void 0 ? models_1.defaultModel : _e, curUser = _c.curUser, _f = _b.actions, saveModel = _f.saveModel, changePage = _f.changePage;
            var users = model.users, technologies = model.technologies;
            var ownerId = curTech.owner;
            var updated = curTech.updated ? new Date(curTech.updated) : undefined;
            var owner = users.filter(function (u) { return u.id === ownerId; }).shift();
            var usedLiterature = curTech.literature;
            var md = (0, utils_1.resolveRefs)(curTech.literature).md2html;
            var mailtoLink = owner && "mailto:".concat(owner.email, "?subject=").concat(curTech.technology.replace(/ /g, '%20'));
            var similarTech = curTech.similar &&
                curTech.similar.length > 0 &&
                technologies.filter(function (t) { return curTech.similar.indexOf(t.id) >= 0; });
            return [
                (0, mithril_1.default)('.row.technology-page', { style: 'height: 95vh' }, (0, mithril_1.default)('.col.s12', [
                    curUser &&
                        (0, mithril_1.default)('.row', (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                            className: 'right',
                            label: isEditting ? 'Stop editting' : 'Edit',
                            iconName: 'edit',
                            onclick: function () { return (isEditting = !isEditting); },
                        }), isEditting &&
                            (0, mithril_1.default)(mithril_materialized_1.FlatButton, {
                                className: 'right',
                                label: 'Delete',
                                iconName: 'delete',
                                onclick: function () {
                                    model.technologies = model.technologies.filter(function (t) { return t.id !== curTech.id; });
                                    saveModel(model);
                                    changePage(models_1.Dashboards.TECHNOLOGIES);
                                },
                            })),
                    (0, mithril_1.default)('.row', isEditting
                        ? (0, mithril_1.default)(mithril_ui_form_1.LayoutForm, {
                            form: form,
                            obj: curTech,
                            onchange: function () {
                                model.technologies = model.technologies.map(function (t) {
                                    return t.id === curTech.id ? curTech : t;
                                });
                                saveModel(model);
                            },
                        })
                        : [
                            (0, mithril_1.default)('.row', [
                                (0, mithril_1.default)('h3', curTech.technology),
                                curTech.application && (0, mithril_1.default)('h4', md(curTech.application)),
                                (0, mithril_1.default)('.col.s12.m6', (0, mithril_1.default)('.row.bottom-margin0', (0, mithril_1.default)('h5.orange.separator', 'Description'), (0, mithril_1.default)('section', [
                                    curTech.category &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Category: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.technologyCategoryOptions, curTech.category) + '.',
                                        ]),
                                    curTech.hpeClassification &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'HPE classification: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.hpeClassificationOptions, curTech.hpeClassification) + '.',
                                        ]),
                                    curTech.mainCap &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Main capability: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.mainCapabilityOptions, curTech.mainCap) + '.',
                                        ]),
                                    curTech.specificCap &&
                                        curTech.specificCap.length > 0 &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Specific capability: '),
                                            (0, utils_1.joinListWithAnd)((0, utils_1.optionsToTxt)(curTech.specificCap, utils_1.specificCapabilityOptions)) + '.',
                                        ]),
                                    curTech.invasive &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Invasive: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.invasivenessOptions, curTech.invasive) + '.',
                                        ]),
                                    curTech.maturity &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Maturity: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.maturityOptions, curTech.maturity) + '.',
                                        ]),
                                    typeof curTech.booster !== 'undefined' &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Can be used as booster: '),
                                            "".concat(curTech.booster ? 'Yes' : 'No', "."),
                                        ]),
                                ]))),
                                curTech.url &&
                                    (0, mithril_1.default)('.col.s6.m6', (0, mithril_1.default)('img.responsive-img', {
                                        src: (0, images_1.resolveImg)(curTech.url),
                                        alt: curTech.technology,
                                    })),
                                (0, mithril_1.default)('.col.s12', (0, mithril_1.default)('.row.bottom-margin0', [
                                    (0, mithril_1.default)('h5.orange.separator', 'How it works'),
                                    curTech.mechanism && (0, mithril_1.default)('p', md(curTech.mechanism)),
                                    curTech.examples &&
                                        (0, mithril_1.default)('p', [(0, mithril_1.default)('span.bold', 'Examples: '), md(curTech.examples)]),
                                    curTech.incubation &&
                                        (0, mithril_1.default)('p', [(0, mithril_1.default)('span.bold', 'Incubation: '), md(curTech.incubation)]),
                                    curTech.effectDuration &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Effect duration: '),
                                            md(curTech.effectDuration),
                                        ]),
                                    (0, mithril_1.default)('h5.orange.separator', 'Keep in mind'),
                                    curTech.practical &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold[title=This information is not medical advice, please read the disclaimer!]', mithril_1.default.trust('Practical execution<sup class="red-text">*</sup>: ')),
                                            md(curTech.practical),
                                        ]),
                                    curTech.sideEffects &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Side-effects: '),
                                            md((0, utils_1.resolveChoice)(curTech.hasSideEffects, curTech.sideEffects)),
                                        ]),
                                    curTech.diff &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Individual differences: '),
                                            md((0, utils_1.resolveChoice)(curTech.hasIndDiff, curTech.diff)),
                                        ]),
                                    curTech.ethical &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Ethical considerations: '),
                                            md((0, utils_1.resolveChoice)(curTech.hasEthical, curTech.ethical)),
                                        ]),
                                    similarTech &&
                                        (0, mithril_1.default)('p', (0, mithril_1.default)('span.bold', "Similar technolog".concat(similarTech.length > 1 ? 'ies' : 'y', ": ")), similarTech.map(function (s, i) {
                                            return (0, mithril_1.default)('a', {
                                                href: services_1.routingSvc.href(models_1.Dashboards.TECHNOLOGY, "?id=".concat(s.id)),
                                            }, s.technology + (i < similarTech.length - 1 ? ', ' : '.'));
                                        })),
                                ])),
                                (0, mithril_1.default)('.col.s6.m8', (0, mithril_1.default)('.row', [
                                    curTech.evidenceDir &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Evidence direction: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.evidenceDirOptions, curTech.evidenceDir) + '.',
                                        ]),
                                    curTech.evidenceScore &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Evidence score: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.evidenceLevelOptions, curTech.evidenceScore) + '.',
                                        ]),
                                    curTech.availability &&
                                        (0, mithril_1.default)('p', [
                                            (0, mithril_1.default)('span.bold', 'Availability: '),
                                            (0, utils_1.getOptionsLabel)(utils_1.availabilityOptions, curTech.availability) + '.',
                                        ]),
                                    usedLiterature && [
                                        (0, mithril_1.default)('h5', 'References'),
                                        (0, mithril_1.default)('ol.browser-default', usedLiterature.map(function (l) {
                                            return (0, mithril_1.default)('li', (0, mithril_1.default)('a', {
                                                href: l.doi,
                                                alt: l.title,
                                                target: '_blank',
                                            }, l.title));
                                        })),
                                    ],
                                ])),
                                owner &&
                                    (0, mithril_1.default)('.col.s6.m4', (0, mithril_1.default)('.card.large', [
                                        (0, mithril_1.default)('.card-image.waves-effect.waves-block.waves-light', [
                                            (0, mithril_1.default)('a', owner &&
                                                owner.url &&
                                                (0, mithril_1.default)('img.activator', { src: owner.url, alt: owner.name })),
                                        ]),
                                        (0, mithril_1.default)('.card-content', (0, mithril_1.default)('p', (0, mithril_1.default)('span.card-title.activator', owner.name, (0, mithril_1.default)('i.material-icons.right', 'more_vert')), (0, mithril_1.default)('ul', [
                                            (0, mithril_1.default)('li', [
                                                (0, mithril_1.default)(mithril_materialized_1.Icon, {
                                                    iconName: 'phone',
                                                    className: 'tiny',
                                                }),
                                                (0, mithril_1.default)('a', { href: "tel:".concat(owner.phone) }, ' ' + owner.phone),
                                            ]),
                                            (0, mithril_1.default)('li', [
                                                (0, mithril_1.default)(mithril_materialized_1.Icon, {
                                                    iconName: 'email',
                                                    className: 'tiny',
                                                }),
                                                (0, mithril_1.default)('a', { href: mailtoLink }, ' ' + owner.email),
                                            ]),
                                        ]))),
                                        (0, mithril_1.default)('.card-action', (0, mithril_1.default)('a', { href: mailtoLink }, 'Email')),
                                        (0, mithril_1.default)('.card-reveal', [
                                            (0, mithril_1.default)('span.card-title.bold', "Owner: ".concat(owner.name), (0, mithril_1.default)(mithril_materialized_1.Icon, { iconName: 'close', className: 'right' })),
                                            updated &&
                                                (0, mithril_1.default)('p', [(0, mithril_1.default)('span.bold', "Last update: ".concat(updated.toDateString()))]),
                                            (0, mithril_1.default)('p', [
                                                (0, mithril_1.default)('span.bold', 'Status: '),
                                                (0, utils_1.getOptionsLabel)(utils_1.statusOptions, curTech.status) + '.',
                                            ]),
                                        ]),
                                    ])),
                            ]),
                        ]),
                ])),
            ];
        },
    };
};
exports.TechnologyPage = TechnologyPage;


/***/ }),

/***/ 7573:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(2027), exports);
__exportStar(__webpack_require__(1751), exports);


/***/ }),

/***/ 2027:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CircularSpinner = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var CircularSpinner = function () {
    return {
        view: function (_a) {
            var _b = _a.attrs, _c = _b === void 0 ? {} : _b, className = _c.className, style = _c.style;
            className = className || 'center-align';
            style = style || 'margin-top: 20%;';
            return (0, mithril_1.default)('div', { className: className, style: style }, (0, mithril_1.default)('.preloader-wrapper.big.active', (0, mithril_1.default)('.spinner-layer.spinner-blue-only', [
                (0, mithril_1.default)('.circle-clipper.left', (0, mithril_1.default)('.circle')),
                (0, mithril_1.default)('.gap.patch', (0, mithril_1.default)('.circle')),
                (0, mithril_1.default)('.circle-clipper.right', (0, mithril_1.default)('.circle')),
            ])));
        },
    };
};
exports.CircularSpinner = CircularSpinner;


/***/ }),

/***/ 1751:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextInputWithClear = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var utils_1 = __webpack_require__(8867);
var TextInputWithClear = function () {
    var id;
    var input;
    var clearButton;
    var labelElement;
    var debouncedOnInput;
    return {
        oninit: function (_a) {
            var _b = _a.attrs, oninput = _b.oninput, id = _b.id;
            id = id || (0, mithril_materialized_1.uniqueId)();
            debouncedOnInput = oninput && (0, utils_1.debounce)(oninput, 500);
        },
        view: function (_a) {
            var _b = _a.attrs, label = _b.label, initialValue = _b.initialValue, placeholder = _b.placeholder, iconName = _b.iconName, _c = _b.className, className = _c === void 0 ? "col s12" : _c, style = _b.style, onchange = _b.onchange, oninput = _b.oninput;
            return (0, mithril_1.default)(".input-field", { className: className, style: style }, [
                iconName && (0, mithril_1.default)(".material-icons prefix", iconName),
                (0, mithril_1.default)("input", {
                    id: id,
                    type: "text",
                    placeholder: placeholder,
                    oncreate: function (_a) {
                        var dom = _a.dom;
                        input = dom;
                        if (initialValue) {
                            input.value = initialValue;
                        }
                    },
                    oninput: function () {
                        clearButton.style.opacity =
                            typeof input.value !== "undefined" ? "1" : "0";
                        input.value ? labelElement.classList.add("active") : labelElement.classList.remove("active");
                        debouncedOnInput && debouncedOnInput(input.value);
                    },
                    onchange: function () {
                        onchange && onchange(input.value);
                    },
                }),
                (0, mithril_1.default)("label", {
                    for: id,
                    className: initialValue || placeholder ? "active" : undefined,
                    oncreate: function (_a) {
                        var dom = _a.dom;
                        return (labelElement = dom);
                    },
                }, label),
                (0, mithril_1.default)("a.waves-effect.waves-light.btn-flat", {
                    style: "opacity: 0; float: right; position: relative; top: -45px; transition: opacity 0.2s linear;",
                    onclick: function () {
                        input.value = "";
                        !placeholder && labelElement.classList.remove("active");
                        clearButton.style.opacity = "0";
                        onchange && onchange("");
                        oninput && oninput("");
                    },
                    oncreate: function (_a) {
                        var dom = _a.dom;
                        clearButton = dom;
                        if (initialValue) {
                            clearButton.style.opacity = "1";
                        }
                    },
                }, (0, mithril_1.default)("i.material-icons", "clear")),
            ]);
        },
    };
};
exports.TextInputWithClear = TextInputWithClear;


/***/ }),

/***/ 8043:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dashboards = void 0;
var Dashboards;
(function (Dashboards) {
    Dashboards["HOME"] = "HOME";
    Dashboards["TAXONOMY"] = "TAXONOMY";
    Dashboards["TECHNOLOGIES"] = "TECHNOLOGIES";
    Dashboards["TECHNOLOGY"] = "TECHNOLOGY";
    Dashboards["ABOUT"] = "ABOUT";
    Dashboards["SETTINGS"] = "SETTINGS";
    Dashboards["OVERVIEW"] = "OVERVIEW";
    Dashboards["HELP"] = "HELP";
})(Dashboards = exports.Dashboards || (exports.Dashboards = {}));


/***/ }),

/***/ 4524:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AVAILABILITY = exports.EVIDENCE_DIRECTION = exports.EVIDENCE_LEVEL = exports.LITERATURE_TYPE = exports.MATURITY = exports.EFFECT_DIRECTION = exports.INVASIVENESS_OBTRUSIVENESS = exports.YES_NO = exports.PERSONALITY_CAPABILITY = exports.SOCIAL_CAPABILITY = exports.MENTAL_CAPABILITY = exports.PHYSICAL_CAPABILITY = exports.COGNITION_CAPABILITY = exports.SPECIFIC_CAPABILITY = exports.MAIN_CAPABILITY = exports.HPE_CLASSIFICATION = exports.CHOICE = exports.STATUS = exports.TECHNOLOGY_CATEGORY = exports.defaultModel = void 0;
exports.defaultModel = {
    version: 1,
    lastUpdate: new Date().valueOf(),
    technologies: [],
    users: [],
};
var TECHNOLOGY_CATEGORY;
(function (TECHNOLOGY_CATEGORY) {
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["HARDWARE"] = 1] = "HARDWARE";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["BIO_ENHANCEMENT"] = 2] = "BIO_ENHANCEMENT";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION"] = 3] = "PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["TRAINING"] = 4] = "TRAINING";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["SELF_REGULATION"] = 5] = "SELF_REGULATION";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["NUTRITION"] = 6] = "NUTRITION";
    TECHNOLOGY_CATEGORY[TECHNOLOGY_CATEGORY["OTHER"] = 7] = "OTHER";
})(TECHNOLOGY_CATEGORY = exports.TECHNOLOGY_CATEGORY || (exports.TECHNOLOGY_CATEGORY = {}));
var STATUS;
(function (STATUS) {
    STATUS[STATUS["FIRST_DRAFT"] = 1] = "FIRST_DRAFT";
    STATUS[STATUS["READY_FOR_REVIEW"] = 2] = "READY_FOR_REVIEW";
    STATUS[STATUS["UNDER_REVIEW"] = 3] = "UNDER_REVIEW";
    STATUS[STATUS["REVIEWED"] = 4] = "REVIEWED";
    STATUS[STATUS["FINISHED"] = 5] = "FINISHED";
})(STATUS = exports.STATUS || (exports.STATUS = {}));
var CHOICE;
(function (CHOICE) {
    CHOICE[CHOICE["NONE"] = 1] = "NONE";
    CHOICE[CHOICE["UNKNOWN"] = 2] = "UNKNOWN";
    CHOICE[CHOICE["YES"] = 3] = "YES";
})(CHOICE = exports.CHOICE || (exports.CHOICE = {}));
var HPE_CLASSIFICATION;
(function (HPE_CLASSIFICATION) {
    HPE_CLASSIFICATION[HPE_CLASSIFICATION["OPTIMIZATION"] = 1] = "OPTIMIZATION";
    HPE_CLASSIFICATION[HPE_CLASSIFICATION["ENHANCEMENT"] = 2] = "ENHANCEMENT";
    HPE_CLASSIFICATION[HPE_CLASSIFICATION["DEGRADATION"] = 3] = "DEGRADATION";
})(HPE_CLASSIFICATION = exports.HPE_CLASSIFICATION || (exports.HPE_CLASSIFICATION = {}));
var MAIN_CAPABILITY;
(function (MAIN_CAPABILITY) {
    MAIN_CAPABILITY[MAIN_CAPABILITY["COGNITION"] = 1] = "COGNITION";
    MAIN_CAPABILITY[MAIN_CAPABILITY["PHYSICAL"] = 2] = "PHYSICAL";
    MAIN_CAPABILITY[MAIN_CAPABILITY["MENTAL"] = 3] = "MENTAL";
    MAIN_CAPABILITY[MAIN_CAPABILITY["SOCIAL"] = 4] = "SOCIAL";
    MAIN_CAPABILITY[MAIN_CAPABILITY["PHYSIOLOGICAL"] = 5] = "PHYSIOLOGICAL";
    MAIN_CAPABILITY[MAIN_CAPABILITY["PERSONALITY"] = 6] = "PERSONALITY";
})(MAIN_CAPABILITY = exports.MAIN_CAPABILITY || (exports.MAIN_CAPABILITY = {}));
var SPECIFIC_CAPABILITY;
(function (SPECIFIC_CAPABILITY) {
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["SITUATION_AWARENESS"] = 1] = "SITUATION_AWARENESS";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["EXECUTIVE_FUNCTIONS"] = 2] = "EXECUTIVE_FUNCTIONS";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["LONG_TERM_MEMORY"] = 3] = "LONG_TERM_MEMORY";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["SHORT_TERM_MEMORY"] = 4] = "SHORT_TERM_MEMORY";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["DECLARATIVE_MEMORY"] = 5] = "DECLARATIVE_MEMORY";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["VIGILANCE"] = 6] = "VIGILANCE";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["PSYCHOMOTOR"] = 7] = "PSYCHOMOTOR";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["VISUAL_PERCEPTION"] = 8] = "VISUAL_PERCEPTION";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["AUDITORY_PERCEPTION"] = 9] = "AUDITORY_PERCEPTION";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["TACTILE_PERCEPTION"] = 10] = "TACTILE_PERCEPTION";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["PAIN"] = 11] = "PAIN";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["ATTENTION"] = 12] = "ATTENTION";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["SPEECH"] = 13] = "SPEECH";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["LEARNING"] = 14] = "LEARNING";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["ARITHMETIC"] = 15] = "ARITHMETIC";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["SOCIAL_INTERACTION"] = 16] = "SOCIAL_INTERACTION";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["RECOVERY"] = 17] = "RECOVERY";
    SPECIFIC_CAPABILITY[SPECIFIC_CAPABILITY["WORKING_MEMORY"] = 18] = "WORKING_MEMORY";
})(SPECIFIC_CAPABILITY = exports.SPECIFIC_CAPABILITY || (exports.SPECIFIC_CAPABILITY = {}));
var COGNITION_CAPABILITY;
(function (COGNITION_CAPABILITY) {
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["SITUATION_AWARENESS"] = 1] = "SITUATION_AWARENESS";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["EXECUTIVE_FUNCTIONS"] = 2] = "EXECUTIVE_FUNCTIONS";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["LONG_TERM_MEMORY"] = 3] = "LONG_TERM_MEMORY";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["SHORT_TERM_MEMORY"] = 4] = "SHORT_TERM_MEMORY";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["DECLARATIVE_MEMORY"] = 5] = "DECLARATIVE_MEMORY";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["VIGILANCE"] = 6] = "VIGILANCE";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["PSYCHOMOTOR"] = 7] = "PSYCHOMOTOR";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["VISUAL_PERCEPTION"] = 8] = "VISUAL_PERCEPTION";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["AUDITORY_PERCEPTION"] = 9] = "AUDITORY_PERCEPTION";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["TACTILE_PERCEPTION"] = 10] = "TACTILE_PERCEPTION";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["PAIN"] = 11] = "PAIN";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["ATTENTION"] = 12] = "ATTENTION";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["SPEECH"] = 13] = "SPEECH";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["LEARNING"] = 14] = "LEARNING";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["ARITHMETIC"] = 15] = "ARITHMETIC";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["SOCIAL_INTERACTION"] = 16] = "SOCIAL_INTERACTION";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["RECOVERY"] = 17] = "RECOVERY";
    COGNITION_CAPABILITY[COGNITION_CAPABILITY["WORKING_MEMORY"] = 18] = "WORKING_MEMORY";
})(COGNITION_CAPABILITY = exports.COGNITION_CAPABILITY || (exports.COGNITION_CAPABILITY = {}));
var PHYSICAL_CAPABILITY;
(function (PHYSICAL_CAPABILITY) {
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["STRENGTH"] = 1] = "STRENGTH";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["ENDURANCE"] = 2] = "ENDURANCE";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["RECOVERY"] = 3] = "RECOVERY";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["SPEED"] = 4] = "SPEED";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["STRUCTURAL_TOUGHNESS"] = 5] = "STRUCTURAL_TOUGHNESS";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["PRECISION"] = 6] = "PRECISION";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["VISION"] = 7] = "VISION";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["HEARING"] = 8] = "HEARING";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["SENSE_OF_TOUCH"] = 9] = "SENSE_OF_TOUCH";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["ENERGY_EFFICIENCY"] = 10] = "ENERGY_EFFICIENCY";
    PHYSICAL_CAPABILITY[PHYSICAL_CAPABILITY["SLEEP_REGULATION"] = 11] = "SLEEP_REGULATION";
})(PHYSICAL_CAPABILITY = exports.PHYSICAL_CAPABILITY || (exports.PHYSICAL_CAPABILITY = {}));
var MENTAL_CAPABILITY;
(function (MENTAL_CAPABILITY) {
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["EMOTION"] = 1] = "EMOTION";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["STRESS"] = 2] = "STRESS";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["RESILIENCE"] = 3] = "RESILIENCE";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["MOTIVATION"] = 4] = "MOTIVATION";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["SELF_ESTEEM"] = 5] = "SELF_ESTEEM";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["PAIN"] = 6] = "PAIN";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["SELF_REPORTED_FATIGUE"] = 7] = "SELF_REPORTED_FATIGUE";
    MENTAL_CAPABILITY[MENTAL_CAPABILITY["EMPATHY"] = 8] = "EMPATHY";
})(MENTAL_CAPABILITY = exports.MENTAL_CAPABILITY || (exports.MENTAL_CAPABILITY = {}));
var SOCIAL_CAPABILITY;
(function (SOCIAL_CAPABILITY) {
    SOCIAL_CAPABILITY[SOCIAL_CAPABILITY["COLLABORATION"] = 1] = "COLLABORATION";
    SOCIAL_CAPABILITY[SOCIAL_CAPABILITY["COMMUNICATION"] = 2] = "COMMUNICATION";
    SOCIAL_CAPABILITY[SOCIAL_CAPABILITY["SOCIAL_INTELLIGENCE"] = 3] = "SOCIAL_INTELLIGENCE";
})(SOCIAL_CAPABILITY = exports.SOCIAL_CAPABILITY || (exports.SOCIAL_CAPABILITY = {}));
var PERSONALITY_CAPABILITY;
(function (PERSONALITY_CAPABILITY) {
    PERSONALITY_CAPABILITY[PERSONALITY_CAPABILITY["LEADERSHIP"] = 1] = "LEADERSHIP";
    PERSONALITY_CAPABILITY[PERSONALITY_CAPABILITY["OBEDIENCE"] = 2] = "OBEDIENCE";
    PERSONALITY_CAPABILITY[PERSONALITY_CAPABILITY["MORALE"] = 3] = "MORALE";
    PERSONALITY_CAPABILITY[PERSONALITY_CAPABILITY["RISK_TAKING"] = 4] = "RISK_TAKING";
    PERSONALITY_CAPABILITY[PERSONALITY_CAPABILITY["PERSISTANCE"] = 5] = "PERSISTANCE";
})(PERSONALITY_CAPABILITY = exports.PERSONALITY_CAPABILITY || (exports.PERSONALITY_CAPABILITY = {}));
var YES_NO;
(function (YES_NO) {
    //CAN BE USED AS A BOOSTER
    YES_NO[YES_NO["YES"] = 1] = "YES";
    YES_NO[YES_NO["NO"] = 2] = "NO";
})(YES_NO = exports.YES_NO || (exports.YES_NO = {}));
var INVASIVENESS_OBTRUSIVENESS;
(function (INVASIVENESS_OBTRUSIVENESS) {
    INVASIVENESS_OBTRUSIVENESS[INVASIVENESS_OBTRUSIVENESS["LOW"] = 1] = "LOW";
    INVASIVENESS_OBTRUSIVENESS[INVASIVENESS_OBTRUSIVENESS["MEDIUM"] = 2] = "MEDIUM";
    INVASIVENESS_OBTRUSIVENESS[INVASIVENESS_OBTRUSIVENESS["HIGH"] = 3] = "HIGH";
})(INVASIVENESS_OBTRUSIVENESS = exports.INVASIVENESS_OBTRUSIVENESS || (exports.INVASIVENESS_OBTRUSIVENESS = {}));
var EFFECT_DIRECTION;
(function (EFFECT_DIRECTION) {
    EFFECT_DIRECTION[EFFECT_DIRECTION["NEGATIVE"] = 1] = "NEGATIVE";
    EFFECT_DIRECTION[EFFECT_DIRECTION["POSITIVE"] = 2] = "POSITIVE";
})(EFFECT_DIRECTION = exports.EFFECT_DIRECTION || (exports.EFFECT_DIRECTION = {}));
var MATURITY;
(function (MATURITY) {
    MATURITY[MATURITY["LOW"] = 1] = "LOW";
    MATURITY[MATURITY["MEDIUM"] = 2] = "MEDIUM";
    MATURITY[MATURITY["HIGH"] = 3] = "HIGH";
})(MATURITY = exports.MATURITY || (exports.MATURITY = {}));
var LITERATURE_TYPE;
(function (LITERATURE_TYPE) {
    LITERATURE_TYPE[LITERATURE_TYPE["CASE_STUDY"] = 1] = "CASE_STUDY";
    LITERATURE_TYPE[LITERATURE_TYPE["THESIS"] = 2] = "THESIS";
    LITERATURE_TYPE[LITERATURE_TYPE["REPORT"] = 3] = "REPORT";
    LITERATURE_TYPE[LITERATURE_TYPE["TECHNICAL_REPORT"] = 4] = "TECHNICAL_REPORT";
    LITERATURE_TYPE[LITERATURE_TYPE["PRODUCER_WEBSITE"] = 5] = "PRODUCER_WEBSITE";
    LITERATURE_TYPE[LITERATURE_TYPE["WHITE_PAPER"] = 6] = "WHITE_PAPER";
    LITERATURE_TYPE[LITERATURE_TYPE["CONFERENCE_PROCEEDING"] = 7] = "CONFERENCE_PROCEEDING";
    LITERATURE_TYPE[LITERATURE_TYPE["PATENT"] = 8] = "PATENT";
    LITERATURE_TYPE[LITERATURE_TYPE["POPULAR_MEDIA"] = 9] = "POPULAR_MEDIA";
    LITERATURE_TYPE[LITERATURE_TYPE["CONSENSUS_STATEMENT"] = 10] = "CONSENSUS_STATEMENT";
    LITERATURE_TYPE[LITERATURE_TYPE["EMPERICAL_PR"] = 11] = "EMPERICAL_PR";
    LITERATURE_TYPE[LITERATURE_TYPE["REVIEW_PR"] = 12] = "REVIEW_PR";
    LITERATURE_TYPE[LITERATURE_TYPE["SYSTEMATIC_REVIEW_PR"] = 13] = "SYSTEMATIC_REVIEW_PR";
    LITERATURE_TYPE[LITERATURE_TYPE["META_ANALYSIS_PR"] = 14] = "META_ANALYSIS_PR";
})(LITERATURE_TYPE = exports.LITERATURE_TYPE || (exports.LITERATURE_TYPE = {}));
var EVIDENCE_LEVEL;
(function (EVIDENCE_LEVEL) {
    EVIDENCE_LEVEL[EVIDENCE_LEVEL["A"] = 1] = "A";
    EVIDENCE_LEVEL[EVIDENCE_LEVEL["B"] = 2] = "B";
    EVIDENCE_LEVEL[EVIDENCE_LEVEL["C"] = 3] = "C";
})(EVIDENCE_LEVEL = exports.EVIDENCE_LEVEL || (exports.EVIDENCE_LEVEL = {}));
var EVIDENCE_DIRECTION;
(function (EVIDENCE_DIRECTION) {
    EVIDENCE_DIRECTION[EVIDENCE_DIRECTION["GENERALLY_IN_FAVOR"] = 1] = "GENERALLY_IN_FAVOR";
    EVIDENCE_DIRECTION[EVIDENCE_DIRECTION["GENERALLY_AGAINST"] = 2] = "GENERALLY_AGAINST";
    EVIDENCE_DIRECTION[EVIDENCE_DIRECTION["UNDECIDED"] = 3] = "UNDECIDED";
})(EVIDENCE_DIRECTION = exports.EVIDENCE_DIRECTION || (exports.EVIDENCE_DIRECTION = {}));
var AVAILABILITY;
(function (AVAILABILITY) {
    AVAILABILITY[AVAILABILITY["YES_WITHIN_THE_NETHERLANDS"] = 1] = "YES_WITHIN_THE_NETHERLANDS";
    AVAILABILITY[AVAILABILITY["YES_WITHIN_THE_EU"] = 2] = "YES_WITHIN_THE_EU";
    AVAILABILITY[AVAILABILITY["YES_OUTSIDE_THE_EU"] = 3] = "YES_OUTSIDE_THE_EU";
    AVAILABILITY[AVAILABILITY["NO"] = 4] = "NO";
    AVAILABILITY[AVAILABILITY["UNKNOWN"] = 5] = "UNKNOWN";
})(AVAILABILITY = exports.AVAILABILITY || (exports.AVAILABILITY = {}));


/***/ }),

/***/ 9660:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(8043), exports);
__exportStar(__webpack_require__(4524), exports);


/***/ }),

/***/ 9035:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(7899), exports);
__exportStar(__webpack_require__(9259), exports);


/***/ }),

/***/ 7899:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cells = exports.appActions = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mergerino_1 = __importDefault(__webpack_require__(6562));
var _1 = __webpack_require__(9035);
var models_1 = __webpack_require__(9660);
var MODEL_KEY = 'HPET_MODEL';
var CUR_USER_KEY = 'HPET_CUR_USER';
var BOOKMARKS_KEY = 'HPET_BOOKMARK';
var appActions = function (_a) {
    var update = _a.update;
    return ({
        // addDucks: (cell, amount) => {
        //   cell.update({ ducks: (value) => value + amount });
        // },
        setPage: function (page) { return update({ page: page }); },
        changePage: function (page, params, query) {
            _1.routingSvc && _1.routingSvc.switchTo(page, params, query);
            update({ page: page });
        },
        saveModel: function (model) {
            model.lastUpdate = Date.now();
            model.version = model.version ? model.version++ : 1;
            localStorage.setItem(MODEL_KEY, JSON.stringify(model));
            console.log(JSON.stringify(model, null, 2));
            update({ model: function () { return model; } });
        },
        saveCurUser: function (curUser) {
            localStorage.setItem(CUR_USER_KEY, curUser);
            update({ curUser: curUser });
        },
        setTechnology: function (curTech) { return update({ curTech: curTech }); },
        bookmark: function (id) {
            return update({
                bookmarks: function (bookmarks) {
                    if (bookmarks === void 0) { bookmarks = []; }
                    var newBookmarks = (function () {
                        if (bookmarks.indexOf(id) >= 0)
                            return bookmarks.filter(function (b) { return b !== id; });
                        bookmarks.push(id);
                        return bookmarks;
                    })();
                    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
                    return newBookmarks;
                },
            });
        },
    });
};
exports.appActions = appActions;
var ds = localStorage.getItem(MODEL_KEY);
var model = ds ? JSON.parse(ds) : models_1.defaultModel;
var b = localStorage.getItem(BOOKMARKS_KEY);
var bookmarks = b ? JSON.parse(b) : [];
var curUser = localStorage.getItem(CUR_USER_KEY) || '';
var app = {
    initial: { page: models_1.Dashboards.HOME, model: model, curTech: undefined, bookmarks: bookmarks, curUser: curUser },
};
exports.cells = (0, mergerino_1.default)({ app: app });
exports.cells.map(function () {
    mithril_1.default.redraw();
});


/***/ }),

/***/ 9259:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.routingSvc = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var models_1 = __webpack_require__(9660);
var meiosis_1 = __webpack_require__(7899);
var layout_1 = __webpack_require__(7572);
var components_1 = __webpack_require__(5421);
var technology_overview_page_1 = __webpack_require__(9678);
var RoutingService = /** @class */ (function () {
    function RoutingService(dashboards) {
        this.setList(dashboards);
    }
    RoutingService.prototype.getList = function () {
        return this.dashboards;
    };
    RoutingService.prototype.setList = function (list) {
        this.dashboards = Object.freeze(list);
    };
    Object.defineProperty(RoutingService.prototype, "defaultRoute", {
        get: function () {
            var dashboard = this.dashboards.filter(function (d) { return d.default; }).shift();
            return dashboard ? dashboard.route : this.dashboards[0].route;
        },
        enumerable: false,
        configurable: true
    });
    RoutingService.prototype.route = function (dashboardId, query) {
        var dashboard = this.dashboards.filter(function (d) { return d.id === dashboardId; }).shift();
        return dashboard
            ? '#!' + dashboard.route + (query ? '?' + mithril_1.default.buildQueryString(query) : '')
            : this.defaultRoute;
    };
    RoutingService.prototype.href = function (dashboardId, params) {
        if (params === void 0) { params = ''; }
        var dashboard = this.dashboards.filter(function (d) { return d.id === dashboardId; }).shift();
        return dashboard ? "#!".concat(dashboard.route.replace(/:\w*/, '')).concat(params) : this.defaultRoute;
    };
    RoutingService.prototype.switchTo = function (dashboardId, params, query) {
        var dashboard = this.dashboards.filter(function (d) { return d.id === dashboardId; }).shift();
        if (dashboard) {
            var url = dashboard.route + (query ? '?' + mithril_1.default.buildQueryString(query) : '');
            mithril_1.default.route.set(url, params);
        }
    };
    RoutingService.prototype.routingTable = function () {
        // console.log('INIT');
        return this.dashboards.reduce(function (p, c) {
            p[c.route] =
                c.hasNavBar === false
                    ? {
                        render: function () {
                            var cell = (0, meiosis_1.cells)();
                            var actions = (0, meiosis_1.appActions)(cell);
                            return (0, mithril_1.default)(c.component, __assign(__assign({}, cell), { actions: actions }));
                        },
                    }
                    : {
                        // onmatch:
                        //   c.id === Dashboards.LOGIN
                        //     ? undefined
                        //     : () => {
                        //         if (c.id !== Dashboards.HOME && !Auth.isLoggedIn()) m.route.set('/login');
                        //       },
                        render: function () {
                            var cell = (0, meiosis_1.cells)();
                            var actions = (0, meiosis_1.appActions)(cell);
                            return (0, mithril_1.default)(layout_1.Layout, __assign(__assign({}, cell), { actions: actions, options: {} }), (0, mithril_1.default)(c.component, __assign(__assign({}, cell), { actions: actions })));
                        },
                    };
            return p;
        }, {});
    };
    return RoutingService;
}());
exports.routingSvc = new RoutingService([
    {
        id: models_1.Dashboards.HOME,
        title: 'HOME',
        icon: 'home',
        route: '/',
        visible: true,
        component: components_1.HomePage,
    },
    {
        id: models_1.Dashboards.TECHNOLOGIES,
        title: 'TECHNOLOGY OVERVIEW',
        icon: 'display_settings',
        route: '/technologies',
        visible: true,
        component: technology_overview_page_1.TechnologyOverviewPage,
    },
    {
        id: models_1.Dashboards.TECHNOLOGY,
        title: 'TECHNOLOGY',
        icon: 'military_tech',
        route: '/technology',
        visible: true,
        component: components_1.TechnologyPage,
    },
    {
        id: models_1.Dashboards.SETTINGS,
        title: 'References',
        icon: 'settings',
        route: '/literature',
        visible: true,
        component: components_1.SettingsPage,
    },
    // {
    // 	id: Dashboards.TAXONOMY,
    // 	title: "TAXONOMY",
    // 	icon: "book",
    // 	route: "/taxonomy",
    // 	visible: true,
    // 	component: AllWordsPage,
    // },
    {
        id: models_1.Dashboards.ABOUT,
        title: 'About',
        icon: 'info',
        route: '/about',
        visible: true,
        component: components_1.AboutPage,
    },
]);


/***/ }),

/***/ 8867:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveRefs = exports.refRegex = exports.markdown2html = exports.technologyForm = exports.availabilityOptions = exports.evidenceLevelOptions = exports.evidenceDirOptions = exports.effectDirectionOptions = exports.maturityOptions = exports.invasivenessOptions = exports.specificCapabilityOptions = exports.mainCapabilityOptions = exports.hpeClassificationOptions = exports.technologyCategoryOptions = exports.resolveChoice = exports.NoYesUnknown = exports.statusOptions = exports.optionsToTxt = exports.joinListWithAnd = exports.getOptionsLabel = exports.getTextColorFromBackground = exports.formatDate = exports.debounce = exports.capitalize = exports.subSup = void 0;
var mithril_1 = __importDefault(__webpack_require__(9402));
var mithril_materialized_1 = __webpack_require__(9989);
var mithril_ui_form_1 = __webpack_require__(2603);
var models_1 = __webpack_require__(9660);
var supRegex = /\^([^_ ]+)(_|$|\s)/g;
var subRegex = /\_([^\^ ]+)(\^|$|\s)/g;
/** Expand markdown notation by converting A_1 to subscript and x^2 to superscript. */
var subSup = function (s) {
    return s ? s.replace(supRegex, "<sup>$1</sup>").replace(subRegex, "<sub>$1</sub>") : s;
};
exports.subSup = subSup;
var capitalize = function (s) { return s && s.charAt(0).toUpperCase() + s.slice(1); };
exports.capitalize = capitalize;
/**
 * Debounce function wrapper, i.e. between consecutive calls of the wrapped function,
 * there will be at least TIMEOUT milliseconds.
 * @param func Function to execute
 * @param timeout Timeout in milliseconds
 * @returns
 */
var debounce = function (func, timeout) {
    var timer;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timer);
        timer = window.setTimeout(function () {
            func.apply(void 0, args);
        }, timeout);
    };
};
exports.debounce = debounce;
var formatDate = function (date) {
    if (date === void 0) { date = new Date(); }
    var d = new Date(date);
    return "".concat(d.getFullYear(), "-").concat((0, mithril_materialized_1.padLeft)(d.getMonth() + 1), "-").concat((0, mithril_materialized_1.padLeft)(d.getDate()));
};
exports.formatDate = formatDate;
/**
 * Get a color that is clearly visible against a background color
 * @param backgroundColor Background color, e.g. #99AABB
 * @returns
 */
var getTextColorFromBackground = function (backgroundColor) {
    if (!backgroundColor) {
        return 'black-text';
    }
    var c = backgroundColor.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma < 105 ? 'white-text' : 'black-text';
};
exports.getTextColorFromBackground = getTextColorFromBackground;
var getOptionsLabel = function (options, id) {
    if (!id) {
        return '';
    }
    var found = options.filter(function (o) { return o.id === id; }).shift();
    return found ? "".concat(found.label).concat(found.title ? " (".concat(found.title, ")") : '') : '';
};
exports.getOptionsLabel = getOptionsLabel;
/** Join a list of items with a comma, and use AND for the last item in the list. */
var joinListWithAnd = function (arr, and, prefix) {
    if (arr === void 0) { arr = []; }
    if (and === void 0) { and = 'and'; }
    if (prefix === void 0) { prefix = ''; }
    return arr.length === 0
        ? ''
        : prefix +
            (arr.length === 1
                ? arr[0]
                : "".concat(arr.slice(0, arr.length - 1).join(', '), " ").concat(and, " ").concat(arr[arr.length - 1]));
};
exports.joinListWithAnd = joinListWithAnd;
/** Convert a list of options to text (label + title?) */
var optionsToTxt = function (selectedIds, options) {
    if (!selectedIds || (selectedIds instanceof Array && selectedIds.length === 0))
        return [''];
    var ids = selectedIds instanceof Array ? selectedIds : [selectedIds];
    var lookup = options.reduce(function (acc, cur) {
        acc[cur.id] = "".concat(cur.label).concat(cur.title ? " (".concat(cur.title, ")") : '');
        return acc;
    }, {});
    return ids.map(function (id) { return lookup[id]; });
};
exports.optionsToTxt = optionsToTxt;
exports.statusOptions = [
    { id: models_1.STATUS.FIRST_DRAFT, label: 'First draft' },
    { id: models_1.STATUS.READY_FOR_REVIEW, label: 'Ready for review' },
    { id: models_1.STATUS.UNDER_REVIEW, label: 'Under review' },
    { id: models_1.STATUS.REVIEWED, label: 'Reviewed' },
    { id: models_1.STATUS.FINISHED, label: 'Finished' },
];
exports.NoYesUnknown = [
    { id: models_1.CHOICE.NONE, label: 'None' },
    { id: models_1.CHOICE.UNKNOWN, label: 'Unknown' },
    { id: models_1.CHOICE.YES, label: 'Yes' },
];
var resolveChoice = function (choice, text) {
    return !choice || choice === models_1.CHOICE.NONE
        ? exports.NoYesUnknown[0].label
        : choice === models_1.CHOICE.UNKNOWN
            ? exports.NoYesUnknown[1].label
            : text;
};
exports.resolveChoice = resolveChoice;
exports.technologyCategoryOptions = [
    { id: models_1.TECHNOLOGY_CATEGORY.HARDWARE, label: 'Hardware' },
    { id: models_1.TECHNOLOGY_CATEGORY.BIO_ENHANCEMENT, label: 'Bio-enhancement' },
    {
        id: models_1.TECHNOLOGY_CATEGORY.PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION,
        label: 'Pharmacological substances, supplements and nutrition',
    },
    { id: models_1.TECHNOLOGY_CATEGORY.TRAINING, label: 'Training' },
    { id: models_1.TECHNOLOGY_CATEGORY.SELF_REGULATION, label: 'Self-regulation' },
    { id: models_1.TECHNOLOGY_CATEGORY.NUTRITION, label: 'Nutrition' },
    { id: models_1.TECHNOLOGY_CATEGORY.OTHER, label: 'Other' },
];
exports.hpeClassificationOptions = [
    { id: models_1.HPE_CLASSIFICATION.OPTIMIZATION, label: 'Optimization' },
    { id: models_1.HPE_CLASSIFICATION.ENHANCEMENT, label: 'Enhancement' },
    { id: models_1.HPE_CLASSIFICATION.DEGRADATION, label: 'Degradation' },
];
exports.mainCapabilityOptions = [
    { id: models_1.MAIN_CAPABILITY.COGNITION, label: 'Cognition' },
    { id: models_1.MAIN_CAPABILITY.PHYSICAL, label: 'Physical' },
    { id: models_1.MAIN_CAPABILITY.MENTAL, label: 'Mental' },
    { id: models_1.MAIN_CAPABILITY.SOCIAL, label: 'Social' },
    { id: models_1.MAIN_CAPABILITY.PHYSIOLOGICAL, label: 'Physiological' },
    { id: models_1.MAIN_CAPABILITY.PERSONALITY, label: 'Personality' },
];
exports.specificCapabilityOptions = [
    { id: models_1.SPECIFIC_CAPABILITY.SITUATION_AWARENESS, label: 'Situation awareness' },
    { id: models_1.SPECIFIC_CAPABILITY.EXECUTIVE_FUNCTIONS, label: 'Executive functions' },
    { id: models_1.SPECIFIC_CAPABILITY.LONG_TERM_MEMORY, label: 'Long term memory' },
    { id: models_1.SPECIFIC_CAPABILITY.SHORT_TERM_MEMORY, label: 'Short term memory' },
    { id: models_1.SPECIFIC_CAPABILITY.DECLARATIVE_MEMORY, label: 'Declarative memory' },
    { id: models_1.SPECIFIC_CAPABILITY.VIGILANCE, label: 'Vigilance' },
    { id: models_1.SPECIFIC_CAPABILITY.PSYCHOMOTOR, label: 'Psychomotor' },
    { id: models_1.SPECIFIC_CAPABILITY.VISUAL_PERCEPTION, label: 'Visual perception' },
    { id: models_1.SPECIFIC_CAPABILITY.AUDITORY_PERCEPTION, label: 'Auditory perception' },
    { id: models_1.SPECIFIC_CAPABILITY.TACTILE_PERCEPTION, label: 'Tactile perception' },
    { id: models_1.SPECIFIC_CAPABILITY.PAIN, label: 'Pain' },
    { id: models_1.SPECIFIC_CAPABILITY.ATTENTION, label: 'Attention' },
    { id: models_1.SPECIFIC_CAPABILITY.SPEECH, label: 'Speech' },
    { id: models_1.SPECIFIC_CAPABILITY.LEARNING, label: 'Learning' },
    { id: models_1.SPECIFIC_CAPABILITY.ARITHMETIC, label: 'Arithmetic' },
    { id: models_1.SPECIFIC_CAPABILITY.SOCIAL_INTERACTION, label: 'Social interaction' },
    { id: models_1.SPECIFIC_CAPABILITY.RECOVERY, label: 'Recovery' },
    { id: models_1.SPECIFIC_CAPABILITY.WORKING_MEMORY, label: 'Working memory' },
];
exports.invasivenessOptions = [
    {
        id: models_1.INVASIVENESS_OBTRUSIVENESS.LOW,
        label: 'Low',
        title: 'No physical substance enters the body',
    },
    {
        id: models_1.INVASIVENESS_OBTRUSIVENESS.MEDIUM,
        label: 'Medium',
        title: 'Supplements, heavy training, interventions with low risk',
    },
    {
        id: models_1.INVASIVENESS_OBTRUSIVENESS.HIGH,
        label: 'High',
        title: 'High-impact pharma, implants, body modifications, interventions with high risk or pain',
    },
];
exports.maturityOptions = [
    {
        id: models_1.MATURITY.LOW,
        label: 'Low',
        title: 'Little to no research has been performed on the intervention. Existing research is inconclusive about the effectiveness',
    },
    {
        id: models_1.MATURITY.MEDIUM,
        label: 'Medium',
        title: 'A small body of research exists indicating effectiveness of the technology. Low TRL level applications',
    },
    {
        id: models_1.MATURITY.HIGH,
        label: 'High',
        title: 'One or more meta-analyses indicate effectiveness. The technology is already applied in practice',
    },
];
exports.effectDirectionOptions = [
    { id: models_1.EFFECT_DIRECTION.NEGATIVE, label: 'The technology descreases a subjects capability level' },
    { id: models_1.EFFECT_DIRECTION.POSITIVE, label: 'The technology increases a subjects capability level' },
];
exports.evidenceDirOptions = [
    { id: models_1.EVIDENCE_DIRECTION.GENERALLY_IN_FAVOR, label: 'Generally in favor' },
    { id: models_1.EVIDENCE_DIRECTION.GENERALLY_AGAINST, label: 'Generally against' },
    { id: models_1.EVIDENCE_DIRECTION.UNDECIDED, label: 'Undecided' },
];
exports.evidenceLevelOptions = [
    { id: models_1.EVIDENCE_LEVEL.A, label: 'Based on consistent and good quality evidence' },
    { id: models_1.EVIDENCE_LEVEL.B, label: 'Based on inconsistent or limited-quality evidence' },
    { id: models_1.EVIDENCE_LEVEL.C, label: 'Based on consensus, usual practice, opinion.' },
];
exports.availabilityOptions = [
    {
        id: models_1.AVAILABILITY.YES_WITHIN_THE_NETHERLANDS,
        label: 'Yes, within The Netherlands',
    },
    { id: models_1.AVAILABILITY.YES_WITHIN_THE_EU, label: 'Yes, within the EU' },
    { id: models_1.AVAILABILITY.YES_OUTSIDE_THE_EU, label: 'Yes, outside the EU' },
    { id: models_1.AVAILABILITY.NO, label: 'No' },
    { id: models_1.AVAILABILITY.UNKNOWN, label: 'Unknown' },
];
var literatureTypeOptions = [
    { id: models_1.LITERATURE_TYPE.CASE_STUDY, label: 'Case study' },
    { id: models_1.LITERATURE_TYPE.THESIS, label: 'Thesis' },
    { id: models_1.LITERATURE_TYPE.REPORT, label: 'Report' },
    { id: models_1.LITERATURE_TYPE.TECHNICAL_REPORT, label: 'Technical report' },
    { id: models_1.LITERATURE_TYPE.PRODUCER_WEBSITE, label: 'Producer website' },
    { id: models_1.LITERATURE_TYPE.WHITE_PAPER, label: 'White paper' },
    { id: models_1.LITERATURE_TYPE.CONFERENCE_PROCEEDING, label: 'Conference proceedings' },
    { id: models_1.LITERATURE_TYPE.PATENT, label: 'Patent' },
    { id: models_1.LITERATURE_TYPE.POPULAR_MEDIA, label: 'Popular media' },
    { id: models_1.LITERATURE_TYPE.CONSENSUS_STATEMENT, label: 'Consensus statement' },
    { id: models_1.LITERATURE_TYPE.EMPERICAL_PR, label: 'Emperical (Peer Reviewed)' },
    { id: models_1.LITERATURE_TYPE.REVIEW_PR, label: 'Review (Peer Reviewed)' },
    {
        id: models_1.LITERATURE_TYPE.SYSTEMATIC_REVIEW_PR,
        label: 'Systematic review (Peer Reviewed)',
    },
    {
        id: models_1.LITERATURE_TYPE.META_ANALYSIS_PR,
        label: 'Meta analysis (Peer Reviewed)',
    },
];
var literatureForm = [
    {
        id: 'title',
        label: 'Title',
        required: true,
        type: 'text',
        className: 'col s12 m4',
    },
    { id: 'doi', label: 'DOI', required: true, type: 'text', className: 'col s8 m5' },
    {
        id: 'type',
        label: 'Type',
        required: true,
        type: 'select',
        options: literatureTypeOptions,
        className: 'col s4 m3',
    },
];
var technologyForm = function (users, technologyOptions) {
    return [
        { id: 'id', type: 'none', autogenerate: 'id' },
        { id: 'updated', type: 'none', autogenerate: 'timestamp' },
        {
            id: 'technology',
            label: 'Technology title',
            type: 'text',
            className: 'col s8 m6',
        },
        {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: exports.statusOptions,
            className: 'col s12 m2',
        },
        {
            id: 'category',
            label: 'Category',
            type: 'select',
            multiple: true,
            options: exports.technologyCategoryOptions,
            className: 'col s4',
        },
        {
            id: 'owner',
            label: 'Owner',
            type: 'select',
            options: users.map(function (u) { return ({ id: u.id, label: u.name }); }),
            className: 'col s4 m3',
        },
        {
            id: 'reviewer',
            label: 'Reviewer',
            type: 'select',
            multiple: true,
            options: users.map(function (u) { return ({ id: u.id, label: u.name }); }),
            className: 'col s8 m9',
        },
        {
            id: 'application',
            label: 'Specific application',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'mainCap',
            label: 'Main capability',
            type: 'select',
            className: 'col s6 m3',
            options: exports.mainCapabilityOptions,
        },
        {
            id: 'hpeClassification',
            label: 'HPE classification',
            type: 'select',
            className: 'col s6 m3',
            options: exports.hpeClassificationOptions,
        },
        {
            id: 'invasive',
            label: 'Invasive?',
            type: 'select',
            className: 'col s6 m2',
            options: exports.invasivenessOptions,
        },
        {
            id: 'booster',
            label: 'Can be applied as booster?',
            type: 'checkbox',
            className: 'col s6 m4',
        },
        {
            id: 'specificCap',
            label: 'Specific capability',
            type: 'select',
            multiple: true,
            options: exports.specificCapabilityOptions,
            className: 'col s12',
        },
        {
            id: 'synonyms',
            label: 'Synonyms and keywords',
            type: 'tags',
            className: 'col s12',
        },
        {
            id: 'similar',
            label: 'Similar technologies',
            type: 'select',
            multiple: true,
            options: technologyOptions,
            className: 'col s12',
        },
        {
            id: 'mechanism',
            label: 'How it works',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'effectDuration',
            label: 'Effect duration',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'incubation',
            label: 'Effect incubation',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'practical',
            label: 'Practical execution',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'hasIndDiff',
            label: 'Has individual differences?',
            type: 'select',
            options: exports.NoYesUnknown,
            className: 'col s4',
        },
        {
            id: 'hasSideEffects',
            label: 'Has side effects?',
            type: 'select',
            options: exports.NoYesUnknown,
            className: 'col s4',
        },
        {
            id: 'hasEthical',
            label: 'Has ethical considerations?',
            type: 'select',
            options: exports.NoYesUnknown,
            className: 'col s4',
        },
        {
            id: 'diff',
            label: 'Individual differences',
            type: 'textarea',
            className: 'col s12',
            show: 'hasIndDiff > 1',
        },
        {
            id: 'sideEffects',
            label: 'Side effects',
            type: 'textarea',
            className: 'col s12',
            show: 'hasSideEffects > 1',
        },
        {
            id: 'ethical',
            label: 'Ethical considerations',
            type: 'textarea',
            className: 'col s12',
            show: 'hasEthical > 1',
        },
        {
            id: 'examples',
            label: 'Examples of the intervention being used in practice',
            type: 'textarea',
            className: 'col s12',
        },
        {
            id: 'maturity',
            label: 'Maturity',
            type: 'select',
            className: 'col s6 m2',
            options: exports.maturityOptions,
        },
        {
            id: 'availability',
            label: 'Availability',
            type: 'select',
            className: 'col s12 m3',
            options: exports.availabilityOptions,
        },
        {
            id: 'evidenceDir',
            label: 'Evidence direction',
            type: 'select',
            className: 'col s12 m2',
            options: exports.evidenceDirOptions,
        },
        {
            id: 'evidenceScore',
            label: 'Evidence quality',
            type: 'select',
            className: 'col s12 m5',
            options: exports.evidenceLevelOptions,
        },
        // {
        //   id: 'evidenceScore',
        //   label: 'Evidence score',
        //   type: 'radio',
        //   checkboxClass: 'col s4',
        //   className: 'col s12',
        //   options: evidenceLevelOptions,
        // },
        { id: 'url', label: 'Link to image', type: 'url', className: 'col s12' },
        {
            id: 'literature',
            label: 'Literature',
            className: 'col s12',
            repeat: true,
            pageSize: 20,
            type: literatureForm,
        },
    ];
};
exports.technologyForm = technologyForm;
/** Convert markdown text to HTML */
var markdown2html = function (markdown) {
    if (markdown === void 0) { markdown = ''; }
    return mithril_1.default.trust((0, mithril_ui_form_1.render)(markdown, true, true));
};
exports.markdown2html = markdown2html;
/** RegExp for references of type [vullings2022] */
exports.refRegex = /\[(\d*)\]/gi;
/** Convert markdown text to HTML after resolving all references. */
var resolveRefs = function (literature) {
    if (literature === void 0) { literature = []; }
    var ids = __spreadArray([], literature.map(function (lit, i) { return ({ id: i + 1, title: lit.title, url: lit.doi, type: 'LIT' }); }), true).reduce(function (acc, cur) {
        acc[cur.id] = cur;
        return acc;
    }, {});
    return {
        ids: ids,
        md2html: function (markdown) {
            if (markdown === void 0) { markdown = ''; }
            var md = markdown.replace(exports.refRegex, function (replaceValue) {
                var reference = ids[replaceValue.replace(/\[|\]/g, '')];
                // console.log(replaceValue);
                return reference
                    ? "<a href=\"".concat(reference.url, "\" target=\"_blank\" alt=\"").concat(reference.title, "\" title=\"").concat(reference.title, "\">").concat(replaceValue, "</a>")
                    : "<span class=\"red-text\">".concat(replaceValue, "</span>");
            });
            return (0, exports.markdown2html)(md);
        },
    };
};
exports.resolveRefs = resolveRefs;


/***/ }),

/***/ 2868:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "682f370b71a2168f21f2.jpg";

/***/ }),

/***/ 9574:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "bcdcd2724cc8e9f700e1.svg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "https://erikvullings.github.io/hpet/";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(2675);
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map