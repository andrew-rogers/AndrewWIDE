/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2024  Andrew Rogers
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

import * as fs from 'fs'
import {parseAwDoc, createHash} from "../modules/renderer.mjs"

function aw2cpp(fn_in, fn_out, prefix) {
    const input = fs.readFileSync(fn_in, 'utf8');
    let doc = parseAwDoc(input);
    let src = "#include <emscripten.h>\n\n";
    let hash = "const char* " + prefix + "_ids()\n{\n\treturn(\n\t\t\"{\"\n";
    for (let i=0; i < doc.length; i++) {
        if (doc[i].type == "wasmcpp") {
            let id = doc[i].id || prefix + "_" + (i+1);
            hash += "\t\t\"\\\"" + id + "\\\": " + createHash(doc[i].content) + ", \"\n";
            if (id == "globals") {
                src += doc[i].content;
            } else {
                src += "EMSCRIPTEN_KEEPALIVE\n";
                src += "extern \"C\" void " + id + "()\n{\n";
                src += doc[i].content;
                src += "}\n\n";
            }
        }
    }
    hash += "\t\t\"\\\"prefix\\\": \\\"" + prefix + "\\\"\"\n\t\t\"}\"\n\t);\n}\n";
    src += hash;
    fs.writeFileSync(fn_out, src);
}

if (process.argv.length == 5) {
    aw2cpp(process.argv[2], process.argv[3], process.argv[4]);
}

