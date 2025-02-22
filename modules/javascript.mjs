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

let aw = null;

export function init(a) {
  aw = a;
  aw.addRenderer("javascript", render);
  aw.plot = function(x, y){
    return PlotGenerator.current().addTrace(x, y);
  };
  aw.unitCircle = function(){
    PlotGenerator.current().unitCircle();
  };
}

let ces = {}; // Variables for currently executing section.

// Define the functions available to user code.
let funcs = {};

funcs.addFunction = function(name, f) {
  funcs[name] = f;
  hdr_src = ""
};

funcs.executeSection = function(id) {
    ces.section.doc.executeSection(id);
};

funcs.getInput = function(name) {
    return ces.inputs[name];
};

funcs.getNamedValues = function(input_name) {
  const str =  ces.inputs[input_name];
  const lines = str.split(/\r?\n/);
  let out = {};
  for (let i in lines) {
    const line = lines[i];
    const pos = line.indexOf(':');
    if (pos > 0) {
      const name = line.substr(0,pos).trim();
      out[name] = JSON.parse('[' + line.substr(pos+1) + ']');
    }
  }
  return out;
};

funcs.heatmap = function(data, transpose) {
  return PlotGenerator.current().addHeatmap(data, transpose);
};

funcs.plot = function(x, y){
  return PlotGenerator.current().addTrace(x, y);
};

funcs.print = function(str){
  return PrintGenerator.current().print(str);
};

funcs.xlabel = function(str){
  return PlotGenerator.current().xlabel(str);
};

funcs.ylabel = function(str){
  return PlotGenerator.current().ylabel(str);
};

let hdr_src = null; // This is prepended to user code to make library functions available.

function createHdrSrc() {
    hdr_src = "";
    let keys = Object.keys(funcs);
    for (let i=0; i<keys.length; i++) {
        hdr_src += "let " + keys[i] + " = funcs." + keys[i] + ";\n";
    }
    hdr_src += "\n";
}

function generateResponses() {
    for (let i=0; i<ces.generators.length; i++) ces.generators[i]();
}

function render(section) {

    if(!hdr_src) createHdrSrc();

    let func = Function("funcs", hdr_src + section.obj.content);

    let ed = section.showEditor(false, function() {
      // Update source from textarea;
      func = Function("funcs", hdr_src + ed.ta.value);

      // Queue the run.
      section.enqueue();
    });

    // Create a div for the execution result
    let div_result = document.createElement("div");
    section.div.appendChild(div_result);

    function wrapper(section){
        div_result.innerHTML="";
        ces.section = section;
        ces.inputs = section.inputs;
        ces.div = div_result;
        ces.generators = [];
        ces.outputs = [];

        func(funcs);

        generateResponses();
        aw.render(ces.outputs);
    };

    section.setFunc(wrapper);
    section.enqueue();
}

let PlotGenerator = function() {
    this.obj = {data: []}
    this.traces = this.obj.data;
};

PlotGenerator.m_current = null;

PlotGenerator.current = function() {
    if(!PlotGenerator.m_current) {
        PlotGenerator.m_current = new PlotGenerator();
        ces.generators.push(function(){
            PlotGenerator.m_current.generate();
        });
    }
    return PlotGenerator.m_current;
};

PlotGenerator.prototype.addHeatmap = function(z, transpose) {
  let data = {z: z, type: 'heatmap'};
  data.transpose = transpose || false;
  this.traces.push(data);
  return this;
};

PlotGenerator.prototype.addTrace = function(x, y) {
  return new PlotTrace(this, x, y);
};

PlotGenerator.prototype.generate = function() {
  let s = {"div": ces.div};
  s.obj = this.obj;
  s.obj.type = "plot";
  ces.outputs.push(s);
  PlotGenerator.m_current = null;
};

