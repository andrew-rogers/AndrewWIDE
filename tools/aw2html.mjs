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
import {parseAwDoc, createHTML} from "../modules/renderer.mjs"

function aw2html(fn_in, fn_out, prefix, module) {
    const input = fs.readFileSync(fn_in, 'utf8');
    const doc = parseAwDoc(input);
    const module_base = module.split('/').pop();
    const mod = {type: "wasmcpp_module", prefix: prefix, module: module_base};
    const html = createHTML({aw_json: doc, aw_modules: [mod]});
    fs.writeFileSync(fn_out, html);
}

if (process.argv.length == 6) {
    aw2html(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
}

