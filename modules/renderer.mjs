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

let aw = null;

let docs = [];

export function init(a) {
  aw = a;
  let renderer = new Renderer();
  let seq = new Sequencer();

  aw.addRenderer = function(type, func) {
    renderer.renderers[type] = func;
  };

  aw.createDoc = function(div, obj) {
    renderer.div = div;
    let doc = new AwDoc(div, obj);
    docs.push(doc);
    doc.render();
    return doc;
  };

  aw.queueRun = function(section) {
    seq.queueRun(section);
  };

  aw.render = function(sections) {
    renderer.renderSections(sections);
  };

  aw.resume = function(id){
    seq.resume(id);
  };

  aw.suspend = function(reason) {
    return seq.suspend(reason);
  };
}

export function parseAwDoc( awdoc ) {

    let ret = [];

    var lines = awdoc.split('\n');
    var src = "";
    var obj={};
    var cnt = 0;
    for (var i = 0; i<lines.length; i++) {
        var line = lines[i];

        // Check if line is AW tag
        if (line.startsWith("AW{") && line.trim().endsWith("}")) {

            // Push the previous section
            if (cnt>0) {
                obj.content = src;
                ret.push(obj);
            }

            // Get attributes of this new section
            obj = JSON.parse(line.slice(2));

            src = "";
            cnt++;
        } else {
            src=src+line+"\n";
        }
    }

    // Push remaining content
    if (cnt>0) {
        obj.content = src;
        ret.push(obj);
    }
    else {
        // If no AW{...} tags then assume the doc is a JSON array.
        ret = JSON.parse(src);
    }

    return ret;
}

export function createHash( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
}

function Queue(callback) {
    this.queueA = [];
    this.queueB = [];
    this.in = this.queueA;
    this.dispatch = this.queueB;
    this.toggle = 0;
    this.callback = callback;
    this.dispatch_enabled = true;
    this.dispatch_pending = false;
}

Queue.prototype.post = function ( obj ) {
    if (obj.constructor.name == "Array") {
        for (var i=0; i<obj.length; i++) {
            this.in.push(obj[i]);
        }
    }
    else {
        this.in.push(obj);
    }

    this._schedule();
};

Queue.prototype.disableDispatch = function () {
  this.dispatch_enabled = false;
  this.dispatch_pending = false;
};

Queue.prototype.enableDispatch = function () {
  this.dispatch_enabled = true;
  this._schedule();
};

Queue.prototype._dispatch = function () {

  // If queue is empty then swap queues.
  if (this.dispatch.length == 0) {
    // Swap queues
    if (this.toggle == 0) {
      this.in = this.queueB;
      this.dispatch = this.queueA;
      this.toggle = 1;
    }
    else {
      this.in = this.queueA;
      this.dispatch = this.queueB;
      this.toggle = 0;
    }

    // If the new queue is not empty, schdeule a dispatch.
    if (this.dispatch.length > 0) {
      this._schedule();
    }
  } else {
    while( (this.dispatch.length > 0) && (this.dispatch_enabled) ) {
      var obj = this.dispatch.shift();
      this.callback( obj );
    }
    this._schedule();
  }
};

Queue.prototype._schedule = function () {
  if (this.dispatch_enabled && (this.dispatch_pending == false)) {
    // Dispatch on the next event cycle.
    var that = this;
    setTimeout( function(){
      that.dispatch_pending = false;
      that._dispatch();
    });
    this.dispatch_pending = true;
  }
};

class AwDoc {
  constructor(div, obj) {
    this.div = div;
    this.obj = obj || {};
    this.cnt = 1;
    this.sectionMap = {};

    // Textarea for displaying log.
    this.ta_log = document.createElement("textarea");
    this.ta_log.style.width = "100%";
    this.ta_log.hidden = true;
    div.appendChild(this.ta_log);
  }

  createDiv() {
    let div = document.createElement("div");
    this.div.appendChild(div);
    return div;
  }

