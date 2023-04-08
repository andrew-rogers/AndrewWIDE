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

function AsyncLoader() {
    this.cnt = 0;
    this.urls = [];
    this.onload = null;
}

AsyncLoader.prototype.load = function ( urls ) {
    for (var i=0; i<urls.length; i++) {
        this.urls.push(urls[i]);
        var script = document.createElement('script');
        script.setAttribute('src', urls[i]);
        script.setAttribute('type', 'text/javascript');
        var that = this;
        script.onload = function() {
            that.cnt = that.cnt + 1;
            if (that.cnt == that.urls.length) {
                if (that.onload()) that.onload();
            }
        };
        document.head.appendChild(script);
    }

    // Do additional check incase urls is empty array.
    if (this.cnt == this.urls.length) {
        if (this.onload()) this.onload();
    }
};

var asyncLoader = new AsyncLoader();

function AwDocViewer( docname ) {
    this.docname = docname;
    this._disableDrop();
    this.ta_awjson = document.getElementById("ta_awjson");
    if (this.ta_awjson == null) this._selectDoc();
    else this._renderFromHTML();
}

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
    var scripts = [];
    if (typeof MathJaxMarkdownRenderer === 'undefined') scripts.push("MathJaxMarkdownRenderer.js");
    if (typeof PlotRenderer === 'undefined') scripts.push("PlotRenderer.js");
    if (typeof PrintRenderer === 'undefined') scripts.push("PrintRenderer.js");
    if (typeof FilterInterface === 'undefined') scripts.push("DSPInterfaces.js");
    if (typeof JavaScriptRenderer === 'undefined') scripts.push("JavaScriptRenderer.js");
    if (typeof WasmRuntime === 'undefined') scripts.push("WasmRuntime.js");
    if (typeof WasmVectors === 'undefined') scripts.push("WasmVectors.js");
    if (typeof PythonRenderer === 'undefined') scripts.push("PythonRenderer.js");
    if (typeof DOTRenderer === 'undefined') scripts.push("DOTRenderer.js");

    asyncLoader.onload = function() {
        new AwCppRenderer(that.awdr);
        var cppwasm = new AwCppWasmRenderer(that.awdr);
        var xhr = new XhrRenderer("/cgi-bin/awcpp.cgi", that.awdr);
        that.awdr.registerRenderer("awcppwasm", cppwasm);
        that.awdr.registerRenderer("diagram", new DiagramRenderer());
        new PlotRenderer(that.awdr);
        new PrintRenderer(that.awdr);
        var jsr = new JavaScriptRenderer(that.awdr);
        new MathJaxMarkdownRenderer(that.awdr);
        var pyr = new PythonRenderer(that.awdr);
        var dotr = new DOTRenderer(that.awdr);
        var fi = new FilterInterface(jsr);
        cppwasm.addInterface("filter", fi);
        callback();
    };
    asyncLoader.load( scripts );
};

AwDocViewer.prototype._openDoc = function( fn ) {
    this.docname = fn;
    var that = this;
    this._instantiateRenderers( function() {
        FileSystem.readFile(fn, function( err, content ) {
            that.awdr.render(content);
        });
    });
};

AwDocViewer.prototype._renderFromHTML = function( fn ) {
    var that = this;
    this._instantiateRenderers( function() {
        that.awdr.setServerless();
        var ta_cache = document.getElementById("ta_cache");
        that.awdr.cache.setCache(JSON.parse(ta_cache.value));
        that.awdr.render(ta_awjson.value);
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

