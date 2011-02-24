/**
	jQuery plugin for text input elements. Adds + and - buttons to change
	field value by 1. Also adds support for changing value with up/down and +/- keys.
	
	Add to an input element the normal way. $("input").inputcontrol();
**/
(function( $ ){
	$.fn.inputcontrol = function() {
	
		return this.each( function() {
			/* Only works for text input fields that are not disabled */
			var $this = $(this);
			if (this.tagName == "INPUT" && $this.attr("type") == "text" && !$this.is(":disabled") ) {
				
				/* Detect desired increment from classname. If none found, default to 1 */
				var increment = 1;
				var inputClasses = $this.attr("class").split(/\s+/);
				for(c in inputClasses) {
					var regEx = /controllable_increment_(-*\d+)/;
					var match = regEx.exec(inputClasses[c]);
					if (match != null) {
						increment = parseFloat(match[1]);
					}
				}
				
				
				/* Change with suitable keys */
				$this.keydown(function(e) {
					if (parseInt($this.val()) != null) {
						var delta;
						if (e.keyCode == 38 || e.keyCode == 107) { // Arrow up or +
							delta = increment;
						} else if (e.keyCode == 40 || e.keyCode == 109) { // Arrow down or -
							delta = -increment;
						}
						
						/* Update if necessary */
						if (delta != null) {
							$this.val( parseInt($this.val()) + delta);
							$this.trigger("change");
							return false;
						}
					}
					
				});
				
				/* Wrap containing the input and controls */
				$this.wrap( $("<span />").addClass("inputcontrol") );				
				var wrap = $this.parent();

				/* Move relevant css rules from input to wrap */
				var transferCss = ["margin-top", "margin-bottom", "margin-right", "margin-left",
									"padding-top", "padding-bottom", "padding-right", "padding-left",
									"display"/*, "float", "clear"*/];				
				for (var i = 0; i < transferCss.length; i++) {
					if ($this.css(transferCss[i]) != "") {
						wrap.css(transferCss[i], $this.css(transferCss[i]));
					}
				}			
				/* Zero input margin & padding for proper control placement */
				$this.css({
					"margin": 0,
					"padding": 0,
					"display": "inline-block",
					"float": "none",
					"clear": "none"
				});
				
				/* Add the + / - buttons */
				var buttonCss = {
							"cursor": "pointer",
							"font-weight": "bold",
							"padding": 0,
							"margin": 0,
							"background": "none",
							"border": "0",
							"color": "#ddd"
						};
				wrap
				.append(
					$("<button />")
						.text("+")
						.css( buttonCss )
						.bind("click", function() {
							if (parseInt($this.val()) != null) {
								$this.val( parseInt($this.val()) + increment);
								$this.trigger("change");
							}
						})
				)
				.append(
					$("<button />")
						.text("-")
						.css( buttonCss )
						.bind("click", function() {
							if (parseInt($this.val()) != null) {
								$this.val( parseInt($this.val()) - increment);
								$this.trigger("change");
							}
						})
				);
					
			}	
		});
		
	}	
}) ( jQuery );