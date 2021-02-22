/* Step1&2: Prepare the canvas and get WebGL context */

var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('experimental-webgl');

/* Step2: Define viewport and add colour */
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(1, 1, 0.5, 1);
gl.clear(gl.COLOR_BUFFER_BIT);