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
    var headers=[];
    var buffers=[];
    var ret_obj = JsonArrayBuffers.processObject( obj, headers, buffers );
    var json=JSON.stringify( ret_obj ) + JSON.stringify( headers );
    
    // Get length required to store all ArrayBuffers and allocate new array.
    var total_length=0;
    for( var i=0; i<buffers.length; i++ ) total_length = total_length + buffers[i].byteLength;
    var arr = new Uint8Array( total_length );
    
    // Insert all ArrayBuffers into new array.
    var offset=0;
    for( var i=0; i<buffers.length; i++ )
    {
        arr.set(new Uint8Array(buffers[i]),offset);
        offset = offset + buffers[i].byteLength;
    }
    
    var ret = new Blob([json, arr.buffer])
    return ret;
};

JsonArrayBuffers.processObject = function( obj, headers, buffers ) {
    var ret_obj={};
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(obj[key].constructor === ArrayBuffer)
            {
                ret_obj["AB#_"+key]=headers.length;
                JsonArrayBuffers.processArrayBuffer( obj[key], headers, buffers );
            }
            else if(obj[key].constructor === Object)
            {
                // Recursively process objects
                ret_obj[key]=JsonArrayBuffers.processObject( obj[key], headers, buffers );
            }
            else ret_obj[key]=obj[key];
        }
    }
    return ret_obj;
};

JsonArrayBuffers.processArrayBuffer = function( buffer, headers, buffers ) {
    var hdr={};
    var offset=0;
    if(headers.length>0)
    {
        var hdr_last=headers[headers.length-1];
        offset = hdr_last["offset"]+hdr_last["length"];
    }
    hdr["offset"]=offset;
    hdr["length"]=buffer.byteLength;
    headers.push(hdr);
    buffers.push(buffer);
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
        if(arr[i]==0x7d) // Find '}'
        {
            if(i>arr.length-4) json_end=i;
            else if(arr[i+1]==0x5b && arr[i+2]==0x7b && arr[i+3]==0x22) json_end=i; // Find [{"
        }
    }
    var obj = JSON.parse(JsonArrayBuffers.textDecode(buffer,0,json_end+1));
    
    // Search array for end of JSON array
    var array_begin=json_end+1;
    var array_end=0;
    for( var i=array_begin; i<arr.length && array_end==0; i++)
    {
        if(arr[i]==0x5d) // Find ']'
        {
            array_end=i;
        }
    }
    var array_headers=[];
    if( array_end>0 ) array_headers = JSON.parse(JsonArrayBuffers.textDecode(buffer,array_begin,array_end-array_begin+1));
    
    return JsonArrayBuffers.parseObject( obj, array_headers, arr, array_end+1);
};

JsonArrayBuffers.parseObject = function( obj, array_headers, arr, arr_offset ) {
    var ret_obj={};
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(key.startsWith("AB#_"))
            {
                // Set the element back to it's original name and set it value as the indexed ArrayBuffer
                var ab_index=obj[key];
                var hdr=array_headers[ab_index];
                var start=hdr["offset"]+arr_offset;
                ret_obj[key.substring(4)]=arr.slice(start,start+hdr["length"]);
            }
            else if(obj[key].constructor === Object)
            {
                // Recursively parse objects
                ret_obj[key]=JsonArrayBuffers.parseObject(obj[key], array_headers, arr, arr_offset);
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


