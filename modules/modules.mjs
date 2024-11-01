import * as javascript from "./javascript.mjs"
import * as cpp from "./cpp.mjs"
import * as mjmd from "./mjmd.mjs"
import * as plot from "./plot.mjs"
export {cpp, javascript, mjmd, plot}

import * as array from "./array.mjs"
import * as mono from "./mono.mjs"
import * as python from "./python.mjs"
import * as section from "./section.mjs"
import * as storage from "./storage.mjs"
import * as wasmdsp from "./wasmdsp.mjs"
window.AndrewWIDE = window.AndrewWIDE || {};
AndrewWIDE.wasmjs = AndrewWIDE.wasmjs || {};
AndrewWIDE.wasmjs.array = array;
AndrewWIDE.addRenderer = function(type, func) {
    AndrewWIDE.awdr.renderers[type] = func;
};
array.init(AndrewWIDE);
javascript.init(AndrewWIDE);

import {AwDocRenderer} from "./renderer.mjs"
AndrewWIDE.awdr = new AwDocRenderer( AndrewWIDE.docname );
wasmdsp.init(AndrewWIDE);
mono.init(AndrewWIDE);
python.init(AndrewWIDE);
section.init(AndrewWIDE);
storage.init(AndrewWIDE);
AndrewWIDE.createSection = section.createSection;