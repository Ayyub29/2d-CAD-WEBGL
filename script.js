"use strict";

var canvas;
var gl;

var menu = "drawing";

var intendedLocation_X = 0;
var intendedLocation_Y = 0;

var redValue = 0;
var greenValue = 0;
var blueValue = 0;

var colorArray;
var maxNumVertices = 20000;
var editedShapeIndex;

var defaultLine = [
    -0.1,0.0,0.0,
    0.1,0.0,0.0,
]

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

var colors = [];
var list_vertices = [];
var shape_center_point = [];
var vertices = [];
var indices = [];
var shape_chosen = "line";
var nside_chosen = 3;

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
    var temp_arr =[];
    var temp_arr2 = [];
    temp_arr2.push(transX);
    temp_arr2.push(transY);
    for (i = 0; i < numVertices; i++){
        vertices.push(defaultShape[i + j]+transX);
        vertices.push(defaultShape[i + j + 1]+transY);
        temp_arr.push(defaultShape[i + j]+transX);
        temp_arr.push(defaultShape[i + j + 1]+transY);
        if (numVertices > 2){
            vertices.push(0.0);
            temp_arr.push(0.0);
        }
        j = j+2;
    }
    list_vertices.push(temp_arr);
    shape_center_point.push(temp_arr2);
}

function setIndices(numVertices, prevNumSisi){
    var j;
    for (j = 1; j < numVertices-1; j++) {
        indices.push(j + prevNumSisi);
        indices.push(j + prevNumSisi + 1);
        if (numVertices > 2){
            indices.push(0 + prevNumSisi);
        }
    }
}

function setColor(redval, greenval, blueval, numvertices){
    var i;
    //colors = [];
    var temp_arr = [];
    for (i = 0; i < numvertices; i++){
        temp_arr.push(redval);
        temp_arr.push(greenval);
        temp_arr.push(blueval);
    }
    colors.push(temp_arr);
}

function editColor(redval, greenval, blueval, shape_number){
    var i;
    console.log(colors);
    for (i = 0; i < colors[shape_number].length/3; i++){
        colors[shape_number][i] = redval;
        colors[shape_number][i+1] = greenval;
        colors[shape_number][i+2] = blueval;
        i = i + 2;
    }
    console.log(colors);
}

function pointerOnWhat(x_pos, y_pos){
    var selected;
    for (var i = 0; i < shape_center_point.length; i++){
        if (calculateDistance(x_pos, y_pos, shape_center_point[i][0], shape_center_point[i][1]) < 0.1){
            console.log("u r clicking on shape nr. "+i);
            selected = i;
        }
    }
    return selected;
}

function flattenArray(array){
    var flatten = [];
    for (var i = 0; i < array.length; i++){
        for (var j = 0; j < array[i].length; j++){
            flatten.push(array[i][j]);
        }
    }
    return flatten;
}

function calculateDistance(x0, y0, x1, y1){
    return (Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2)));
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

function clearCanvas(){
    vertices = [];
    indices = [];
    colors = [];
}

window.onload = function init() {
    canvas = document.getElementById("ourCanvas");
    gl = canvas.getContext('experimental-webgl');

    if (!gl) {
    alert("WebGL isn't available");
    }

    var shp = document.getElementById("shape");

    shp.addEventListener("click", function() {
    shape_chosen = shp.value;
    });

    var ns = document.getElementById("n-side");

    ns.addEventListener("click", function() {
    nside_chosen = ns.value;
    console.log(nside_chosen);
    console.log("test");
    });

    var r = document.getElementById("red");

    r.addEventListener("click", function() {
    redValue = r.value/255;
    //setColor(redValue, greenValue, blueValue, nside_chosen);
    });

    var g = document.getElementById("green");

    g.addEventListener("click", function() {
    greenValue = g.value/255;
    //setColor(redValue, greenValue, blueValue, 4);
    });

    var b = document.getElementById("blue");

    b.addEventListener("click", function() {
    blueValue = b.value/255;
    //setColor(redValue, greenValue, blueValue, 4);
    });

    var mn = document.getElementById("selected_menu");
    
    mn.addEventListener("click", function() {
    menu = mn.value;
    });

    var c = document.getElementById("clear")
    c.addEventListener("click", function(){
    clearCanvas(canvas);
    });

    canvas.addEventListener("mousedown", function(event){
    mouseClicked = true;
    var position = getIntendedPosition(event, canvas);
    if (menu === "drawing"){
        console.log("You are drawing");
        if (shape_chosen === "line"){
            // setIndices(2, vertices.length/3);
            // setVertices(defaultLine, position.x, position.y, 2);
        }
        else if (shape_chosen === "square"){
            setIndices(4, vertices.length/3);
            setVertices(defaultSquare, position.x, position.y, 4);
            setColor(redValue, greenValue, blueValue, 4);
        }
        else if (shape_chosen === "polygon"){
            setIndices(nside_chosen, vertices.length/3);
            setColor(redValue, greenValue, blueValue, nside_chosen);
            if (nside_chosen == 3){
                setVertices(defaultPolithree, position.x, position.y, nside_chosen);
            }
            else if (nside_chosen == 4){
                setVertices(defaultSquare, position.x, position.y, nside_chosen);
            }
            else if (nside_chosen == 5){
                setVertices(defaultPolima, position.x, position.y, nside_chosen);
            }
        }
        console.log(colors + " COLOR YANG ATAS");
        console.log(vertices);
        console.log(indices);
        console.log(list_vertices);
        console.log(position.x+" is X");
        console.log(position.y+" is Y");
    }
    else if (menu === "edit"){
        console.log("You are editing");
        editColor(redValue, greenValue, blueValue, pointerOnWhat(position.x, position.y));
    }
    render();
    });

    canvas.addEventListener("mouseup", function(event){
    mouseClicked = false;
    });

} 
function render() {
    /*========== Defining and storing the geometry and colors =========*/
    var flatten_colors = flattenArray(colors);
    var flatten_vertices = flattenArray(list_vertices);

    // Create an empty buffer object to store vertex buffer
    var vertex_buffer = gl.createBuffer();
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_vertices), gl.STATIC_DRAW);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_colors), gl.STATIC_DRAW);

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_colors), gl.STATIC_DRAW);

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

