import * as dot from "./dot.mjs"
import * as javascript from "./javascript.mjs"
import * as mjmd from "./mjmd.mjs"
import * as mono from "./mono.mjs"
import * as plot from "./plot.mjs"
import * as python from "./python.mjs"
import * as section from "./section.mjs"
import * as storage from "./storage.mjs"
import * as wasmdsp from "./wasmdsp.mjs"

window.AndrewWIDE = window.AndrewWIDE || {};

AndrewWIDE.addRenderer = function(type, func) {
  AndrewWIDE.awdr.renderers[type] = func;
};

AndrewWIDE.classes = AndrewWIDE.classes || {};

import {AwDocRenderer} from "./renderer.mjs"
AndrewWIDE.awdr = new AwDocRenderer( AndrewWIDE.docname );

dot.init(AndrewWIDE);
javascript.init(AndrewWIDE);
mjmd.init(AndrewWIDE);
mono.init(AndrewWIDE);
plot.init(AndrewWIDE);
python.init(AndrewWIDE);
section.init(AndrewWIDE);
storage.init(AndrewWIDE);
wasmdsp.init(AndrewWIDE);
