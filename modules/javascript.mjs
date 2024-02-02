export let aw = {}; // AndrewWIDE will set elements in the aw object to allow this module to access global functionality.
export let types = {javascript: render}

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

    // Create a div for the execution result
    var div_result = document.createElement("div");
    section.div.appendChild(div_result);

    function wrapper(){
        // TODO: Process inputs
        _input = {};
        _input.div = div_result;
        _outputs = [];
        let plot = function(){};
        func(funcs);
        // TODO: Response generators
        AndrewWIDE.postSections(_outputs);
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
