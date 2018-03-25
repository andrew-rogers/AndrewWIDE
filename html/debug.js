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

Debug.prototype.hexdump = function( buffer ) {
    var arr = new Uint8Array( buffer );
    var hex_str="";
    var str="";

    for( var i=0; i<arr.length; i++ )
    {
        var val=arr[i];

        // Convert to hex, zero pad if less than two hex digits.
        if( val<16 ) hex_str=hex_str+"0";
        hex_str=hex_str+val.toString(16)+" ";

        // Print ASCII.
        if( val>=32 && val<127) str=str+String.fromCharCode(val);
        else str=str+"."

        // Add extra space after eight bytes.
        if( (i%16) == 7 ) hex_str=hex_str+" ";

        // After 16 bytes display the hex and ASCII.
        if( (i%16) == 15 )
        {
            this.log(hex_str+" |"+str+"|");
            hex_str="";
            str=""
        }
    }

    // Display any remaining.
    while( hex_str.length < 49 ) hex_str=hex_str+" ";
    this.log(hex_str+" |"+str+"|");
};

