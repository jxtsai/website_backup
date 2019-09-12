"use strict";

window.addEventListener('resize', handleWindowResize, false);

var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container,controls;

var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;
var scene = new THREE.Scene();

var aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 55;
	nearPlane = 1;
	farPlane = 10000;

var camera = new THREE.PerspectiveCamera(
	fieldOfView,
	aspectRatio,
	nearPlane,
	farPlane
);

camera.position.set (0, 0, 250);	
scene.add(camera);
scene.fog = new THREE.Fog(0x000000, 150, 500);

var renderer = new THREE.WebGLRenderer({ 
	alpha: true, 
	antialias: true 
});

renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMap.enabled = true;  
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container = document.getElementById('container');
container.appendChild(renderer.domElement);

// CONTROLS
/////////////////

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.enabled = true;
controls.minDistance = 50;
controls.maxDistance = 250;
controls.minZoom = 0;
controls.maxZoom = Infinity;
/* controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI/2 - Math.PI/60; */

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

//LIGHTS
//////////////////

var hemisphereLight, shadowLight;

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	shadowLight.position.set(150, 350, 350);

	shadowLight.castShadow = true;

	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

// Colours
//////////////////

var Colors = {
	red:0xCA3C38,
	white:0xd8d0d1,
	grey:0xb5b5b5,
	darkGrey: 0x707070,
};

// SkyBox
//////////////////

function initSkybox(){

	var urls = [
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_pos_x.jpg',
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_neg_x.jpg',
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_pos_y.jpg',
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_neg_y.jpg',
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_neg_z.jpg',
		'https://zultanzul.github.io/ThreeJS-Robot/skybox/sky_pos_z.jpg'
	];
	
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;
	
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = reflectionCube;
	
	var material = new THREE.ShaderMaterial( {	
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide		
	} ), skyBox = new THREE.Mesh( new THREE.BoxGeometry( 5000, 5000, 5000 ), material );	
  
	scene.add( skyBox );
}

// Dust Particles
//////////////////
var Dust = function() {
  
  this.mesh = new THREE.Object3D();
  var geomLine = new THREE.Geometry();
    geomLine.vertices.push(
      new THREE.Vector3( 0, -10, 0 ),
      new THREE.Vector3( 0, 10, 0 )
    );
  var Mat = new THREE.LineBasicMaterial({color:0xffffff});
  var line = new THREE.Line( geomLine, Mat ); 
  this.mesh.add(line);  
}

var DustArray = [];

var DustMatrix = function() {  
    
 this.mesh = new THREE.Object3D();
    
  this.nDust = 75;  
  // Create the Cakes
  for(var i=0; i<this.nDust; i++){
  
    this.d = new Dust();   
    this.d.mesh.position.y = -300+Math.random()*600;   
    this.d.mesh.position.x = -300+Math.random()*600;   
    this.d.mesh.position.z = 300-Math.random()*600;
    this.d.mesh.scale.y = 0.5+Math.random()*1.0;
    this.mesh.add(this.d.mesh);
    DustArray.push(this.d);
  }   
}

DustMatrix.prototype.Speed = function(){ 
  for (var i = 0; i <DustArray.length; i++){       
    DustArray[i].mesh.position.y -=2;    
    
    if (DustArray[i].mesh.position.y <= -200 ) {
      DustArray[i].mesh.position.y=400;        
    }     
  }
  for (var i = 0; i <DustArray.length; i+=3){       
    DustArray[i].mesh.position.y -=4;   
    
    if (DustArray[i].mesh.position.y <= -200 ) {
      DustArray[i].mesh.position.y=400;        
    }     
  }
}


// ROBOT
//////////////////

