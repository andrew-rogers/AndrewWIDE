/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2018  Andrew Rogers
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

var Debug = function(div) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        document.body.appendChild(div);
    }

    this.createInDiv(div);
};

Debug.prototype.createInDiv = function( div ) {
    this.div = div;

    // Create, style and append the output textarea
    this.ta_output = document.createElement("textarea");
    this.ta_output.setAttribute("style","width: 100%");
    this.ta_output.setAttribute("rows","10");
    this.ta_output.setAttribute("readonly","readonly");
    this.ta_output.value="";
    this.ta_output.style.display="none";
    this.div.appendChild(this.ta_output);
};

Debug.prototype.log = function( str ) {
    this.ta_output.value = this.ta_output.value + str + "\n";
    this.ta_output.style.display="block";
    this.ta_output.scrollTop = this.ta_output.scrollHeight;
};

