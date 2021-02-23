"use strict";

var canvas = document.getElementById("my_Canvas");
var gl;
var colors = [];
var intendedLocation_X = 0;
var inte
var redValue = 0;
var greenValue = 0;
var blueValue = 0;
var colorArray;
var maxNumVertices = 20000;
var index = 0;

var delay = 50;

var cindex = 0;
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var indices = [1,3,4]

var mouseClicked = false;

function setColor(redval, greenval, blueval, numvertices){
    var i;
    colors = [];
    for (i = 0; i < numvertices; i++){
        colors.push(redval);
        colors.push(greenval);
        colors.push(blueval);
    }
}

window.onload = function init() {
    canvas = document.getElementById("ourCanvas");
    gl = canvas.getContext('experimental-webgl');

    // gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
    alert("WebGL isn't available");
    }

    var r = document.getElementById("red");

    r.addEventListener("click", function() {
    redValue = r.value/255;
    console.log(redValue + "RED");
    console.log(colors);
    setColor(redValue, greenValue, blueValue, 4);
    console.log(colors);
    });

    var g = document.getElementById("green");

    g.addEventListener("click", function() {
    greenValue = g.value/255;
    setColor(redValue, greenValue, blueValue, 4);
    console.log(greenValue + "GREEN");
    });

    var b = document.getElementById("blue");

    b.addEventListener("click", function() {
    blueValue = b.value/255;
    setColor(redValue, greenValue, blueValue, 4);
    console.log(blueValue + "BLUE");
    });

    // var c = document.getElementById("clear")
    // c.addEventListener("click", function(){
    // index = 0;
    // numPolygons = 0;
    // numIndices = [];
    // numIndices[0] = 0;
    // start = [0];
    // });

    canvas.addEventListener("mousedown", function(event){
    mouseClicked = true;
    numPolygons++;
    numIndices[numPolygons] = 0;
    start[numPolygons] = index;
    });

    canvas.addEventListener("mouseup", function(event){
    mouseClicked = false;
    });

    render();
} 
function render() {
    /*========== Defining and storing the geometry and colors =========*/

    var vertices = [
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0,
        0.5,0.5,0.0 
    ];

    indices = [3,2,1,3,1,0];

    // Create an empty buffer object to store vertex buffer
    var vertex_buffer = gl.createBuffer();
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Create an empty buffer object to store Index buffer
    var Index_Buffer = gl.createBuffer();
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Create an empty buffer object and store color data
    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    /*====================== Shaders =======================*/

    // Vertex shader source code
    var vertCode =
        'attribute vec3 coordinates;' +
        'attribute vec3 color;'+
        'varying vec3 vColor;'+
        'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        'vColor = color;'+
        '}';

    // Create a vertex shader object
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);

    // Compile the vertex shader
    gl.compileShader(vertShader);

    // Fragment shader source code
    var fragCode = 'precision mediump float;'+
                'varying vec3 vColor;'+
                'void main(void) {'+
                    'gl_FragColor = vec4(vColor, 1.);'+
                '}';

    // Create fragment shader object 
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);

    // Compile the fragmentt shader
    gl.compileShader(fragShader);

    // Create a shader program object to
    // store the combined shader program
    var shaderProgram = gl.createProgram();

    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);

    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);

    // Link both the programs
    gl.linkProgram(shaderProgram);

    // Use the combined shader program object
    gl.useProgram(shaderProgram);

    /* ======= Associating shaders to buffer objects =======*/

    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer); 
    // Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    // Enable the attribute
    gl.enableVertexAttribArray(coord);

    // bind the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    // get the attribute location
    var color = gl.getAttribLocation(shaderProgram, "color");
    // point attribute to the volor buffer object
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;
    // enable the color attribute
    gl.enableVertexAttribArray(color);

    /*============= Drawing the Quad ================*/
    // Clear the canvas
    gl.clearColor(0.9, 0.5, 0.5, 0.9);
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);
    // Draw the square
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
    setTimeout(
        function() {
        requestAnimFrame(render);
        }, delay
    );
}