var Robot = function() {
	
	this.mesh = new THREE.Object3D();
	
	var redMat = new THREE.MeshPhongMaterial({color:Colors.red, flatShading:true});
	var whiteMat = new THREE.MeshPhongMaterial({color:Colors.white, flatShading:true});
	var greyMat = new THREE.MeshPhongMaterial({color:Colors.grey, flatShading:true});
	var darkGreyMat = new THREE.MeshPhongMaterial({color:Colors.darkGrey, flatShading:true});
	// Create the Head
	var geomHead = new THREE.BoxGeometry(75,50,50,1,1,1);
	var head = new THREE.Mesh(geomHead, redMat);

	head.castShadow = true;
	head.receiveShadow = true;

	// Create the Eyes
	var geomEye = new THREE.CylinderBufferGeometry(15, 10, 10, 8 );
	geomEye.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	var eyeL = new THREE.Mesh(geomEye, whiteMat);
	eyeL.position.set(15,0,25);
	eyeL.castShadow = true;
	eyeL.receiveShadow = true;


	// Clone Eye
	var eyeR = eyeL.clone();
	eyeL.position.x = -eyeR.position.x;


  this.eyes = new THREE.Object3D();
  this.eyes.add(eyeL,eyeR);
  head.add(this.eyes);

	// Add Antennna
	var geomAntennaBase = new THREE.CylinderBufferGeometry(5, 10, 5, 6 );
	var antennaBase = new THREE.Mesh(geomAntennaBase, redMat);
	antennaBase.position.set(0,27,0);
	antennaBase.castShadow = true;
	antennaBase.receiveShadow = true;
	head.add(antennaBase);

	var geomAntennaRod = new THREE.CylinderBufferGeometry(1, 5, 20, 6 );
	var antennaRod = new THREE.Mesh(geomAntennaRod, redMat);
	antennaRod.position.set(0,10,0);
	antennaRod.castShadow = true;
	antennaRod.receiveShadow = true;
	antennaBase.add(antennaRod);

	var geomAntennaTop = new THREE.SphereBufferGeometry( 6, 8, 8 );
	var antennaTop = new THREE.Mesh(geomAntennaTop, whiteMat);
	antennaTop.position.set(0,20,0);
	antennaTop.castShadow = true;
	antennaTop.receiveShadow = true;
	antennaBase.add(antennaTop);

	antennaBase.scale.set(0.8, 0.8, 0.8);

	// Create Jaw
	var geomJaw = new THREE.BoxGeometry(85,10,60,1,1,1);
	this.jaw = new THREE.Mesh(geomJaw, redMat);
	this.jaw.castShadow = true;
	this.jaw.receiveShadow = true;
	this.jaw.position.set(0,-40, 0);
	this.jaw.rotation.x =  Math.PI * 0.05;
	this.mesh.add(this.jaw);

	//Create Jaw Vertical
	var geomJawV = new THREE.BoxGeometry(85,25,10,1,1,1);
	var jawV = new THREE.Mesh(geomJawV, redMat);
	jawV.receiveShadow = true;
	jawV.position.set(0, 17.5,-25);
	this.jaw.add(jawV);

	//Create Teeth
	var geomTeeth = new THREE.BoxGeometry(75,5,5,1,1,1);
	var teeth = new THREE.Mesh(geomTeeth, whiteMat);
	teeth.castShadow = true;
	teeth.receiveShadow = true;
	teeth.position.set(0, 5 ,20);
	this.jaw.add(teeth);

	var geomTeethBack = new THREE.BoxGeometry(5,5,30,1,1,1);
	var teethBackL = new THREE.Mesh(geomTeethBack, whiteMat);
	teethBackL.castShadow = true;
	teethBackL.receiveShadow = true;
	teethBackL.position.set(35, 5, 5);
	this.jaw.add(teethBackL);

	var teethBackR = teethBackL.clone();
	teethBackL.position.x = -teethBackR.position.x;
	this.jaw.add(teethBackR);	

	//Creat Jaw Bolts
	var geomJawBolt = new THREE.CylinderBufferGeometry(10, 10, 10, 8 );
	geomJawBolt.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
	var jawBoltL = new THREE.Mesh(geomJawBolt, redMat);
	jawBoltL.position.set(-40,25,-25);
	jawBoltL.castShadow = true;
	jawBoltL.receiveShadow = true;
	this.jaw.add(jawBoltL);

	//Clone the Jaw
	var jawBoltR = jawBoltL.clone();
	jawBoltL.position.x = -jawBoltR.position.x;
	this.jaw.add(jawBoltR);

	//Add the Jaw
	head.add(this.jaw);
  
	//Add the Head
  this.headCont = new THREE.Object3D();
  this.headCont.add(head);
	this.mesh.add(this.headCont);


	//Create the Torso
	var geomTorso = new THREE.BoxGeometry(65,60,50,1,1,1);
	var torso = new THREE.Mesh(geomTorso, redMat);
	torso.castShadow = true;
	torso.receiveShadow = true;
	geomTorso.vertices[3].x+=10;
	geomTorso.vertices[2].x+=10;
	geomTorso.vertices[7].x-=10;
	geomTorso.vertices[6].x-=10;

	geomTorso.vertices[3].z-=5;
	geomTorso.vertices[2].z+=5;
	geomTorso.vertices[7].z+=5;
	geomTorso.vertices[6].z-=5;


	var geomButton = new THREE.BoxGeometry(5,5,2.5);
	var button = new THREE.Mesh(geomButton, greyMat);
	button.position.set(20,10,28);
	button.castShadow = true;
	button.receiveShadow = true;
	torso.add(button);

	var geomButtonWide = new THREE.BoxGeometry(5,10,2.5);
	var buttonWide = new THREE.Mesh(geomButtonWide, greyMat);
	buttonWide.position.set(10,10,28);
	buttonWide.castShadow = true;
	buttonWide.receiveShadow = true;
	torso.add(buttonWide);


	var geomnDial = new THREE.CylinderBufferGeometry(10, 10, 4, 8 );
	var dial = new THREE.Mesh(geomnDial, darkGreyMat);	
	dial.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	dial.position.set(-15,10,27);
	dial.castShadow = true;
	dial.receiveShadow = true;
	torso.add(dial);


	//Create the LowerTorso
	var geomTorsoLower = new THREE.BoxGeometry(20,12,60,1,1,2);
	var torsoLowerL = new THREE.Mesh(geomTorsoLower, redMat);
	torsoLowerL.position.set(25,-36,0);
	geomTorsoLower.vertices[4].y-=10;	
	geomTorsoLower.vertices[10].y-=10;
	torsoLowerL.castShadow = true;
	torsoLowerL.receiveShadow = true;
	torso.add(torsoLowerL);

	var torsoLowerR = torsoLowerL.clone();
	torsoLowerL.position.x = -torsoLowerR.position.x;
	torso.add(torsoLowerR);

	var torsoLowerM = torsoLowerL.clone();
	torsoLowerM.position.x=0;
	torsoLowerM.position.y=-33.5;
	torsoLowerM.scale.set(1,1.2,1.1);
	torso.add(torsoLowerM);

	// Create the Neck
	var geomNeck = new THREE.CylinderBufferGeometry(10, 15, 12, 6);
	var neck = new THREE.Mesh(geomNeck, redMat);
	neck.castShadow = true;
	neck.position.y = 35;
	neck.receiveShadow = true;
	torso.add(neck);


	// Create JetPack

	var geomFuelBox = new THREE.BoxBufferGeometry(45, 30, 10 );
	var fuelBox = new THREE.Mesh(geomFuelBox, redMat);
	fuelBox.position.set(0,0,-30);
	fuelBox.castShadow = true;
	fuelBox.receiveShadow = true;
	torso.add(fuelBox);

	var geomFuel = new THREE.CylinderBufferGeometry(15, 15, 60, 8 );
	var fuel = new THREE.Mesh(geomFuel, greyMat);
	fuel.position.set(20,0,-50);
	fuel.castShadow = true;
	fuel.receiveShadow = true;
	torso.add(fuel);

	var geomFuelTop = new THREE.SphereGeometry( 15, 8, 8 );
	var fuelTop = new THREE.Mesh(geomFuelTop, whiteMat);
	fuelTop.position.set(0,30,0);
	fuelTop.castShadow = true;
	fuelTop.receiveShadow = true;
	fuel.add(fuelTop);

	var geomFuelBot = new THREE.CylinderBufferGeometry(15, 20, 10, 8 );
	var fuelBot = new THREE.Mesh(geomFuelBot, darkGreyMat);
	fuelBot.position.set(0,-30,0);
	fuelBot.castShadow = true;
	fuelBot.receiveShadow = true;
	fuel.add(fuelBot);


	var fuelR = fuel.clone();
	fuel.position.x = -fuelR.position.x;
	torso.add(fuelR);
  fuel.rotation.x = Math.PI/30;
  fuelR.rotation.x = Math.PI/30;
	this.mesh.add(torso);



	// Create Arms - need better anchor poitns

	this.armLeft = new THREE.Object3D();

	var geomArm = new THREE.BoxGeometry(10,40,10);
	var armUpperL = new THREE.Mesh(geomArm, redMat);
	armUpperL.rotateZ = Math.PI/8;
	armUpperL.castShadow = true;
	armUpperL.position.set(55,0,0);
	armUpperL.receiveShadow = true;
	armUpperL.rotation.z =	Math.PI/3;
	armUpperL.rotation.y =	-Math.PI/4;
	this.armLeft.add(armUpperL);

	var armLowerL = armUpperL.clone();
	//armUpperL.position.y = -armLowerL.position.y;
	armLowerL.position.set(70,-22,35);
	armLowerL.rotation.y =	-Math.PI/2;
	this.armLeft.add(armLowerL);	

	// Creat Hands
	var geomHand = new THREE.BoxGeometry(30,30,10);
	var handL = new THREE.Mesh(geomHand, redMat);
	handL.castShadow = true;
	handL.position.set(0,-20,0);
	handL.receiveShadow = true;
	armLowerL.add(handL);

	this.mesh.add(this.armLeft);	

	this.armRight = this.armLeft.clone();
	this.armRight.position.y = 25;	
	this.armRight.rotation.y = Math.PI;
	this.armRight.rotation.x = Math.PI;

	this.mesh.add(this.armRight);	

	// Create Legs - Needs better Anchor Points

	var geomLeg = new THREE.BoxGeometry(10,40,10);
	var legL = new THREE.Mesh(geomLeg, redMat);
	legL.castShadow = true;
	legL.position.set(25,-72,10);
	legL.receiveShadow = true;

	var legLowerL = legL.clone();
	legLowerL.position.set(0,-35,-15);
	legLowerL.rotation.x =	Math.PI/3.5;
	legL.add(legLowerL);

	// Creat Feet
	var geomFeet = new THREE.BoxGeometry(30,10,40);
	var feet = new THREE.Mesh(geomFeet, redMat);
	feet.castShadow = true;
	feet.position.set(0,-20,10);
	feet.receiveShadow = true;
	legLowerL.add(feet);	

  this.legLCont = new THREE.Object3D();
  this.legLCont.add(legL);
	this.mesh.add(this.legLCont);

	var legR = legL.clone();
	legR.position.x = -25;
	legR.rotation.x = -Math.PI/10;

  this.legRCont = new THREE.Object3D();
  this.legRCont.add(legR);
	this.mesh.add(this.legRCont);
  
	//Position Body Parts
	head.scale.set(1.2, 1.2, 1.2);
	head.position.y = 100;
	torso.position.y = 0;
};

