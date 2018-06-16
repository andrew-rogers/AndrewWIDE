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

function fileread(filename, callback)
{
    var obj={path: filename, cmd: "load"};
    var that = this;
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, function( response ) {
        var err=""; ///@todo pass error to callback
        callback("",response["content"]);
    });
}

function filewrite(filename, data, callback)
{
    var obj={cmd: "save"};
    obj["content"]=data;
    obj["path"]=filename;
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, function( response ) {
        ///@todo When a response for save is defined, handle it here.
    });
}

function listfiles(dir, callback)
{
    var obj={path: dir, cmd: "listfiles"};
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, callback);
}

