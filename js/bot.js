var Bot = {
	"init": function() {
		Bot.Tabs.init();
		
		Bot.Connection.hint("KaiBot     o_O".replace(/ /g, "&nbsp;"));
		
		window.setTimeout(function() {
			jQuery("#tabs > .buttons").removeClass("hidden");
			
			Bot.Connection.search();
		}, 2000);
		//Bot.Connection.connected("12345");
	},
	"joysticks": {},
	"Connection": {
		"connected": false,
		"search": function() {
			if(typeof bluetoothSerial !== "undefined") {
				bluetoothSerial.list(function(devices) {					
					if(!jQuery.isArray(devices)) devices = [];
					
					Bot.Connection.list(devices);
				}, function() {
					Bot.Connection.error();
				});
			}
			else if(Math.random() < 0.8) {
				Bot.Connection.list([]);
			}
			else {
				Bot.Connection.list([{
					"uuid": "Aaaaaaa"
				}, {
					"uuid": "Bbbbbbb"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Ccccccc"
				}, {
					"uuid": "Xxxxxxx"
				}]);
			}
		},
		"list": function(list) {
			if(!list || list.length <= 0) {
				Bot.Connection.hint("Searching...");
				
				window.setTimeout(function() {
					Bot.Connection.search();
				}, 1000);
				
				return;
			}
			
			jQuery("#tabs > .page[data-tab='connection']").html("");
			var $list = jQuery("<div class=\"list\"></div>").appendTo("#tabs > .page[data-tab='connection']");

			for(var i = 0; i < Math.min(list.length, 12); ++i) {
				jQuery("<span class=\"button\"></span>").attr({
					"data-id": list[i].uuid
				}).html("<span class=\"text\">" + (list[i].text || list[i].uuid) + "</span>").on("touchend", function() {
					Bot.Connection.connect(jQuery(this).attr("data-id"));
				}).appendTo($list);
			}
		},
		"connect": function(uuid) {
			Bot.Connection.hint("Connecting...");
			
			if(typeof bluetoothSerial !== "undefined") {
				bluetoothSerial.connect(uuid, function() {					
					Bot.Connection.success("Connected.");
					Bot.Connection.connected(uuid);
				}, function() {
					Bot.Connection.error();
				});
			}
			else {
				window.setTimeout(function() {
					Bot.Connection.success("Connected.");
					Bot.Connection.connected(uuid);
				}, 500);
			}
		},
		"connected": function(uuid) {
			Bot.Connection.connected = uuid;
			
			window.setTimeout(function() {
				jQuery("#tabs > .buttons > .button").removeClass("disabled");
				
				jQuery("#tabs > .buttons > .button[data-tab='connection']").addClass("disabled");
				jQuery("#tabs > .buttons > .button:not([data-tab='connection'])").first().trigger("touchend");
			}, 1000);
		},
		"hint": function(hint) {
			jQuery("#tabs > .page[data-tab='connection']").html("<span class=\"hint\">" + hint + "</span>");
		},
		"success": function(success) {
			jQuery("#tabs > .page[data-tab='connection']").html("<span class=\"hint success\">" + (success || "Ok.") + "</span>");
		},
		"error": function(error) {
			jQuery("#tabs > .page[data-tab='connection']").html("<span class=\"hint error\">" + (error || "Error.") + "</span>");
		},
		"send": function(cmd, callback) {
			if(typeof bluetoothSerial === "undefined") {
				console.log("sending \"" + cmd + "\"...");
				if(typeof callback === "function") callback();
			}
			else {
				bluetoothSerial.write(cmd, function() {
					if(typeof callback === "function") callback();
				});
			}
		}
	},
	"Tabs": {
		"init": function() {
			jQuery("#tabs > .buttons > .button").on("mouseup touchend", function() {
				var tab = jQuery(this).attr("data-tab");
				if(jQuery(this).is(".disabled")) return;
				
				jQuery("#tabs > .buttons > .button").removeClass("active");
				jQuery("#tabs > .buttons > .button[data-tab='" + tab + "']").addClass("active");
				jQuery("#tabs > .page").removeClass("active");
				jQuery("#tabs > .page[data-tab='" + tab + "']").addClass("active");
				
				var tmp = new Bot.Joystick({
					"axis": "all",
					
					"callback": function(x, y) {
						console.log(x, y);
					}
				});
				tmp.container.appendTo("#tabs > .page[data-tab='1']");
				window.tmp = tmp;
				
				return false;
			});
			
			//#region tab:walk
			Bot.joysticks["walk"] = new Bot.Joystick({
				"key": "walk",
				"axis": "both",
				"callback": function(x, y) {
					Bot.Connection.send("walk_" + x + "_" + y);
				}
			});
			Bot.joysticks["walk"].container.appendTo("#tabs > .page[data-tab='walk']");
			//#endregion
			
			//#region tab:up/down
			Bot.joysticks["updown"] = new Bot.Joystick({
				"key": "updown",
				"axis": "y",
				"callback": function(x, y) {
					Bot.Connection.send("updown_" + y);
				}
			});
			Bot.joysticks["updown"].container.appendTo("#tabs > .page[data-tab='updown']");
			//#endregion
			
			//#region tab:move
			Bot.joysticks["move"] = new Bot.Joystick({
				"key": "move",
				"axis": "all",
				"callback": function(x, y) {
					Bot.Connection.send("move_" + x + "_" + y);
				}
			});
			Bot.joysticks["move"].container.appendTo("#tabs > .page[data-tab='move']");
			//#endregion
			
			//#region tab:rotate
			Bot.joysticks["rotate"] = new Bot.Joystick({
				"key": "rotate",
				"axis": "x",
				"callback": function(x, y) {
					Bot.Connection.send("rotate_" + x);
				}
			});
			Bot.joysticks["rotate"].container.appendTo("#tabs > .page[data-tab='rotate']");
			//#endregion
			
			//#region tab:system
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='reload']").on("touchend mouseup", function() {
				location.reload();
			});
			
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='reset']").on("touchend mouseup", function() {
				Bot.Connection.send("reset");
			});
			
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='1']").on("touchend mouseup", function() {
				Bot.Connection.send("1");
			});
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='2']").on("touchend mouseup", function() {
				Bot.Connection.send("2");
			});
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='3']").on("touchend mouseup", function() {
				Bot.Connection.send("3");
			});
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='4']").on("touchend mouseup", function() {
				Bot.Connection.send("4");
			});
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='5']").on("touchend mouseup", function() {
				Bot.Connection.send("5");
			});
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='6']").on("touchend mouseup", function() {
				Bot.Connection.send("6");
			});
			//#endregion
		}
	},
	"Joystick": function(options) {
		var container = jQuery(arguments[0]);
		if(container.is("*")) {
			options = arguments[1];
			if(jQuery.isPlainObject(options)) options = {};
			options.container = container;
		}
		
		options = jQuery.extend({
			"container": null,
			"axis": "both",
			"min": -100,
			"max": 100,
			
			"keep": false,
			
			"callback": null
		}, options || {});
		
		var self = {
			"options": options,
			"active": false,
			
			"x": 0,
			"y": 0,
			"lx": 0,
			"ly": 0,
			
			"axis": false,
			"init": function() {
				self.container = jQuery(options.container);
				if(!self.container.is("*")) self.container = jQuery("<div></div>");
				
				self.container.addClass("ui joystick").attr({
					"data-axis": options.axis
				});
				
				if(options.axis == "both") {
					self.axis = null;
				}
				else {
					self.axis = options.axis;
				}
				
				self.frame = jQuery("<div class=\"frame\"></div>").appendTo(self.container);
				
				self.stick = jQuery("<div class=\"stick\"></div>").appendTo(self.frame);
				self.stick.on({
					"touchstart mousedown": function(evt) {
						var pos = self.pos(evt);
						if(pos) {
							self.active = true;
							
							self.x = pos.x;
							self.y = pos.y;
						
							self.stick.addClass("active");
						}
						else {
							self.active = false;
							
							self.x = 0;
							self.y = 0;
							
							self.stick.removeClass("active");
						}
					},
					"touchend mouseup": function() {
						
						self.active = false;
						self.stick.removeClass("active");
						
						if(!self.options.keep) {
							self.x = 0;
							self.y = 0;
						
							self.stick.animate({
								"left": self.options.axis == "y" ? "30px" : "100px",
								"top": self.options.axis == "x" ? "30px" : "100px"
							}, 200);
													
							if(typeof self.options.callback === "function") self.options.callback(0, 0);
							
							if(self.options.axis == "both") self.axis = null;
						}						
					}
				});
				
				self.frame.on({
					"touchmove mousemove": function(evt) {
						if(!self.active) return;
						
						var pos = self.pos(evt);
						if(pos) {
							var delta = {
								"x": Math.max(-100, Math.min(100, pos.x - self.x)),
								"y": Math.max(-100, Math.min(100, pos.y - self.y))
							};
							
							if(!self.axis) {
								if(delta.x < -5 || delta.x > 5) {
									self.axis = "x";
								}
								else if(delta.y < -5 || delta.y > 5) {
									self.axis = "y";
								}
								else {
									return;
								}
							}
							
							if(self.axis == "x") delta.y = 0;
							if(self.axis == "y") delta.x = 0;
							
							if(self.options.axis == "x") {
								self.stick.css({
									"left": Math.max(25, Math.min(175, 100 + delta.x)) + "px",
									"top": Math.max(25, Math.min(175, 30 + delta.y)) + "px"
								});
							}
							else if(self.options.axis == "y") {
								self.stick.css({
									"left": Math.max(25, Math.min(175, 30 + delta.x)) + "px",
									"top": Math.max(25, Math.min(175, 100 + delta.y)) + "px"
								});
							}
							else {
								self.stick.css({
									"left": Math.max(25, Math.min(175, 100 + delta.x)) + "px",
									"top": Math.max(25, Math.min(175, 100 + delta.y)) + "px"
								});
							}
							
							var d = self.options.max - self.options.min;
							var x = self.options.min + Math.floor(d * (delta.x + 100) / 200);
							var y = self.options.min + Math.floor(d * (-delta.y + 100) / 200);
								
							if((self.lx != x || self.ly != y) && typeof self.options.callback === "function") {
								self.options.callback(x, y);
							}
							
							self.lx = x;
							self.ly = y;
						}
					}
				});
				
				self.ranges = jQuery("<div class=\"ranges\"></div>").appendTo(self.container);
				jQuery("<span class=\"range\" data-value=\"5\">5</span>").appendTo(self.ranges);
				jQuery("<span class=\"range\" data-value=\"10\">10</span>").appendTo(self.ranges);
				jQuery("<span class=\"range\" data-value=\"25\">25</span>").appendTo(self.ranges);
				jQuery("<span class=\"range\" data-value=\"100\">100</span>").appendTo(self.ranges);
				jQuery("<span class=\"range\" data-value=\"225\">225</span>").appendTo(self.ranges);
				self.ranges.find(".range").on("touchend", function() {
					var val = jQuery(this).attr("data-value");
					self.btn(parseInt(val, 10));
				});
				
				var oldVal = localStorage.getItem("joystickvalue_" + self.options.key) || 10;
				if(oldVal) self.btn(oldVal);
			},
			"pos": function(evt) {
				var result = {
					"x": 0,
					"y": 0
				};
				
				if(typeof evt.offsetX === "number") {
					result = {
						"x": evt.offsetX,
						"y": evt.offsetY
					};
				}
				else if(evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length) {
					result = {
						"x": evt.originalEvent.touches[0].pageX,
						"y": evt.originalEvent.touches[0].pageY
					};
				}
				else {
					return null;
				}
								
				return result;				
			},
			"btn": function(val) {
				self.ranges.find(".range").removeClass("active");
				self.ranges.find(".range[data-value='" + val + "']").addClass("active");
				
				self.options.min = -val;
				self.options.max = val;
				
				if(self.options.key) localStorage.setItem("joystickvalue_" + self.options.key, val);
			}
		};
		
		self.init();
		
		return self;
	}
};

jQuery(document).ready(function() {
	document.ontouchstart = function(e){ 
		e.preventDefault(); 
	};

	Bot.init();
});