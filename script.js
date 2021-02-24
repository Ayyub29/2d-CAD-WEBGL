"use strict";

var canvas;
var gl;
var colors = [];
var intendedLocation_X = 0;
var intendedLocation_Y = 0;
var redValue = 0;
var greenValue = 0;
var blueValue = 0;
var colorArray;
var maxNumVertices = 20000;
var index = 0;
var vertices = [];
var defaultSquare = [
    -0.1,0.1,0.0,
    -0.1,-0.1,0.0,
    0.1,-0.1,0.0,
    0.1,0.1,0.0,
]

var defaultPolithree =[
    0.0, 0.0, 0.0,
    -0.4, 0.0, 0.0,        
    -0.2, 0.2, 0.0,
]

var defaultPolima = [
    0.1,0.5,0.0,    
    0.0,0.25,0.0,            
    0.25,0.0,0.0,
    0.5,0.25,0.0,         
    0.4,0.5,0.0,
]

var delay = 50;

var cindex = 0;
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var indices = [];

var mouseClicked = false;

function getIntendedPosition(event, canvas) {

    const bcr = canvas.getBoundingClientRect();
    const bcr_x = event.clientX - bcr.left;
    const bcr_y = event.clientY - bcr.top;

    return {
        x: (bcr_x - (canvas.scrollWidth/2)) / (canvas.scrollWidth/2),
        y: ((bcr_y > (canvas.scrollHeight/2)) ? -1 : 1) * Math.abs(bcr_y - (canvas.scrollHeight/2)) / (canvas.scrollHeight/2)
    };
}

function resize(defaultShape, k){
    for(var i=0; i<defaultShape.length; i++) {
        defaultShape[i] *= k;
    }
    return defaultShape;
}

function setVertices(defaultShape, transX, transY, numVertices){
    var i;
    var j = 0;
    //vertices = [];
    for (i = 0; i < numVertices; i++){
        vertices.push(defaultShape[i + j]+transX);
        vertices.push(defaultShape[i + j + 1]+transY);
        vertices.push(0.0);
        j = j+2;
    }
}

function setIndices(lastLength, numVertices, prevNumSisi){
    var j;
    for (j = 1; j < numVertices-1; j++) {
        indices.push(j + prevNumSisi);
        indices.push(j + prevNumSisi + 1);
        indices.push(0 + prevNumSisi);
    }
}

function setColor(redval, greenval, blueval, numvertices){
    var i;
    colors = [];
    for (i = 0; i < numvertices; i++){
        colors.push(redval);
        colors.push(greenval);
        colors.push(blueval);
    }
}

function createVertexfromShape(n, length){
    var vertex = [];
    var angle = (2 * Math.PI) / (n);
    var cur_x = length * Math.cos(angle);
    var cur_y = length * Math.sin(angle);
    for (var i = 1; i < n; i++){
        vertex.push(cur_x);
        vertex.push(cur_y);
        cur_x = Math.cos(angle) * cur_x - Math.sin(angle) * cur_y;
        cur_y = Math.cos(angle) * cur_y + Math.sin(angle) * cur_x;
    }
    return vertex
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
    setColor(redValue, greenValue, blueValue, 4);
    });

    var g = document.getElementById("green");

    g.addEventListener("click", function() {
    greenValue = g.value/255;
    setColor(redValue, greenValue, blueValue, 4);
    });

    var b = document.getElementById("blue");

    b.addEventListener("click", function() {
    blueValue = b.value/255;
    setColor(redValue, greenValue, blueValue, 4);
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
    var position = getIntendedPosition(event, canvas);
    setIndices(indices.length, 4, vertices.length/3);
    setVertices(defaultSquare, position.x, position.y, 4);
    console.log(vertices);
    console.log(indices);
    console.log(position.x+" is X");
    console.log(position.y+"is Y");
    numPolygons++;
    numIndices[numPolygons] = 0;
    start[numPolygons] = index;
    render();
    });

    canvas.addEventListener("mouseup", function(event){
    mouseClicked = false;
    });

} 
function render() {
    /*========== Defining and storing the geometry and colors =========*/

    // indices = [1,2,0,2,3,0];

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
            render();
        }, 5000
    );
}


//BAGIANNYA LINES


function bindBuffer(vertex_buffer, Index_Buffer, vertices, indices){
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    // // Pass the vertex data to the buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // // Unbind the buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function draw(shape){
    // Clear the canvas
    gl.clearColor(0.9, 0.5, 0.5, 0.9);
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);
    // Draw the square
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT,0);
}

function initShaderProgram(){
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
    return shaderProgram;
}

function renderlines(){
    var vertex_buffer = gl.createBuffer();
    var Index_Buffer = gl.createBuffer();
    
    bindBuffer(vertex_buffer, Index_Buffer, vertex, indices);
    
    // Create an empty buffer object and store color data
    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var shaderProgram = initShaderProgram();

    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer); 
    // Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
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

    draw();
}

