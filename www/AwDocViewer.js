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

window.AndrewWIDE = window.AndrewWIDE || {};

AndrewWIDE.saveDoc = function(path, callback) {
  const tas = document.getElementsByClassName('awjson');
  let obj = {};
  for (let i=0; i<tas.length; i++) {
    const ta = tas[i];
    obj[ta.id] = ta.value;
  }
  AndrewWIDE.storage.writeFile(path, JSON.stringify(obj), (err) => {
    if (callback) callback(err);
  });
};

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
    this.serverless = false;
    if ((this.ta_awjson == null) && (docname != "serverless")) this._selectDoc();
    else this._renderFromHTML();
    AndrewWIDE.docname = this.docname;
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
    var that = this;
    var scripts = [];
    if (typeof PrintRenderer === 'undefined') scripts.push("PrintRenderer.js");
    if (typeof WasmRuntime === 'undefined') scripts.push("WasmRuntime.js");
    if (typeof WasmVectors === 'undefined') scripts.push("WasmVectors.js");

    // Pyodide has to be loaded before require.js https://github.com/pyodide/pyodide/issues/4863
    if (typeof loadPyodide === 'undefined') scripts.push("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");
    if (typeof window['@hpcc-js/wasm'] == 'undefined') scripts.push("https://unpkg.com/@hpcc-js/wasm@0.3.11/dist/index.min.js");

    function instantiate_legacy() {
        let awdr = AndrewWIDE.awdr;
        var cppwasm = new AwCppWasmRenderer(awdr);
        if (!that.serverless) new XhrRenderer("/cgi-bin/awcpp.cgi", awdr);
        awdr.registerRenderer("awcppwasm", cppwasm);
        awdr.registerRenderer("diagram", new DiagramRenderer());
        new PrintRenderer(awdr);
        callback();
    }

    asyncLoader.onload = function() {
        that._requireModules(instantiate_legacy);
    };
    asyncLoader.load( scripts );
};

AwDocViewer.prototype._openDoc = function( fn ) {
    this.docname = fn;
    var that = this;
    this._instantiateRenderers( function() {
        FileSystem.readFile(fn, function( err, content ) {
            AndrewWIDE.awdr.render(content);
        });
    });
};

AwDocViewer.prototype._registerModules = function(m) {
    let renderers = AndrewWIDE.awdr.renderers;

    function registerTypes(types) {
        let keys = Object.keys(types);
        for (let i=0; i<keys.length; i++) {
            let name = keys[i];
            renderers[name] = function(section) {
                types[name](section);
                // TODO: The module will add a run() function to the section object. Create a Runnable that calls it.
            };
        }
    }

    let keys = Object.keys(m);
    for (let i=0; i<keys.length; i++) {
        let module = m[keys[i]];
        module.aw.render = function(obj, div) {
            AndrewWIDE.awdr.post(obj, div);
        };
        let types = module.types;
        registerTypes(types);
    }
};

AwDocViewer.prototype._renderFromHTML = function( fn ) {
    this.serverless = true;
    let that = this;
    this._instantiateRenderers( function() {
        var awdr = AndrewWIDE.awdr;
        awdr.setServerless();
        const tas = document.getElementsByClassName('awjson');
        if (tas.length == 0) {
            var ta_cache = document.getElementById("ta_cache");
            if (ta_cache) {
              awdr.cache.fromObj(JSON.parse(ta_cache.value));
              awdr.render(ta_awjson.value);
            }
            else {
              that._renderFromStorage(fn);
            }
        }
        for (let i=0; i<tas.length; i++) {
            const ta = tas[i];
            if (ta.id == "ta_cache") {
                awdr.cache.fromObj(JSON.parse(ta.value));
            } else {
                awdr.render(tas[i].value);
            }
        }
    });
};

AwDocViewer.prototype._renderFromStorage = function( fn ) {
  var fn = window.location.search;
  if (fn.startsWith("?idbs=")) {
    var fn = decodeURIComponent(fn.slice(6));
    AndrewWIDE.storage.readFile(fn, (err,data) => {
      let awjson = JSON.parse(data);
      for (let key in awjson) {
        AndrewWIDE.awdr.render(awjson[key]);
      }
    });
  }
  else {
    console.log("Unable to find AwJson data.");
  }
};

AwDocViewer.prototype._requireModules = function( callback ) {
    var urls = ["./modules"];
    var script = document.createElement('script');
    script.setAttribute('src', 'require.js');
    script.setAttribute('type', 'text/javascript');
    var that = this;
    script.onload = function() {
        require(urls, function() {
            AndrewWIDE.modules = require("./modules");
            that._registerModules(AndrewWIDE.modules);
            if (callback) callback();
        });
    };
    document.head.appendChild(script);
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

