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
	var cameraX = -900, cameraY = 0, cameraZ = -1300;
	var crotX = 0.4, crotY = 0.2, crotZ = 0.1;
	
	// Set up camera and projection
	var camera		= new perspex.Camera(cameraX,cameraY,cameraZ,crotX,crotY,crotZ,width,height,-2000),
		projection	= perspex(camera,{ clamp: false });
	
	// Listening for mouse events
	canvas.addEventListener("mousemove",function(eventData) {
		var cX = canvas.width - eventData.clientX, cY = eventData.clientY;
		crotY = 0.2 - (0.2 - (cX / canvas.width)*0.4)
		crotX = 0.4 - (0.2 - (cY / canvas.height)*0.4)
		
		camera.setRotation(crotX, crotY, crotZ);
	});
	
	var cubes = [];
	for (var c = 0; c < 20; c++) {
		cubes.push(new Cube(20+Math.ceil(Math.random()*100),projection));
		cubes[cubes.length-1].hue = Math.ceil((360/20)*c);
	}
	
	function setPositions() {
		cubes.forEach(function(cube) {
			cube.x = Math.floor(-100+Math.random()*200);
			cube.y = Math.floor(-100+Math.random()*200);
			cube.z = Math.floor(-100+Math.random()*200);
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
			
			return 1 || dp < 0;
		});
		
		// Draw faces
		faces.forEach(function(face) {
			context.fillStyle = "hsla(" + (face.cube.hue || 0) + ",100%,50%,1)";
			
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
		if (webkitRequestAnimationFrame)	window.webkitRequestAnimationFrame(runProjection,canvas);
		if (msieRequestAnimationFrame)		window.msieRequestAnimationFrame(runProjection,canvas);
		if (mozRequestAnimationFrame)		window.mozRequestAnimationFrame(runProjection,canvas);
		if (oRequestAnimationFrame) 		window.oRequestAnimationFrame(runProjection,canvas);
		if (requestAnimationFrame)			window.requestAnimationFrame(runProjection,canvas);
	}
	
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
