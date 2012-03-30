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
	var cameraX = -1300, cameraY = 0, cameraZ = -1300;
	var crotX = 0.4, crotY = 0.2, crotZ = 0;
	
	var toolbar = document.createElement("div");
	toolbar.style.backgroundColor = "#333";
	toolbar.style.color = "white";
	toolbar.style.height = "30px";
	toolbar.style.width = "100%";
	toolbar.style.position = "absolute";
	toolbar.style.bottom = "0px";
	toolbar.style.left = "0px";
	toolbar.style.fontFamily = "sans-serif";
	toolbar.style.lineHeight = "30px";
	
	toolbar.innerHTML = "CameraX: <input camerax value='" + cameraX + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	toolbar.innerHTML += " CameraY: <input cameray value='" + cameraY + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	toolbar.innerHTML += " CameraZ: <input cameraz value='" + cameraZ + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	
	toolbar.innerHTML += "rotX: <input rotx value='" + crotX + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	toolbar.innerHTML += "rotY: <input roty value='" + crotY + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	toolbar.innerHTML += "rotZ: <input rotz value='" + crotZ + "' style='background-color: #555; color: white; border: solid #999 1px; width: 40px;'/>";
	
	document.body.appendChild(toolbar);
	
	var xinput = _q("[camerax]")[0],
		yinput = _q("[cameray]")[0],
		zinput = _q("[cameraz]")[0],
		rxinput = _q("[rotx]")[0],
		ryinput = _q("[rotz]")[0],
		rzinput = _q("[roty]")[0];
	
	xinput.addEventListener("keydown",function(event) {
		if (event.keyCode === 38) {
			cameraX += 10;
			xinput.value = cameraX;
		}
		
		if (event.keyCode === 40) {
			cameraX -= 10;
			xinput.value = cameraX;
		}
		
		camera.setPosition(cameraX, cameraY, cameraZ);
		runProjection();
		
	});
	
	yinput.addEventListener("keydown",function(event) {
		if (event.keyCode === 38) {
			cameraY += 10;
			yinput.value = cameraY;
		}
		
		if (event.keyCode === 40) {
			cameraY -= 10;
			yinput.value = cameraY;
		}
		
		camera.setPosition(cameraX, cameraY, cameraZ);
		runProjection();
		
	});
	
	zinput.addEventListener("keydown",function(event) {
		if (event.keyCode === 38) {
			cameraZ += 10;
			zinput.value = cameraZ;
		}
		
		if (event.keyCode === 40) {
			cameraZ -= 10;
			zinput.value = cameraZ;
		}
		
		camera.setPosition(cameraX, cameraY, cameraZ);
		runProjection();
	});
	
	var chgFunc = function() {
		cameraX = parseFloat(xinput.value);
		cameraY = parseFloat(yinput.value);
		cameraZ = parseFloat(zinput.value);
		
		camera.setPosition(cameraX, cameraY, cameraZ);
		runProjection();
	};
	
	xinput.addEventListener("change",chgFunc);
	yinput.addEventListener("change",chgFunc);
	zinput.addEventListener("change",chgFunc);
	
	
	// Set up camera and projection
	var camera		= new perspex.Camera(cameraX,cameraY,cameraZ,crotX,crotY,crotZ,width,height,-2000),
		projection	= perspex(camera,{ clamp: false });
	
	// Listening for mouse events
	canvas.addEventListener("mousemove",function(eventData) {
		var cX = canvas.width - eventData.clientX, cY = eventData.clientY;
		crotY = 0.5 - (0.2 - (cX / canvas.width)*0.4)
		crotX = 0.2 - (0.2 - (cY / canvas.height)*0.4)
		
		rxinput.value = crotX;
		ryinput.value = crotY;
		rzinput.value = crotZ;
		
		camera.setRotation(crotX, crotY, crotZ);
		runProjection();
	});
	
	var cubes = [];
	// for (var x = -300; x < 300; x += 50) {
	// 	for (var y = -300; y < 300; y += 50) {
	// 		for (var z = -300; z < 300; z += 50) {
	// 			cubes.push(new Cube(20,projection));
	// 			cubes[cubes.length-1].x = x;
	// 			cubes[cubes.length-1].y = y;
	// 			cubes[cubes.length-1].z = z;
	// 			cubes[cubes.length-1].hue = Math.ceil((360/(200*200*200))*(x*y*z));
	// 		}
	// 	}
	// }
	
	
	for (var c = 0; c < 100; c ++) {
		cubes.push(new Cube(20+Math.ceil(Math.random()*100),projection));
		cubes[cubes.length-1].hue = (360/100) * c;
	}
	
	function setPositions() {
		cubes.forEach(function(cube) {
			cube.size = 20+Math.ceil(Math.random()*100);
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
		
		// Much easier if we draw our axes
	    // draw the x-axis
	    context.strokeStyle = '#FF0000';
	    context.beginPath();
	    context.moveTo.apply(context, projection.project(0, 0, 0));
	    context.lineTo.apply(context, projection.project(500, 0, 0));
	    context.closePath();
	    context.stroke();
    
	    // draw the y-axis
	    context.strokeStyle = '#00FF00';
	    context.beginPath();
	    context.moveTo.apply(context, projection.project(0, 0, 0));
	    context.lineTo.apply(context, projection.project(0, 500, 0));
	    context.closePath();
	    context.stroke();
    
	    // draw the z-axis
	    context.strokeStyle = '#0000FF';
	    context.beginPath();
	    context.moveTo.apply(context, projection.project(0, 0, 0));
	    context.lineTo.apply(context, projection.project(0, 0, 500));
	    context.lineTo.apply(context, projection.project(500, 0, 500));
	    context.stroke();
		
		context.fillText.apply(context, ["0,0,0"].concat(projection.project(0, 0, 0)));
		context.fillText.apply(context, ["500X"].concat(projection.project(500, 0, 0)));
		context.fillText.apply(context, ["500Y"].concat(projection.project(0, 500, 0)));
		context.fillText.apply(context, ["500Z"].concat(projection.project(0, 0, 500)));
		context.fillText.apply(context, ["500XYZ"].concat(projection.project(500, 500, 500)));
		
		// Create storage for faces
		var faces = [];
		
		// Move cubes according to speed and direction, and then collect faces...
		cubes.forEach(function(cube) {
			cube[cube.axis] += cube.direction * cube.speed;
			faces = faces.concat(cube.faces());
		});
		
		// Sort by distance from camera
		faces.forEach(function(face) {
			var averageXYZ = 0;
			face.points.forEach(function(point) {
				averageXYZ += point.x + point.y + point.z;
			});
			
			face.averagePosition = averageXYZ / (3 * 4);
		});
		
		var cameraPosition = (cameraX + cameraY + cameraZ) / 3;
		faces = faces.sort(function(facea,faceb) {
			// temp, doesn't take into account camera position
			return (faceb.averagePosition - cameraPosition) - (facea.averagePosition - cameraPosition);
		});
		
		// Cull backfaces
		faces = faces.filter(function(face) {
			var vec1 = {dx: face.points[0].x - face.points[1].x,
						dy: face.points[0].y - face.points[1].y,
						dz: face.points[0].z - face.points[1].z};
			
			var vec2 = {dx: face.points[2].x - face.points[1].x,
						dy: face.points[2].y - face.points[1].y,
						dz: face.points[2].z - face.points[1].z};
			
			var crossProduct = {dx: vec1.dy * vec2.dz - vec1.dz * vec2.dy,
								dy: vec1.dz * vec2.dx - vec1.dx * vec2.dz,
								dz: vec1.dx * vec2.dy - vec1.dy * vec2.dx};
			
			var cameraVector = {dx: cameraX - (face.points[0].x + face.points[1].x + face.points[2].x) / 3,
								dy: cameraY - (face.points[0].y + face.points[1].y + face.points[2].y) / 3,
								dz: cameraZ - (face.points[0].z + face.points[1].z + face.points[2].z) / 3}
			
			var dp =	crossProduct.dx * cameraVector.dx + 
						crossProduct.dy * cameraVector.dy + 
						crossProduct.dz * cameraVector.dz;
			
			return dp < 0;
		});
		
		// Draw faces
		faces.forEach(function(face) {
			context.fillStyle = "hsla(" + (face.cube.hue || 0) + ",100%,50%,0.5)";
			
			context.beginPath();
			context.moveTo.apply(context,projection.project(face.points[0].x,face.points[0].y,face.points[0].z));
			face.points.forEach(function(point,index) {
				if (index) context.lineTo.apply(context,projection.project(point.x,point.y,point.z));
			});
			context.closePath();
			context.fill();
			// context.stroke();
		});
		
		// Hopefully that's safe for the near future
		//if (webkitRequestAnimationFrame)	window.webkitRequestAnimationFrame(runProjection,canvas);
		//if (msieRequestAnimationFrame)		window.msieRequestAnimationFrame(runProjection,canvas);
		//if (mozRequestAnimationFrame)		window.mozRequestAnimationFrame(runProjection,canvas);
		//if (oRequestAnimationFrame) 		window.oRequestAnimationFrame(runProjection,canvas);
		//if (requestAnimationFrame)			window.requestAnimationFrame(runProjection,canvas);
	}
	window.setInterval(runProjection,33);
	setPositions();
	runProjection();
},false);

