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
};

JsonArrayBuffers.stringify = function( obj ) {
    var buffers=[];
    var ret_obj = {};
    var total_length = JsonArrayBuffers.processObject( obj, 0, ret_obj, buffers );
    var json=JSON.stringify( ret_obj );
    
    // Create new array for concatenation of all ArrayBuffers
    var arr = new Uint8Array( total_length );
    
    // Insert all ArrayBuffers into new array.
    var offset=0;
    for( var i=0; i<buffers.length; i++ )
    {
        arr.set(new Uint8Array(buffers[i]),offset);
        offset = offset + buffers[i].byteLength;
    }
    
    var ret = new Blob([json, "\n", arr.buffer])
    return ret;
};

JsonArrayBuffers.processObject = function( obj, offset, ret_obj, buffers ) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(obj[key].constructor === ArrayBuffer)
            {
                // Replace value with offset and length into binary section
                var length=obj[key].byteLength;
                ret_obj["AB#_"+key]={offset: offset, length: length};
                offset=offset+length;

                 // Copy ArrayBuffer into buffers array
                buffers.push(obj[key]);
            }
            else if(obj[key].constructor === Object)
            {
                // Recursively process objects
                ret_obj[key]={}; // Create new object in return object.
                offset=JsonArrayBuffers.processObject( obj[key], offset, ret_obj[key], buffers );
            }
            else ret_obj[key]=obj[key];
        }
    }
    return offset;
};

JsonArrayBuffers.parseBlob = function( blob, callback ) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var obj = JsonArrayBuffers.parse( this.result );
        if( callback ) callback( obj );
    };
    fileReader.readAsArrayBuffer(blob);
};

JsonArrayBuffers.parse = function( buffer ) {
    var arr = new Uint8Array(buffer);

    // Search array for end of JSON object
    var json_end=0;
    for( var i=0; i<arr.length && json_end==0; i++)
    {
        if(arr[i]==10) // Find LF
        {
            json_end=i;
        }
    }
    var obj = JSON.parse(JsonArrayBuffers.textDecode(buffer,0,json_end));

    return JsonArrayBuffers.parseObject( obj, arr, json_end+1);
};

JsonArrayBuffers.parseObject = function( obj, arr, arr_offset ) {
    var ret_obj={};
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(key.startsWith("AB#_"))
            {
                // Set the element back to it's original name and set it value as the indexed ArrayBuffer
                var hdr=obj[key];
                var start=hdr["offset"]+arr_offset;
                ret_obj[key.substring(4)]=arr.slice(start,start+hdr["length"]);
            }
            else if(obj[key].constructor === Object)
            {
                // Recursively parse objects
                ret_obj[key]=JsonArrayBuffers.parseObject(obj[key], arr, arr_offset);
            }
            else ret_obj[key]=obj[key];
        }
    }
    return ret_obj;
};

JsonArrayBuffers.textDecode = function( buffer, start, count ) {
    var arr = new Uint8Array(buffer);
    var str = "";

    var end=start+count;
    if( end > arr.length ) end=arr.length;
    for( var i=start; i<end; i++)
    {
        // Get code point
        var leading=arr[i];
        var code_point=leading;
        var num_extra=0;
        while(leading & 0x80)
        {
            leading = leading<<1;
            num_extra++;
        }
        if(num_extra>0)
        {
            code_point = leading>>num_extra; // Clear MSBs 110xxxxx becomes 000xxxxx
            num_extra--;
            for( var j=0; j<num_extra; j++ ) code_point=(code_point<<6) | (arr[++i] & 0x3f)
        }

        // Append code point to string
        str = str + String.fromCharCode(code_point); ///@todo deal with code_point>0xffff
    }
    return str;
};

JsonArrayBuffers.query = function(url, obj, callback) {
    var blob=JsonArrayBuffers.stringify(obj);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (event) {
        var response_obj=JsonArrayBuffers.parse(xhr.response);
        if( callback ) callback(response_obj);
    };

    xhr.send(blob);
};

