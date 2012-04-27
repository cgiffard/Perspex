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
	
	function splineAdjoins(splinea,splineb) {
		return	splinea[0] === splineb[0] ||
				splinea[1] === splineb[0] || 
				splinea[0] === splineb[1] ||
				splinea[1] === splineb[1];
	}

	// Actual Cube Function

	function Cube(size,projection) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xRotation = 0;
		this.yRotation = 0;
		this.zRotation = 0;
		this.size = size ? size : 1;
		this.projection = projection;
	}

	Cube.prototype = {
		"constructor": Cube,
		
		// Generate cube points
		points: function() {
			var points = [], x, y, z;
			for (x = 0; x <= 1; x++)
				for (y = 0; y <= 1; y++)
					for (z = 0; z <= 1; z++)
						points.push([
							x ? (this.size / 2) *-1 : this.size / 2,
							y ? (this.size / 2) *-1 : this.size / 2,
							z ? (this.size / 2) *-1 : this.size / 2
						]);
		
			return points;
		},
	
		rotatePoints: function() {
			var pointArray = this.points(),
				transformedArray = [],
				self = this;
		
			pointArray.forEach(function(point) {
				point = rotateZ(rotateY(rotateX(point,self.xRotation),self.yRotation),self.zRotation);
				transformedArray.push([
					point[0] + self.x,
					point[1] + self.y,
					point[2] + self.z
				]);
			});
		
			return transformedArray;
		},
	
		splines: function() {
			var points = this.rotatePoints(),
				splines = [],
				self = this;
		
			function isDirectlyAdjacent(pointa,pointb) {
				return Math.floor(pointDistance(pointa,pointb)) <= self.size;
			}
		
			points.forEach(function(point) {
				points
					.filter(function(fPoint) {
						return fPoint !== point && isDirectlyAdjacent(point,fPoint);
					})
					.forEach(function(point2) {
						if (!splines.reduce(function(prev,cur) {
								return prev || (cur[0] === point && cur[1] === point2) || (cur[1] === point && cur[0] === point2);
							},false)) {
						
							splines.push([point,point2]);
						}
					});
			});
			
			return splines;
		},
	
		triangles: function() {
			var splines = this.splines(),
				triangles = [],
				cleanTriangles = [],
				self = this;
		
			splines.forEach(function(spline) {
				splines
					.filter(function(fSpline) {
						return fSpline !== spline && splineAdjoins(spline,fSpline);
					})
					.forEach(function(spline2) {
						var polygon = [];
						spline
							.concat(spline2)
							.forEach(function(point) {
								if (!polygon.reduce(function(prev,cur) {
										return prev || cur === point;
									},false)) {
									polygon.push(point);
								}
							});
					
						polygon.cube = self;
						triangles.push(polygon);
					});
			});
		
			// Determines whether the polygon already exists in the clean list
			// or, whether it intersects a polygon in the clean list
			function validForCleanList(candidateTri) {
				// Just return true if there's no triangles in the list yet.
				if (!cleanTriangles.length) return true;
			
				// Using a traditional loop that we can break out of easily.
				for (var triIndex = 0; triIndex < cleanTriangles.length; triIndex ++) {
					var cleanTri = cleanTriangles[triIndex];
					var candidateTriMidpoint = self.projection.findMidpoint(candidateTri),
						cleanTriMidpoint = self.projection.findMidpoint(cleanTri);
				
					var midpointDistance = pointDistance(candidateTriMidpoint,cleanTriMidpoint);
				
					// We're the same triangle!
					if (candidateTriMidpoint === cleanTriMidpoint) return false;
				
					if (midpointDistance < self.size/2.2) {
						return false;
					}
				}
			
				// We didn't die. Must be valid!
				return true;
			}
		
			// Scour triangles for clean list validity.
			triangles.forEach(function(triangle) {
				if (validForCleanList(triangle)) cleanTriangles.push(triangle);
			});
		
			// Reorder triangles to ensure clockwise orientation
			cleanTriangles = cleanTriangles.map(function(triangle) {
				var surfaceNormal = self.projection.findNormal(triangle);
			
				var surfaceMidpoint = self.projection.findMidpoint(triangle);
			
				var vectorOut = [
					surfaceMidpoint[0] + (surfaceNormal[0] * (self.size/4)),
					surfaceMidpoint[1] + (surfaceNormal[1] * (self.size/4)),
					surfaceMidpoint[2] + (surfaceNormal[2] * (self.size/4))
				];
			
				var surfaceMidpointOffset = pointDistance([0,0,0],surfaceMidpoint),
					vectorOutOffset = pointDistance([0,0,0],vectorOut);
			
				if (vectorOutOffset < surfaceMidpointOffset) {
					triangle = triangle.reverse();
				}
			
				return triangle;
			});
		
			return cleanTriangles;
		},
	
		// Interpolate triangles. Does not modify geometry shape.
		subdivideTriangles: function(trianglesIn, iterations) {
			var trianglesOut = [], self = this;
			iterations --;
		
			trianglesIn.forEach(function(triangle) {
				var midpoints = [];
				var masterNormal = self.projection.findNormal(triangle);
			
				triangle.forEach(function(point,index) {
					var current 	= point,
						next		= triangle[(index + 1) % triangle.length],
						next2		= triangle[(index + 2) % triangle.length],
						edgePoint	= self.projection.findMidpoint([current,next]),
						edgePoint2	= self.projection.findMidpoint([next2,current]);
				
					midpoints.push(edgePoint);
					trianglesOut.push([
						current,
						edgePoint,
						edgePoint2
					]);
				});
			
				trianglesOut.push(midpoints);
			})
		
			if (iterations > 0) trianglesOut = self.subdivideTriangles(trianglesOut,iterations);
			return trianglesOut;
		}
	}
	
	function cube(size,projection) {
		return new Cube(size,projection);
	}
	
	(typeof module != "undefined" && module.exports) ? (module.exports = cube) : (typeof define != "undefined" ? (define("cube", [], function() { return cube; })) : (context.cube = cube));
})(this);