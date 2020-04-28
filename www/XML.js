/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2020  Andrew Rogers
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

var XML = function()
{
    
};

XML.stringify = function(xml, indent)
{
    indent = (typeof indent !== 'undefined') ? indent : '  ';
    return XML._stringify(xml, indent);
};

XML._stringify = function(xml, indent)
{
    var str=indent;

    str+='<'+xml.nodeName;

    var atts=xml.attributes;
    if (atts) {
        for( var i=0; i<atts.length; i++)
        {
            var name=atts[i].name;
            str+=' '+name+'="'+atts[i].value+'"';
        }
    }
    str+='>';

    var closing_indent=''; // The closing tag is only indented if there are child nodes
    var c=xml.childNodes;
    if (c) {
        var first = true;
        
        // If element has one text node then output it.
        if (c.length==1 && c[0].nodeName == '#text') {
            str+=c[0].data;
        } else {
            for( var i=0; i<c.length; i++)
            {
                var child = c[i];
                if (child.nodeName != '#text') { // Text nodes between sibling nodes is just white-space so ignore.
                    if( first ) {
                        str+='\n';
                        closing_indent=indent; // The parent closing tag will be on new line so indent.
                        first = false;
                    }
                    str+=XML._stringify(child,indent+'  ');
                }
            }
        }
    }
    str+=closing_indent+'</'+xml.nodeName+'>\n';

    return str;
};