  createSection(obj) {

    // Get id from supplied string or object. Otherwise create a default id.
    let id = null;
    if(typeof obj === 'string') {
      id = obj;
    }
    else {
      id = obj.id;
      if (obj.hasOwnProperty("id") == false) {
        // Create a default ID if one is not given
        id = obj.type + "_" + this.cnt;
      }
      this.cnt++;
    }

    // If the id is not in map then create a new section.
    if (this.sectionMap.hasOwnProperty(id) == false) {
      this.sectionMap[id] = new AndrewWIDE.classes.Section(id);
    }

    // Assign object to section.
    this.sectionMap[id].setObj(this, obj);

    return this.sectionMap[id];
  }

  render() {
    // Disable running all runnable sections until all sections dispatched. This is to allow asynchronous compilation of code to
    // complete before potential dependencies are run.
    let id = aw.suspend( "AwDoc render" );

    let sections = [];
    for (let key in this.obj) {
      let awdoc = this.obj[key];
      let doc = parseAwDoc( awdoc );
      for (var i=0; i<doc.length; i++) {
        let section = this.createSection(doc[i]);
        section.obj.id = section.id;
        sections.push(section);
      }
    }
    aw.render(sections);
    AndrewWIDE.resume( id );
  };
}

class Renderer {
  constructor() {
    this.renderers = {};
  }

  registerRenderer(name, renderer) {
    this.renderers[name]=renderer;
  }

  renderSections(sections) {
    if (sections.constructor.name == "Array") {
      for (var i=0; i<sections.length; i++) {
        this.#dispatch(sections[i]);
      }
    }
    else {
      this.#dispatch(sections);
    }
  }

  #dispatch(section) {
    const renderer_name = section.obj.type;
    if (this.renderers.hasOwnProperty(renderer_name)) {
      const renderer = this.renderers[renderer_name];
      renderer(section);
    }
    else {
      const ta = document.createElement("textarea");
      ta.value = "Error: No renderer for '" + renderer_name + "'\n";
      ta.value += JSON.stringify(section.obj);
      ta.style.width = "100%";
      section.div.appendChild(ta);
    }
  }
}

export function createHTML(textareas) {
    let loader = `(function () {
    let name = 'AndrewWIDE.js';
    let urls = [name, 'http://andrew-rogers.github.io/AndrewWIDE/javascripts/' + name];
    let cnt = 0;

    function load() {
        let script = document.createElement('script');
        let url = urls[cnt];
        script.setAttribute('src', url);
        script.setAttribute('type', 'text/javascript');
        script.onload = function() {
            console.log("Got '" + name + "' from '" + url + "'");
            new AwDocViewer( "serverless" );
        };
        script.onerror = function(e) {
            cnt++;
            if (cnt<urls.length) load();
            else console.log("Can't load " + name);
        };
        document.head.appendChild(script);
    }
    load();
})();`;
    var html = "<!DOCTYPE html>\n<html>\n\t<head>\n";
    html += "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" charset=\"UTF-8\">\n";
    html += "\t</head>\n\t<body>\n"
    const keys = Object.keys(textareas)
    for (let i=0; i<keys.length; i++) html += "\t\t<textarea id=\"" + keys[i] + "\" class=\"awjson\" hidden>\n" + JSON.stringify(textareas[keys[i]]) + "\n\t\t</textarea>\n";
    html += "\t\t<script>\n";
    html += loader + "\n";
    html += "\t\t</script>\n";
    html += "\t</body>\n</html>\n";
    return html
}

class Sequencer {
  constructor() {
    this.suspend_cnt = 0;
    this.disables={}; // If any items in this object are true, running is disabled and queued for later.
    this.queue = new Queue(function(section) {
      section.func(section);
    });
  }

  queueRun(section) {
    if (section.func) this.queue.post(section);
  }

  resume(id) {
    let name = "suspend_" + id;
    delete this.disables[name];
    if (Object.keys(this.disables).length == 0) this.queue.enableDispatch();
  }

  suspend(reason) {
    let id = this.suspend_cnt;
    let name = "suspend_" + id;
    this.suspend_cnt++;
    this.disables[name] = true;
    this.queue.disableDispatch();
    return id;
  }
}
