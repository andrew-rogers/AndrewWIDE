export let aw = {}; // AndrewWIDE will set elements in the aw object to allow this module to access global functionality.
export let types = {javascript: render}

let ces = {}; // Variables for currently executing section.

// Define the functions available to user code.
let funcs = {};
funcs.plot = function(data){
    return PlotGenerator.current().addTrace(data);
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
        AndrewWIDE.queueRun(section.obj.id);
    }
    ta.oninput = function() {controls.elem.hidden = false;};

    function wrapper(){
        // TODO: Process inputs
        ces.input = {};
        ces.div = div_result;
        ces.generators = [];
        ces.outputs = [];

        func(funcs);

        generateResponses();
        AndrewWIDE.postSections(ces.outputs);
    };

    AndrewWIDE.addRunnable(section.obj, wrapper);
    AndrewWIDE.queueRun(section.obj.id);
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
    this.traces = [];
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

PlotGenerator.prototype.addTrace = function(y) {
    this.traces.push({y: y});
};

PlotGenerator.prototype.generate = function() {
    let s = {"div": ces.div};
    s.obj = {"type": "plot", "data": this.traces};
    ces.outputs.push(s);
    PlotGenerator.m_current = null;
};
