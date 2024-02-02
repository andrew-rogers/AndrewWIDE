export let aw = {}; // AndrewWIDE will set elements in the aw object to allow this module to access global functionality.
export let types = {javascript: render, func_run: run}

let wrapper_funcs = {};
let _input = {}; // Inputs for the currently running section.
let _outputs = []; // Outputs for the currently running section.

// Define the functions available to user code.
let funcs = {};
funcs.plot = function(data){
    var section_in = _input;
    var s = {"div": section_in.div, "callback": section_in.callback};
    s.obj = {"type": "plot", "data": [{"y":data}]};
    _outputs.push(s);
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

function render(section) {
    textarea(section.obj.content, section.div);

    if(!hdr_src) createHdrSrc();

    let func = Function("funcs", hdr_src + section.obj.content);

    wrapper_funcs[section.obj.id] = function(section){
        // TODO: Process inputs
        _input = section;
        _outputs = [];
        let plot = function(){};
        func(funcs);
        // TODO: Response generators
        AndrewWIDE.postSections(_outputs);
    };

    var sections_out = [];

    // Create a div for the execution result
    var div_result = document.createElement("div");
    let div = section.div;
    let obj = section.obj;
    div.appendChild(div_result);
    if (obj.hasOwnProperty("inputs")==false) obj.inputs = [];
    s = {"div": div_result, "callback": section.callback};
    s.obj = {"type": "runnable", "id":obj.id, "inputs": obj.inputs, "div":div_result, "run": "func_run"};
    sections_out.push(s);

    // Queue the run
    run = {}
    run.obj = {"type": "run", "id": obj.id};
    sections_out.push(run);

    AndrewWIDE.postSections( sections_out );
}

function run(section) {
    let func = wrapper_funcs[section.obj.id];
    func(section);
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