Robot.prototype.blinkLoop = function (){
  var isBlinking = false;

  if ((!isBlinking) && (Math.random()>0.99)) {
    isBlinking = true;
    blink();
  } 

  function blink() {
    robot.eyes.scale.y = 1;
    robot.eyes.scale.y = 1;
    TweenMax.to(robot.eyes.scale, .07, {
        y: 0, yoyo: true, repeat: 1, onComplete: function() {
           isBlinking = false;
        }
    });
  }
};

Robot.prototype.idleAnimation = function (){
  //HEAD
  this.headCont.rotation.z = Math.sin(Date.now() * 0.002) * Math.PI * 0.02 ;
  this.headCont.rotation.x = Math.cos(Date.now() * 0.001) * Math.PI * 0.02 ;
  this.headCont.rotation.y = Math.sin(Date.now() * 0.001) * Math.PI * 0.1 ; 
  this.jaw.rotation.x = Math.sin(Date.now() * 0.001) * -Math.PI * 0.07 ; 
  this.jaw.rotation.x = Math.max(-0.02,this.jaw.rotation.x);
  
  //ARMs
  this.armLeft.rotation.x = Math.sin(Date.now() * 0.002) * -Math.PI * 0.1 ;
  this.armRight.rotation.z = Math.sin(Date.now() * 0.001) * -Math.PI * 0.07 ;
  
  //LEFT
  
  this.legRCont.rotation.x = Math.sin(Date.now() * 0.001) * -Math.PI * 0.05 ;
  this.legRCont.rotation.z = Math.sin(Date.now() * 0.001) * -Math.PI * 0.02 ;
  this.legLCont.rotation.x = Math.sin(Date.now() * 0.0015) * Math.PI * 0.02 ;
  this.legLCont.rotation.z = Math.cos(Date.now() * 0.0012) * Math.PI * 0.01;

  //Vibration
  this.mesh.position.x = Math.sin(Date.now() * 0.03) * 0.5 ;
  this.mesh.position.y = Math.cos(Date.now() * 0.01) * 1 ;
  //this.mesh.position.z = Math.cos(Date.now() * 0.03) * -1 ;
  
  this.mesh.position.y += Math.sin(Date.now() * 0.001) * 15 ;
};

