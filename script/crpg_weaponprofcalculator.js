(function( $ ){
	$.fn.crpg_weaponprofcalculator = function() {

	
		return this.each( function() {
			if (this.tagName == "DIV") {
				var $this = $(this);
				
				$this
				.append(
					$("<h2 />")
						.text("Effective WPF Calculator")
				)
				.append(
					$("<p />")
						.addClass("credits")
						.text("Original Python script by cmpxchg8b")
				)
				.append(
					$("<p />")
						.text("Calculates weight effect on archery/melee wpf and power draw skill. Also shows power draw / archery wpf relationship - having power draw too high compared to archery wpf lowers the wpf considerably.")
					)
				.append(
					$("<p />")
						.text("Head and hand armor have multipliers added to their weight when calculating total encumberance: head weight * 3, hand weight * 2. Take this into account when planning optimal gear sets.")
				);
				
				var inputContainer = $("<div />")
					.addClass("input")
					.append(
						$("<h3 />").text("Starting values")
					);
				$this.append(inputContainer);
				
				var outputContainer = $("<div />")
					.addClass("output");
				$this.append(outputContainer);
				
				/* Creates output */
				var createOutput = function() {
					outputContainer.children().remove();
				
					var powerdraw = parseInt(inputs["Power Draw"].val());
					var archery_wpf = parseInt(inputs["Archery WPF"].val());
					var melee_wpf = parseInt(inputs["Melee WPF"].val());
					
					var head_armor = parseFloat(inputs["Head armor weight"].val());
					var body_armor = parseFloat(inputs["Body armor weight"].val());
					var leg_armor = parseFloat(inputs["Leg armor weight"].val());
					var hand_armor = parseFloat(inputs["Hand armor weight"].val());
					
					var encumberance = getEncumberance(head_armor, body_armor, leg_armor, hand_armor);
					var wpfs = getEffectiveWpfs(powerdraw, archery_wpf,	melee_wpf, encumberance);
					
					/* Text listing */
					var wrapper = $("<div />");
					wrapper.append(
						$("<h3 />").text("Effective values")
					)
					.append(
						$("<ul />")
						.css({
							"font-size": "110%",
							"margin": "3em 0 6em 0"
						})
						.append(
							$("<li />").text("Power draw: " + inputs["Power Draw"].val() + " -> " + wpfs[1])
						)
						.append(
							$("<li />").text("Archery WPF: " + inputs["Archery WPF"].val() + " -> " + wpfs[0])
						)
						.append(
							$("<li />").text("Melee WPF: " + inputs["Melee WPF"].val() + " -> " + wpfs[2])
						)
					);					
					outputContainer.append(wrapper);
					
					
					/* Graphic for power draw / wpf */
					outputContainer.append(
						$("<h3 />").text("Graphics")
					);
					
					var encGraphWrap = $("<div />")
						.addClass("graphWrap")
						.width(400)
						.height(350)
						.append(
							$("<label />")
							.text("Effective archery  WPF with PD " + powerdraw + " / Base WPF")
						);
					outputContainer.append(encGraphWrap);
					
					var encGraphContainer = $("<div />")
						.addClass("graphContainer")
						.width(encGraphWrap.width() * 0.9)
						.height(encGraphWrap.height() * 0.9);					
					encGraphWrap.append(encGraphContainer);					
					
					/* Calculate dataset */
					var archeryWpfs = [];
					var wpfBalancePoint = [];
					for (var wpf = 1; wpf < 500; wpf++) {
						var result = getEffectiveWpfs(powerdraw, wpf, melee_wpf, encumberance);
						archeryWpfs.push( [wpf, result[0]] );
						if ( Math.abs(result[0] - wpf) < 2 && wpf > 10) {
							wpfBalancePoint.push( [wpf, result[0]] );
						}
					}
					
					try {
						$.plot( encGraphContainer, [
							{ 	label: "Effective archery WPF",
								data: archeryWpfs,
								
							},
							{
								label: "WPF balance point",
								data: wpfBalancePoint,
								points: { show: true }
							}
							]);
					} catch(exc) {
						wrapper.append(
							$("<p />").text("Error creating graph: " + exc)
						);
					}
					
					/* Graphic for encumberance / wpf */
					var encGraphWrap = $("<div />")
						.addClass("graphWrap")
						.width(400)
						.height(350)
						.append(
							$("<label />")
							.text("Effective WPF / Total encumberance")
						);
					outputContainer.append(encGraphWrap);
					
					var encGraphContainer = $("<div />")
						.addClass("graphContainer")
						.width(encGraphWrap.width() * 0.9)
						.height(encGraphWrap.height() * 0.9);					
					encGraphWrap.append(encGraphContainer);					
					
					/* Calculate dataset */
					var meleeWpfs = [];
					var archeryWpfs = [];
					
					for (var enc = 0; enc < 100; enc++) {
						var result = getEffectiveWpfs(powerdraw, archery_wpf, melee_wpf, enc);
						meleeWpfs.push( [enc, result[2]] );
						archeryWpfs.push( [enc, result[0]] );						
					}
					
					try {
						$.plot( encGraphContainer, [
							{ label: "Effective melee WPF", data: meleeWpfs },
							{ label: "Effective archery WPF", data: archeryWpfs }
						]);
					} catch(exc) {
						wrapper.append(
							$("<p />").text("Error creating graph: " + exc)
						);
					}
					
					
					
					
					
					return wrapper;
				};
				
				/* Validates input and triggers output calculation */
				var inputChanged = function() {
				
					/* Validate */
					for (inputKey in inputs) {
						var input = inputs[inputKey];
						var value = 0;
						try {
							
							/* Replace , with . for proper conversion */
							input.val( input.val().replace(",", ".") );
						
							value = parseFloat(input.val());							
							
							if (value < 0 || value > 10000 || isNaN(value)) {
								throw ("Invalid value");
							}
							
						} catch(exc) {
							value = 0;
							input.val(value);
						}
					}
					
					/* Create output */
					createOutput();
				};
				
				/* Input fields to create*/
				var inputFields = ["Power Draw", "Archery WPF", "Melee WPF",
					"Head armor weight", "Body armor weight", "Leg armor weight", "Hand armor weight"];
					
				/* Map for field name -> field */
				var inputs = [], hash;
				
				var startingValues = $("<div />").addClass("inputGroup");
				for (var i = 0; i < inputFields.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + inputFields[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "0")
						.bind("change", inputChanged);
					
					/* Put field to the map */
					inputs[ inputFields[i] ] = input;
					
					var label = $("<label />")
						.text( inputFields[i] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					inputContainer.append(wrap);
				}
				
				/* Trigger output creation */
				inputChanged();
			
			}
		});
		
	}	
}) ( jQuery );