export let aw = {}; // AndrewWIDE will set elements in the aw object to allow this module to access global functionality.
export let types = {javascript: render, func_run: run}

let funcs = {};

function render(section) {
    textarea(section.obj.content, section.div);

    let func = Function(section.obj.content);

    funcs[section.obj.id] = function(){
        // TODO: Process inputs
        func();
        // TODO: Get outputs
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
    let func = funcs[section.obj.id];
    func();
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