function Cube(size,projection) {
	this.size = size;
	this.projection = projection;
	this.x = 0;
	this.y = 0;
	this.z = 0;
}

Cube.prototype = {
		
	rotation: function(x,y,z) {
		// later.
	},
		
	points: function() {
		var points = [], x, y, z;
		for (x = 0; x <= 1; x++)
			for (y = 0; y <= 1; y++)
				for (z = 0; z <= 1; z++)
					points.push({
						x: x ? this.x : this.x + this.size,
						y: y ? this.y : this.y + this.size,
						z: z ? this.z : this.z + this.size
					});
		
		return points;
	},
		
	lines: function() {
		var points = this.points(), lines = [];
		var size = this.size;
		var c = this;
		
		function pointsAdjacent(pointA,pointB) {
			var xDiff = Math.abs(((pointA.x-c.x)/size) - ((pointB.x-c.x)/size));
			var yDiff = Math.abs(((pointA.y-c.y)/size) - ((pointB.y-c.y)/size));
			var zDiff = Math.abs(((pointA.z-c.z)/size) - ((pointB.z-c.z)/size));
			return (xDiff + yDiff + zDiff) === 1;
		}
		
		points.forEach(function(pointA,indexA) {
			points.forEach(function(pointB,indexB) {
				if (indexA !== indexB) {
					if (pointsAdjacent(pointA,pointB)) {
						lines.push([pointA,pointB]);
					}
				}
			});
		});
			
		return lines;
	},
		
	faces: function() {
		var faces = [], points = this.points();
		var w = this.size
		faces = [
			{points:[
				points[2], // 3
				points[6], // 7
				points[7], // 8
				points[3]  // 4
			],cube:this},
			{points:[
				points[0], // 1
				points[1], // 2
				points[3], // 4
				points[2]  // 3
			],cube:this},
			{points:[
				points[0], // 1
				points[4], // 5
				points[6], // 7
				points[2]  // 3
			],cube:this},
			{points:[
				points[4], // 5
				points[5], // 6
				points[7], // 8
				points[6]  // 7
			],cube:this},
			{points:[
				points[5], // 6
				points[1], // 2
				points[3], // 4
				points[7], // 8
			],cube:this},
			{points:[
				points[0], // 1
				points[4], // 5
				points[5], // 6
				points[1]  // 2
			],cube:this}
		]
		
		return faces;
	}
};
