// In-browser toolbar for steering a perspex projection's camera.
(function (glob) {
	
	function Toolbar(camera) {
		var self = this;
		if (perspex && camera instanceof perspex.Camera) {
			self.events = {"update":function(){}};
			self.boundCamera = camera;
			self.toolbar = document.createElement("div");
			
			with (self.toolbar.style) {
				position		 = "absolute";
				bottom			 = "0px";
				left			 = "0px";
				height			 = "30px";
				backgroundColor	 = "rgba(0,0,0,0.8)";
				color			 = "white";
				fontFamily		 = "sans-serif";
				fontSize		 = "0.6em";
				lineHeight		 = "30px";
				width			 = "100%";
			}
			
			self.controls = {};
			self.cameraProperties = [
				["cX","X Pos"],
				["cY","Y Pos"],
				["cZ","Z Pos"],
				["Θx","X Rot"],
				["Θy","Y Rot"],
				["Θz","Z Rot"],
				["eX","Pupil Width"],
				["eY","Pupil Height"],
				["eZ","View Depth"]
			];
			
			self.cameraProperties.forEach(function(property) {
				var tmpControlGroup = document.createElement("div");
				var tmpControlLabel = document.createElement("label");
				var tmpControlInput = document.createElement("input");
				
				tmpControlGroup.style.float = "left";
				tmpControlGroup.style.overflow = "hidden";
				tmpControlGroup.style.paddingLeft = "10px";
				tmpControlGroup.style.display = "inline-block";
				
				tmpControlInput.type = "number";
				tmpControlInput.value = self.boundCamera[property[0]];
				tmpControlInput.step = "1";
				tmpControlInput.id = "camval" + property[0];
				
				with (tmpControlInput.style) {
					backgroundColor	= "transparent";
					border			= "solid white 1px";
					color			= "white";
					width			= "60px";
					marginLeft		= "5px";
				}
				
				tmpControlLabel.innerHTML = property[1];
				tmpControlLabel.for = "camval" + property[0];
				
				function updateCamera() {
					self.boundCamera[property[0]] = parseFloat(tmpControlInput.value);
					self.events.update();
				}
				
				tmpControlInput.addEventListener("change",updateCamera,false);
				tmpControlInput.addEventListener("keydown",updateCamera,false);
				tmpControlInput.addEventListener("keyup",updateCamera,false);
				
				tmpControlGroup.appendChild(tmpControlLabel);
				tmpControlGroup.appendChild(tmpControlInput);
				self.toolbar.appendChild(tmpControlGroup);
				
				self.controls[property[0]] = tmpControlInput;
			});
		} else {
			throw new Error("You must pass in a perspex camera.");
		}
	}
	
	Toolbar.prototype = {
		"constructor": Toolbar,
		
		"appendTo": function(destinationNode) {
			destinationNode.appendChild(this.toolbar);
		},
		
		"bindCamera": function(camera) {
			if (camera instanceof perspex.Camera) {
				this.boundCamera = camera;
			}
		},
		
		"update": function() {
			var self = this;
			self.cameraProperties.forEach(function(property) {
				self.controls[property[0]].value = self.boundCamera[property[0]];
			});
		},
		
		"on": function(event,callback) {
			if (event in this.events) {
				if (callback instanceof Function) {
					this.events[event] = callback;
				} else {
					throw new Error("Callback must be a function.");
				}
			} else {
				throw new Error("Unrecognised event!");
			}
		}
	}
	
	
	
	window.PerspexToolbar = Toolbar;
})();