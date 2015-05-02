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
			(new Bot.Joystick({
				"axis": "both",
				"min": -10,
				"max": 10,
				"callback": function(x, y) {
					Bot.Connection.send("walk_" + x + "_" + y);
				}
			})).container.appendTo("#tabs > .page[data-tab='walk']");
			//#endregion
			
			//#region tab:up/down
			(new Bot.Joystick({
				"axis": "y",
				"min": -10,
				"max": 10,
				"callback": function(x, y) {
					Bot.Connection.send("updown_" + y);
				}
			})).container.appendTo("#tabs > .page[data-tab='updown']");
			//#endregion
			
			//#region tab:move
			(new Bot.Joystick({
				"axis": "all",
				"min": -10,
				"max": 10,
				"callback": function(x, y) {
					Bot.Connection.send("move_" + x + "_" + y);
				}
			})).container.appendTo("#tabs > .page[data-tab='move']");
			//#endregion
			
			//#region tab:rotate
			(new Bot.Joystick({
				"axis": "x",
				"min": -10,
				"max": 10,
				"callback": function(x, y) {
					Bot.Connection.send("rotate_" + x);
				}
			})).container.appendTo("#tabs > .page[data-tab='rotate']");
			//#endregion
			
			//#region tab:system
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='reload']").on("touchend mouseup", function() {
				location.reload();
			});
			
			jQuery("#tabs > .page[data-tab='system'] .button[data-action='reset']").on("touchend mouseup", function() {
				Bot.Connection.send("reset");
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
				
				self.stick = jQuery("<div class=\"stick\"></div>").appendTo(self.container);
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
								"left": "100px",
								"top": "100px"
							}, 200);
													
							if(typeof self.options.callback === "function") self.options.callback(0, 0);
							
							if(self.options.axis == "both") self.axis = null;
						}						
					}
				});
				
				self.container.on({
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
							
							self.stick.css({
								"left": Math.max(25, Math.min(175, 100 + delta.x)) + "px",
								"top": Math.max(25, Math.min(175, 100 + delta.y)) + "px"
							});
							
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