var Jet = function() {
  var geom = new THREE.BoxBufferGeometry(4, 4, 4);
  this.Mat = new THREE.MeshLambertMaterial({color:0xffba00, flatShading:true, transparent: true, opacity: 0.5});
  this.mesh = new THREE.Mesh(geom, this.Mat);
  this.mesh.position.set(0,-18,-25);
}

var ParticleArray = [];

var JetStream = function() {  
    
 this.mesh = new THREE.Object3D();
  this.intensity = 2;
  this.pointLightL = new THREE.PointLight( 0xffba00, this.intensity, 70, 2 );
  this.pointLightL.position.set( 10, -30, 0 );
  
  this.pointLightR = new THREE.PointLight( 0xffba00, this.intensity, 70, 2 );
  this.pointLightR.position.set( -10, -30, 0 );
  
  this.mesh.add(this.pointLightR,this.pointLightL);
    
  this.mesh.rotation.x = Math.PI/30
  this.nParticles = 25;  
  // Create the Cakes
  for(var i=0; i<this.nParticles; i++){
  
    this.p = new Jet();   
    this.p.mesh.position.y = 0+Math.random()*60;   
    this.p.mesh.position.x = 0+Math.random()*8;   
    this.p.mesh.position.z = 0+Math.random()*8;
    this.p.mesh.rotation.x = 0-Math.random()*3;
    this.p.mesh.rotation.y = 0-Math.random()*3;  
    this.p.mesh.rotation.z = 0-Math.random()*3; 
    var s = 0.1+Math.random()*1.0;
    
    this.p.mesh.scale.set(s,s,s);

    this.mesh.add(this.p.mesh);
    ParticleArray.push(this.p);
  }  
  
}
var offset = 0.03+Math.random()*0.06;

