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

function LongPoll(cgi, poll_obj, callback) {
	this.cgi = cgi
	this.poll_obj = poll_obj;
	this.callback = callback;
	this.cnt = 0; // The second counter, counts down.
	this.timeout = 20; // After 20 seconds send another poll.
	var that = this;
	setInterval(function() { that.tick(); }, 1000); // Call tick() every 1000ms
}

LongPoll.prototype.tick = function() {
	if(this.cnt<=0){
 		this.send(this.poll_obj);
		this.cnt=20;
	}
	this.cnt=this.cnt-1;
};

LongPoll.prototype.send = function(obj) {
	var xmlhttp = new XMLHttpRequest();
	var that=this;
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			var rt=xmlhttp.responseText;
			if(that.callback)that.callback(JSON.parse(rt));
			that.cnt=0;
		}        
	};
  
	xmlhttp.open("POST", this.cgi, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.send(JSON.stringify(obj));
};

