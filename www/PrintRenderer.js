/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2023  Andrew Rogers
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

var PrintRenderer = function(awdr) {
    this.awdr = awdr;
    awdr.registerRenderer("print", this);
};

PrintRenderer.prototype.renderSection = function( section_in, callback ) {
    this.module = section_in.doc.docname.slice(0,-6);
    var type = section_in.obj.type;
    if (type == "print") {
        this._print(section_in, callback);
    }
};

PrintRenderer.prototype._print = function( section_in, callback ) {
    var obj = section_in.obj;
    var div = section_in.div;

    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = obj.str;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
};