JetStream.prototype.Jet = function(){
   this.mesh.position.y = Math.sin(Date.now() * 0.001) * 15 ;
  for (var i = 0; i <ParticleArray.length; i++){       
    ParticleArray[i].mesh.position.y -=.8;
    ParticleArray[i].mesh.scale.x += 0.05;
    ParticleArray[i].mesh.scale.y += 0.05;
    ParticleArray[i].mesh.scale.z += 0.05;
    ParticleArray[i].mesh.rotation.x +=0.05;
    ParticleArray[i].mesh.rotation.y +=0.05;
    ParticleArray[i].Mat.color.setRGB(1,0.7,0);
    
    if (ParticleArray[i].mesh.position.y <= -20 ) {
      ParticleArray[i].Mat.color.setRGB(1,0.5,0);
    }    
    if (ParticleArray[i].mesh.position.y <= -45 ) {
      ParticleArray[i].Mat.color.setRGB(1,0.15,0);
      ParticleArray[i].mesh.scale.x += 0.05;
      ParticleArray[i].mesh.scale.y += 0.05;
      ParticleArray[i].mesh.scale.z += 0.05;
    }    
    
    if (ParticleArray[i].mesh.position.y <= -65 ) {
      ParticleArray[i].Mat.color.setRGB(0.15,0.15,0.15);
      ParticleArray[i].mesh.scale.x += 0.05;
      ParticleArray[i].mesh.scale.y += 0.05;
      ParticleArray[i].mesh.scale.z += 0.05;
    }
    
    if (ParticleArray[i].mesh.position.y <= -75 ) {
      ParticleArray[i].mesh.position.y=-12;   
      ParticleArray[i].mesh.scale.set(1,1,1);
    } 
    
  }
}

