/*
The MIT License (MIT)
Copyright (c) Latino - Lenguaje de Programacion
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
"use strict";

CodeMirror.defineMode("latino", function(config) {
  var indentUnit = config.indentUnit;


  var palabras_reservadas = {
      /* elegir */
      "elegir": true, "defecto": true, "otro": true, "caso": true,
      /* Logicos */
      "cierto": true, "verdadero": true, "falso": true, "nulo": true,
      /* Bucles */
      "desde": true, "hasta": true, "mientras": true, "romper": true, "repetir": true,
      /* Estructura condicional */
      "si": true, "osi": true, "sino": true, "fin": true,
      /* Otros */
      "funcion": true, "fun": true, "global": true, "regresar": true, "retornar": true, "ret": true
  };

  var funciones = {
    /* Base */
    "escribir": true, "imprimir": true, "acadena": true, "anumero": true, "alogico": true,
    "incluir": true, "leer": true, "limpiar": true, "tipo": true, "imprimirf": true, "error": true,
    "poner": true,
    /* Dev */
    "mostrar": true, "imprimir_pila": true,
    /* Dics lib */
    "dic.longitud": true, "dic.llaves": true, "dic.valores": true, "dic.vals": true,
    /* File lib */
    "archivo.leer": true, "archivo.lineas": true, "archivo.ejecutar": true, "archivo.poner": true,
    "archivo.copiar": true, "archivo.eliminar": true, "archivo.crear": true, "archivo.renombrar": true,
    /* Lista */
    "lista.invertir": true, "lista.agregar": true, "lista.extender": true, "lista.eliminar_indice": true,
    "lista.longitud": true, "lista.indice": true, "lista.encontrar": true, "lista.comparar": true,
    "lista.insertar": true, "lista.eliminar": true, "lista.contiene": true, "lista.concatenar": true,
    "lista.crear": true,
    /* Mate lib */
    "mate.acos": true,  "mate.atan": true,  "mate.cosh": true,      "mate.senh": true,
    "mate.tanh": true,  "mate.log": true,   "mate.raiz": true,      "mate.piso": true,
    "mate.atan2": true, "mate.frexp": true, "mate.aleatorio": true, "mate.asen": true,
    "mate.cos": true,   "mate.sen": true,   "mate.tan": true,       "mate.exp": true,
    "mate.log10": true, "mate.techo": true, "mate.abs": true,       "mate.pot": true,
    "mate.ldexp": true,
    /* Paquete */
    "paquete.cargar": true,
   /* Cadena */
   "cadena.char": true,       "cadena.bytes": true,      "cadena.esta_vacia": true, "cadena.longitud": true,
   "cadena.minusculas": true, "cadena.mayusculas": true, "cadena.recortar": true, "cadena.es_numerico": true,
   "cadena.es_numero": true, "cadena.es_alfa": true, "cadena.invertir": true, "cadena.ejecutar": true,
   "cadena.concatenar": true, "cadena.comparar": true, "cadena.contiene": true, "cadena.termina_con": true,
   "cadena.es_igual": true, "cadena.indice": true, "cadena.encontrar": true, "cadena.ultimo_indice": true,
   "cadena.eliminar": true, "cadena.separar": true, "cadena.inicia_con": true, "cadena.match": true,
   "cadena.insertar": true, "cadena.rellenar_izquierda": true, "cadena.rellenar_derecha": true, "cadena.reemplazar": true,
   "cadena.subcadena": true, "cadena.formato": true,
   /* Sis lib */
    "sis.dormir": true, "sis.ejecutar": true, "sis.pipe": true, "sis.fecha": true,
    "sis.salir": true, "sis.avisar": true, "sis.cwd": true, "sis.iraxy": true,
    "sis.tiempo": true, "sis.usuario": true
  };

  var isOperatorChar = /[+\-*&^%:=<>!|\/]/;

  var curPunc;

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'" || ch == "`") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    if (/[\d\.]/.test(ch)) {
      if (ch == ".") {
        stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/);
      } else if (ch == "0") {
        stream.match(/^[xX][0-9a-fA-F]+/) || stream.match(/^0[0-7]+/);
      } else {
        stream.match(/^[0-9]*\.?[0-9]*([eE][\-+]?[0-9]+)?/);
      }
      return "number";
    }
    if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      curPunc = ch;
      return null;
    }
    if (ch == "/" || ch == "#") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      }
      if (stream.eat("/") || ch == "#") {
        stream.skipToEnd();
        return "comment";
      }
    }
    if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }
    stream.eatWhile(/[\w\$_\xa1-\uffff]/);
    var cur = stream.current();
    if (palabras_reservadas.propertyIsEnumerable(cur)) {
      if (cur == "case" || cur == "default") curPunc = "case";
      return "keyword";
    }
    if (funciones.propertyIsEnumerable(cur)) return "atom";
    return "variable";
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && quote != "`" && next == "\\";
      }
      if (end || !(escaped || quote == "`"))
        state.tokenize = tokenBase;
      return "string";
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }

  function Context(indented, column, type, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.align = align;
    this.prev = prev;
  }
  function pushContext(state, col, type) {
    return state.context = new Context(state.indented, col, type, null, state.context);
  }
  function popContext(state) {
    if (!state.context.prev) return;
    var t = state.context.type;
    if (t == ")" || t == "]" || t == "}")
      state.indented = state.context.indented;
    return state.context = state.context.prev;
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: null,
        context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
        indented: 0,
        startOfLine: true
      };
    },

    token: function(stream, state) {
      var ctx = state.context;
      if (stream.sol()) {
        if (ctx.align == null) ctx.align = false;
        state.indented = stream.indentation();
        state.startOfLine = true;
        if (ctx.type == "case") ctx.type = "}";
      }
      if (stream.eatSpace()) return null;
      curPunc = null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment") return style;
      if (ctx.align == null) ctx.align = true;

      if (curPunc == "{") pushContext(state, stream.column(), "}");
      else if (curPunc == "[") pushContext(state, stream.column(), "]");
      else if (curPunc == "(") pushContext(state, stream.column(), ")");
      else if (curPunc == "case") ctx.type = "case";
      else if (curPunc == "}" && ctx.type == "}") popContext(state);
      else if (curPunc == ctx.type) popContext(state);
      state.startOfLine = false;
      return style;
    },

    indent: function(state, textAfter) {
      if (state.tokenize != tokenBase && state.tokenize != null) return CodeMirror.Pass;
      var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
      if (ctx.type == "case" && /^(?:case|default)\b/.test(textAfter)) {
        state.context.type = "}";
        return ctx.indented;
      }
      var closing = firstChar == ctx.type;
      if (ctx.align) return ctx.column + (closing ? 0 : 1);
      else return ctx.indented + (closing ? 0 : indentUnit);
    },

    electricChars: "{}):",
    closeBrackets: "()[]{}''\"\"``",
    fold: "brace",
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    lineComment: "//"
  };
});

CodeMirror.defineMIME("text/x-latino", "latino");
