(function( $ ){
	$.fn.crpg_damagecalculator = function() {

	
		return this.each( function() {
			if (this.tagName == "DIV") {
				var $this = $(this);				

				$this
				.append(
					$("<h2 />")
						.text("Weapon Damage Calculator")
				)
				.append(
					$("<p />")
						.addClass("credits")
						.text("Javascript implementation by Vargas, inspiring Python script by virus_found, research by Urist. Formulae updated by San.")
				)
				.append(
					$("<p />")
						.text("Calculates potential damage player can inflict on target. Ignores movement and hit location. It appears that random factor is included in damage calculation. This is represented by displaying the average inflicted damage as well as minimum and maximum.")
					)
				.append(
					$("<p />")
						.text("Mounted and shield damage values may not be accurate.")
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
						var eweight = Math.round(getEffectiveWeight(inputs["helmet"].val(), inputs["bodyarmor"].val(), inputs["handarmor"].val(), inputs["boots"].val()) * 10) / 10;
						var damage = getWeaponDamage(
							inputs["Strength"].val(),						
							inputs["Power Strike"].val(),
							inputs["Horse Archery"].val(),
							inputs["WPF"].val(),
							inputs["Weapon damage"].val(),
							inputs["Damage type"].val(),
							inputs["Weapon type"].val(),
							inputs["Mounted"].is(":checked"),
							inputs["Shield"].is(":checked"),
							inputs["Armor"].val(),
							eweight
						);
						
						outputWrap.append(
							$("<h3 />").text("Damage values")
						);
						
						output = $("<ul />")
						.css({
							"font-size": "110%",
							"margin": "1em 0 2em 0"
						})
						.append(
							$("<li />")
								.text("Minimum: " + damage[0])
						)
						.append(
							$("<li />")
								.text("Real Average: " + damage[2] /*Math.max(0,(Math.round((damage[0] + damage[1]) * 50.0))/ 100.0)*/)
						)
						.append(
							$("<li />")
								.text("Maximum: " + damage[1])
						)
						.append(
							$("<li />")
								.text("Raw Damage: " + damage[3])
						);

						if(inputs["Knockdown"].is(":checked") && inputs["Damage type"].val() == "Blunt")
						{
							var kdHL = getKnockdownChanceHeadLegs(parseFloat(inputs["weaponWeight"].val()), damage[3]);
							var kdB  = getKnockdownChanceBody(parseFloat(inputs["weaponWeight"].val()), damage[3]);
							output.append(
							$("<li />")
								.text("Knockdown Chance for Head/Legs: " + kdHL + "%")
							)
							.append(
							$("<li />")
								.text("Knockdown Chance for Body: " + kdB + "%")
							);
						}
					} catch(exc){
						output = $("<p />").text(exc);
					}
					outputWrap.append(output)




					var output2;					
					try {

						var eweight = Math.round(getEffectiveWeight(inputs["helmet"].val(), inputs["bodyarmor"].val(), inputs["handarmor"].val(), inputs["boots"].val()) * 10) / 10;
						var ewpf = getEffectiveWPF(
							inputs["WPF"].val(),					
							inputs["Power Strike"].val(),
							eweight,
							inputs["Weapon type"].val()
						);

						var weight =  Math.round((parseFloat(inputs["helmet"].val()) + parseFloat(inputs["bodyarmor"].val()) + parseFloat(inputs["handarmor"].val()) + parseFloat(inputs["boots"].val())) * 10) / 10;
						var powerpenalty = -getPowerPenalty(parseInt(inputs["Power Strike"].val()), inputs["Weapon type"].val());

						var weightpenalty = parseInt(inputs["WPF"].val()) - ((/*1 -*/ getWeightMulti(eweight)) * (parseInt(inputs["WPF"].val())) / 100);
						weightpenalty = Math.round(weightpenalty);
						ewpf = Math.round(ewpf);

						outputWrap.append(
							$("<h3 />").text("Effective wpf")
						);
						
						output2 = $("<ul />")
						.css({
							"font-size": "110%",
							"margin": "1em 0 2em 0"
						})
						.append(
							$("<li />")
								.text("Armor Weight: " + weight)
						)
						.append(
							$("<li />")
								.text("Effective Armor Weight: " + eweight)
						)
						.append(
							$("<li />")
								.text("Effective WPF: " + ewpf)
						)
						.append(
							$("<li />")
								.text("WPF penalty from weight: " + weightpenalty)
						)
						.append(
							$("<li />")
								.text("WPF penalty from PT/PD: " + powerpenalty)
						)


					} catch(exc){
						output2 = $("<p />").text(exc);
					}
					outputWrap.append(output2)
					
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
					var eweight = Math.round(getEffectiveWeight(inputs["helmet"].val(), inputs["bodyarmor"].val(), inputs["handarmor"].val(), inputs["boots"].val()) * 10) / 10;
					var damages = [ ["Cut", [] ], ["Pierce", [] ], ["Blunt", [] ] ];
					for (var armor = 0; armor < 100; armor++) {
						
						for (var i = 0; i < damages.length; i++) {
							var damage = getWeaponDamage(
								inputs["Strength"].val(),						
								inputs["Power Strike"].val(),
								inputs["Horse Archery"].val(),
								inputs["WPF"].val(),
								inputs["Weapon damage"].val(),
								damages[i][0],
								inputs["Weapon type"].val(),
								inputs["Mounted"].is(":checked"),
								inputs["Shield"].is(":checked"),
								armor,
								eweight
							);
							damages[i][1].push( [armor,damage[2]] );
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
				var charInputs = ["Strength", "Power Strike", "Horse Archery", "WPF"];
				var valInputs  = ["18", "6", "1", "140"];
				for (var i = 0; i < charInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + charInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", valInputs[i])
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
					"value": "34",
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
				var weaponTypes = ["1H", "1/2H", "2H", "Polearm (1h)", "Polearm (2h)", "Crossbow", "Bow", "Throwing"];
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
				
				// Weapon Weight and knockdown, currently commented out

				var weaponWeight = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "2",
					"name": "input_weaponWeight"
					})
					.bind("change", inputChanged);

				inputs["weaponWeight"] = weaponWeight;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Weapon weight")
						)
						.append(
							weaponWeight
						)	
				);

				var knockdownCheckbox = $("<input />")
					.attr({
					"type": "checkbox",
					"name": "input_knockdown"
					})
					.bind("change", inputChanged);
				
				inputs["Knockdown"] = knockdownCheckbox;


				// Armor weight stuff

				var helmet = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "0",
					"name": "input_helmet"
					})
					.bind("change", inputChanged);

				inputs["helmet"] = helmet;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Helmet weight")
						)
						.append(
							helmet
						)	
				);


				var bodyarmor = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "0",
					"name": "input_bodyarmor"
					})
					.bind("change", inputChanged);

				inputs["bodyarmor"] = bodyarmor;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Body armor weight")
						)
						.append(
							bodyarmor
						)	
				);



				var handarmor = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "0",
					"name": "input_handarmor"
					})
					.bind("change", inputChanged);

				inputs["handarmor"] = handarmor;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Hand armor weight")
						)
						.append(
							handarmor
						)	
				);


				var boots = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr({
					"type": "text",
					"size": "3",
					"value": "0",
					"name": "input_boots"
					})
					.bind("change", inputChanged);

				inputs["boots"] = boots;
				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Boot weight")
						)
						.append(
							boots
						)	
				);
				

				// End.

				wrap.append(
					$("<div />")
						.addClass("inputWrap")
						.append(
							$("<label />").text("Knockdown")
						)
						.append(
							knockdownCheckbox
						)
				);

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
						.attr("value", "55")
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