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
	var cameraX = -100,
		cameraY = 100,
		cameraZ = -100
		crotX = 0,
		crotY = -1,
		crotZ = -0.5,
		pupilWidth = width,
		pupilHeight = height,
		fieldOfView = 60, // 60 degrees
		viewDepth = (Math.tan(fieldOfView * (Math.PI/180)) * (pupilWidth/2));
		
	
	// Set up camera and projection
	var camera		= new perspex.Camera(cameraX,cameraY,cameraZ,crotX,crotY,crotZ,pupilWidth,pupilHeight,viewDepth),
		projection	= perspex(camera,{ clamp: false });
	
	var cameraToolbar = new PerspexToolbar(camera);
		cameraToolbar.appendTo(document.body);
		cameraToolbar.on("update",runProjection);
	
	
	var cubes = [];
	
	// for (var c = 0; c < 100; c ++) {
	// 		cubes.push(new Cube(20+Math.ceil(Math.random()*100),projection));
	// 		cubes[cubes.length-1].hue = (360/100) * c;
	// 	}
	
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
		
		canvas.lineWidth = 3;
		
		// Much easier if we draw our axes
	    // draw the x-axis
		if (projection.shouldDrawPolygon([[0,0,0],[500,0,0],[0,0,0]]) || 1) {
		    context.strokeStyle = '#FF0000';
		    context.beginPath();
		    context.moveTo.apply(context, projection.project(0, 0, 0));
		    context.lineTo.apply(context, projection.project(500, 0, 0));
		    context.closePath();
		    context.stroke();
		}
    	
		if (projection.shouldDrawPolygon([[0,0,0],[0,500,0],[0,0,0]]) || 1) {
		    // draw the y-axis
		    context.strokeStyle = '#00FF00';
		    context.beginPath();
		    context.moveTo.apply(context, projection.project(0, 0, 0));
		    context.lineTo.apply(context, projection.project(0, 500, 0));
		    context.closePath();
		    context.stroke();
		}
    	
		if (projection.shouldDrawPolygon([[0,0,0],[0,0,500],[0,0,0]]) || 1) {
			// draw the z-axis
		    context.strokeStyle = '#0000FF';
		    context.beginPath();
		    context.moveTo.apply(context, projection.project(0, 0, 0));
		    context.lineTo.apply(context, projection.project(0, 0, 500));
			
			if (projection.shouldDrawPolygon([[0,0,0],[500,0,500],[0,0,0]])) {
			    context.lineTo.apply(context, projection.project(500, 0, 500));
			}
		    context.stroke();
		}
		
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
		
		faces = faces.filter(function(face) {
			return projection.shouldDrawPolygon(face.points);
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
		
		// Draw faces
		faces.forEach(function(face) {
			context.fillStyle = "hsla(" + (face.cube.hue || 0) + ",100%,50%,0.5)";
			
			context.beginPath();
			context.moveTo.apply(context,projection.project(face.points[0][0],face.points[0][1],face.points[0][2]));
			face.points.forEach(function(point,index) {
				if (index) context.lineTo.apply(context,projection.project(point[0],point[1],point[2]));
			});
			context.closePath();
			context.fill();
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
					points.push([
						x ? this.x : this.x + this.size,
						y ? this.y : this.y + this.size,
						z ? this.z : this.z + this.size
					]);
		
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
