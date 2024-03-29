/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2020  Andrew Rogers
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

var XhrRenderer = function(url, awdoc_renderer) {
    this.url = url;
    this.awdoc_renderer = awdoc_renderer;
    this.waiting = false;
    this.queue = [];
    this.renderer_id = awdoc_renderer.registerAsync(this);
    this._getTypes();
};

XhrRenderer.prototype._getTypes = function() {
    var section = {"obj": {"type": "get_types"}, "div" : {}};
    var lock_id = this.awdoc_renderer.waitTypes();
    var that = this;
    this._render(section, function(types) {
        that._types(types);
        that.awdoc_renderer.doneTypes(lock_id);
    });
};

XhrRenderer.prototype._next = function() {
    if (this.waiting==false) {
        if (this.queue.length > 0) {
            var obj = this.queue.shift();
            this._query( obj.in, obj.post);
        }
        else {
            this.awdoc_renderer.renderingComplete(this.renderer_id);
        }
    }
};

XhrRenderer.prototype._query = function( section, post ) {
    this.waiting = true;
    var that = this;
    var xhr = new XMLHttpRequest();
	xhr.open("POST", this.url, true);
	xhr.onload = function (event) {
	    that.waiting = false;
	    section_out = {"div": section.div};
		section_out.obj=JSON.parse(xhr.response);
		post(section_out);
		that._next();
	};
	xhr.send(JSON.stringify(section.obj));
};

XhrRenderer.prototype._render = function( section, post ) {
    this.queue.push({"in": section, "post": post});
    this._next();
};

XhrRenderer.prototype._types = function(section) {
    var types = section.obj.types;
    var that = this;
    for (var i = 0; i < types.length; i++) {
        this.awdoc_renderer.registerType(types[i].type, types[i].attributes, function(section, post){
            that._render(section, post);
        });
    }
};

var MonoRenderer = function( awdoc_renderer ) {
    this.awdr = awdoc_renderer;
    awdoc_renderer.registerRenderer("mono", this);
};

MonoRenderer.prototype.renderObj = function( obj, div, callback ) {

    // Clear the div
    div.innerHTML="";

    // Create controls
    var controls = new NavBar();
    var butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    var butt_drop = document.createElement("button");
    butt_drop.innerHTML="Drop file here";
    butt_drop.className="drop";
    controls.addRight(butt_drop);
    //controls.elem.hidden = true;
    div.appendChild(controls.elem);

    // Put the content into the textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = obj.content;
    div.appendChild(ta);
    div.style.width = "100%";
    ta.style.height = (ta.scrollHeight+8)+"px";
    if( callback ) callback();

    // Drop handlers
    var that = this;
    butt_drop.ondrop = function(e) {
        e.preventDefault();
        var filename = e.dataTransfer.files[0];
        that._handleDroppedFile( obj, ta, filename );
        return false;
    };
    ta.ondrop = function(e) {
        e.preventDefault();
        var filename = e.dataTransfer.files[0];
        that._handleDroppedFile( obj, ta, filename );
        return false;
    };

    // Run handler
    butt_run.onclick = function(e) {
        obj.content = ta.value;
        var obj_out = {"type": "run_section", "id": obj.id};
        that.awdr.postSections([{"obj": obj_out}]);
    };
};

MonoRenderer.prototype._handleDroppedFile = function( obj, ta, filename ) {
    var reader = new FileReader();
    reader.onload = function(event) {
        obj.filename = filename;
        obj.content = event.target.result;
        ta.value = obj.content;
    };
    reader.readAsText(filename);
};

var AwCppRenderer = function(awdoc_renderer) {
    this.docname = awdoc_renderer.docname;
    this.awdoc_renderer = awdoc_renderer;
    new MonoRenderer( awdoc_renderer );

    // Register types handled by this class.
    awdoc_renderer.registerRenderer("awcpp", this);
};

AwCppRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "awcpp") {
        this._render( obj.content, obj.id, div, callback );
    }
};

AwCppRenderer.prototype._render = function(cpp, func_name, div, callback) {

    // Create controls
    var controls = new NavBar();
    var butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    controls.elem.hidden = true;
    div.appendChild(controls.elem);

    // Put the C++ source into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = cpp;
    ta.oninput = function() {controls.elem.hidden = false;};
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";

    // Create a div for the execution result
    var div_result = document.createElement("div");
    div.appendChild(div_result);

    var obj = { "type":"func_src", "module":this.docname.slice(0,-6), "func":func_name, "src":cpp };
    this.awdoc_renderer.post( obj, div_result, callback);

    var that = this;
    butt_run.onclick = function() {
        var obj = { "type":"func_src", "module":that.docname.slice(0,-6), "func":func_name, "src":ta.value };
        that.awdoc_renderer.post( obj, div_result, callback);
    }
};

