const express = require("express");
// import "./node_modules/express/index.js";
// import "express";
// import "fs";
const fs = require("fs"); 
const cors = require("cors");
const app = express();
app.use(cors());
const port = 3000;
// const motorcycleRacer = require("./motorcycle_racer.js");
const {JSDOM} = require('jsdom');
const ogl = require('ogl');
// import { initGraphics } from "./motorcycle_racer.js"

app.get("/get/shield_info",(req,res)=> {
  fs.readFile("./json/shield_pixels.json",(err,data)=>{
    if (err) res.status(500).send('Could not read shield JSON');
    else res.status(200).send(data);
  });
})

app.get("/get/bridge_info",(req,res)=> {
  fs.readFile("./json/bridge_tester.json",(err,data)=>{
    if (err) res.status(500).send('Could not read bridge JSON');
    else res.status(200).send(data);
  });
})

// app.get("/",(req,res)=>{
//   const document = new JSDOM(` <!DOCTYPE html><html>
//     <div class = "InnerCanvas"><canvas id = "glcanvas" width = 1000px height = 800px></canvas></div>
//     </html>`).window.document;
//   const canvas = document.querySelector("canvas");
//   console.log(canvas);
//   const renderer = new ogl.Renderer({canvas});
//   const gl = renderer.gl;
//   document.appendChild(gl.canvas);
//   motorcycleRacer.initGraphics(gl); 
// });

app.listen(port);