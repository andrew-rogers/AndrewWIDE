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

var DOTRenderer = function(awdoc_renderer) {
    this.awdr = awdoc_renderer;
    var that = this;
    awdoc_renderer.registerType("dot", {/* No attributes */}, function(section){ that._dot(section); });
    this.status = null;
    this.queue = []; // Store DOT sources here until ready.
};

DOTRenderer.prototype._dot = function( section_in ) {
    if (!this.status) {
        var that = this;
        this._loadJs(function(){
            while( that.queue.length > 0 ) {
                var s = that.queue.shift();
                that._render(s);
            }
            that.status = "Ready.";
            console.log(that.status);
        });
    }
    if (this.status === "Ready.") _render(section_in);
    else this.queue.push(section_in);
};

DOTRenderer.prototype._loadJs = function( callback ) {
    scripts = ["https://d3js.org/d3.v5.min.js",
        "https://unpkg.com/@hpcc-js/wasm@0.3.11/dist/index.min.js",
        "https://unpkg.com/d3-graphviz@3.0.5/build/d3-graphviz.js"
    ];
    this.awdr.loadScriptsSeq(scripts, callback);
    this.status = "Loading DOT Javascript.";
    console.log(this.status);
};

DOTRenderer.prototype._render = function( section_in ) {
    var d3_div = d3.create("div");
    var div = d3_div.node();
    section_in.div.appendChild(div);
    div.style['text-align'] = 'center';
    d3_div.graphviz().renderDot(section_in.obj.content);
};

