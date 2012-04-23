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
	var cameraX = 200,
		cameraY = 100,
		cameraZ = -1500
		crotX = -0.07,
		crotY = 3.27,
		crotZ = -0.06,
		pupilWidth = width,
		pupilHeight = height,
		fieldOfView = 60, // 60 degrees
		viewDepth = (Math.tan(fieldOfView * (Math.PI/180)) * (pupilWidth/2));
	
	var startTime = (new Date()).getTime();
	var framesPast = 0;
	
	
	// Set up camera and projection
	var camera		= new perspex.Camera(cameraX,cameraY,cameraZ,crotX,crotY,crotZ,pupilWidth,pupilHeight,viewDepth),
		projection	= perspex(camera,{ clamp: false });
	
	var cameraToolbar = new PerspexToolbar(camera);
		cameraToolbar.appendTo(document.body);
		// cameraToolbar.on("update",runProjection);
	
	var cubes = [];
	
	for (var c = 0; c < 10; c ++) {
		cubes.push(new Cube(100,projection));
		cubes[cubes.length-1].hue = (360/10) * c;
	}
	
	function setPositions() {
		cubes.forEach(function(cube) {
			// cube.size = 20+Math.ceil(Math.random()*100);
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
		
		// Create storage for faces
		var faces = [];
		
		// Move cubes according to speed and direction, and then collect faces...
		cubes.forEach(function(cube) {
			cube[cube.axis] += cube.direction * cube.speed;
			cube[cube.axis + "Rotation"] += (cube.direction * cube.speed);
			
			faces = faces.concat(cube.triangles());
		});
		// console.log(cubes);
		var totalFaces = faces.length;
		// Only return the faces we're actually going to draw...
		faces = faces.filter(function(face) {
			return projection.shouldDrawPolygon(face,width,height);
		});
		
		// Sort by draw order...
		faces = faces.sort(function(facea,faceb) {
			return projection.camera.distanceTo(facea) - projection.camera.distanceTo(faceb);
		});
		
		var cameraPosition = (cameraX + cameraY + cameraZ) / 3;
		faces = faces.sort(function(facea,faceb) {
			// temp, doesn't take into account camera position
			return (faceb.averagePosition - cameraPosition) - (facea.averagePosition - cameraPosition);
		});
		
		// Draw faces
		faces.forEach(function(face) {
			var lightness = 20;
			var surfaceNormal = projection.findNormal(face);
			var cameraVector = projection.camera.getVector();
			
			var dotProduct = [
				(surfaceNormal[0] * cameraVector[0]) +
				(surfaceNormal[1] * cameraVector[1]) +
				(surfaceNormal[2] * cameraVector[2])
			];
			
			lightness = lightness + Math.abs(dotProduct / 25);
			lightness = lightness > 100 ? 100 : lightness;
			
			context.fillStyle = "hsla(" + face.cube.hue + ",100%," + lightness + "%,1)";
			context.strokeStyle = "hsla(" + face.cube.hue + ",100%," + lightness + "%,1)";
			
			context.beginPath();
			context.moveTo.apply(context,projection.project(face[0][0],face[0][1],face[0][2]));
			face.forEach(function(point,index) {
				
				// context.fillRect.apply(context,projection.project(point[0],point[1],point[2]).concat([3,3]));
				if (index) context.lineTo.apply(context,projection.project(point[0],point[1],point[2]));
			});
			context.closePath();
			context.fill();
			context.stroke();
		});
		
		context.fillStyle = "white";
		context.fillRect(10,10,130,15);
		context.fillStyle = "black";
		context.fillText("Drawing " + faces.length + "/" + totalFaces + " Polygons",15,20);
		
		var timeElapsed = (new Date().getTime()) - startTime;
		var fps = Math.round(timeElapsed / framesPast);
		
		context.fillStyle = "white";
		context.fillRect(250,10,50,15);
		context.fillStyle = "black";
		context.fillText("FPS: " + fps,250,20);
		
		
		framesPast ++;
		
		// Hopefully that's safe for the near future
		// if (window.webkitRequestAnimationFrame)	webkitRequestAnimationFrame(runProjection,canvas);
		// 		if (window.msieRequestAnimationFrame)	msieRequestAnimationFrame(runProjection,canvas);
		// 		if (window.mozRequestAnimationFrame)	mozRequestAnimationFrame(runProjection,canvas);
		// 		if (window.oRequestAnimationFrame) 		oRequestAnimationFrame(runProjection,canvas);
		// 		if (window.requestAnimationFrame)		requestAnimationFrame(runProjection,canvas);
	}
	
	window.setInterval(runProjection,50);
	
	setPositions();
	runProjection();
},false);