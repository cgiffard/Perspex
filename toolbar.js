// This is for the browser.
(function (glob) {
	
	function Toolbar(camera) {
		var self = this;
		if (perspex && camera instanceof perspex.Camera) {
			self.events = {"update":function(){}};
			self.boundCamera = camera;
			self.toolbar = document.createElement("div");
			self.toolbar.style.position = "absolute";
			self.toolbar.style.bottom = "0px";
			self.toolbar.style.left = "0px";
			self.toolbar.style.height = "30px";
			self.toolbar.style.backgroundColor = "rgba(0,0,0,0.8)";
			self.toolbar.style.color = "white";
			self.toolbar.style.fontFamily = "sans-serif";
			self.toolbar.style.fontSize = "0.6em";
			self.toolbar.style.lineHeight = "30px";
			self.toolbar.style.width = "100%";
			
			var controls = [];
			var cameraProperties = [
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
			
			cameraProperties.forEach(function(property) {
				var tmpControlGroup = document.createElement("div");
				var tmpControlLabel = document.createElement("label");
				var tmpControlInput = document.createElement("input");
				
				tmpControlGroup.style.float = "left";
				tmpControlGroup.style.overflow = "hidden";
				tmpControlGroup.style.paddingLeft = "10px";
				tmpControlGroup.style.display = "inline-block";
				
				tmpControlInput.type = "number";
				tmpControlInput.value = self.boundCamera[property[0]];
				tmpControlInput.step = "0.01";
				tmpControlInput.id = "camval" + property[0];
				tmpControlInput.style.backgroundColor = "transparent";
				tmpControlInput.style.border = "solid white 1px";
				tmpControlInput.style.color = "white";
				tmpControlInput.style.width = "60px";
				tmpControlInput.style.marginLeft = "5px";
				
				tmpControlLabel.innerHTML = property[1];
				tmpControlLabel.for = "camval" + property[0];
				
				tmpControlInput.addEventListener("change",function(event) {
					self.boundCamera[property[0]] = parseFloat(tmpControlInput.value);
					self.events.update();
				});
				
				tmpControlGroup.appendChild(tmpControlLabel);
				tmpControlGroup.appendChild(tmpControlInput);
				self.toolbar.appendChild(tmpControlGroup);
			});
			
			function updateControls() {
				
			}
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