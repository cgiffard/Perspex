// perspex 0.0.1
// ────────────────────────────────────────────────────────────────────────────────────────
// Perspective Projection Math Helpers
// ────────────────────────────────────────────────────────────────────────────────────────
// Structure flogged ungratefully from DamonOehlman/isomath

(function (glob) {
	// There's a lot we can do to improve the performance still (such as precaching Math.* calls.)
	// For performance reasons, I may move away from objects for setting camera/view position and rotation.
	// I'll have to run some benchmarks first.
	
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
		
		// Finds the camera vector based on its location and rotation.
		getVector: function() {
			var radConvert = (Math.PI / 180),
				angleX = this.Θx * radConvert,
				angleY = this.Θy * radConvert,
				angleZ = this.Θz * radConvert
				x = this.cX,
				y = this.cY,
				z = this.cZ;
			
			y = y * Math.cos(angleX) - z * Math.sin(angleX);
			z = y * Math.sin(angleX) + z * Math.cos(angleX);
			z = z * Math.cos(angleY) - x * Math.sin(angleY);
			x = z * Math.sin(angleY) + x * Math.cos(angleY);
			x = x * Math.cos(angleZ) - y * Math.sin(angleZ);
			y = x * Math.sin(angleZ) + y * Math.cos(angleZ);
			
			return [x,y,z];
		}
	};
	
	
	function Projection(camera, opts) {
		this.camera = camera instanceof Camera ? camera : new Camera(0,0,0, 0,0,0, 0,0,0);
		
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
			
			dX = Math.cos(c.Θy) * (Math.sin(c.Θz) * (aY - c.cY) + Math.cos(c.Θz) * (aX - c.cX)) - Math.sin(c.Θy) * (aZ - c.cZ);
			dY = Math.sin(c.Θx) * (Math.cos(c.Θy) * (aZ - c.cZ) + Math.sin(c.Θy) * (Math.sin(c.Θz) * (aY - c.cY) + Math.cos(c.Θz) * (aX - c.cX))) + Math.cos(c.Θx) * (Math.cos(c.Θz) * (aY - c.cY) - Math.sin(c.Θz) * (aX - c.cX));
			dZ = Math.cos(c.Θx) * (Math.cos(c.Θy) * (aZ - c.cZ) + Math.sin(c.Θy) * (Math.sin(c.Θz) * (aY - c.cY) + Math.cos(c.Θz) * (aX - c.cX))) - Math.sin(c.Θx) * (Math.cos(c.Θz) * (aY - c.cY) - Math.sin(c.Θz) * (aX - c.cX));
			
			bX = (dX - c.eX) * (c.eZ/dZ);
			bY = (dY - c.eY) * (c.eZ/dZ);
			
            // if we are clamping, then clamp the values
            // clamp using the fastest proper rounding: http://jsperf.com/math-round-vs-hack/3
            if (this.clamp) {
                bX = ~~(bX + (bX > 0 ? 0.5 : -0.5));
                bY = ~~(bY + (bY > 0 ? 0.5 : -0.5));
            }
			
			return [bX, bY];
		},
		
		// Determines whether a polygon should be drawn (it is on the screen
		// and in front of the camera)
		// Takes an array of points, and render area dimensions.
		
		shouldDrawPolygon: function(pointArray,viewWidth,viewHeight) {
			// At least one part of the polygon projects to the display surface.
			if (this.onscreen(pointArray,viewWidth,viewHeight)) {
				var surfaceNormal = this.findNormal(pointArray),
					cameraVector = this.camera.getVector();
					
				cameraVector[2] -= this.camera.eZ;
				
				var polygonAverage = [
					pointArray.reduce(function(prev,current){ return prev + current[0]; },0) / pointArray.length,
					pointArray.reduce(function(prev,current){ return prev + current[1]; },0) / pointArray.length,
					pointArray.reduce(function(prev,current){ return prev + current[2]; },0) / pointArray.length
				];
				
				var polygonCameraVector = [
					polygonAverage[0] + cameraVector[0],
					polygonAverage[1] + cameraVector[1],
					polygonAverage[2] + cameraVector[2],
				];
				
				var dotProduct =
					(polygonCameraVector[0] * surfaceNormal[0]) + 
					(polygonCameraVector[1] * surfaceNormal[1]) + 
					(polygonCameraVector[2] * surfaceNormal[2]);
				
				if (dotProduct < 0) return false;
				
				// Or, if we're positive... return true.
				return true;
			}
			
			return false;
		},
		
		// Determines, from an array of points and the render area dimensions,
		// whether a polygon will appear in the view area and should be drawn.
		
		onscreen: function(pointArray,viewWidth,viewHeight) {
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
			if (pointArray.length < 3) throw new Error("Can't find normal of a surface with less than three points.");
			
			// Shamelessly ripped of Marius Gundersen's 2011 ongamestart talk
			var vector1 = {
				dx: pointArray[0][0] - pointArray[1][0],
				dy: pointArray[0][1] - pointArray[1][1],
				dz: pointArray[0][2] - pointArray[1][2]
			};
			
			var vector2 = {
				dx: pointArray[2][0] - pointArray[1][0],
				dy: pointArray[2][1] - pointArray[1][1],
				dz: pointArray[2][2] - pointArray[1][2]
			};
			
			// Return cross-product
			return [
				vector1.dy * vector2.dz - vector1.dz * vector2.dy,
				vector1.dz * vector2.dx - vector1.dx * vector2.dz,
				vector1.dx * vector2.dy - vector1.dy * vector2.dx
			];
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
