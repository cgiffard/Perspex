// perspex 0.0.1
// ────────────────────────────────────────────────────────────────────────────────────────
// Perspective Projection Math Helpers
// ────────────────────────────────────────────────────────────────────────────────────────
// Structure flogged ungratefully from isomath

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
		}
	};
	
	
	function Projection(camera, opts) {
		this.camera = camera instanceof Camera ? camera : new Camera(0,0,0, 0,0,0, 0,0,0);
		
        // initialise options
        opts = opts || {};
        this.clamp = opts.clamp;
	}
	
	Projection.prototype = {
		
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