scene.traverse( object => {
  object.castShadow = true;
  object.receiveShadow = true;
});


//INIT SCENE
//////////////////
var robot, jetStreamL, jetStreamR, dustMatrix;

function createRobot(){ 
	robot = new Robot();
	robot.mesh.position.y = 0;
	robot.mesh.rotation.z = Math.PI/20;	
 	robot.mesh.rotation.x = Math.PI/10;	 
	robot.mesh.scale.set(.5,.5,.5);
	scene.add(robot.mesh);
}

function createJets(){ 
	jetStreamL = new JetStream();
  jetStreamL.mesh.position.set(6,0,-30);
  jetStreamL.mesh.rotation.x = Math.PI/6;	
	jetStreamL.mesh.rotation.z = Math.PI/20;	
  
	jetStreamR = new JetStream();
  jetStreamR.mesh.position.set(-14,0,-30);
  jetStreamR.mesh.rotation.x = Math.PI/6;	
 	jetStreamR.mesh.rotation.z = Math.PI/20;	
	scene.add(jetStreamR.mesh, jetStreamL.mesh);
}

function createDustMatrix(){ 
	dustMatrix = new DustMatrix();
	dustMatrix.mesh.rotation.z = Math.PI/20;	
 	dustMatrix.mesh.rotation.x = Math.PI/10;	 
  
	scene.add(dustMatrix.mesh);
}


createLights();
initSkybox();
createRobot();
createJets();
createDustMatrix();

//ANIMATION
//////////////////

function animate(){
  jetStreamR.Jet();  
  jetStreamL.Jet();
  robot.blinkLoop();
  robot.idleAnimation();
  dustMatrix.Speed();
 	controls.update();
}

function loop(){
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
	animate();
}

loop();

//NCC-1701
console.log("                                                                \n  ___________________  *       _-_                   *          \n  \\\%c==============%c_%c=%c_/ ____.---'---`---.____   *        *     *  \n              \\\_ \\\    \\\----._________.----/                     \n         *      \\\ \\\   /  /    `-_-'              *            * \n  *         __,--`.`-'..'-_                            *        \n           /____          ||    *         *                     \n                `--.____,-'                                     \n                                                                ", "color: #ff0000;", "color: #000000;", "color: #0000ff;", "color: #000000;");