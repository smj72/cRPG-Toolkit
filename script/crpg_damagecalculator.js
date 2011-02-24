(function( $ ){
	$.fn.crpg_damagecalculator = function() {

	
		return this.each( function() {
			if (this.tagName == "DIV") {
				var $this = $(this);				

				$this
				.append(
					$("<h2 />")
						.text("Melee Weapon Damage Calculator")
				)
				.append(
					$("<p />")
						.addClass("credits")
						.text("Javascript implementation by Vargas, inspiring Python script by virus_found, research by Urist")
				)
				.append(
					$("<p />")
						.text("Calculates potential damage player can inflict on target. Ignores movement and hit location. It appears that random factor is included in damage calculation. This is represented by displaying the average inflicted damage as well as minimum and maximum.")
					);
				
				// Validates all inputs and then calls for output
				var inputChanged = function() {
				
					// Validate numerics
					var validateInputs = ["Strength", "Power Strike", "WPF", "Armor"];
					for (var i = 0; i < validateInputs.length; i++) {
						var input = inputs[ validateInputs[i] ];
						var value = 1;
						try {						
							value = parseInt(input.val());							
							
							if (value < 0 || value > 1000 || isNaN(value)) {
								throw ("Invalid value");
							}
							
						} catch(exc) {
							value = 1;
							input.val(value);
						}
					}
					
					// Power strike cannot be higher than Floor(str/3)
					var maximumPs = Math.floor(parseInt(inputs["Strength"].val()) / 3);
					if ( maximumPs < parseInt(inputs["Power Strike"].val()))
						inputs["Power Strike"].val(maximumPs);
					
					
					// Create output
					createOutput();
				}
				
				var createOutput = function() {
					//function getWeaponDamage(str, ps, wpf, dmg, dmgType, weaponCat, mounted, shield, armor)
					outputWrap.children().remove();
					
					
					var output;					
					try {
						var damage = getWeaponDamage(
							inputs["Strength"].val(),						
							inputs["Power Strike"].val(),
							inputs["WPF"].val(),
							inputs["Weapon damage"].val(),
							inputs["Damage type"].val(),
							inputs["Weapon type"].val(),
							inputs["Mounted"].is(":checked"),
							inputs["Shield"].is(":checked"),
							inputs["Armor"].val()
						);
						
						outputWrap.append(
							$("<h3 />").text("Damage values")
						);
						
						output = $("<ul />")
						.css({
							"font-size": "110%",
							"margin": "3em 0 5em 0"
						})
						.append(
							$("<li />")
								.text("Minimum: " + damage[0])
						)
						.append(
							$("<li />")
								.text("Average: " + ((damage[0] + damage[1]) / 2))
						)
						.append(
							$("<li />")
								.text("Maximum: " + damage[1])
						);
					} catch(exc){
						output = $("<p />").text(exc);
					}
					outputWrap.append(output)
					
					/* Graphic for damage for each damage type and armor */
					outputWrap.append(
						$("<h3 />").text("Graphics")
					);
					
					var damageTypeGraphWrap = $("<div />")
						.addClass("graphWrap")
						.width(400)
						.height(350)
						.append(
							$("<label />")
							.text("Average damage to armor for specified starting values with different damage types (dmg / armor)")
						);
					outputWrap.append(damageTypeGraphWrap);
					
					var damageTypeGraphContainer = $("<div />")
						.addClass("graphContainer")
						.width(damageTypeGraphWrap.width() * 0.9)
						.height(damageTypeGraphWrap.height() * 0.9);					
					damageTypeGraphWrap.append(damageTypeGraphContainer);					
					
					/* Calculate dataset */
					var damages = [ ["Cut", [] ], ["Pierce", [] ], ["Blunt", [] ] ];
					for (var armor = 0; armor < 100; armor++) {
						
						for (var i = 0; i < damages.length; i++) {
							var damage = getWeaponDamage(
								inputs["Strength"].val(),						
								inputs["Power Strike"].val(),
								inputs["WPF"].val(),
								inputs["Weapon damage"].val(),
								damages[i][0],
								inputs["Weapon type"].val(),
								inputs["Mounted"].is(":checked"),
								inputs["Shield"].is(":checked"),
								armor
							);
							damages[i][1].push( [armor, (damage[0] + damage[1]) / 2] );
						}
					}
					
					try {
						$.plot( damageTypeGraphContainer, [
							{ 	label: damages[0][0],
								data: damages[0][1],								
							},
							{ 	label: damages[1][0],
								data: damages[1][1],								
							},
							{ 	label: damages[2][0],
								data: damages[2][1],								
							},
							]);
					} catch(exc) {
						outputWrap.append(
							$("<p />").text("Error creating graph: " + exc)
						);
					}
					
					
					
				}
				
				//
				// Create input elements
				//
				var inputContainer = $("<div />")
					.addClass("input")
					.append(
						$("<h3 />")
							.text("Starting values")
					);
				$this.append(inputContainer);
				
				var inputs = [], hash;
				
				// Character options		
				var charWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Character")
					);					
				var charInputs = ["Strength", "Power Strike", "WPF"];
				for (var i = 0; i < charInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + charInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "1")
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ charInputs[i] ] = input;
					
					var label = $("<label />")
						.text( charInputs[i] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					charWrap.append(wrap);
				}
				
				
				
				// Add mounted/not checkbox
				var mountedWrap = $("<div />")
					.addClass("inputWrap");
				
				var mountedCheckbox = $("<input />")
					.attr({
					"type": "checkbox",
					"name": "input_mounted"
					})
					.bind("change", inputChanged);
				
				inputs["Mounted"] = mountedCheckbox;
				
				mountedWrap.append(
					$("<label />").text("Mounted")
				).append( mountedCheckbox );
				
				charWrap.append( mountedWrap );
				inputContainer.append(charWrap);
				
				
				// Equipment options			
				var wrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Equipment")
					);
				
				var weaponDamage = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "30",
					"name": "input_weapondamage"
					})
					.bind("change", inputChanged);
				
				inputs["Weapon damage"] = weaponDamage;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Weapon damage")
						)
						.append(
							weaponDamage
						)	
				);
					
					
				// Weapon type select
				var weaponTypeSelect = $("<select />")
					.bind("change", inputChanged);
				var weaponTypes = ["1H", "1/2H", "2H", "Polearm (1h)", "Polearm (2h)"];
				for (var i = 0; i < weaponTypes.length; i++) {
					weaponTypeSelect.append(
						$("<option />")
							.attr("value", weaponTypes[i])
							.text(weaponTypes[i])
					);
				}
				
				inputs["Weapon type"] = weaponTypeSelect;
				
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Weapon type")
						)
						.append(
							weaponTypeSelect
						)	
				);
				
				// Damage type select
				var damageTypeSelect = $("<select />")
					.bind("change", inputChanged);
				var damageTypes = ["Cut", "Pierce", "Blunt"];
				for (var i = 0; i < damageTypes.length; i++) {
					damageTypeSelect.append(
						$("<option />")
							.attr("value", damageTypes[i])
							.text(damageTypes[i])
					);
				}
				
				inputs["Damage type"] = damageTypeSelect;
				
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Damage type")
						)
						.append(
							damageTypeSelect
						)	
				);
				
				
				
				var shieldCheckbox = $("<input />")
					.attr({
					"type": "checkbox",
					"name": "input_shield"
					})
					.bind("change", inputChanged);
				
				inputs["Shield"] = shieldCheckbox;
				
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Shield")
						)
						.append(
							shieldCheckbox
						)
				);
				inputContainer.append(wrap);
				
				
				// Target options
				var targetWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Target")
					);					
				var targetInputs = ["Armor"];
				for (var i = 0; i < targetInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + targetInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "10")
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ targetInputs[i] ] = input;
					
					var label = $("<label />")
						.text( targetInputs[i] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					targetWrap.append(wrap);
				}
				inputContainer.append(targetWrap);
				
				
				
				// Output
				var outputWrap = $("<div />")
					.addClass("output");
				$this.append(outputWrap);
				
				// Trigger output generation
				inputChanged();
			}
		});
		
	}	
}) ( jQuery );