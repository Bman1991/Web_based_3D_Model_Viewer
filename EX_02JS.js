// JavaScript Document/* 

/*HTML Model Viewer

Resources:

www.threejs.org 
https://github.com/theMaxscriptGuy/Windows_Programs
http://blog.teamtreehouse.com/the-beginners-guide-to-three-js
http://it-ebooks.info/search/?q=three.js&type=title
http://www.script-tutorials.com/webgl-with-three-js-lesson-6/ 

E-Books

Three.js Essentials
Learning Three.js: The JavaScript 3D Library for WebGL

cubeMap environmnents provided by OpenGameArt.Org
   Emil Persson

*/

//--- Global variables ---
var scene, camera, renderer;
var diffuse;
var bump;
var specular; 
var textureMat;
var wireMat;
var environmentMat;
var textureCube;
var controlUI;

var modelOBJ;
var wireframeOBJ;
var cubeMapOBJ; 
var reload; 

var skyColor;
var groundColor;
 
//--- main functions --- 
init();
animate(); 

//initiates the setup process
function init(){
  
  //--- scene setup --- 
  scene = new THREE.Scene(); //create new scene
  //store browser window size 
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  
  //--- renderer setup ---
  renderer = new THREE.WebGLRenderer({antialias:true}); //create WebGL renderer
  renderer.setSize(WIDTH,HEIGHT); //set renderer size
  document.body.appendChild(renderer.domElement); //appends renderer to HTML document body
  renderer.domElement.id = "context" // sets ID to context 
  
  //--- Camera setup ---  
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(100,150,0); //position of camera in scene
  camera.lookAt(0,0,0); //direction where camera is looking 
  scene.add(camera); //add camera
  
  //Resizing setup - resizes window size dependent objects 
  window.addEventListener('resize', function(){
    var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix(); 
  });//END of resize window event listener 
  
  
  //--- lighting setup ---
  var light = new THREE.DirectionalLight(0xffffff); //create white directional light
  light.position.set(-100, -200, 100);// light position in scene
  light.lookAt(0,0,0); //direction where camera is looking 
  scene.add(light); //add light to scene
  
  var light2 = new THREE.DirectionalLight(0xffffff);
  light2.position.set(100, 200, 100);
  light2.lookAt(0,0,0);
  scene.add(light2);
  
  var light3 = new THREE.DirectionalLight(0xffffff);
  light3.position.set(-100, 0, -100);
  light3.lookAt(0,0,0);
  scene.add(light3);
  
  var hLight = new THREE.HemisphereLight(0xffffff,0xffffff,0.3);
  scene.add(hLight);
  
  //Texture loaders 
 loadTexture('Briefcase');
  
  // load model
  loadModel('Briefcase');
 
 // load environment
 createEnvironment('Pond');
  
  //--- UI setup and default settings --- 
  controlUI = new function() {
     this.specularPower = 30; //set specular power to 30
     this.bumpScale = 1; //set bump scale to 1
     this.opacity = 1; //set opacity to 1
     this.color = textureMat.color.getHex(); //set color based off of textureMat color in hexadecimal 
     this.wireframeColor = wireMat.color.getHex(); // set wireframe color based off of wireMat color in hexadecimal
     this.wireframe = false; //hide wireframe
     this.noTexture = false; //show texture of model
     this.noEnvironment = true; // hide environment or cubemap 
     this.noReflection = false; // show reflection  
     this.model = 'Briefcase'; // default to "Briefcase" model
     this.environment = 'Pond'; // default to "pond" environment or cubmap 
    
  };//END of controlUI Object
  
  //add controls to GUI
  addControlGui(controlUI);
  
  //--- creates GUI and adds controlUI to GUI ---
  function addControlGui(controlObj) {
    var gui = new dat.GUI(); //create GUI controls 
    gui.add(controlObj, 'specularPower', 1.0, 200.0); //set specular power range to 1-200
    gui.add(controlObj, 'bumpScale', 0.0, 5.0); //set bump scale range to 0-5
    gui.add(controlObj, 'opacity', 0.1, 1); // set opacity range to 0.1-1
    gui.addColor(controlObj, 'color'); //set texture color to model's textureMat color 
    gui.addColor(controlObj, 'wireframeColor'); //set wireframe color to wireMat color
    gui.add(controlObj, 'wireframe'); // set "wireframe" toggle controls
    gui.add(controlObj, 'noTexture'); // set "noTexture" toggle controls 
    gui.add(controlObj, 'noEnvironment'); //set "noEnvironment" toggle controls
    gui.add(controlObj, 'noReflection'); //set "noReflection" toggle controls
    reload = gui.add(controlObj, 'model', ['Briefcase', 'Car', 'WoodCrate', 'BreadTruck']); //set model drop down menu with the following choices 
    reloadEnv = gui.add(controlObj, 'environment', ['Pond', 'Stair', 'Vasa', 'BerzeliiPark', 'ForbiddenCity', 'CNTower']); //set environment drop down menu with the follwing choices
  }//END of addControlGui()
  
  //orbital controls 
  controls = new THREE.OrbitControls(camera, renderer.domElement);// set camera controls to orbiting style controls 
  
}// END of init()

