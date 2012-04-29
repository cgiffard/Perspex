(function (context) {
	
	// Helper functions for vector maths
	function rotateX(point, angle) {
	    var rad		= angle * Math.PI / 180,
			cosa	= Math.cos(rad),
			sina	= Math.sin(rad),
			x, y, z;
		
	    y = point[1] * cosa - point[2] * sina;
	    z = point[1] * sina + point[2] * cosa;
	    return [point[0], y, z];
	}
	
	function rotateY(point, angle) {
	    var rad		= angle * Math.PI / 180,
			cosa	= Math.cos(rad),
			sina	= Math.sin(rad),
			x, y, z;
		
	    z = point[2] * cosa - point[0] * sina;
	    x = point[2] * sina + point[0] * cosa;
	    return [x, point[1], z];
	}
	
	function rotateZ(point, angle) {
	    var rad		= angle * Math.PI / 180,
			cosa	= Math.cos(rad),
			sina	= Math.sin(rad),
			x, y, z;
		
	    x = point[0] * cosa - point[1] * sina;
	    y = point[0] * sina + point[1] * cosa;
	    return [x, y, point[2]];
	}
	
	function pointDistance(pointa,pointb) {
		var comparisonVector = [
			pointa[0] - pointb[0],
			pointa[1] - pointb[1],
			pointa[2] - pointb[2]
		];
		
		return Math.sqrt(Math.pow(comparisonVector[0],2) + Math.pow(comparisonVector[1],2) + Math.pow(comparisonVector[2],2));
	}
	
	// Actual Sphere Function

	function Sphere(radius,projection) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xRotation = 0;
		this.yRotation = 0;
		this.zRotation = 0;
		this.radius = radius ? radius : 1;
		this.projection = projection;
		this.detail = 10; // 10 subdivisions per (2D) rotation
	}

	Sphere.prototype = {
		"constructor": Sphere,
		
		// Generate sphere points
		points: function() {
			var points = [], x, y, z,
				radConvert = Math.PI / 180,
				iterator = 360/this.detail;
			
			// Run two rotations... XZ and YZ
			for (var xzRot = 0; xzRot < 360; xzRot += iterator) {
				for (var yzRot = 0; yzRot < 180; yzRot += iterator) {
					y = Math.cos(yzRot * radConvert) * this.radius;
					z = Math.sin(yzRot * radConvert) * this.radius;
					x = 0;
					
					point = rotateY([x,y,z],xzRot + (this.yRotation || 0));
					if (this.xRotation) point = rotateX(point,this.xRotation);
					if (this.zRotation) point = rotateZ(point,this.zRotation);
					
					point[0] += this.x;
					point[1] += this.y;
					point[2] += this.z;
					
					points.push(rotateY([x,y,z],xzRot));
				}
			}
		
			return points;
		},
		
		// Generate sphere points
		triangles: function() {
			var x, y, z,
				rings = [],
				triangles = [],
				radConvert = Math.PI / 180,
				iterator = 180/this.detail,
				point = [0,0,0];
			
			// Run two rotations... XZ and YZ
			for (var xzRot = 0; xzRot < 360; xzRot += iterator * 2) {
				
				// Add another ring to the stack
				rings.push([]);
				
				for (var yzRot = 0; Math.floor(yzRot) <= 180; yzRot += iterator) {
					y = Math.cos(yzRot * radConvert) * this.radius;
					z = Math.sin(yzRot * radConvert) * this.radius;
					x = 0;
					
					point = rotateY([x,y,z],xzRot + (this.yRotation || 0));
					if (this.xRotation) point = rotateX(point,this.xRotation);
					if (this.zRotation) point = rotateZ(point,this.zRotation);
					
					point[0] += this.x;
					point[1] += this.y;
					point[2] += this.z;
					
					rings[rings.length-1].push(point);
				}
			}
		
			rings.forEach(function(ring,index) {
				var nextRing = rings[(index + 1) % rings.length];
				var point
				
				ring.forEach(function(point,index) {
					if (index < ring.length - 1) {
						var nextPoint = ring[index+1],
							nextRingPoint = nextRing[index],
							nextRingNextPoint = nextRing[index+1];
						
						if (index < ring.length - 2) {
							triangles.push([
								point,
								nextPoint,
								nextRingPoint
							],
							[
								nextRingNextPoint,
								nextRingPoint,
								nextPoint,
							]);
						} else {
							triangles.push([
								point,
								nextPoint,
								nextRingPoint
							]);
						}
					}
				});
			});
			
			return triangles;
		}
	}
	
	function sphere(size,projection) {
		return new Sphere(size,projection);
	}
	
	(typeof module != "undefined" && module.exports) ? (module.exports = sphere) : (typeof define != "undefined" ? (define("sphere", [], function() { return sphere; })) : (context.sphere = sphere));
})(this);
