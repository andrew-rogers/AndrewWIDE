import * as javascript from "./javascript.mjs"
import * as cpp from "./cpp.mjs"
import * as mjmd from "./mjmd.mjs"
import * as plot from "./plot.mjs"
export {cpp, javascript, mjmd, plot}

import * as array from "./array.mjs"
window.AndrewWIDE = window.AndrewWIDE || {};
AndrewWIDE.wasmjs = AndrewWIDE.wasmjs || {};
AndrewWIDE.wasmjs.array = array;
array.init(AndrewWIDE);

import {AwDocRenderer} from "./renderer.mjs"
AndrewWIDE.awdr = new AwDocRenderer( AndrewWIDE.docname );
