(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
var entities_json_1 = __importDefault(require("./maps/entities.json"));
var legacy_json_1 = __importDefault(require("./maps/legacy.json"));
var xml_json_1 = __importDefault(require("./maps/xml.json"));
var decode_codepoint_1 = __importDefault(require("./decode_codepoint"));
var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
exports.decodeXML = getStrictDecoder(xml_json_1.default);
exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
function getStrictDecoder(map) {
    var replace = getReplacer(map);
    return function (str) { return String(str).replace(strictEntityRe, replace); };
}
var sorter = function (a, b) { return (a < b ? 1 : -1); };
exports.decodeHTML = (function () {
    var legacy = Object.keys(legacy_json_1.default).sort(sorter);
    var keys = Object.keys(entities_json_1.default).sort(sorter);
    for (var i = 0, j = 0; i < keys.length; i++) {
        if (legacy[j] === keys[i]) {
            keys[i] += ";?";
            j++;
        }
        else {
            keys[i] += ";";
        }
    }
    var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
    var replace = getReplacer(entities_json_1.default);
    function replacer(str) {
        if (str.substr(-1) !== ";")
            str += ";";
        return replace(str);
    }
    // TODO consider creating a merged map
    return function (str) { return String(str).replace(re, replacer); };
})();
function getReplacer(map) {
    return function replace(str) {
        if (str.charAt(1) === "#") {
            var secondChar = str.charAt(2);
            if (secondChar === "X" || secondChar === "x") {
                return decode_codepoint_1.default(parseInt(str.substr(3), 16));
            }
            return decode_codepoint_1.default(parseInt(str.substr(2), 10));
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return map[str.slice(1, -1)] || str;
    };
}

},{"./decode_codepoint":3,"./maps/entities.json":7,"./maps/legacy.json":8,"./maps/xml.json":9}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var decode_json_1 = __importDefault(require("./maps/decode.json"));
// Adapted from https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
var fromCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.fromCodePoint ||
    function (codePoint) {
        var output = "";
        if (codePoint > 0xffff) {
            codePoint -= 0x10000;
            output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
            codePoint = 0xdc00 | (codePoint & 0x3ff);
        }
        output += String.fromCharCode(codePoint);
        return output;
    };
function decodeCodePoint(codePoint) {
    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
        return "\uFFFD";
    }
    if (codePoint in decode_json_1.default) {
        codePoint = decode_json_1.default[codePoint];
    }
    return fromCodePoint(codePoint);
}
exports.default = decodeCodePoint;

},{"./maps/decode.json":6}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
var xml_json_1 = __importDefault(require("./maps/xml.json"));
var inverseXML = getInverseObj(xml_json_1.default);
var xmlReplacer = getInverseReplacer(inverseXML);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using XML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeXML = getASCIIEncoder(inverseXML);
var entities_json_1 = __importDefault(require("./maps/entities.json"));
var inverseHTML = getInverseObj(entities_json_1.default);
var htmlReplacer = getInverseReplacer(inverseHTML);
/**
 * Encodes all entities and non-ASCII characters in the input.
 *
 * This includes characters that are valid ASCII characters in HTML documents.
 * For example `#` will be encoded as `&num;`. To get a more compact output,
 * consider using the `encodeNonAsciiHTML` function.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in HTML
 * documents using HTML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
function getInverseObj(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (inverse, name) {
        inverse[obj[name]] = "&" + name + ";";
        return inverse;
    }, {});
}
function getInverseReplacer(inverse) {
    var single = [];
    var multiple = [];
    for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
        var k = _a[_i];
        if (k.length === 1) {
            // Add value to single array
            single.push("\\" + k);
        }
        else {
            // Add value to multiple array
            multiple.push(k);
        }
    }
    // Add ranges to single characters.
    single.sort();
    for (var start = 0; start < single.length - 1; start++) {
        // Find the end of a run of characters
        var end = start;
        while (end < single.length - 1 &&
            single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
            end += 1;
        }
        var count = 1 + end - start;
        // We want to replace at least three characters
        if (count < 3)
            continue;
        single.splice(start, count, single[start] + "-" + single[end]);
    }
    multiple.unshift("[" + single.join("") + "]");
    return new RegExp(multiple.join("|"), "g");
}
// /[^\0-\x7F]/gu
var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
var getCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.prototype.codePointAt != null
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        function (str) { return str.codePointAt(0); }
    : // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        function (c) {
            return (c.charCodeAt(0) - 0xd800) * 0x400 +
                c.charCodeAt(1) -
                0xdc00 +
                0x10000;
        };
function singleCharReplacer(c) {
    return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0))
        .toString(16)
        .toUpperCase() + ";";
}
function getInverse(inverse, re) {
    return function (data) {
        return data
            .replace(re, function (name) { return inverse[name]; })
            .replace(reNonASCII, singleCharReplacer);
    };
}
var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
 *
 * Have a look at `escapeUTF8` if you want a more concise output at the expense
 * of reduced transportability.
 *
 * @param data String to escape.
 */
function escape(data) {
    return data.replace(reEscapeChars, singleCharReplacer);
}
exports.escape = escape;
/**
 * Encodes all characters not valid in XML documents using numeric hexadecimal
 * reference (eg. `&#xfc;`).
 *
 * Note that the output will be character-set dependent.
 *
 * @param data String to escape.
 */
function escapeUTF8(data) {
    return data.replace(xmlReplacer, singleCharReplacer);
}
exports.escapeUTF8 = escapeUTF8;
function getASCIIEncoder(obj) {
    return function (data) {
        return data.replace(reEscapeChars, function (c) { return obj[c] || singleCharReplacer(c); });
    };
}

},{"./maps/entities.json":7,"./maps/xml.json":9}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
var decode_1 = require("./decode");
var encode_1 = require("./encode");
/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeXML` or `decodeHTML` directly.
 */
function decode(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
}
exports.decode = decode;
/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeHTMLStrict` or `decodeXML` directly.
 */
function decodeStrict(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
}
exports.decodeStrict = decodeStrict;
/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `encodeHTML`, `encodeXML` or `encodeNonAsciiHTML` directly.
 */
