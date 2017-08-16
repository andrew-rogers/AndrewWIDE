/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2017  Andrew Rogers
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

var OctavePlot = function(div) {
    if(div){
        this.div=div;
    } else{
        this.div=document.createElement("div");
        document.body.appendChild(this.div);
    }

    // Setup default greyscale colourmap
    this.cm=[];
    this.nc=256;
    for(var i=0; i<this.nc; i++){
      this.cm[i*4]=i;
      this.cm[i*4+1]=i;
      this.cm[i*4+2]=i;
      this.cm[i*4+3]=255;
    }  
};

OctavePlot.prototype.image = function(x) {
    this.canvas=document.createElement("canvas");
    this.div.appendChild(this.canvas);
    if(canvas.getContext) {
      var ctx = canvas.getContext('2d');

      canvas.width=x.ncols;
      canvas.height=x.nrows;
      var myImageData = ctx.createImageData(canvas.width, canvas.height);
      var data=myImageData.data;
      for(var i=0; i<x.data.length; i++)
      {
        var d=Math.floor(x.data[i]);
        data[i*4]=this.cm[d*4];     // Red
        data[i*4+1]=this.cm[d*4+1]; // Green
        data[i*4+2]=this.cm[d*4+2]; // Blue
        data[i*4+3]=this.cm[d*4+3]; // Opacity
      }
      ctx.putImageData(myImageData, 0, 0);
    }   
};
