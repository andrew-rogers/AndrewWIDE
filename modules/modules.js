import * as javascript from "./javascript.js"
import * as cpp from "./cpp.js"
import * as mjmd from "./mjmd.js"
import * as plot from "./plot.js"
export {cpp, javascript, mjmd, plot}

import * as array from "./array.js"
window.AndrewWIDE = window.AndrewWIDE || {};
AndrewWIDE.wasmjs = AndrewWIDE.wasmjs || {};
AndrewWIDE.wasmjs.array = array;
array.init(AndrewWIDE);
