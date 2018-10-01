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

var cnt=0;

function repeat()
{
  setInterval(tick, 1000);
}

function tick()
{
  if(cnt<=0){
    query();
    cnt=20;
  }
  cnt=cnt-1;
}


function query()
{
  var obj = { screen: "A" };
  var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      var rt=xmlhttp.responseText;
      if(rt.length>4){
        document.getElementById("target").innerHTML = rt;
      }
      cnt=0;
    }
  };
  
  xmlhttp.open("POST", "/cgi-bin/presenter.cgi", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.send(JSON.stringify(obj));
}

