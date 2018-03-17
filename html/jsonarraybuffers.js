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

var JsonArrayBuffers = function() {
    this.array_headers=[];
    this.array_blob=new Blob();
};

JsonArrayBuffers.stringify = function( obj ) {
    var inst = new JsonArrayBuffers()
    var ret_obj = inst.processObject( obj );
    var json=JSON.stringify( ret_obj ) + JSON.stringify( inst.array_headers );
    var ret = new Blob([json, inst.array_blob])
    return ret;
};

JsonArrayBuffers.prototype.processObject = function( obj ) {
    var ret_obj={};
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(obj[key].constructor === ArrayBuffer)
            {
                ret_obj["AB#_"+key]=this.array_headers.length;
                this.processArrayBuffer( obj[key] );
            }
            else if(obj[key].constructor === Object)
            {
                // Recursively process objects
                ret_obj[key]=this.processObject(obj[key]);
            }
            else ret_obj[key]=obj[key];
        }
    }
    return ret_obj;
};

JsonArrayBuffers.prototype.processArrayBuffer = function( buffer ) {
    var hdr={};
    hdr["offset"]=this.array_blob.size;
    hdr["length"]=buffer.byteLength;
    this.array_headers.push(hdr);
    this.array_blob=new Blob([this.array_blob, buffer]);
};