PlotGenerator.prototype.shape = function(obj) {
  this.obj.layout = this.obj.layout || {};
  let layout = this.obj.layout;
  layout.shapes = layout.shapes || [];
  layout.shapes.push(obj);
  return this;
}

PlotGenerator.prototype.unitCircle = function() {
  let circle = {};
  circle["type"] = "circle";
  circle["xref"] = "x";
  circle["yref"] = "y";
  circle["x0"] = -1;
  circle["y0"] = -1;
  circle["x1"] = 1;
  circle["y1"] = 1;
  circle["opacity"] = 0.2;
  let layout = {shapes: [], xaxis: {}, yaxis: {}};
  layout["shapes"].push(circle);
  layout["xaxis"]["constrain"] = "domain";
  layout["yaxis"]["scaleanchor"] = "x";
  this.obj.layout = layout;
  return this;
}

PlotGenerator.prototype.xlabel = function(str) {
  this.obj.xlabel = str;
  return this;
};

PlotGenerator.prototype.xticks = function(vals, labels) {
  this.obj.layout = this.obj.layout || {};
  let layout = this.obj.layout;
  layout.xaxis = layout.xaxis || {};
  layout.xaxis.tickvals = vals;
  layout.xaxis.ticktext = labels;
  layout.xaxis.ticklen = 8;
  layout.xaxis.tickwidth = 3;
  return this;
};

PlotGenerator.prototype.ylabel = function(str) {
  this.obj.ylabel = str;
  return this;
};

PlotGenerator.prototype.yticks = function(vals, labels) {
  this.obj.layout = this.obj.layout || {};
  let layout = this.obj.layout;
  layout.yaxis = layout.yaxis || {};
  layout.yaxis.tickvals = vals;
  layout.yaxis.ticktext = labels;
  layout.yaxis.ticklen = 8;
  layout.yaxis.tickwidth = 3;
  return this;
};


let PlotTrace = function(gen, x, y) {
  this.gen = gen;
  this.graph = gen.obj;
  this.trace = {};
  this.graph.data = this.graph.data || [];
  this.graph.data.push(this.trace);

  if (typeof y === 'undefined') {
    this.trace.y = x;
  } else {
    this.trace.x = x;
    this.trace.y = y;
  }
};

PlotTrace.prototype.marker = function(sym) {
  if (sym == 'o') sym = 'circle-open';
  this.trace.marker = {symbol: sym};
  this.trace.mode = 'markers';
  return this;
};

PlotTrace.prototype.name = function(n) {
  this.trace.name = n;
  return this;
};

PlotTrace.prototype.plot = function(x, y) {
  return new PlotTrace(this.gen, x ,y);
};

PlotTrace.prototype.shape = function(obj) {
  return this.gen.shape(obj);
};

PlotTrace.prototype.style = function(obj) {
  for (let k in obj) {
    if (k == 'mode') {
      this.trace.mode = obj.mode;
    }
    else if (k == 'fill') {
      this.trace.fill = obj.fill;
    }
    else {
      this.trace.line = this.trace.line || {};
      this.trace.line[k] = obj[k];
    }
  }
  return this;
};

PlotTrace.prototype.xticks = function(vals, labels) {
  return this.gen.xticks(vals, labels);
};

PlotTrace.prototype.yticks = function(vals, labels) {
  return this.gen.yticks(vals, labels);
};

let PrintGenerator = function() {
    this.str = '';
};

PrintGenerator.m_current = null;

PrintGenerator.current = function() {
    if(!PrintGenerator.m_current) {
        PrintGenerator.m_current = new PrintGenerator();
        ces.generators.push(function(){
            PrintGenerator.m_current.generate();
        });
    }
    return PrintGenerator.m_current;
};

PrintGenerator.prototype.print = function(str) {
  this.str += str;
};

PrintGenerator.prototype.generate = function() {
    let s = {"div": ces.div};
    s.obj = {"type": "print", "str": this.str};
    ces.outputs.push(s);
    PrintGenerator.m_current = null;
};
