export let aw = {};
export let types = {javascript: render}

export function init(a) {
  aw = a;
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

funcs.print = function(str){
  return PrintGenerator.current().print(str);
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

    // Create controls
    let controls = new NavBar();
    let butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    controls.elem.hidden = true;
    section.div.appendChild(controls.elem);

    let ta = textarea(section.obj.content, section.div);

    // Create a div for the execution result
    let div_result = document.createElement("div");
    section.div.appendChild(div_result);

    // Define event handler functions.
    let that = this;
    butt_run.onclick = function() {
        // Update source from textarea;
        func = Function("funcs", hdr_src + ta.value);

        // Queue the run.
        aw.queueRun(section.obj.id);
    }
    ta.oninput = function() {controls.elem.hidden = false;};

    function wrapper(section){
        div_result.innerHTML="";
        ces.inputs = section.obj.args.inputs;
        ces.div = div_result;
        ces.generators = [];
        ces.outputs = [];

        func(funcs);

        generateResponses();
        aw.postSections(ces.outputs);
    };

    aw.addRunnable(section.obj, wrapper);
    aw.queueRun(section.obj.id);
}

function textarea( text, div ) {
    // Put the text into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta;
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
  return new PlotTrace(this.obj, x, y);
};

PlotGenerator.prototype.generate = function() {
  let s = {"div": ces.div};
  s.obj = this.obj;
  s.obj.type = "plot";
  ces.outputs.push(s);
  PlotGenerator.m_current = null;
};

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


let PlotTrace = function(obj, x, y) {
  this.graph = obj;
  this.trace = {};
  obj.data = obj.data || [];
  obj.data.push(this.trace);

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
  obj.data = obj.data || [];
  if (typeof y === 'undefined') {
    obj.data.push({y: x});
  } else {
    obj.data.push({x: x, y: y});
  }
  return this;
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
