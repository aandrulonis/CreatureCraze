// // web/main.js
// import PhysicsModule from './physics.js';

// const Module = await PhysicsModule();
// const world = new Module.PhysicsWorld();

var  PI, outcomes, modes, Color, Vec3, canvas, gl;
class MotorcycleRacerProps {
    constructor() {
        
    }

    update(dt) {
        dynamics.propagate(dt);
        
    }
}

async function runMotorcycleRacer(frameDT, utils, cppUtils) {
    PI = utils.PI;
    outcomes = utils.outcomes;
    modes = utils.modes;
    Color = utils.Color;
    Vec3 = utils.Vec3;
    canvas = document.getElementById("Canvas");
    gl = canvas.getContext('webgl');

    const sunPos = new cppUtils.vec3(0.,0.,50.);
    const sunCol = new cppUtils.vec3(100., 100., 100.);
    const scene = new cppUtils.Scene(sunPos, sunCol);
    const diffuse_col = new cppUtils.vec3(1, 0, 0);
    const F0 = new cppUtils.vec3(0, 1, 0);
    const sphere = new cppUtils.Ellipsoid(.5, .5, .5, 0., 1., diffuse_col, F0);
    const obj = new cppUtils.Object3D();
    const pos1 = new cppUtils.vec3(0,0,0);
    const angle1 = new cppUtils.vec3(0,0,0);
    const pos2 = new cppUtils.vec3(0,0,0);
    const angle2 = new cppUtils.vec3(0,0,0);
    obj.addShape(pos1, angle1, sphere);
    scene.addObject(pos2, angle2, obj);
    scene.triangulate(20);
    const obs_pos = new cppUtils.vec3(-10, 0, 0);
    scene.computeColors(obs_pos);
    const posPtr = scene.getVertexPositions();
    const indPtr = scene.getVertexIndices();
    const colPtr = scene.getVertexColors();
    const numTri = scene.numTriangles();
    const numVert = scene.numVertices();
    const positions = new Float64Array(cppUtils.HEAPF64.buffer, posPtr, numVert*3);
    const indices = new Int32Array(cppUtils.HEAP32.buffer, indPtr, numTri*3);
    const colors = new Float64Array(cppUtils.HEAPF64.buffer, colPtr, numVert*4);

    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec4 aColor;
        varying vec4 vColor;  // passed to fragment shader, interpolated automatically

        void main() {
            gl_Position = vec4(aPosition, 1.0);
            vColor = aColor;  // rasterizer interpolates this across the triangle
        }`;
    const fragmentShaderSource = `
        precision mediump float;
        varying vec4 vColor;  // arrives already interpolated between vertices

        void main() {
            gl_FragColor = vColor;
        }`;
    const program = gl.createProgram();
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);
    console.log(`frag shader: ${fragShader}`)
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    console.log(`log: ${gl.getProgramInfoLog(program)}`)


    // Position buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const posLocation = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, 0, 0); // 3 = xyz
    gl.enableVertexAttribArray(posLocation);

    // Color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorLocation = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0); // 4 = rgba
    gl.enableVertexAttribArray(colorLocation);

    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

   // gl.viewport(0, 0, canvas.width, canvas.height);
    console.log(`buff info: ${gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE)}`)

    // clear to black
    gl.clearColor(1,1,1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   function mainFunc() {
        let currFrame = 0;
        const startTime = performance.now();
        return new Promise((res) => {
            requestAnimationFrame(animate);
            async function animate () {
                currFrame++;
                gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
                console.log('running')
                await new Promise((res)=>setTimeout(()=>res(),Math.max(0,startTime+currFrame*frameDT-performance.now())))
                requestAnimationFrame(animate);
            }
        });
    }
    mainFunc();

    scene.delete();
    obs_pos.delete();

}

export { runMotorcycleRacer };