//animation loop function 
function animate(){
   
  //--- wireframe model controls ---
   wireMat.color = new THREE.Color(controlUI.wireframeColor);
   wireMat.emissive = new THREE.Color(controlUI.wireframeColor);
   wireMat.visible = controlUI.wireframe;
   
  //--- main texture controls --- 
   if(controlUI.noTexture == true){textureMat.map = '';}
   else{textureMat.map = diffuse;}
  
   if(controlUI.noReflection == true){textureMat.envMap = '';}
   else{textureMat.envMap = textureCube;}
   
   textureMat.color = new THREE.Color(controlUI.color); 
   textureMat.transparent = true; 
   textureMat.opacity = controlUI.opacity;
   textureMat.bumpScale = controlUI.bumpScale; 
   textureMat.shininess = controlUI.specularPower;
   
   //changes model and environment when a change occurs with model or environment. 
  reload.onChange(function(value){ removeModel(); loadTexture(value); loadModel(value);}); //when model changes
  reloadEnv.onChange(function(value){removeCubeMap(); createEnvironment(value);}); //when environment changes
   environmentMat.visible = controlUI.noEnvironment; //toggles environment visibility based off of GUI controls
   
  //updates materials 
   textureMat.needsUpdate = true;
   wireMat.needsUpdate = true;
   
   
  //renders
   requestAnimationFrame(animate); //causes loop 
   renderer.render(scene, camera); //renders scene
   controls.update(); // updates GUI controls
   
}//END of animate()

//loads texture 
function loadTexture(texture){
  
  //loads diffuse map for graphical detail, like color, graphics, or fonts that you normally see.  
  var diffLoader = new THREE.TGALoader();
  diffuse = diffLoader.load('models/' + texture + '_Diffuse.tga', function(diffuse){});//'models/'
  
  //loads bump map for finer detail, like cracks, screw heads, or wood grain that is too detailed to model. 
  var bumpLoader = new THREE.TGALoader();
  bump = bumpLoader.load('models/'+ texture +'_Bump.tga', function(bump){});
  
  //loads specular map for lighting effects, like shiny vs dull or metal vs plastic vs wood. 
  var specLoader = new THREE.TGALoader();
  specular = specLoader.load('models/' + texture + '_Specular.tga', function(specular){});
  
  //Creates material 
  textureMat = new THREE.MeshPhongMaterial({color: 0xffffff, map: diffuse, specularMap: specular, bumpMap: bump, side: THREE.DoubleSide});//graphical material
  wireMat = new THREE.MeshBasicMaterial({color: 0x07f786, wireframe: true, emissive: 0xffffff, shading: THREE.flatShading});//solid wire material
  
}//END of loadTexture()

//loads model 
function loadModel(model){
	
 //Model loader 
  var loader = new THREE.OBJLoader();
  loader.load('models/' + model + '_Final.obj', createMesh); 
  
    function createMesh(geometry){
      
      modelOBJ = geometry; // assign model geometry to global variable for referencing
	   
      //creates model mesh
      var mat = textureMat;
      geometry.traverse(function(child){ if(child instanceof THREE.Mesh){ child.material = mat;}});// must have ".traverse" to apply material
      
      
      //clones geometry for wireframe 
      newGeometry = geometry.clone();
      wireframeOBJ = newGeometry; // assign model geometry to global variable for referencing 
      var mat2 = wireMat; 
      newGeometry.traverse(function(child){ if(child instanceof THREE.Mesh){ child.material = mat2; child.material.wireframe = true;}});
      newGeometry.scale.set(1,1,1);
      
      //add to scene 
      scene.add(newGeometry);
      scene.add(geometry);
     
    }//END of createMesh()
}//END of loadModel()

//removes model from scene
function removeModel(){
  scene.remove(modelOBJ, wireframeOBJ); 
}

//removes cubemap or environment from scene
function removeCubeMap(){
  scene.remove(cubeMapOBJ);
}

//creates cubemap or environment for scene
function createEnvironment(envUrl){
   
   //--- create cubemap --- 
   function createCubeMap(){
    var path = 'cubeMaps/' + envUrl +'/'; //path of cubemap images
    var format = '.jpg'; //format of cubemap images
    var urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ]; //creates a list of path urls to each image for each side of the cubemap.  
	
	//
    textureCube = THREE.ImageUtils.loadTextureCube(urls); 
	
    return textureCube; 
  }//END of createCubeMap()
  
  textureCube = createCubeMap(); //creates cubemap texture 
  var shader = THREE.ShaderLib["cube"]; // creates shader for cube
  shader.uniforms["tCube"].value = textureCube; // apply cubemap texture
  
  //creates shader material with cubemap texture and shader  
  environmentMat = new THREE.ShaderMaterial({fragmentShader:shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: shader.uniforms, depthWrite: false, side: THREE. BackSide});
  
  cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(10000,10000,10000), environmentMat); //create cube for environment 
  cubeMapOBJ = cubeMesh; // assign model mesh to global variable for referencing
  scene.add(cubeMesh); //adds cube mesh object to scene
  
  textureMat.envMap = textureCube;//apply CubeMap texture to the model for fake reflection
  
}// END of createEnvironment()



