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
  aw.classes.Section = Section;
}

class Section {
  constructor(id) {
    this.id = id;
    this.observers = [];
    this.inputSections = [];
  }

  addDep(dep) {
    this.observers.push(dep);
  }

  addInputSection(input) {
    this.inputSections.push(input);
  }

  enqueue(enqueue_observers) {
    if (!this.obj.id || (this.inputSections.length > 0)) {
      if (this.func) aw.queueRun(this);
    }
    if (enqueue_observers) {
      for (let i=0; i<this.observers.length; i++) this.observers[i].enqueue(true);
    }
  }

  execute() {
    this.inputs = {};
    for (let i=0; i<this.inputSections.length; i++) {
        let key = this.inputSections[i].id;
        this.inputs[key] = this.inputSections[i].getData();
    }
    if (this.func) this.func(this);
  }

  getData() {
    return this.data;
  }

  setData(data) {
    this.data = data;
  }

  setFunc(f) {
    this.func = f;
    this.#linkInputSections();
  }

  setObj(doc, obj) {
    if (typeof obj === 'object') {
      this.doc = doc;
      this.obj = obj;
      this.#createDiv();
    }
  }

  showEditor(hidden, callback) {

    // Create controls
    let controls = new NavBar();
    let butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    controls.elem.hidden = true;
    this.div.appendChild(controls.elem);

    // Create text area
    let ta = {};
    if (this.obj.hasOwnProperty("hidden")) hidden = this.obj.hidden;
    if (!hidden) ta = this.#textarea();

    // Define event handler functions.
    butt_run.onclick = function() {
      if (callback) callback();
    }
    ta.oninput = function() {controls.elem.hidden = false;};

    return {controls,ta};
  }

  showSource(hidden) {
    let ta = {};
    if (this.obj.hasOwnProperty("hidden")) hidden = this.obj.hidden;
    if (!hidden) ta = this.#textarea();
    return ta;
  }

  #createDiv() {
    // Create a div for the section.
    if (this.div == undefined) {
      this.div = this.doc.createDiv();
    }
  }

  #linkInputSections() {
    if (this.obj.inputs) {
      let input_ids = this.obj.inputs;
      for (let i=0; i<input_ids.length; i++) {
        let input = this.doc.createSection(input_ids[i]);
        this.inputSections.push(input);
        input.addDep(this);
      }
    }
  }

  #textarea() {
    let ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = this.obj.content;
    this.div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta;
  }
}
