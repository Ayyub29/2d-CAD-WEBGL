"use strict";

var canvas;
var gl;

var menu = "drawing";

var intendedLocation_X = 0;
var intendedLocation_Y = 0;

var redValue = 0;
var greenValue = 0;
var blueValue = 0;
var multiplierValue = 1;

var colorArray;
var maxNumVertices = 20000;
var editedShapeIndex;

var defaultSquare = [
    -1.0,1.0,0.0,
    -1.0,-1.0,0.0,
    1,-1,0.0,
    1,1,0.0,
]

var delay = 50;

var colors = [];
var list_vertices = [];
var shape_center_point = [];
var vertices = [];
var indices = [];

var linecolors = [];
var linevertices = [];
var lineindices = [];

var shape_chosen = "line";
var nside_chosen = 3;
var size_chosen = 0;

var mouseClicked = false;
var amountClicked = 0;
var points = [];

const savetoLocalStorage = () => {
    localStorage.setItem('vertices',JSON.stringify(vertices));
    localStorage.setItem('indices',JSON.stringify(indices));
    localStorage.setItem('colors',JSON.stringify(colors));
    localStorage.setItem('linecolors',JSON.stringify(linecolors));
    localStorage.setItem('lineindices',JSON.stringify(lineindices));
    localStorage.setItem('linevertices',JSON.stringify(linevertices));
}

function loadfromLocalStorage(){
    vertices = JSON.parse(localStorage.getItem("vertices"));
    indices = JSON.parse(localStorage.getItem("indices"));
    colors = JSON.parse(localStorage.getItem("colors"));
    linecolors = JSON.parse(localStorage.getItem("linecolors"));
    linevertices = JSON.parse(localStorage.getItem("linevertices"));
    lineindices = JSON.parse(localStorage.getItem("lineindices"));
}

function getIntendedPosition(event, canvas) {

    const bcr = canvas.getBoundingClientRect();
    const bcr_x = event.clientX - bcr.left;
    const bcr_y = event.clientY - bcr.top;

    return {
        x: (bcr_x - (canvas.scrollWidth/2)) / (canvas.scrollWidth/2),
        y: ((bcr_y > (canvas.scrollHeight/2)) ? -1 : 1) * Math.abs(bcr_y - (canvas.scrollHeight/2)) / (canvas.scrollHeight/2)
    };
}

function getVertex(event, canvas) {
    const bcr = canvas.getBoundingClientRect();
    const bcr_x = event.clientX - bcr.left;
    const bcr_y = event.clientY - bcr.top;

    var x = (bcr_x - (canvas.scrollWidth/2)) / (canvas.scrollWidth/2);
    var y = ((bcr_y > (canvas.scrollHeight/2)) ? -1 : 1) * Math.abs(bcr_y - (canvas.scrollHeight/2)) / (canvas.scrollHeight/2)
    
    linevertices.push(x);
    linevertices.push(y);
}

function resize(defaultShape, k){
    var resizedShape = [];
    for(var i=0; i< defaultShape.length; i++) {
        resizedShape[i] = defaultShape[i] * k;
    }
    return resizedShape;
}

function resizeOnEdit(multiplier, shapeIndex){
    var i;
    var j = 2;
    var k = list_vertices[shapeIndex].length;
    for (i = 0; i < k/3; i++){
        console.log(i);
        if (i == 0){
            list_vertices[shapeIndex][i] = (list_vertices[shapeIndex][i] * multiplier) - (multiplier * shape_center_point[shapeIndex][0]) + shape_center_point[shapeIndex][0];
            list_vertices[shapeIndex][i+1] = (list_vertices[shapeIndex][i+1] * multiplier) - (multiplier * shape_center_point[shapeIndex][1]) + shape_center_point[shapeIndex][1];
            list_vertices[shapeIndex][i+2] = (list_vertices[shapeIndex][i+2] * multiplier) + 0;
        }
        else{
            list_vertices[shapeIndex][i+j] = (list_vertices[shapeIndex][i+j] * multiplier) - (multiplier * shape_center_point[shapeIndex][0]) + shape_center_point[shapeIndex][0];
            list_vertices[shapeIndex][i+j+1] = (list_vertices[shapeIndex][i+j+1] * multiplier) - (multiplier * shape_center_point[shapeIndex][1]) + shape_center_point[shapeIndex][1];
            list_vertices[shapeIndex][i+j+2] = (list_vertices[shapeIndex][i+j+2] * multiplier) + 0;
            j = j + 2;
        }
    }
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
        indices.unshift(j + prevNumSisi);
        indices.unshift(j + prevNumSisi + 1);
        if (numVertices > 2){
            indices.unshift(0 + prevNumSisi);
        }
    }
}

