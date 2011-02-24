(function( $ ){
	$.fn.crpg_xpdisplay = function() {

	
		return this.each( function() {
			if (this.tagName == "DIV") {
				var $this = $(this);				

				$this
				.append(
					$("<h2 />")
						.text("Experience gain")
				)
				.append(
					$("<p />")
						.text("Displays the amount of experience needed for each level, and calculates time required to gain that amount of xp at given generation, multiplier and xp/minute rating. Default value of 1000 xp/min is currently used (in version 0.210), but it can be changed to accomodate to changes in game functionality.")
					)
				.append(
					$("<p />")
						.text("Calculator is accurate only to level 30. If there is a level 30+ available, send me (Vargas) a PM on the forum with your current level and xp required for next level. I'll update this.")
				);
				
				// Validates all inputs and then calls for output
				var inputChanged = function() {
					
					
					if ( parseInt(inputs["Target level"].val() ) > 50) {
						inputs["Target level"].val(50);
					}
					else if ( parseInt(inputs["Target level"].val()) < 2) {
						inputs["Target level"].val(2);
					}
					
					if ( parseInt(inputs["Generation"].val() ) > 50) {
						inputs["Generation"].val(50);
					}
					else if ( parseInt(inputs["Generation"].val()) < 1) {
						inputs["Generation"].val(1);
					}
					
					if ( parseInt(inputs["Multiplier"].val() ) > 5) {
						inputs["Multiplier"].val(5);
					}
					else if ( parseInt(inputs["Multiplier"].val()) < 1) {
						inputs["Multiplier"].val(1);
					}
					
					
				
									
					// Create output
					createOutput();
				}
				
				var createOutput = function() {
				
					outputContainer.children().remove();
					
					
										
					
					/* Calculate dataset */					
					var maxLevel = parseInt( inputs["Target level"].val() );
					var gen = parseInt( inputs["Generation"].val() );
					var multiplier = parseInt( inputs["Multiplier"].val() );
					var xpPerMin = parseInt( inputs["XP / Minute"].val() );
					var levelXps = [];
					var levelTimes = [];
					for(var i = 2; i <= maxLevel; i++) {
						levelXps.push( [i, getXPForLevel(i) ] );
					}
					
					
					var table = $("<table />")
						.append(
							$("<thead />")
								.append(
									$("<th />")
									.addClass("tableLabel")
									.text("Level")
								)
								.append(
									$("<th />").text("Experience")
								)
								.append(
									$("<th />").text("Time to reach (hh:mm)")
								)
						);
					for(var i = 0; i < levelXps.length; i++) {
						$(table).append(
							$("<tr />")
								.append(
									$("<td />")
									.addClass("tableLabel")
									.text(levelXps[i][0])
								)
								.append(
									$("<td />").text(levelXps[i][1].separate(","))
								)
								.append(
									$("<td />").text( getTimeForXP(levelXps[i][1], xpPerMin, gen, multiplier) )
								)
						)
					}
					outputContainer.append(table);	
					
					var graphWrap = $("<div />")
						.addClass("graphWrap")
						.width(400)
						.height(350)
						.append(
							$("<label />")
							.text("Experience required for level")
						);
					outputContainer.append(graphWrap);
					
					var graphContainer = $("<div />")
						.addClass("graphContainer")
						.width(graphWrap.width() * 0.9)
						.height(graphWrap.height() * 0.9);					
					graphWrap.append(graphContainer);
					
					/* Draw graph*/
					try {
						$.plot( graphContainer, [
							{ 	label: "Experience",
								data: levelXps,
								
							}
							]);
					} catch(exc) {
						alert(exc);
						graphContainer.append(
							$("<p />").text("Error creating graph: " + exc)
						);
					}
				}
				
				//
				// Create input elements
				//
				var inputContainer = $("<div />")
					.addClass("input");
				$this.append(inputContainer);
				
				var inputs = [], hash;
				

				// Character options		
				var xpWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Level (min / max)")
					);
				
				var xpInputs = [ ["Target level", 30], ["Generation", 1], ["Multiplier", 1] , ["XP / Minute", 1000] ];
				for (var i = 0; i < xpInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + xpInputs[i][0].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", xpInputs[i][1])
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ xpInputs[i][0] ] = input;
					
					var label = $("<label />")
						.text( xpInputs[i][0] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					xpWrap.append(wrap);
				}
				inputContainer.append(xpWrap);
				
				// Output
				var outputContainer = $("<div />")
					.addClass("output");
				$this.append(outputContainer);
				
				// Trigger output generation
				inputChanged();
			}
		});
		
	}	
}) ( jQuery );