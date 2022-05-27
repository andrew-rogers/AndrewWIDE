/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2022  Andrew Rogers
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

function AwDocViewer( docname ) {
    this.docname = docname;
    this._disableDrop();
    this.ta_awjson = document.getElementById("ta_awjson");
    if (this.ta_awjson == null) this._selectDoc();
    else this._renderFromHTML();
}

AwDocViewer.prototype.inject = function ( scripts, callback ) {
    var cnt = 0;
    for (var i=0; i<scripts.length; i++) {
        var script = document.createElement('script');
        script.setAttribute('src', scripts[i]);
        script.setAttribute('type', 'text/javascript');
        script.onload = function() {
            cnt = cnt + 1;
            if (cnt == scripts.length) {
                callback();
            }
        };
        document.head.appendChild(script);
    }
};

AwDocViewer.prototype._disableDrop = function () {
    // Prevent dropped files being openned in new browser tabs.
    window.addEventListener("dragover",function(e){
        e.preventDefault();
    },false);
    window.addEventListener("drop",function(e){
        e.preventDefault();
    },false);
};

AwDocViewer.prototype._instantiateRenderers = function ( callback ) {
    this.awdr = new AwDocRenderer(this.docname);
    var that = this;
    var scripts = [
        "https://cdn.jsdelivr.net/gh/markedjs/marked/marked.min.js",
        "https://cdn.plot.ly/plotly-2.12.1.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS-MML_SVG" ];
    if (typeof PlotRenderer === 'undefined') scripts.push("PlotRenderer.js");
    this.inject(scripts, function() {
        new AwCppRenderer(that.awdr);
        var cppwasm = new AwCppWasmRenderer(that.awdr);
        var xhr = new XhrRenderer("/cgi-bin/awcpp.cgi", that.awdr);
        that.awdr.registerRenderer("awcppwasm", cppwasm);
        that.awdr.registerRenderer("mjmd", new MathJaxMarkdownRenderer());
        that.awdr.registerRenderer("diagram", new DiagramRenderer());
        new PlotRenderer(that.awdr);
        callback();
    });
};

AwDocViewer.prototype._openDoc = function( fn ) {
    this.docname = fn;
    var that = this;
    this._instantiateRenderers( function() {
        FileSystem.readFile(fn, function( err, content ) {
            that.awdr.render(content);
            that.awdr.start();
        });
    });
};

AwDocViewer.prototype._renderFromHTML = function( fn ) {
    var that = this;
    this._instantiateRenderers( function() {
        that.awdr.setServerless();
        var ta_cache = document.getElementById("ta_cache");
        that.awdr.setCache(JSON.parse(ta_cache.value));
        that.awdr.render(ta_awjson.value);
        that.awdr.start();
    });
};

AwDocViewer.prototype._selectDoc = function( fn ) {
    var fn = window.location.search;
    if (fn.startsWith("?file=")) {
        // Get filename from URL query.
        var fn = decodeURIComponent(fn.slice(6));
        this._openDoc(fn);
    }
    else {
        // Create a fileselector to get filename from user.
        div=document.createElement("div");
        document.body.appendChild(div);
        var fs = new FileSelector(div, FileSystem.list);
        var that = this;
        fs.show(function(fn){
            that._openDoc(fn);
        });
    }
};

