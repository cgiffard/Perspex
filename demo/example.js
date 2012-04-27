// Perspex test / example
/*



THIS IS INCREDIBLY ROUGH. I'll fix it up soon.




*/

window.addEventListener("load",function(EventData) {
	var _q = function(input){ return document.querySelectorAll(input); };
	var canvas	= _q("canvas#example")[0],
		context	= canvas.getContext("2d"),
		width	= parseInt(window.innerWidth,10),
		height	= parseInt(window.innerHeight,10);
	
	
	// Set up canvas & body style
	document.body.style.margin = "0px";
	document.body.style.overflow = "hidden";
	canvas.width = width;
	canvas.height = height;
	
	// Local tracking for camera
	var cameraX = (width/4) * -1,
		cameraY = (height/4) * -1,
		cameraZ = -1500
		crotX = 0,
		crotY = 0,
		crotZ = 0,
		pupilWidth = 1,
		pupilHeight = 1,
		fieldOfView = 70,
		viewDepth = 3700;//(Math.tan(fieldOfView * (Math.PI/180)) * (width/2));
	
	var startTime = (new Date()).getTime();
	var framesPast = 0;
	
	
	// Set up camera and projection
	var camera		= new perspex.Camera(cameraX,cameraY,cameraZ,crotX,crotY,crotZ,pupilWidth,pupilHeight,viewDepth),
		projection	= perspex(camera,{ clamp: false });
	
	var cameraToolbar = new PerspexToolbar(camera);
		cameraToolbar.appendTo(document.body);
		// cameraToolbar.on("update",runProjection);
	
	var cubes = [], hue=0, cumulativeFrameTime = 0;
	window.cubes = cubes;
	
	for (var c = 0; c < 25; c ++) {
		cubes.push([sphere,cube][Math.round(Math.random())](100,projection));
		cubes[cubes.length-1].hue = (360/10) * c;
		cubes[cubes.length-1].detail = 8;
	}
	
	function setPositions() {
		cubes.forEach(function(cube) {
			cube.radius = cube.size = 20 + Math.ceil(Math.random()*100);
			cube.x = Math.floor(-500+Math.random()*1000);
			cube.y = Math.floor(-500+Math.random()*1000);
			cube.z = Math.floor(-500+Math.random()*1000);
			cube.axis = ['x','y','z'][Math.floor(Math.random()*3)];
			cube.direction = [-1,+1][Math.floor(Math.random()*2)];
			cube.speed = Math.random()*4;
		});
		
		window.setTimeout(setPositions,439*8); //136.5BPM
	}
	
	
	function runProjection() {
		// Reset display surface
		canvas.width = width;
		
		var frameStarted = (new Date()).getTime();
		
		// Draw axes
		context.lineWidth = 3;
		context.strokeStyle = "red";
		context.beginPath()
		context.moveTo.apply(context,projection.project(0,0,0));
		context.lineTo.apply(context,projection.project(300,0,0));
		context.stroke();
		
		context.strokeStyle = "lime";
		context.beginPath()
		context.moveTo.apply(context,projection.project(0,0,0));
		context.lineTo.apply(context,projection.project(0,0,300));
		context.stroke();
		
		context.strokeStyle = "blue";
		context.beginPath()
		context.moveTo.apply(context,projection.project(0,0,0));
		context.lineTo.apply(context,projection.project(0,300,0));
		context.stroke();
		
		
		// Create storage for faces
		var faces = [];
		
		// Move cubes according to speed and direction, and then collect faces...
		cubes.forEach(function(cube) {
			cube[cube.axis] += cube.direction * cube.speed;
			cube[cube.axis + "Rotation"] += (cube.direction * cube.speed);
							
			// faces = faces.concat(cube.subdivideTriangles(cube.triangles(),2));
			faces = faces.concat(cube.triangles());
		});
		
		var totalFaces = faces.length;
		
		// Only return the faces we're actually going to draw...
		faces = faces.filter(function(face) {
			return projection.shouldDrawPolygon(face,width,height);
		});
		
		// Sort by draw order...
		faces = faces.sort(function(facea,faceb) {
			return projection.camera.distanceTo(faceb) - projection.camera.distanceTo(facea);
		});
		
		var cameraVector = projection.camera.getVector();
		
		context.lineWidth = 1;
		// Draw faces
		faces.forEach(function(face) {
			var lightness = 0;
			var surfaceNormal = projection.findNormal(face);
			
			var dotProduct = [
				(surfaceNormal[0] * cameraVector[0]) +
				(surfaceNormal[1] * cameraVector[1]) +
				(surfaceNormal[2] * cameraVector[2])
			];
			
			// if (dotProduct > 0) {
				lightness = lightness + Math.abs(dotProduct / 20);
				lightness = lightness > 90 ? 90 : lightness;
				
				context.fillStyle = "hsla(" + hue + ",100%," + lightness + "%,1)";
				context.strokeStyle = "hsla(" + hue + ",100%," + lightness + "%,1)";
				
				context.beginPath();
				context.moveTo.apply(context,projection.project(face[0][0],face[0][1],face[0][2]));
				face.forEach(function(point,index) {
					if (index) context.lineTo.apply(context,projection.project(point[0],point[1],point[2]));
				});
				context.closePath();
				context.fill();
				// context.stroke();
			// }
		});
		
		context.fillStyle = "white";
		context.fillRect(10,10,130,15);
		context.fillStyle = "black";
		context.fillText("Drawing " + faces.length + "/" + totalFaces + " Polygons",15,20);
		
		var timeElapsed = ((new Date().getTime()) - startTime)/1000;
		var frameTime = ((new Date().getTime()) - frameStarted);
		cumulativeFrameTime += frameTime;
		var fps = Math.round(framesPast/timeElapsed);
		
		context.fillStyle = "white";
		context.fillRect(250,10,50,15);
		context.fillStyle = "black";
		context.fillText("FPS: " + fps,250,20);
		
		context.fillText("FrameTime: " + (cumulativeFrameTime/framesPast),350,20);
		
		framesPast ++;
		hue++;
		
		// Hopefully that's safe for the near future
		//if (window.webkitRequestAnimationFrame)	webkitRequestAnimationFrame(runProjection,canvas);
		//if (window.msieRequestAnimationFrame)	msieRequestAnimationFrame(runProjection,canvas);
		//if (window.mozRequestAnimationFrame)	mozRequestAnimationFrame(runProjection,canvas);
		//if (window.oRequestAnimationFrame) 		oRequestAnimationFrame(runProjection,canvas);
		//if (window.requestAnimationFrame)		requestAnimationFrame(runProjection,canvas);
		window.setTimeout(runProjection,0);
	}
	
	setPositions();
	runProjection();
},false);