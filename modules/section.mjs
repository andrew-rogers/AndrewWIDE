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

let cnt = 1;
let sectionMap = {};

export function createSection(obj) {

  // Get id from supplied string or object. Otherwise create a default id.
  let id = null;
  if(typeof obj ==='string') {
    id = obj;
    obj = {};
  }
  else {
    id = obj.id;
    if (obj.hasOwnProperty("id") == false) {
      // Create a default ID if one is not given
      id = obj.type + "_" + cnt;
    }
  }
  cnt++;

  // If the id is not in map then create a new section.
  if (sectionMap.hasOwnProperty(id) == false) {
    sectionMap[id] = new Section(id, obj);
  }

  return sectionMap[id];
}

class Section {
  constructor(id, obj) {
    this.id = id;
    this.obj = obj;
  }
}
