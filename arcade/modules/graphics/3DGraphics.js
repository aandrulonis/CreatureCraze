var  PI, outcomes, modes, Color, Vec3, canvas, gl;

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createBuffers(stlObj) {
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stlObj.vertexPositions), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stlObj.vertexColors), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(stlObj.vertexIndices), gl.STATIC_DRAW);

    return { positionBuffer: positionBuffer, colorBuffer: colorBuffer, indexBuffer: indexBuffer };
}

function setupProgram(stlObj, initCol) {
    const vertexShaderSrc = `
        attribute vec4 position;
        attribute vec4 color;
        uniform mat4 modelViewMat;
        uniform mat4 projectionMat;

        varying lowp vec4 vColor;
        void main() {
            gl_Position = projectionMat * modelViewMat * position;
            vColor = color;
        }`;
    const fragmentShaderSrc = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(${initCol.r}, ${initCol.g}, ${initCol.b}, ${initCol.a});
        }`;
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    const shaderProgram = createProgram(vertexShader, fragmentShader);
    gl.linkProgram(shaderProgram);
    const buffers = createBuffers(stlObj);
    const programInfo = {
        program: shaderProgram,
        buffers: buffers,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "position"),
            vertexColor: gl.getAttribLocation(shaderProgram, "color"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "projectionMat"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "modelViewMat"),
        },
    };
    return programInfo;
}

function clear(r, g, b, a = 1) {
    gl.clearColor(r, g, b, a);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function makeProjMatrix(mat4, FOV, AR, zClose, zFar) {
    const mat = glMatrix.mat4.create();
    glMatrix.mat4.perspective(mat, FOV, AR, zClose, zFar);
    return mat;
}

function makeModelViewMatrix(pos, thetaX, thetaY, thetaZ) {
    const mat = glMatrix.mat4.create();
    glMatrix.mat4.translate(mat, mat, pos.getList());
    glMatrix.mat4.rotate(mat, mat, thetaX, Vec3.X_HAT);
    glMatrix.mat4.rotate(mat, mat, thetaY, Vec3.Y_HAT);
    glMatrix.mat4.rotate(mat, mat, thetaZ, Vec3.Z_HAT);
    return mat;
}

function setupPosAttrib(programInfo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.buffers.posBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

async function initGraphics(utils, canvas) {
    PI = utils.PI;
    outcomes = utils.outcomes;
    modes = utils.modes;
    Color = utils.Color;
    Vec3 = utils.Vec3;
    gl = canvas.getContext('webgl');
    let stlPromise;
    await fetch("./json/bridge_tester.json").then((response)=> {if (!response.ok) stlPromise = null;  else stlPromise = response.json(); });
    if (!stlPromise) return;
    const stlObj = await stlPromise;
    const programInfo = setupProgram(stlObj, Color.RED);
    clear(Color.BLACK.getTuple());
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    const FOV = 45 * Math.PI / 180;
    const AR = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projMatrix = makeProjMatrix(FOV, AR, .1, 100);
    const modelViewMatrix = makeModelViewMatrix(Vec3.ORIGIN, Math.PI / 5, Math.PI / 5, Math.PI / 5);
    setupPosAttrib(programInfo);
    gl.useProgram(programInfo.program);
    console.log(gl.TRIANGLES);
    console.log(stlObj.vertexCount)
    gl.drawElements(gl.TRIANGLES, stlObj.vertexCount,gl.UNSIGNED_SHORT, 0);
    console.log("hi?")
}

export { initGraphics }