function encode(data, level) {
    return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
}
exports.encode = encode;
var encode_2 = require("./encode");
Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return encode_2.encodeXML; } });
Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function () { return encode_2.encodeNonAsciiHTML; } });
Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return encode_2.escape; } });
Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function () { return encode_2.escapeUTF8; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
var decode_2 = require("./decode");
Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_2.decodeXML; } });
Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_2.decodeXML; } });

},{"./decode":2,"./encode":4}],6:[function(require,module,exports){
module.exports={"0":65533,"128":8364,"130":8218,"131":402,"132":8222,"133":8230,"134":8224,"135":8225,"136":710,"137":8240,"138":352,"139":8249,"140":338,"142":381,"145":8216,"146":8217,"147":8220,"148":8221,"149":8226,"150":8211,"151":8212,"152":732,"153":8482,"154":353,"155":8250,"156":339,"158":382,"159":376}

},{}],7:[function(require,module,exports){
module.exports={"Aacute":"??","aacute":"??","Abreve":"??","abreve":"??","ac":"???","acd":"???","acE":"?????","Acirc":"??","acirc":"??","acute":"??","Acy":"??","acy":"??","AElig":"??","aelig":"??","af":"???","Afr":"????","afr":"????","Agrave":"??","agrave":"??","alefsym":"???","aleph":"???","Alpha":"??","alpha":"??","Amacr":"??","amacr":"??","amalg":"???","amp":"&","AMP":"&","andand":"???","And":"???","and":"???","andd":"???","andslope":"???","andv":"???","ang":"???","ange":"???","angle":"???","angmsdaa":"???","angmsdab":"???","angmsdac":"???","angmsdad":"???","angmsdae":"???","angmsdaf":"???","angmsdag":"???","angmsdah":"???","angmsd":"???","angrt":"???","angrtvb":"???","angrtvbd":"???","angsph":"???","angst":"??","angzarr":"???","Aogon":"??","aogon":"??","Aopf":"????","aopf":"????","apacir":"???","ap":"???","apE":"???","ape":"???","apid":"???","apos":"'","ApplyFunction":"???","approx":"???","approxeq":"???","Aring":"??","aring":"??","Ascr":"????","ascr":"????","Assign":"???","ast":"*","asymp":"???","asympeq":"???","Atilde":"??","atilde":"??","Auml":"??","auml":"??","awconint":"???","awint":"???","backcong":"???","backepsilon":"??","backprime":"???","backsim":"???","backsimeq":"???","Backslash":"???","Barv":"???","barvee":"???","barwed":"???","Barwed":"???","barwedge":"???","bbrk":"???","bbrktbrk":"???","bcong":"???","Bcy":"??","bcy":"??","bdquo":"???","becaus":"???","because":"???","Because":"???","bemptyv":"???","bepsi":"??","bernou":"???","Bernoullis":"???","Beta":"??","beta":"??","beth":"???","between":"???","Bfr":"????","bfr":"????","bigcap":"???","bigcirc":"???","bigcup":"???","bigodot":"???","bigoplus":"???","bigotimes":"???","bigsqcup":"???","bigstar":"???","bigtriangledown":"???","bigtriangleup":"???","biguplus":"???","bigvee":"???","bigwedge":"???","bkarow":"???","blacklozenge":"???","blacksquare":"???","blacktriangle":"???","blacktriangledown":"???","blacktriangleleft":"???","blacktriangleright":"???","blank":"???","blk12":"???","blk14":"???","blk34":"???","block":"???","bne":"=???","bnequiv":"??????","bNot":"???","bnot":"???","Bopf":"????","bopf":"????","bot":"???","bottom":"???","bowtie":"???","boxbox":"???","boxdl":"???","boxdL":"???","boxDl":"???","boxDL":"???","boxdr":"???","boxdR":"???","boxDr":"???","boxDR":"???","boxh":"???","boxH":"???","boxhd":"???","boxHd":"???","boxhD":"???","boxHD":"???","boxhu":"???","boxHu":"???","boxhU":"???","boxHU":"???","boxminus":"???","boxplus":"???","boxtimes":"???","boxul":"???","boxuL":"???","boxUl":"???","boxUL":"???","boxur":"???","boxuR":"???","boxUr":"???","boxUR":"???","boxv":"???","boxV":"???","boxvh":"???","boxvH":"???","boxVh":"???","boxVH":"???","boxvl":"???","boxvL":"???","boxVl":"???","boxVL":"???","boxvr":"???","boxvR":"???","boxVr":"???","boxVR":"???","bprime":"???","breve":"??","Breve":"??","brvbar":"??","bscr":"????","Bscr":"???","bsemi":"???","bsim":"???","bsime":"???","bsolb":"???","bsol":"\\","bsolhsub":"???","bull":"???","bullet":"???","bump":"???","bumpE":"???","bumpe":"???","Bumpeq":"???","bumpeq":"???","Cacute":"??","cacute":"??","capand":"???","capbrcup":"???","capcap":"???","cap":"???","Cap":"???","capcup":"???","capdot":"???","CapitalDifferentialD":"???","caps":"??????","caret":"???","caron":"??","Cayleys":"???","ccaps":"???","Ccaron":"??","ccaron":"??","Ccedil":"??","ccedil":"??","Ccirc":"??","ccirc":"??","Cconint":"???","ccups":"???","ccupssm":"???","Cdot":"??","cdot":"??","cedil":"??","Cedilla":"??","cemptyv":"???","cent":"??","centerdot":"??","CenterDot":"??","cfr":"????","Cfr":"???","CHcy":"??","chcy":"??","check":"???","checkmark":"???","Chi":"??","chi":"??","circ":"??","circeq":"???","circlearrowleft":"???","circlearrowright":"???","circledast":"???","circledcirc":"???","circleddash":"???","CircleDot":"???","circledR":"??","circledS":"???","CircleMinus":"???","CirclePlus":"???","CircleTimes":"???","cir":"???","cirE":"???","cire":"???","cirfnint":"???","cirmid":"???","cirscir":"???","ClockwiseContourIntegral":"???","CloseCurlyDoubleQuote":"???","CloseCurlyQuote":"???","clubs":"???","clubsuit":"???","colon":":","Colon":"???","Colone":"???","colone":"???","coloneq":"???","comma":",","commat":"@","comp":"???","compfn":"???","complement":"???","complexes":"???","cong":"???","congdot":"???","Congruent":"???","conint":"???","Conint":"???","ContourIntegral":"???","copf":"????","Copf":"???","coprod":"???","Coproduct":"???","copy":"??","COPY":"??","copysr":"???","CounterClockwiseContourIntegral":"???","crarr":"???","cross":"???","Cross":"???","Cscr":"????","cscr":"????","csub":"???","csube":"???","csup":"???","csupe":"???","ctdot":"???","cudarrl":"???","cudarrr":"???","cuepr":"???","cuesc":"???","cularr":"???","cularrp":"???","cupbrcap":"???","cupcap":"???","CupCap":"???","cup":"???","Cup":"???","cupcup":"???","cupdot":"???","cupor":"???","cups":"??????","curarr":"???","curarrm":"???","curlyeqprec":"???","curlyeqsucc":"???","curlyvee":"???","curlywedge":"???","curren":"??","curvearrowleft":"???","curvearrowright":"???","cuvee":"???","cuwed":"???","cwconint":"???","cwint":"???","cylcty":"???","dagger":"???","Dagger":"???","daleth":"???","darr":"???","Darr":"???","dArr":"???","dash":"???","Dashv":"???","dashv":"???","dbkarow":"???","dblac":"??","Dcaron":"??","dcaron":"??","Dcy":"??","dcy":"??","ddagger":"???","ddarr":"???","DD":"???","dd":"???","DDotrahd":"???","ddotseq":"???","deg":"??","Del":"???","Delta":"??","delta":"??","demptyv":"???","dfisht":"???","Dfr":"????","dfr":"????","dHar":"???","dharl":"???","dharr":"???","DiacriticalAcute":"??","DiacriticalDot":"??","DiacriticalDoubleAcute":"??","DiacriticalGrave":"`","DiacriticalTilde":"??","diam":"???","diamond":"???","Diamond":"???","diamondsuit":"???","diams":"???","die":"??","DifferentialD":"???","digamma":"??","disin":"???","div":"??","divide":"??","divideontimes":"???","divonx":"???","DJcy":"??","djcy":"??","dlcorn":"???","dlcrop":"???","dollar":"$","Dopf":"????","dopf":"????","Dot":"??","dot":"??","DotDot":"???","doteq":"???","doteqdot":"???","DotEqual":"???","dotminus":"???","dotplus":"???","dotsquare":"???","doublebarwedge":"???","DoubleContourIntegral":"???","DoubleDot":"??","DoubleDownArrow":"???","DoubleLeftArrow":"???","DoubleLeftRightArrow":"???","DoubleLeftTee":"???","DoubleLongLeftArrow":"???","DoubleLongLeftRightArrow":"???","DoubleLongRightArrow":"???","DoubleRightArrow":"???","DoubleRightTee":"???","DoubleUpArrow":"???","DoubleUpDownArrow":"???","DoubleVerticalBar":"???","DownArrowBar":"???","downarrow":"???","DownArrow":"???","Downarrow":"???","DownArrowUpArrow":"???","DownBreve":"??","downdownarrows":"???","downharpoonleft":"???","downharpoonright":"???","DownLeftRightVector":"???","DownLeftTeeVector":"???","DownLeftVectorBar":"???","DownLeftVector":"???","DownRightTeeVector":"???","DownRightVectorBar":"???","DownRightVector":"???","DownTeeArrow":"???","DownTee":"???","drbkarow":"???","drcorn":"???","drcrop":"???","Dscr":"????","dscr":"????","DScy":"??","dscy":"??","dsol":"???","Dstrok":"??","dstrok":"??","dtdot":"???","dtri":"???","dtrif":"???","duarr":"???","duhar":"???","dwangle":"???","DZcy":"??","dzcy":"??","dzigrarr":"???","Eacute":"??","eacute":"??","easter":"???","Ecaron":"??","ecaron":"??","Ecirc":"??","ecirc":"??","ecir":"???","ecolon":"???","Ecy":"??","ecy":"??","eDDot":"???","Edot":"??","edot":"??","eDot":"???","ee":"???","efDot":"???","Efr":"????","efr":"????","eg":"???","Egrave":"??","egrave":"??","egs":"???","egsdot":"???","el":"???","Element":"???","elinters":"???","ell":"???","els":"???","elsdot":"???","Emacr":"??","emacr":"??","empty":"???","emptyset":"???","EmptySmallSquare":"???","emptyv":"???","EmptyVerySmallSquare":"???","emsp13":"???","emsp14":"???","emsp":"???","ENG":"??","eng":"??","ensp":"???","Eogon":"??","eogon":"??","Eopf":"????","eopf":"????","epar":"???","eparsl":"???","eplus":"???","epsi":"??","Epsilon":"??","epsilon":"??","epsiv":"??","eqcirc":"???","eqcolon":"???","eqsim":"???","eqslantgtr":"???","eqslantless":"???","Equal":"???","equals":"=","EqualTilde":"???","equest":"???","Equilibrium":"???","equiv":"???","equivDD":"???","eqvparsl":"???","erarr":"???","erDot":"???","escr":"???","Escr":"???","esdot":"???","Esim":"???","esim":"???","Eta":"??","eta":"??","ETH":"??","eth":"??","Euml":"??","euml":"??","euro":"???","excl":"!","exist":"???","Exists":"???","expectation":"???","exponentiale":"???","ExponentialE":"???","fallingdotseq":"???","Fcy":"??","fcy":"??","female":"???","ffilig":"???","fflig":"???","ffllig":"???","Ffr":"????","ffr":"????","filig":"???","FilledSmallSquare":"???","FilledVerySmallSquare":"???","fjlig":"fj","flat":"???","fllig":"???","fltns":"???","fnof":"??","Fopf":"????","fopf":"????","forall":"???","ForAll":"???","fork":"???","forkv":"???","Fouriertrf":"???","fpartint":"???","frac12":"??","frac13":"???","frac14":"??","frac15":"???","frac16":"???","frac18":"???","frac23":"???","frac25":"???","frac34":"??","frac35":"???","frac38":"???","frac45":"???","frac56":"???","frac58":"???","frac78":"???","frasl":"???","frown":"???","fscr":"????","Fscr":"???","gacute":"??","Gamma":"??","gamma":"??","Gammad":"??","gammad":"??","gap":"???","Gbreve":"??","gbreve":"??","Gcedil":"??","Gcirc":"??","gcirc":"??","Gcy":"??","gcy":"??","Gdot":"??","gdot":"??","ge":"???","gE":"???","gEl":"???","gel":"???","geq":"???","geqq":"???","geqslant":"???","gescc":"???","ges":"???","gesdot":"???","gesdoto":"???","gesdotol":"???","gesl":"??????","gesles":"???","Gfr":"????","gfr":"????","gg":"???","Gg":"???","ggg":"???","gimel":"???","GJcy":"??","gjcy":"??","gla":"???","gl":"???","glE":"???","glj":"???","gnap":"???","gnapprox":"???","gne":"???","gnE":"???","gneq":"???","gneqq":"???","gnsim":"???","Gopf":"????","gopf":"????","grave":"`","GreaterEqual":"???","GreaterEqualLess":"???","GreaterFullEqual":"???","GreaterGreater":"???","GreaterLess":"???","GreaterSlantEqual":"???","GreaterTilde":"???","Gscr":"????","gscr":"???","gsim":"???","gsime":"???","gsiml":"???","gtcc":"???","gtcir":"???","gt":">","GT":">","Gt":"???","gtdot":"???","gtlPar":"???","gtquest":"???","gtrapprox":"???","gtrarr":"???","gtrdot":"???","gtreqless":"???","gtreqqless":"???","gtrless":"???","gtrsim":"???","gvertneqq":"??????","gvnE":"??????","Hacek":"??","hairsp":"???","half":"??","hamilt":"???","HARDcy":"??","hardcy":"??","harrcir":"???","harr":"???","hArr":"???","harrw":"???","Hat":"^","hbar":"???","Hcirc":"??","hcirc":"??","hearts":"???","heartsuit":"???","hellip":"???","hercon":"???","hfr":"????","Hfr":"???","HilbertSpace":"???","hksearow":"???","hkswarow":"???","hoarr":"???","homtht":"???","hookleftarrow":"???","hookrightarrow":"???","hopf":"????","Hopf":"???","horbar":"???","HorizontalLine":"???","hscr":"????","Hscr":"???","hslash":"???","Hstrok":"??","hstrok":"??","HumpDownHump":"???","HumpEqual":"???","hybull":"???","hyphen":"???","Iacute":"??","iacute":"??","ic":"???","Icirc":"??","icirc":"??","Icy":"??","icy":"??","Idot":"??","IEcy":"??","iecy":"??","iexcl":"??","iff":"???","ifr":"????","Ifr":"???","Igrave":"??","igrave":"??","ii":"???","iiiint":"???","iiint":"???","iinfin":"???","iiota":"???","IJlig":"??","ijlig":"??","Imacr":"??","imacr":"??","image":"???","ImaginaryI":"???","imagline":"???","imagpart":"???","imath":"??","Im":"???","imof":"???","imped":"??","Implies":"???","incare":"???","in":"???","infin":"???","infintie":"???","inodot":"??","intcal":"???","int":"???","Int":"???","integers":"???","Integral":"???","intercal":"???","Intersection":"???","intlarhk":"???","intprod":"???","InvisibleComma":"???","InvisibleTimes":"???","IOcy":"??","iocy":"??","Iogon":"??","iogon":"??","Iopf":"????","iopf":"????","Iota":"??","iota":"??","iprod":"???","iquest":"??","iscr":"????","Iscr":"???","isin":"???","isindot":"???","isinE":"???","isins":"???","isinsv":"???","isinv":"???","it":"???","Itilde":"??","itilde":"??","Iukcy":"??","iukcy":"??","Iuml":"??","iuml":"??","Jcirc":"??","jcirc":"??","Jcy":"??","jcy":"??","Jfr":"????","jfr":"????","jmath":"??","Jopf":"????","jopf":"????","Jscr":"????","jscr":"????","Jsercy":"??","jsercy":"??","Jukcy":"??","jukcy":"??","Kappa":"??","kappa":"??","kappav":"??","Kcedil":"??","kcedil":"??","Kcy":"??","kcy":"??","Kfr":"????","kfr":"????","kgreen":"??","KHcy":"??","khcy":"??","KJcy":"??","kjcy":"??","Kopf":"????","kopf":"????","Kscr":"????","kscr":"????","lAarr":"???","Lacute":"??","lacute":"??","laemptyv":"???","lagran":"???","Lambda":"??","lambda":"??","lang":"???","Lang":"???","langd":"???","langle":"???","lap":"???","Laplacetrf":"???","laquo":"??","larrb":"???","larrbfs":"???","larr":"???","Larr":"???","lArr":"???","larrfs":"???","larrhk":"???","larrlp":"???","larrpl":"???","larrsim":"???","larrtl":"???","latail":"???","lAtail":"???","lat":"???","late":"???","lates":"??????","lbarr":"???","lBarr":"???","lbbrk":"???","lbrace":"{","lbrack":"[","lbrke":"???","lbrksld":"???","lbrkslu":"???","Lcaron":"??","lcaron":"??","Lcedil":"??","lcedil":"??","lceil":"???","lcub":"{","Lcy":"??","lcy":"??","ldca":"???","ldquo":"???","ldquor":"???","ldrdhar":"???","ldrushar":"???","ldsh":"???","le":"???","lE":"???","LeftAngleBracket":"???","LeftArrowBar":"???","leftarrow":"???","LeftArrow":"???","Leftarrow":"???","LeftArrowRightArrow":"???","leftarrowtail":"???","LeftCeiling":"???","LeftDoubleBracket":"???","LeftDownTeeVector":"???","LeftDownVectorBar":"???","LeftDownVector":"???","LeftFloor":"???","leftharpoondown":"???","leftharpoonup":"???","leftleftarrows":"???","leftrightarrow":"???","LeftRightArrow":"???","Leftrightarrow":"???","leftrightarrows":"???","leftrightharpoons":"???","leftrightsquigarrow":"???","LeftRightVector":"???","LeftTeeArrow":"???","LeftTee":"???","LeftTeeVector":"???","leftthreetimes":"???","LeftTriangleBar":"???","LeftTriangle":"???","LeftTriangleEqual":"???","LeftUpDownVector":"???","LeftUpTeeVector":"???","LeftUpVectorBar":"???","LeftUpVector":"???","LeftVectorBar":"???","LeftVector":"???","lEg":"???","leg":"???","leq":"???","leqq":"???","leqslant":"???","lescc":"???","les":"???","lesdot":"???","lesdoto":"???","lesdotor":"???","lesg":"??????","lesges":"???","lessapprox":"???","lessdot":"???","lesseqgtr":"???","lesseqqgtr":"???","LessEqualGreater":"???","LessFullEqual":"???","LessGreater":"???","lessgtr":"???","LessLess":"???","lesssim":"???","LessSlantEqual":"???","LessTilde":"???","lfisht":"???","lfloor":"???","Lfr":"????","lfr":"????","lg":"???","lgE":"???","lHar":"???","lhard":"???","lharu":"???","lharul":"???","lhblk":"???","LJcy":"??","ljcy":"??","llarr":"???","ll":"???","Ll":"???","llcorner":"???","Lleftarrow":"???","llhard":"???","lltri":"???","Lmidot":"??","lmidot":"??","lmoustache":"???","lmoust":"???","lnap":"???","lnapprox":"???","lne":"???","lnE":"???","lneq":"???","lneqq":"???","lnsim":"???","loang":"???","loarr":"???","lobrk":"???","longleftarrow":"???","LongLeftArrow":"???","Longleftarrow":"???","longleftrightarrow":"???","LongLeftRightArrow":"???","Longleftrightarrow":"???","longmapsto":"???","longrightarrow":"???","LongRightArrow":"???","Longrightarrow":"???","looparrowleft":"???","looparrowright":"???","lopar":"???","Lopf":"????","lopf":"????","loplus":"???","lotimes":"???","lowast":"???","lowbar":"_","LowerLeftArrow":"???","LowerRightArrow":"???","loz":"???","lozenge":"???","lozf":"???","lpar":"(","lparlt":"???","lrarr":"???","lrcorner":"???","lrhar":"???","lrhard":"???","lrm":"???","lrtri":"???","lsaquo":"???","lscr":"????","Lscr":"???","lsh":"???","Lsh":"???","lsim":"???","lsime":"???","lsimg":"???","lsqb":"[","lsquo":"???","lsquor":"???","Lstrok":"??","lstrok":"??","ltcc":"???","ltcir":"???","lt":"<","LT":"<","Lt":"???","ltdot":"???","lthree":"???","ltimes":"???","ltlarr":"???","ltquest":"???","ltri":"???","ltrie":"???","ltrif":"???","ltrPar":"???","lurdshar":"???","luruhar":"???","lvertneqq":"??????","lvnE":"??????","macr":"??","male":"???","malt":"???","maltese":"???","Map":"???","map":"???","mapsto":"???","mapstodown":"???","mapstoleft":"???","mapstoup":"???","marker":"???","mcomma":"???","Mcy":"??","mcy":"??","mdash":"???","mDDot":"???","measuredangle":"???","MediumSpace":"???","Mellintrf":"???","Mfr":"????","mfr":"????","mho":"???","micro":"??","midast":"*","midcir":"???","mid":"???","middot":"??","minusb":"???","minus":"???","minusd":"???","minusdu":"???","MinusPlus":"???","mlcp":"???","mldr":"???","mnplus":"???","models":"???","Mopf":"????","mopf":"????","mp":"???","mscr":"????","Mscr":"???","mstpos":"???","Mu":"??","mu":"??","multimap":"???","mumap":"???","nabla":"???","Nacute":"??","nacute":"??","nang":"??????","nap":"???","napE":"?????","napid":"?????","napos":"??","napprox":"???","natural":"???","naturals":"???","natur":"???","nbsp":"??","nbump":"?????","nbumpe":"?????","ncap":"???","Ncaron":"??","ncaron":"??","Ncedil":"??","ncedil":"??","ncong":"???","ncongdot":"?????","ncup":"???","Ncy":"??","ncy":"??","ndash":"???","nearhk":"???","nearr":"???","neArr":"???","nearrow":"???","ne":"???","nedot":"?????","NegativeMediumSpace":"???","NegativeThickSpace":"???","NegativeThinSpace":"???","NegativeVeryThinSpace":"???","nequiv":"???","nesear":"???","nesim":"?????","NestedGreaterGreater":"???","NestedLessLess":"???","NewLine":"\n","nexist":"???","nexists":"???","Nfr":"????","nfr":"????","ngE":"?????","nge":"???","ngeq":"???","ngeqq":"?????","ngeqslant":"?????","nges":"?????","nGg":"?????","ngsim":"???","nGt":"??????","ngt":"???","ngtr":"???","nGtv":"?????","nharr":"???","nhArr":"???","nhpar":"???","ni":"???","nis":"???","nisd":"???","niv":"???","NJcy":"??","njcy":"??","nlarr":"???","nlArr":"???","nldr":"???","nlE":"?????","nle":"???","nleftarrow":"???","nLeftarrow":"???","nleftrightarrow":"???","nLeftrightarrow":"???","nleq":"???","nleqq":"?????","nleqslant":"?????","nles":"?????","nless":"???","nLl":"?????","nlsim":"???","nLt":"??????","nlt":"???","nltri":"???","nltrie":"???","nLtv":"?????","nmid":"???","NoBreak":"???","NonBreakingSpace":"??","nopf":"????","Nopf":"???","Not":"???","not":"??","NotCongruent":"???","NotCupCap":"???","NotDoubleVerticalBar":"???","NotElement":"???","NotEqual":"???","NotEqualTilde":"?????","NotExists":"???","NotGreater":"???","NotGreaterEqual":"???","NotGreaterFullEqual":"?????","NotGreaterGreater":"?????","NotGreaterLess":"???","NotGreaterSlantEqual":"?????","NotGreaterTilde":"???","NotHumpDownHump":"?????","NotHumpEqual":"?????","notin":"???","notindot":"?????","notinE":"?????","notinva":"???","notinvb":"???","notinvc":"???","NotLeftTriangleBar":"?????","NotLeftTriangle":"???","NotLeftTriangleEqual":"???","NotLess":"???","NotLessEqual":"???","NotLessGreater":"???","NotLessLess":"?????","NotLessSlantEqual":"?????","NotLessTilde":"???","NotNestedGreaterGreater":"?????","NotNestedLessLess":"?????","notni":"???","notniva":"???","notnivb":"???","notnivc":"???","NotPrecedes":"???","NotPrecedesEqual":"?????","NotPrecedesSlantEqual":"???","NotReverseElement":"???","NotRightTriangleBar":"?????","NotRightTriangle":"???","NotRightTriangleEqual":"???","NotSquareSubset":"?????","NotSquareSubsetEqual":"???","NotSquareSuperset":"?????","NotSquareSupersetEqual":"???","NotSubset":"??????","NotSubsetEqual":"???","NotSucceeds":"???","NotSucceedsEqual":"?????","NotSucceedsSlantEqual":"???","NotSucceedsTilde":"?????","NotSuperset":"??????","NotSupersetEqual":"???","NotTilde":"???","NotTildeEqual":"???","NotTildeFullEqual":"???","NotTildeTilde":"???","NotVerticalBar":"???","nparallel":"???","npar":"???","nparsl":"??????","npart":"?????","npolint":"???","npr":"???","nprcue":"???","nprec":"???","npreceq":"?????","npre":"?????","nrarrc":"?????","nrarr":"???","nrArr":"???","nrarrw":"?????","nrightarrow":"???","nRightarrow":"???","nrtri":"???","nrtrie":"???","nsc":"???","nsccue":"???","nsce":"?????","Nscr":"????","nscr":"????","nshortmid":"???","nshortparallel":"???","nsim":"???","nsime":"???","nsimeq":"???","nsmid":"???","nspar":"???","nsqsube":"???","nsqsupe":"???","nsub":"???","nsubE":"?????","nsube":"???","nsubset":"??????","nsubseteq":"???","nsubseteqq":"?????","nsucc":"???","nsucceq":"?????","nsup":"???","nsupE":"?????","nsupe":"???","nsupset":"??????","nsupseteq":"???","nsupseteqq":"?????","ntgl":"???","Ntilde":"??","ntilde":"??","ntlg":"???","ntriangleleft":"???","ntrianglelefteq":"???","ntriangleright":"???","ntrianglerighteq":"???","Nu":"??","nu":"??","num":"#","numero":"???","numsp":"???","nvap":"??????","nvdash":"???","nvDash":"???","nVdash":"???","nVDash":"???","nvge":"??????","nvgt":">???","nvHarr":"???","nvinfin":"???","nvlArr":"???","nvle":"??????","nvlt":"<???","nvltrie":"??????","nvrArr":"???","nvrtrie":"??????","nvsim":"??????","nwarhk":"???","nwarr":"???","nwArr":"???","nwarrow":"???","nwnear":"???","Oacute":"??","oacute":"??","oast":"???","Ocirc":"??","ocirc":"??","ocir":"???","Ocy":"??","ocy":"??","odash":"???","Odblac":"??","odblac":"??","odiv":"???","odot":"???","odsold":"???","OElig":"??","oelig":"??","ofcir":"???","Ofr":"????","ofr":"????","ogon":"??","Ograve":"??","ograve":"??","ogt":"???","ohbar":"???","ohm":"??","oint":"???","olarr":"???","olcir":"???","olcross":"???","oline":"???","olt":"???","Omacr":"??","omacr":"??","Omega":"??","omega":"??","Omicron":"??","omicron":"??","omid":"???","ominus":"???","Oopf":"????","oopf":"????","opar":"???","OpenCurlyDoubleQuote":"???","OpenCurlyQuote":"???","operp":"???","oplus":"???","orarr":"???","Or":"???","or":"???","ord":"???","order":"???","orderof":"???","ordf":"??","ordm":"??","origof":"???","oror":"???","orslope":"???","orv":"???","oS":"???","Oscr":"????","oscr":"???","Oslash":"??","oslash":"??","osol":"???","Otilde":"??","otilde":"??","otimesas":"???","Otimes":"???","otimes":"???","Ouml":"??","ouml":"??","ovbar":"???","OverBar":"???","OverBrace":"???","OverBracket":"???","OverParenthesis":"???","para":"??","parallel":"???","par":"???","parsim":"???","parsl":"???","part":"???","PartialD":"???","Pcy":"??","pcy":"??","percnt":"%","period":".","permil":"???","perp":"???","pertenk":"???","Pfr":"????","pfr":"????","Phi":"??","phi":"??","phiv":"??","phmmat":"???","phone":"???","Pi":"??","pi":"??","pitchfork":"???","piv":"??","planck":"???","planckh":"???","plankv":"???","plusacir":"???","plusb":"???","pluscir":"???","plus":"+","plusdo":"???","plusdu":"???","pluse":"???","PlusMinus":"??","plusmn":"??","plussim":"???","plustwo":"???","pm":"??","Poincareplane":"???","pointint":"???","popf":"????","Popf":"???","pound":"??","prap":"???","Pr":"???","pr":"???","prcue":"???","precapprox":"???","prec":"???","preccurlyeq":"???","Precedes":"???","PrecedesEqual":"???","PrecedesSlantEqual":"???","PrecedesTilde":"???","preceq":"???","precnapprox":"???","precneqq":"???","precnsim":"???","pre":"???","prE":"???","precsim":"???","prime":"???","Prime":"???","primes":"???","prnap":"???","prnE":"???","prnsim":"???","prod":"???","Product":"???","profalar":"???","profline":"???","profsurf":"???","prop":"???","Proportional":"???","Proportion":"???","propto":"???","prsim":"???","prurel":"???","Pscr":"????","pscr":"????","Psi":"??","psi":"??","puncsp":"???","Qfr":"????","qfr":"????","qint":"???","qopf":"????","Qopf":"???","qprime":"???","Qscr":"????","qscr":"????","quaternions":"???","quatint":"???","quest":"?","questeq":"???","quot":"\"","QUOT":"\"","rAarr":"???","race":"?????","Racute":"??","racute":"??","radic":"???","raemptyv":"???","rang":"???","Rang":"???","rangd":"???","range":"???","rangle":"???","raquo":"??","rarrap":"???","rarrb":"???","rarrbfs":"???","rarrc":"???","rarr":"???","Rarr":"???","rArr":"???","rarrfs":"???","rarrhk":"???","rarrlp":"???","rarrpl":"???","rarrsim":"???","Rarrtl":"???","rarrtl":"???","rarrw":"???","ratail":"???","rAtail":"???","ratio":"???","rationals":"???","rbarr":"???","rBarr":"???","RBarr":"???","rbbrk":"???","rbrace":"}","rbrack":"]","rbrke":"???","rbrksld":"???","rbrkslu":"???","Rcaron":"??","rcaron":"??","Rcedil":"??","rcedil":"??","rceil":"???","rcub":"}","Rcy":"??","rcy":"??","rdca":"???","rdldhar":"???","rdquo":"???","rdquor":"???","rdsh":"???","real":"???","realine":"???","realpart":"???","reals":"???","Re":"???","rect":"???","reg":"??","REG":"??","ReverseElement":"???","ReverseEquilibrium":"???","ReverseUpEquilibrium":"???","rfisht":"???","rfloor":"???","rfr":"????","Rfr":"???","rHar":"???","rhard":"???","rharu":"???","rharul":"???","Rho":"??","rho":"??","rhov":"??","RightAngleBracket":"???","RightArrowBar":"???","rightarrow":"???","RightArrow":"???","Rightarrow":"???","RightArrowLeftArrow":"???","rightarrowtail":"???","RightCeiling":"???","RightDoubleBracket":"???","RightDownTeeVector":"???","RightDownVectorBar":"???","RightDownVector":"???","RightFloor":"???","rightharpoondown":"???","rightharpoonup":"???","rightleftarrows":"???","rightleftharpoons":"???","rightrightarrows":"???","rightsquigarrow":"???","RightTeeArrow":"???","RightTee":"???","RightTeeVector":"???","rightthreetimes":"???","RightTriangleBar":"???","RightTriangle":"???","RightTriangleEqual":"???","RightUpDownVector":"???","RightUpTeeVector":"???","RightUpVectorBar":"???","RightUpVector":"???","RightVectorBar":"???","RightVector":"???","ring":"??","risingdotseq":"???","rlarr":"???","rlhar":"???","rlm":"???","rmoustache":"???","rmoust":"???","rnmid":"???","roang":"???","roarr":"???","robrk":"???","ropar":"???","ropf":"????","Ropf":"???","roplus":"???","rotimes":"???","RoundImplies":"???","rpar":")","rpargt":"???","rppolint":"???","rrarr":"???","Rrightarrow":"???","rsaquo":"???","rscr":"????","Rscr":"???","rsh":"???","Rsh":"???","rsqb":"]","rsquo":"???","rsquor":"???","rthree":"???","rtimes":"???","rtri":"???","rtrie":"???","rtrif":"???","rtriltri":"???","RuleDelayed":"???","ruluhar":"???","rx":"???","Sacute":"??","sacute":"??","sbquo":"???","scap":"???","Scaron":"??","scaron":"??","Sc":"???","sc":"???","sccue":"???","sce":"???","scE":"???","Scedil":"??","scedil":"??","Scirc":"??","scirc":"??","scnap":"???","scnE":"???","scnsim":"???","scpolint":"???","scsim":"???","Scy":"??","scy":"??","sdotb":"???","sdot":"???","sdote":"???","searhk":"???","searr":"???","seArr":"???","searrow":"???","sect":"??","semi":";","seswar":"???","setminus":"???","setmn":"???","sext":"???","Sfr":"????","sfr":"????","sfrown":"???","sharp":"???","SHCHcy":"??","shchcy":"??","SHcy":"??","shcy":"??","ShortDownArrow":"???","ShortLeftArrow":"???","shortmid":"???","shortparallel":"???","ShortRightArrow":"???","ShortUpArrow":"???","shy":"??","Sigma":"??","sigma":"??","sigmaf":"??","sigmav":"??","sim":"???","simdot":"???","sime":"???","simeq":"???","simg":"???","simgE":"???","siml":"???","simlE":"???","simne":"???","simplus":"???","simrarr":"???","slarr":"???","SmallCircle":"???","smallsetminus":"???","smashp":"???","smeparsl":"???","smid":"???","smile":"???","smt":"???","smte":"???","smtes":"??????","SOFTcy":"??","softcy":"??","solbar":"???","solb":"???","sol":"/","Sopf":"????","sopf":"????","spades":"???","spadesuit":"???","spar":"???","sqcap":"???","sqcaps":"??????","sqcup":"???","sqcups":"??????","Sqrt":"???","sqsub":"???","sqsube":"???","sqsubset":"???","sqsubseteq":"???","sqsup":"???","sqsupe":"???","sqsupset":"???","sqsupseteq":"???","square":"???","Square":"???","SquareIntersection":"???","SquareSubset":"???","SquareSubsetEqual":"???","SquareSuperset":"???","SquareSupersetEqual":"???","SquareUnion":"???","squarf":"???","squ":"???","squf":"???","srarr":"???","Sscr":"????","sscr":"????","ssetmn":"???","ssmile":"???","sstarf":"???","Star":"???","star":"???","starf":"???","straightepsilon":"??","straightphi":"??","strns":"??","sub":"???","Sub":"???","subdot":"???","subE":"???","sube":"???","subedot":"???","submult":"???","subnE":"???","subne":"???","subplus":"???","subrarr":"???","subset":"???","Subset":"???","subseteq":"???","subseteqq":"???","SubsetEqual":"???","subsetneq":"???","subsetneqq":"???","subsim":"???","subsub":"???","subsup":"???","succapprox":"???","succ":"???","succcurlyeq":"???","Succeeds":"???","SucceedsEqual":"???","SucceedsSlantEqual":"???","SucceedsTilde":"???","succeq":"???","succnapprox":"???","succneqq":"???","succnsim":"???","succsim":"???","SuchThat":"???","sum":"???","Sum":"???","sung":"???","sup1":"??","sup2":"??","sup3":"??","sup":"???","Sup":"???","supdot":"???","supdsub":"???","supE":"???","supe":"???","supedot":"???","Superset":"???","SupersetEqual":"???","suphsol":"???","suphsub":"???","suplarr":"???","supmult":"???","supnE":"???","supne":"???","supplus":"???","supset":"???","Supset":"???","supseteq":"???","supseteqq":"???","supsetneq":"???","supsetneqq":"???","supsim":"???","supsub":"???","supsup":"???","swarhk":"???","swarr":"???","swArr":"???","swarrow":"???","swnwar":"???","szlig":"??","Tab":"\t","target":"???","Tau":"??","tau":"??","tbrk":"???","Tcaron":"??","tcaron":"??","Tcedil":"??","tcedil":"??","Tcy":"??","tcy":"??","tdot":"???","telrec":"???","Tfr":"????","tfr":"????","there4":"???","therefore":"???","Therefore":"???","Theta":"??","theta":"??","thetasym":"??","thetav":"??","thickapprox":"???","thicksim":"???","ThickSpace":"??????","ThinSpace":"???","thinsp":"???","thkap":"???","thksim":"???","THORN":"??","thorn":"??","tilde":"??","Tilde":"???","TildeEqual":"???","TildeFullEqual":"???","TildeTilde":"???","timesbar":"???","timesb":"???","times":"??","timesd":"???","tint":"???","toea":"???","topbot":"???","topcir":"???","top":"???","Topf":"????","topf":"????","topfork":"???","tosa":"???","tprime":"???","trade":"???","TRADE":"???","triangle":"???","triangledown":"???","triangleleft":"???","trianglelefteq":"???","triangleq":"???","triangleright":"???","trianglerighteq":"???","tridot":"???","trie":"???","triminus":"???","TripleDot":"???","triplus":"???","trisb":"???","tritime":"???","trpezium":"???","Tscr":"????","tscr":"????","TScy":"??","tscy":"??","TSHcy":"??","tshcy":"??","Tstrok":"??","tstrok":"??","twixt":"???","twoheadleftarrow":"???","twoheadrightarrow":"???","Uacute":"??","uacute":"??","uarr":"???","Uarr":"???","uArr":"???","Uarrocir":"???","Ubrcy":"??","ubrcy":"??","Ubreve":"??","ubreve":"??","Ucirc":"??","ucirc":"??","Ucy":"??","ucy":"??","udarr":"???","Udblac":"??","udblac":"??","udhar":"???","ufisht":"???","Ufr":"????","ufr":"????","Ugrave":"??","ugrave":"??","uHar":"???","uharl":"???","uharr":"???","uhblk":"???","ulcorn":"???","ulcorner":"???","ulcrop":"???","ultri":"???","Umacr":"??","umacr":"??","uml":"??","UnderBar":"_","UnderBrace":"???","UnderBracket":"???","UnderParenthesis":"???","Union":"???","UnionPlus":"???","Uogon":"??","uogon":"??","Uopf":"????","uopf":"????","UpArrowBar":"???","uparrow":"???","UpArrow":"???","Uparrow":"???","UpArrowDownArrow":"???","updownarrow":"???","UpDownArrow":"???","Updownarrow":"???","UpEquilibrium":"???","upharpoonleft":"???","upharpoonright":"???","uplus":"???","UpperLeftArrow":"???","UpperRightArrow":"???","upsi":"??","Upsi":"??","upsih":"??","Upsilon":"??","upsilon":"??","UpTeeArrow":"???","UpTee":"???","upuparrows":"???","urcorn":"???","urcorner":"???","urcrop":"???","Uring":"??","uring":"??","urtri":"???","Uscr":"????","uscr":"????","utdot":"???","Utilde":"??","utilde":"??","utri":"???","utrif":"???","uuarr":"???","Uuml":"??","uuml":"??","uwangle":"???","vangrt":"???","varepsilon":"??","varkappa":"??","varnothing":"???","varphi":"??","varpi":"??","varpropto":"???","varr":"???","vArr":"???","varrho":"??","varsigma":"??","varsubsetneq":"??????","varsubsetneqq":"??????","varsupsetneq":"??????","varsupsetneqq":"??????","vartheta":"??","vartriangleleft":"???","vartriangleright":"???","vBar":"???","Vbar":"???","vBarv":"???","Vcy":"??","vcy":"??","vdash":"???","vDash":"???","Vdash":"???","VDash":"???","Vdashl":"???","veebar":"???","vee":"???","Vee":"???","veeeq":"???","vellip":"???","verbar":"|","Verbar":"???","vert":"|","Vert":"???","VerticalBar":"???","VerticalLine":"|","VerticalSeparator":"???","VerticalTilde":"???","VeryThinSpace":"???","Vfr":"????","vfr":"????","vltri":"???","vnsub":"??????","vnsup":"??????","Vopf":"????","vopf":"????","vprop":"???","vrtri":"???","Vscr":"????","vscr":"????","vsubnE":"??????","vsubne":"??????","vsupnE":"??????","vsupne":"??????","Vvdash":"???","vzigzag":"???","Wcirc":"??","wcirc":"??","wedbar":"???","wedge":"???","Wedge":"???","wedgeq":"???","weierp":"???","Wfr":"????","wfr":"????","Wopf":"????","wopf":"????","wp":"???","wr":"???","wreath":"???","Wscr":"????","wscr":"????","xcap":"???","xcirc":"???","xcup":"???","xdtri":"???","Xfr":"????","xfr":"????","xharr":"???","xhArr":"???","Xi":"??","xi":"??","xlarr":"???","xlArr":"???","xmap":"???","xnis":"???","xodot":"???","Xopf":"????","xopf":"????","xoplus":"???","xotime":"???","xrarr":"???","xrArr":"???","Xscr":"????","xscr":"????","xsqcup":"???","xuplus":"???","xutri":"???","xvee":"???","xwedge":"???","Yacute":"??","yacute":"??","YAcy":"??","yacy":"??","Ycirc":"??","ycirc":"??","Ycy":"??","ycy":"??","yen":"??","Yfr":"????","yfr":"????","YIcy":"??","yicy":"??","Yopf":"????","yopf":"????","Yscr":"????","yscr":"????","YUcy":"??","yucy":"??","yuml":"??","Yuml":"??","Zacute":"??","zacute":"??","Zcaron":"??","zcaron":"??","Zcy":"??","zcy":"??","Zdot":"??","zdot":"??","zeetrf":"???","ZeroWidthSpace":"???","Zeta":"??","zeta":"??","zfr":"????","Zfr":"???","ZHcy":"??","zhcy":"??","zigrarr":"???","zopf":"????","Zopf":"???","Zscr":"????","zscr":"????","zwj":"???","zwnj":"???"}

},{}],8:[function(require,module,exports){
module.exports={"Aacute":"??","aacute":"??","Acirc":"??","acirc":"??","acute":"??","AElig":"??","aelig":"??","Agrave":"??","agrave":"??","amp":"&","AMP":"&","Aring":"??","aring":"??","Atilde":"??","atilde":"??","Auml":"??","auml":"??","brvbar":"??","Ccedil":"??","ccedil":"??","cedil":"??","cent":"??","copy":"??","COPY":"??","curren":"??","deg":"??","divide":"??","Eacute":"??","eacute":"??","Ecirc":"??","ecirc":"??","Egrave":"??","egrave":"??","ETH":"??","eth":"??","Euml":"??","euml":"??","frac12":"??","frac14":"??","frac34":"??","gt":">","GT":">","Iacute":"??","iacute":"??","Icirc":"??","icirc":"??","iexcl":"??","Igrave":"??","igrave":"??","iquest":"??","Iuml":"??","iuml":"??","laquo":"??","lt":"<","LT":"<","macr":"??","micro":"??","middot":"??","nbsp":"??","not":"??","Ntilde":"??","ntilde":"??","Oacute":"??","oacute":"??","Ocirc":"??","ocirc":"??","Ograve":"??","ograve":"??","ordf":"??","ordm":"??","Oslash":"??","oslash":"??","Otilde":"??","otilde":"??","Ouml":"??","ouml":"??","para":"??","plusmn":"??","pound":"??","quot":"\"","QUOT":"\"","raquo":"??","reg":"??","REG":"??","sect":"??","shy":"??","sup1":"??","sup2":"??","sup3":"??","szlig":"??","THORN":"??","thorn":"??","times":"??","Uacute":"??","uacute":"??","Ucirc":"??","ucirc":"??","Ugrave":"??","ugrave":"??","uml":"??","Uuml":"??","uuml":"??","Yacute":"??","yacute":"??","yen":"??","yuml":"??"}

},{}],9:[function(require,module,exports){
module.exports={"amp":"&","apos":"'","gt":">","lt":"<","quot":"\""}

},{}],10:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
class Source {
    constructor(cheerio) {
        // <-----------        OPTIONAL METHODS        -----------> //
        /**
         * Manages the ratelimits and the number of requests that can be done per second
         * This is also used to fetch pages when a chapter is downloading
         */
        this.requestManager = createRequestManager({
            requestsPerSecond: 2.5,
            requestTimeout: 5000
        });
        this.cheerio = cheerio;
    }
    /**
     * (OPTIONAL METHOD) This function is called when ANY request is made by the Paperback Application out to the internet.
     * By modifying the parameter and returning it, the user can inject any additional headers, cookies, or anything else
     * a source may need to load correctly.
     * The most common use of this function is to add headers to image requests, since you cannot directly access these requests through
     * the source implementation itself.
     *
     * NOTE: This does **NOT** influence any requests defined in the source implementation. This function will only influence requests
     * which happen behind the scenes and are not defined in your source.
     */
    globalRequestHeaders() { return {}; }
    globalRequestCookies() { return []; }
    /**
     * A stateful source may require user input.
     * By supplying this value to the Source, the app will render your form to the user
     * in the application settings.
     */
    getAppStatefulForm() { return createUserForm({ formElements: [] }); }
    /**
     * When the Advanced Search is rendered to the user, this skeleton defines what
     * fields which will show up to the user, and returned back to the source
     * when the request is made.
     */
    getAdvancedSearchForm() { return createUserForm({ formElements: [] }); }
    /**
     * (OPTIONAL METHOD) Given a manga ID, return a URL which Safari can open in a browser to display.
     * @param mangaId
     */
    getMangaShareUrl(mangaId) { return null; }
    /**
     * If a source is secured by Cloudflare, this method should be filled out.
     * By returning a request to the website, this source will attempt to create a session
     * so that the source can load correctly.
     * Usually the {@link Request} url can simply be the base URL to the source.
     */
    getCloudflareBypassRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which communicates with a given source, and returns a list of all possible tags which the source supports.
     * These tags are generic and depend on the source. They could be genres such as 'Isekai, Action, Drama', or they can be
     * listings such as 'Completed, Ongoing'
     * These tags must be tags which can be used in the {@link searchRequest} function to augment the searching capability of the application
     */
    getTags() { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) A function which should scan through the latest updates section of a website, and report back with a list of IDs which have been
     * updated BEFORE the supplied timeframe.
     * This function may have to scan through multiple pages in order to discover the full list of updated manga.
     * Because of this, each batch of IDs should be returned with the mangaUpdatesFoundCallback. The IDs which have been reported for
     * one page, should not be reported again on another page, unless the relevent ID has been detected again. You do not want to persist
     * this internal list between {@link Request} calls
     * @param mangaUpdatesFoundCallback A callback which is used to report a list of manga IDs back to the API
     * @param time This function should find all manga which has been updated between the current time, and this parameter's reported time.
     *             After this time has been passed, the system should stop parsing and return
     */
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) A function which should readonly allf the available homepage sections for a given source, and return a {@link HomeSection} object.
     * The sectionCallback is to be used for each given section on the website. This may include a 'Latest Updates' section, or a 'Hot Manga' section.
     * It is recommended that before anything else in your source, you first use this sectionCallback and send it {@link HomeSection} objects
     * which are blank, and have not had any requests done on them just yet. This way, you provide the App with the sections to render on screen,
     * which then will be populated with each additional sectionCallback method called. This is optional, but recommended.
     * @param sectionCallback A callback which is run for each independant HomeSection.
     */
    getHomePageSections(sectionCallback) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) This function will take a given homepageSectionId and metadata value, and with this information, should return
     * all of the manga tiles supplied for the given state of parameters. Most commonly, the metadata value will contain some sort of page information,
     * and this request will target the given page. (Incrementing the page in the response so that the next call will return relevent data)
     * @param homepageSectionId The given ID to the homepage defined in {@link getHomePageSections} which this method is to readonly moreata about
     * @param metadata This is a metadata parameter which is filled our in the {@link getHomePageSections}'s return
     * function. Afterwards, if the metadata value returned in the {@link PagedResults} has been modified, the modified version
     * will be supplied to this function instead of the origional {@link getHomePageSections}'s version.
     * This is useful for keeping track of which page a user is on, pagnating to other pages as ViewMore is called multiple times.
     */
    getViewMoreItems(homepageSectionId, metadata) { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) This function is to return the entire library of a manga website, page by page.
     * If there is an additional page which needs to be called, the {@link PagedResults} value should have it's metadata filled out
     * with information needed to continue pulling information from this website.
     * Note that if the metadata value of {@link PagedResults} is undefined, this method will not continue to run when the user
     * attempts to readonly morenformation
     * @param metadata Identifying information as to what the source needs to call in order to readonly theext batch of data
     * of the directory. Usually this is a page counter.
     */
    getWebsiteMangaDirectory(metadata) { return Promise.resolve(null); }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('minutes')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(Date.now());
        }
        return time;
    }
    /**
     * When a function requires a POST body, it always should be defined as a JsonObject
     * and then passed through this function to ensure that it's encoded properly.
     * @param obj
     */
    urlEncodeObject(obj) {
        let ret = {};
        for (const entry of Object.entries(obj)) {
            ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
        }
        return ret;
    }
}
exports.Source = Source;

},{}],11:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);

},{"./Source":10}],12:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":11,"./models":33}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],15:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],16:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],19:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],20:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],21:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],22:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],23:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],24:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],25:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],26:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],27:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],28:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],30:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],31:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],32:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],33:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./TrackObject"), exports);
__exportStar(require("./OAuth"), exports);
__exportStar(require("./UserForm"), exports);

},{"./Chapter":13,"./ChapterDetails":14,"./Constants":15,"./HomeSection":16,"./Languages":17,"./Manga":18,"./MangaTile":19,"./MangaUpdate":20,"./OAuth":21,"./PagedResults":22,"./RequestHeaders":23,"./RequestManager":24,"./RequestObject":25,"./ResponseObject":26,"./SearchRequest":27,"./SourceInfo":28,"./SourceTag":29,"./TagSection":30,"./TrackObject":31,"./UserForm":32}],34:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mangahub = exports.MangahubInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangahubParser_1 = require("./MangahubParser");
const MH_DOMAIN = 'https://mangahub.io';
const method = 'GET';
const headers = {
    "content-type": "application/x-www-form-urlencoded"
};
exports.MangahubInfo = {
    version: '1.0.8',
    name: 'Mangahub',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from Mangahub.',
    hentaiSource: false,
    websiteBaseURL: MH_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ]
};
class Mangahub extends paperback_extensions_common_1.Source {
    getMangaShareUrl(mangaId) { return `${MH_DOMAIN}/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangahubParser_1.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/manga/`,
                method,
                param: mangaId,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangahubParser_1.parseChapters($, mangaId);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chapterNumber = chapterId.split("chapter-")[1];
            const request = createRequestObject({
                url: `https://api.mghubcdn.com/graphql`,
                method: "POST",
                headers: {
                    'content-type': 'application/json',
                },
                data: `{\"query\":\"{chapter(x:m01,slug:\\\"${mangaId}\\\",number:${chapterNumber}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`
            });
            let response = yield this.requestManager.schedule(request, 1);
            response = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const data = Object(response.data);
            if (!(data === null || data === void 0 ? void 0 : data.chapter))
                throw new Error('Missing "chapter" property!');
            if (!((_a = data.chapter) === null || _a === void 0 ? void 0 : _a.pages))
                throw new Error('Missing "pages" property!');
            const rawPages = JSON.parse(data.chapter.pages);
            const pages = [];
            for (const i in rawPages) {
                pages.push("https://img.mghubcdn.com/file/imghub/" + rawPages[i]);
            }
            return createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: pages,
                longStrip: false
            });
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${MH_DOMAIN}/search`,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            return MangahubParser_1.parseTags($);
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            updatedManga = MangahubParser_1.parseUpdatedManga($, time, ids);
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const section1 = createHomeSection({ id: 'hot_update', title: 'Hot Updates', view_more: true });
            const section2 = createHomeSection({ id: 'hot_manga', title: 'Hot Manga', view_more: true });
            const section3 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates', view_more: true });
            const sections = [section1, section2, section3];
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            MangahubParser_1.parseHomeSections($, sections, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = "";
            switch (homepageSectionId) {
                case "hot_manga":
                    param = `/popular/page/${page}`;
                    break;
                case "hot_update":
                    param = `/new/page/${page}`;
                    break;
                case "latest_updates":
                    param = `/updates/page/${page}`;
                    break;
                default:
                    throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
            }
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
                param,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = MangahubParser_1.parseViewMore($, homepageSectionId);
            metadata = !MangahubParser_1.isLastPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    searchRequest(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            const search = MangahubParser_1.generateSearch(query);
            const request = createRequestObject({
                url: MH_DOMAIN,
                method,
                headers,
                param: `/search/page/${page}?q=${search}&order=POPULAR&genre=all`
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = MangahubParser_1.parseSearch($);
            metadata = !MangahubParser_1.isLastPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
}
exports.Mangahub = Mangahub;

},{"./MangahubParser":35,"paperback-extensions-common":12}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseViewMore = exports.parseSearch = exports.generateSearch = exports.parseHomeSections = exports.parseUpdatedManga = exports.parseTags = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities = require("entities");
exports.parseMangaDetails = ($, mangaId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const titles = [];
    titles.push(decodeHTMLEntity($("h1._3xnDj").contents().first().text().trim()));
    for (const title of $("h1._3xnDj > small").text().trim().split(/\\|; /)) {
        if (title !== "")
            titles.push(decodeHTMLEntity(title.trim()));
    }
    const image = (_b = (_a = $("img.img-responsive")) === null || _a === void 0 ? void 0 : _a.attr("src")) !== null && _b !== void 0 ? _b : "";
    const author = decodeHTMLEntity((_c = $("._3QCtP > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)").text().trim()) !== null && _c !== void 0 ? _c : "");
    const artist = decodeHTMLEntity((_d = $("._3QCtP > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)").text().trim()) !== null && _d !== void 0 ? _d : "");
    const description = decodeHTMLEntity((_g = (_f = (_e = $("div#noanim-content-tab-pane-99 p.ZyMp7")) === null || _e === void 0 ? void 0 : _e.first()) === null || _f === void 0 ? void 0 : _f.text()) !== null && _g !== void 0 ? _g : "No description available");
    let hentai = false;
    const arrayTags = [];
    for (const tag of $("._3Czbn a").toArray()) {
        const label = $(tag).text().trim();
        const id = (_j = (_h = $(tag).attr('href')) === null || _h === void 0 ? void 0 : _h.split("/genre/")[1]) !== null && _j !== void 0 ? _j : "";
        if (!id || !label)
            continue;
        if (["ADULT", "SMUT", "MATURE"].includes(label.toUpperCase()))
            hentai = true;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = (_k = $("._3QCtP > div:nth-child(2) > div:nth-child(3) > span:nth-child(2)")) === null || _k === void 0 ? void 0 : _k.first().text().trim();
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
        case 'COMPLETED':
            status = paperback_extensions_common_1.MangaStatus.COMPLETED;
            break;
        default:
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
    }
    return createManga({
        id: mangaId,
        titles: titles,
        image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
        rating: 0,
        status: status,
        author: author == "" ? "Unknown" : author,
        artist: artist == "" ? "Unknown" : artist,
        tags: tagSections,
        desc: description,
        //hentai: hentai
        hentai: false //MangaDex down
    });
};
exports.parseChapters = ($, mangaId) => {
    var _a, _b, _c, _d;
    const chapters = [];
    for (const chapter of $("ul.MWqeC,list-group").children("li").toArray()) {
        const id = (_b = (_a = $('a', chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.split(`/${mangaId}/`).pop()) !== null && _b !== void 0 ? _b : "";
        const title = $("span.text-secondary._3D1SJ", chapter).text().replace("#", "Chapter ").trim();
        const chapterSection = $("span.text-secondary._3D1SJ", chapter).text().trim();
        const chapRegex = chapterSection.match(/(\d+\.?\d?)/);
        let chapterNumber = 0;
        if (chapRegex && chapRegex[1])
            chapterNumber = Number(chapRegex[1]);
        const date = parseDate((_d = (_c = $("small.UovLc", chapter)) === null || _c === void 0 ? void 0 : _c.text()) !== null && _d !== void 0 ? _d : "");
        if (!id)
            continue;
        chapters.push(createChapter({
            id,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: chapterNumber,
            time: date,
        }));
    }
    return chapters;
};
//Unable to get tags from site, might need to hardcode these?
exports.parseTags = ($) => {
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] })];
    return tagSections;
};
exports.parseUpdatedManga = ($, time, ids) => {
    var _a, _b;
    const updatedManga = [];
    for (const manga of $("div.media", "div._21UU2").toArray()) {
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/').pop()) !== null && _b !== void 0 ? _b : "";
        const mangaDate = parseDate($('._3L1my', manga).first().text());
        if (!id)
            continue;
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id);
            }
        }
    }
    return {
        ids: updatedManga,
    };
};
exports.parseHomeSections = ($, sections, sectionCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    for (const section of sections)
        sectionCallback(section);
    //Popular Mango Updates
    const hotMangaUpdate = [];
    for (const manga of $("div.manga-slide", "div.manga-slider").toArray()) {
        const title = $("strong", manga).text().trim();
        const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/manga/').pop()) !== null && _b !== void 0 ? _b : "";
        const imageSection = (_c = $("div.m-slide-background", manga).attr("style")) !== null && _c !== void 0 ? _c : "";
        const imgRegex = imageSection.match(/(https?:\/\/.*\.(?:png|jpg))/);
        let image = "https://i.imgur.com/GYUxEX8.png";
        if (imgRegex && imgRegex[0])
            image = imgRegex[0];
        const subtitle = $("em", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        hotMangaUpdate.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[0].items = hotMangaUpdate;
    sectionCallback(sections[0]);
    //Hot Mango
    const hotManga = [];
    for (const manga of $("div.media", "._11E7v").toArray()) {
        const title = (_d = $('img', manga).first().attr('alt')) !== null && _d !== void 0 ? _d : "";
        const id = (_f = (_e = $('a', manga).attr('href')) === null || _e === void 0 ? void 0 : _e.split('/manga/').pop()) !== null && _f !== void 0 ? _f : "";
        const image = (_g = $('img', manga).first().attr('src')) !== null && _g !== void 0 ? _g : "";
        const subtitle = $("p > a.text-secondary", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        hotManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[1].items = hotManga;
    sectionCallback(sections[1]);
    //Latest Mango
    const latestManga = [];
    const latestArray = $("div.media", "div._21UU2").toArray();
    for (const manga of latestArray.splice(0, 30)) { //Too many items! (Over 500!)
        const title = (_h = $('img', manga).first().attr('alt')) !== null && _h !== void 0 ? _h : "";
        const id = (_k = (_j = $('a', manga).attr('href')) === null || _j === void 0 ? void 0 : _j.split('/manga/').pop()) !== null && _k !== void 0 ? _k : "";
        const image = (_l = $('img', manga).first().attr('src')) !== null && _l !== void 0 ? _l : "";
        const subtitle = $("span.text-secondary._3D1SJ", manga).text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        latestManga.push(createMangaTile({
            id: id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    sections[2].items = latestManga;
    sectionCallback(sections[2]);
    for (const section of sections)
        sectionCallback(section);
};
exports.generateSearch = (query) => {
    var _a;
    let search = (_a = query.title) !== null && _a !== void 0 ? _a : "";
    return encodeURI(search);
};
exports.parseSearch = ($) => {
    var _a, _b, _c, _d;
    const mangas = [];
    const collectedIds = [];
    for (const manga of $("div.media-manga.media", "div#mangalist").toArray()) {
        const title = (_a = $('img', manga).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $("a", manga).attr('href')) === null || _b === void 0 ? void 0 : _b.split("/manga/").pop()) !== null && _c !== void 0 ? _c : "";
        const image = (_d = $("img", manga).attr('src')) !== null && _d !== void 0 ? _d : "";
        const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
        if (collectedIds.includes(id) || !id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
        collectedIds.push(id);
    }
    ;
    return mangas;
};
exports.parseViewMore = ($, homepageSectionId) => {
    var _a, _b, _c, _d;
    const mangas = [];
    for (const manga of $("div#mangalist div.media-manga.media").toArray()) {
        const title = (_a = $('img', manga).first().attr('alt')) !== null && _a !== void 0 ? _a : "";
        const id = (_c = (_b = $("a", manga).attr('href')) === null || _b === void 0 ? void 0 : _b.split("/manga/").pop()) !== null && _c !== void 0 ? _c : "";
        const image = (_d = $("img", manga).attr('src')) !== null && _d !== void 0 ? _d : "";
        const subtitle = $("p > a", manga).first().text().replace("#", "Chapter ").trim();
        if (!id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: !image ? "https://i.imgur.com/GYUxEX8.png" : image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    return mangas;
};
exports.isLastPage = ($) => {
    let isLast = true;
    let hasNext = Boolean($("a.btn.btn-primary").text());
    if (hasNext)
        isLast = false;
    return isLast;
};
const parseDate = (date) => {
    var _a;
    date = date.toUpperCase();
    let time;
    let number = Number(((_a = /\d*/.exec(date)) !== null && _a !== void 0 ? _a : [])[0]);
    if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
        time = new Date(Date.now());
    }
    else if (date.includes("YEAR") || date.includes("YEARS")) {
        time = new Date(Date.now() - (number * 31556952000));
    }
    else if (date.includes("MONTH") || date.includes("MONTHS")) {
        time = new Date(Date.now() - (number * 2592000000));
    }
    else if (date.includes("WEEK") || date.includes("WEEKS")) {
        time = new Date(Date.now() - (number * 604800000));
    }
    else if (date.includes("YESTERDAY")) {
        time = new Date(Date.now() - 86400000);
    }
    else if (date.includes("DAY") || date.includes("DAYS")) {
        time = new Date(Date.now() - (number * 86400000));
    }
    else if (date.includes("HOUR") || date.includes("HOURS")) {
        time = new Date(Date.now() - (number * 3600000));
    }
    else if (date.includes("MINUTE") || date.includes("MINUTES")) {
        time = new Date(Date.now() - (number * 60000));
    }
    else if (date.includes("SECOND") || date.includes("SECONDS")) {
        time = new Date(Date.now() - (number * 1000));
    }
    else {
        let split = date.split("-");
        time = new Date(Number(split[2]), Number(split[0]) - 1, Number(split[1]));
    }
    return time;
};
const decodeHTMLEntity = (str) => {
    return entities.decodeHTML(str);
};

},{"entities":5,"paperback-extensions-common":12}]},{},[34])(34)
});
