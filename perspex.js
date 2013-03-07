// perspex 0.0.1
// ────────────────────────────────────────────────────────────────────────────────────────
// Perspective Projection Math Helpers
// ────────────────────────────────────────────────────────────────────────────────────────
// Structure flogged ungratefully from DamonOehlman/isomath

(function (glob) {
	// There's a lot we can do to improve the performance still (such as precaching Math.* calls.)
	// For performance reasons, I may move away from objects for setting camera/view position and rotation.
	// I'll have to run some benchmarks first.
	
	// Helpers -------------- //
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
	
	
	// Helper function for determining the distance between two 3D points
	function pointDistance(pointa,pointb) {
		var comparisonVector = [
			pointa[0] - pointb[0],
			pointa[1] - pointb[1],
			pointa[2] - pointb[2]
		];
		
		return Math.sqrt(Math.pow(comparisonVector[0],2) + Math.pow(comparisonVector[1],2) + Math.pow(comparisonVector[2],2));
	}
	
	// Rotates a point in 3D space, by an arbitrary X, Y, and X value
	function rotatePoint(point,angleX,angleY,angleZ) {
		var radConvert = (Math.PI / 180),
			x = point[0],
			y = point[1],
			z = point[2];
		
		y = y * Math.cos(angleX * radConvert) - z * Math.sin(angleX * radConvert);
		z = y * Math.sin(angleX * radConvert) + z * Math.cos(angleX * radConvert);
		z = z * Math.cos(angleY * radConvert) - x * Math.sin(angleY * radConvert);
		x = z * Math.sin(angleY * radConvert) + x * Math.cos(angleY * radConvert);
		x = x * Math.cos(angleZ * radConvert) - y * Math.sin(angleZ * radConvert);
		y = x * Math.sin(angleZ * radConvert) + y * Math.cos(angleZ * radConvert);
		
		return [x,y,z];
	}
	
	
	// Θ represents camera (c) rotation, in xyz, euler transform
	// c is camera position, in xyz
	// d is transformed point in xyz
	// a is point to project, in xyz
	// b is final projected point, in 2D XY
	// e is the view distance relative to the display surface.
	
	// Not using vec3s any more for performance reasons
	function Camera(cX,cY,cZ, Θx,Θy,Θz, eX,eY,eZ) {
		// Camera position
		this.setPosition(cX,cY,cZ);
		
		// Camera rotation
		this.setRotation(Θx,Θy,Θz);
		
		// View position
		this.setViewOffset(eX,eY,eZ);
		
		// Projection for later storage.
		this.projection = null;
	}
	
	Camera.prototype = {
		setPosition: function(cX,cY,cZ) {
			// Camera position
			this.cX = cX && !isNaN(cX) ? cX : 0;
			this.cY = cY && !isNaN(cY) ? cY : 0;
			this.cZ = cZ && !isNaN(cZ) ? cZ : 0;
		},
		
		setRotation: function(Θx,Θy,Θz) {
			// Camera rotation
			this.Θx = Θx && !isNaN(Θx) ? Θx : 0;
			this.Θy = Θy && !isNaN(Θy) ? Θy : 0;
			this.Θz = Θz && !isNaN(Θz) ? Θz : 0;
		},
		
		setViewOffset: function(eX,eY,eZ) {
			// View offset XYZ
			this.eX = eX && !isNaN(eX) ? eX : 0;
			this.eY = eY && !isNaN(eY) ? eY : 0;
			this.eZ = eZ && !isNaN(eZ) ? eZ : 0;
		},
		
		// Finds the camera vector based on its location and pupil dimensions.
		getVector: function() {
			return [
				this.cX,
				this.cY,
				this.cZ
			];
		},
		
		// Gets the distance between the camera and the midpoint of an arbitrary polygon
		distanceTo: function(pointArray,useClosestPoint) {
			if (!pointArray.length) throw new Error("You must provide an array of points to find the distance.");
			
			var comparisonPoint = [0,0,0],
				cameraVector = this.getVector()
				self = this;
			
			if (useClosestPoint) {
				// Comparing based on closest point in polygon.
				var closestPointDistance = Infinity,
					pointArrayLength = pointArray.length,
					point, pointDistanceCalc = 0;
				
				for (var pointIndex = 0; pointIndex < pointArrayLength; pointIndex ++) {
					point = pointArray[pointIndex];
					pointDistanceCalc = self.distanceTo(point);
					
					if (pointDistanceCalc < closestPointDistance) {
						closestPointDistance = pointDistanceCalc;
						comparisonPoint = point;
					}
				}
				
			} else {
				// Comparing based on polygon average/midpoint (NOT centroid)
				// If there's only one point, the just use it as the midpoint
				comparisonPoint = pointArray.length > 1 ? this.projection.findMidpoint(pointArray) : pointArray.slice(0,1);
			}
			
			// Calculate and return the (potentially diagonal) distance
			return pointDistance(comparisonPoint,cameraVector);
		},
		
		// Finds the view frustum from the camera settings
		viewFrustum: function() {
			// coming soon.
		}
	};
	
	
	function Projection(camera, opts) {
		this.camera = camera instanceof Camera ? camera : new Camera(0,0,0, 0,0,0, 0,0,0);
		this.camera.projection = this;
		
        // initialise options
        opts = opts || {};
        this.clamp = opts.clamp;
	}
	
	Projection.prototype = {
		
		// Generates a 2D coordinate (in array form) from a 3D coordinate,
		// accommodating for camera position, view depth, and 3D rotation (represented by Θ)
		
		project: function(aX, aY, aZ) {
			var dX, dY, dZ; // Destination
			var c = this.camera;
			var radConvert = Math.PI / 180,
				cΘx = c.Θx * radConvert,
				cΘy = c.Θy * radConvert,
				cΘz = c.Θz * radConvert;
			
			dX = Math.cos(cΘy) * (Math.sin(cΘz) * (aY - c.cY) + Math.cos(cΘz) * (aX - c.cX)) - Math.sin(cΘy) * (aZ - c.cZ);
			dY = Math.sin(cΘx) * (Math.cos(cΘy) * (aZ - c.cZ) + Math.sin(cΘy) * (Math.sin(cΘz) * (aY - c.cY) + Math.cos(cΘz) * (aX - c.cX))) + Math.cos(cΘx) * (Math.cos(cΘz) * (aY - c.cY) - Math.sin(cΘz) * (aX - c.cX));
			dZ = Math.cos(cΘx) * (Math.cos(cΘy) * (aZ - c.cZ) + Math.sin(cΘy) * (Math.sin(cΘz) * (aY - c.cY) + Math.cos(cΘz) * (aX - c.cX))) - Math.sin(cΘx) * (Math.cos(cΘz) * (aY - c.cY) - Math.sin(cΘz) * (aX - c.cX));
			
			bX = (dX - c.eX) * (c.eZ/dZ);
			bY = (dY - c.eY) * (c.eZ/dZ);
			
            // if we are clamping, then clamp the values
            // clamp using the fastest proper rounding: http://jsperf.com/math-round-vs-hack/3
            if (this.clamp) {
                bX = ~~(bX + (bX > 0 ? 1 : -1));
                bY = ~~(bY + (bY > 0 ? 1 : -1));
            }
			
			return [bX, bY];
		},
		
		// Determines whether a polygon should be drawn (it is on the screen
		// and in front of the camera)
		// Takes an array of points, and render area dimensions.
		
		shouldDrawPolygon: function(pointArray,viewWidth,viewHeight) {
			var self = this;
			
			// At least one part of the polygon projects to the display surface.
			if (self.onscreen(pointArray,viewWidth,viewHeight)) {
				return !self.cullBackface(pointArray);
			}
			
			return false;
		},
		
		// Determines whether a polygon should be drawn, based on whether it faces the camera.
		// (Backface visibility culling)
		cullBackface: function(pointArray) {
			var self = this,
				cameraVector = self.camera.getVector(),
				surfaceNormal = self.findNormal(pointArray);
			
			var cameraVectors = [
				[cameraVector[0] - self.camera.eX,	cameraVector[1] - self.camera.eY,	cameraVector[2]],
				[cameraVector[0] - self.camera.eX,	cameraVector[1] + self.camera.eY,	cameraVector[2]],
				[cameraVector[0] + self.camera.eX,	cameraVector[1] - self.camera.eY,	cameraVector[2]],
				[cameraVector[0] + self.camera.eX,	cameraVector[1] + self.camera.eY,	cameraVector[2]],
				// This is somewhat arbitrary. Testing will confirm whether it is really necessary, or whether the values need tweaking.
				[cameraVector[0] - (self.camera.eX * 2), cameraVector[1] + (self.camera.eY * 2), cameraVector[2]],
				[cameraVector[0],cameraVector[1],cameraVector[2]]
			];
			
			// Because of our variable pupil size, we need to run the calculation four/five times
			// (for each of our four pupil extremes)
			var isBackface = true,
				cameraVectorsLength = cameraVectors.length,
				cameraVectorIndex;
			
			for (vectorIndex = 0; vectorIndex < cameraVectorsLength; vectorIndex++) {
				if (self.facesVector(surfaceNormal,cameraVectors[vectorIndex])) {
					isBackface = false;
					break;
				}
			}
			
			return isBackface;
		},
		
		// Determines whether a polygon (described by a normal) faces an arbitrary vector.
		facesVector: function(surfaceNormal,vector) {
			var dotProduct = [
				(surfaceNormal[0] * vector[0]) +
				(surfaceNormal[1] * vector[1]) +
				(surfaceNormal[2] * vector[2])
			];
			
			return dotProduct > 0;
		},
		
		// Determines, from an array of points and the render area dimensions,
		// whether a polygon will appear in the 2D view area and should be drawn.
		// Should be used after frustum culling to limit the amount of projection
		// processing being done.
		
		onscreen: function(pointArray,viewWidth,viewHeight) {
			if (!viewWidth || !viewHeight) throw new Error("A view width and height must be specified to determine whether polygon is onscreen.");
			
			for (var pIndex = 0; pIndex < pointArray.length; pIndex ++) {
				var projectedPoint = this.project.apply(this,pointArray[pIndex]);
				
				if (projectedPoint[0] >= 0 && projectedPoint[0] <= viewWidth &&
					projectedPoint[1] >= 0 && projectedPoint[1] <= viewHeight) {
					
					return true;
				}
			}
			
			return false;
		},
		
		// Determines the surface normal of a simple convex polygon
		// (triangle or non-weird quadrilateral) from an array of its points.
		
		findNormal: function(pointArray) {
			
			// Newell's Normal Calculation Method (http://www.opengl.org/wiki/Calculating_a_Surface_Normal)
			var normal = [0,0,0],
				pointArrayLength = pointArray.length;
			
			for (var index = 0; index < pointArrayLength; index ++) {
				var point = pointArray[index],
					current = point,
					next = pointArray[(index + 1) % pointArray.length];
					
				normal[0] += ((current[1] - next[1]) * (current[2] + next[2]));
				normal[1] += ((current[2] - next[2]) * (current[0] + next[0]));
				normal[2] += ((current[0] - next[0]) * (current[1] + next[1]));
			}
			
			// Normalise vector
			var vectorLength = Math.sqrt(Math.pow(normal[0],2) + Math.pow(normal[1],2) + Math.pow(normal[2],2));
			normal[0] /= vectorLength;
			normal[1] /= vectorLength;
			normal[2] /= vectorLength;
			
			return normal;
		},
		
		// Finds the middle/average from an arbitrary array of points.
		findMidpoint: function(pointArray) {
			var midpoint = [0,0,0],
				pointArrayLength = pointArray.length;
			
			for (var pointIndex = 0; pointIndex < pointArrayLength; pointIndex ++) {
				var point = pointArray[pointIndex];
				
				midpoint[0] += point[0] / pointArray.length;
				midpoint[1] += point[1] / pointArray.length;
				midpoint[2] += point[2] / pointArray.length;
			}
			
			return midpoint;
		}
	};
	
    function perspex(camera, opts) {
        return new Projection(camera, opts);
    }
    
    // export the projection type
    perspex.Projection = Projection;
	perspex.Camera = Camera;
	
	(typeof module != "undefined" && module.exports) ? (module.exports = perspex) : (typeof define != "undefined" ? (define("perspex", [], function() { return perspex; })) : (glob.perspex = perspex));
})(this);
