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
let cnt = 1;
let sectionMap = {};

export function createSection(obj) {

  // Get id from supplied string or object. Otherwise create a default id.
  let id = null;
  if(typeof obj === 'string') {
    id = obj;
  }
  else {
    id = obj.id;
    if (obj.hasOwnProperty("id") == false) {
      // Create a default ID if one is not given
      id = obj.type + "_" + cnt;
    }
    cnt++;
  }

  // If the id is not in map then create a new section.
  if (sectionMap.hasOwnProperty(id) == false) {
    sectionMap[id] = new Section(id);
  }

  // Assign object to section.
  sectionMap[id].setObj(obj);

  return sectionMap[id];
}

export function init(a) {
  aw = a;
}

class Section {
  constructor(id) {
    this.id = id;
    this.deps = [];
    this.inputs = [];
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  addInput(input) {
    this.inputs.push(input);
  }

  generateCallArgs = function () {
    // Search the specified input sections and get their content.
    var ret = {};
    for (let i=0; i<this.inputs.length; i++) {
        let key = this.inputs[i].id;
        ret[key] = this.inputs[i].obj.content;
    }
    return {"inputs": ret};
  }

  setObj(obj) {
    if (typeof obj === 'object') {
      this.obj = obj;
      this.#createDiv();
    }
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
      this.div = document.createElement("div");
      aw.awdr.div.appendChild(this.div);
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