function updateSize(multiplier, selectedIndex){
    for (var i = 1; i < list_vertices[selectedIndex].length; i++){
        list_vertices[selectedIndex][i] = list_vertices[selectedIndex][i] * multiplier;
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
    var j = 2;
    for (i = 0; i < colors[shape_number].length/3; i++){
        if (i == 0){
            colors[shape_number][i] = redval;
            colors[shape_number][i+1] = greenval;
            colors[shape_number][i+2] = blueval;
        }
        else{
            colors[shape_number][i+j] = redval;
            colors[shape_number][i+j+1] = greenval;
            colors[shape_number][i+j+2] = blueval;
            j = j + 2;
    }
    }
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
    for (var i = 1; i <= n; i++){
        vertex.push(cur_x);
        vertex.push(cur_y);
        vertex.push(0);
        var cnt_x = Math.cos(angle) * cur_x - Math.sin(angle) * cur_y;
        var cnt_y = Math.cos(angle) * cur_y + Math.sin(angle) * cur_x;
        cur_x = cnt_x;
        cur_y = cnt_y;
    }
    console.log(vertex);
    return vertex
}

function clearCanvas(){
    vertices = [];
    indices = [];
    colors = [];
    linevertices = [];
    lineindices = [];
    linecolors = [];
}

window.onload = function init() {
    canvas = document.getElementById("ourCanvas");
    gl = canvas.getContext('experimental-webgl');

    if (!gl) {
    alert("WebGL isn't available");
    }
    initframe();

    var sz = document.getElementById("resize");
    size_chosen = sz.value;

    sz.addEventListener("click", function() {
    size_chosen = sz.value;
    });

    var shp = document.getElementById("shape");
    shape_chosen = shp.value;
    shp.addEventListener("click", function() {
    shape_chosen = shp.value;
    });

    var ns = document.getElementById("n-side");
    nside_chosen = ns.value;
    ns.addEventListener("click", function() {
    nside_chosen = ns.value;
    console.log(nside_chosen);
    console.log("test");
    });

    var r = document.getElementById("red");
    redValue = r.value/255;

    r.addEventListener("click", function() {
    redValue = r.value/255;
    //setColor(redValue, greenValue, blueValue, nside_chosen);
    });

    var g = document.getElementById("green");
    greenValue = g.value/255;

    g.addEventListener("click", function() {
    greenValue = g.value/255;
    //setColor(redValue, greenValue, blueValue, 4);
    });

    var b = document.getElementById("blue");
    blueValue = b.value/255;
    b.addEventListener("click", function() {
    blueValue = b.value/255;
    //setColor(redValue, greenValue, blueValue, 4);
    });

    var mv = document.getElementById("resize");
    
    mv.addEventListener("click", function() {
    multiplierValue = mv.value;
    });

    var mn = document.getElementById("selected_menu");
    menu = mn.value;
    mn.addEventListener("click", function() {
    menu = mn.value;
    });

    var c = document.getElementById("clear")
    c.addEventListener("click", function(){
    clearCanvas(canvas);
    render();
    });

    var save = document.getElementById("save")
    save.addEventListener("click", savetoLocalStorage)

    var load = document.getElementById("load")
    load.addEventListener("click", function(){
        loadfromLocalStorage();
        render();
    });

    canvas.addEventListener("mousedown", function(event){
    mouseClicked = true;
    var position = getIntendedPosition(event, canvas);
    if (menu === "drawing"){
        console.log("You are drawing");
        if (shape_chosen === "line"){
            getVertex(event, canvas);
            linecolors.push(redValue);
            linecolors.push(greenValue);
            linecolors.push(blueValue);
            console.log(linevertices);
            if ((amountClicked % 2 == 0) && (amountClicked > 0)){
                lineindices.unshift(lineindices.length+1);
                lineindices.unshift(lineindices.length+1);
            }
            amountClicked = amountClicked + 1;
            render();
        }
        else if (shape_chosen === "square"){
            console.log(list_vertices);
            setIndices(4, vertices.length/3);
            var test = resize(defaultSquare,size_chosen);
            console.log(test);
            setVertices(test, position.x, position.y, 4);
            setColor(redValue, greenValue, blueValue, 4);
            render();
            
        }
        else if (shape_chosen === "polygon"){
            setIndices(nside_chosen, vertices.length/3);
            var test = createVertexfromShape(nside_chosen,size_chosen);
            setVertices(test, position.x, position.y, nside_chosen);
            setColor(redValue, greenValue, blueValue, nside_chosen);
            render();
        }
    }
    else if (menu === "edit"){
        console.log("You are editing");
        var shapeSelected = pointerOnWhat(position.x, position.y);
        editColor(redValue, greenValue, blueValue, shapeSelected);
        if (size_chosen != 0.1){
            resizeOnEdit(size_chosen * 10, shapeSelected);
        }
        render();
    }  
    });

    canvas.addEventListener("mouseup", function(event){
    mouseClicked = false;
    });
} 

function initframe(){
    gl.clearColor(0.9, 0.5, 0.5, 0.9);
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);
}

function render() {
    var flatten_colors = flattenArray(colors);
    var flatten_vertices = flattenArray(list_vertices);

    // INIT SHADER
    var vertCode =
        'attribute vec3 coordinates;' +
        'attribute vec3 color;'+
        'varying vec3 vColor;'+
        'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        'vColor = color;'+
        '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragCode = 'precision mediump float;'+
                'varying vec3 vColor;'+
                'void main(void) {'+
                    'gl_FragColor = vec4(vColor, 1.);'+
                '}';

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    //INIT PROGRAM
    var shaderProgram = gl.createProgram();

    // ATTACH & LINK SHADER
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    gl.useProgram(shaderProgram);

    //INIT BUFFER
    var vertex_buffer = gl.createBuffer();
    var Index_Buffer = gl.createBuffer();
    var color_buffer = gl.createBuffer ();

    //BIND BUFFER BUAT TRIANGLE STUFF : SQUARE && POLYGON
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten_colors), gl.STATIC_DRAW);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer); 

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);


    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(color);


    //DRAW TRIANGLE STUFF
    gl.clearColor(0.9, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linevertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineindices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linecolors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer); 

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) 
    gl.enableVertexAttribArray(color);

    //DRAW LINE STUFF
    gl.drawElements(gl.LINES, lineindices.length, gl.UNSIGNED_SHORT,0);
}
