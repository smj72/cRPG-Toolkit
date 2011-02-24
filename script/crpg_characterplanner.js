(function( $ ){
	$.fn.crpg_characterplanner = function() {

	
		return this.each( function() {
			if (this.tagName == "DIV") {
				var $this = $(this);				
				
				$this
				.append(
					$("<h2 />")
						.text("Character planner")
				)
				.append(
					$("<p />")
						.text("Calculates available attribute, skill and wpp points. Enables making character builds for specified level characters and displaying build information in an easy-to-copy listing.")
					)
				.append(
					$("<p />")
						.text("WPF calculation can have minor error (1-2 WPF), as it is based on player observations and not exact function like before (thanks Gafferjack).")
				)
				.append(
					$("<p />")
						.text("For cRPG version 0.210")
				);
				
				// Validates all inputs and then calls for output
				var inputChanged = function() {
				
					// Validate level input
					var input = inputs["Level"];
					var value = 1;
					try {						
						value = parseInt(input.val());							
						
						if (value < 1 || value > 100 || isNaN(value)) {
							throw ("Invalid value");
						}
						
					} catch(exc) {
						value = 1;
						input.val(value);
					}
				
					// Validate attribute inputs
					for (i = 0; i < attrInputs.length; i++) {
						var inputName = attrInputs[i];
						var input = inputs[inputName];
						var value = 3;
						try {						
							value = parseInt(input.val());							
							
							if (value < 3 || value > 100 || isNaN(value)) {
								throw ("Invalid value");
							}
							
						} catch(exc) {
							value = 3;
							input.val(value);
						}
					}
				
					// Validate skill inputs, first remove basic errors				
					for (i = 0; i < skillInputs.length; i++) {
						var inputName = skillInputs[i];
						var input = inputs[inputName];
						var value = 1;
						try {						
							value = parseInt(input.val());							
							
							if (value < 0 || value > 30 || isNaN(value)) {
								throw ("Invalid value");
							}
							
						} catch(exc) {
							value = 0;
							input.val(value);
						}
					}
					
					// Skill points need to be converted 2 at a time
					if ( parseInt(inputs["Converted"].val()) % 2 != 0)
						inputs["Converted"].val( parseInt(inputs["Converted"].val()) - 1);
					
					// Then validate skill-attribute dependencies
					var skillDependencies = [
						["Converted", parseInt(availableSkillOutput.text())],
						["Ironflesh", Math.floor(inputs["Strength"].val() / 3)],
						["Power Strike", Math.floor(inputs["Strength"].val() / 3)],
						["Shield", Math.floor(inputs["Agility"].val() / 3)],
						["Athletics", Math.floor(inputs["Agility"].val() / 3)],
						["Riding", Math.floor(inputs["Agility"].val() / 3)],
						["Horse Archery", Math.floor(inputs["Agility"].val() / 6)],
						["Power Draw", Math.floor(inputs["Strength"].val() / 3)],
						["Power Throw", Math.floor(inputs["Strength"].val() / 3)],
						["Weapon Master", Math.floor(inputs["Agility"].val() / 3)]
					];
					for(var i = 0; i < skillDependencies.length; i++) {
						var skill = skillDependencies[i][0];
						var limit = skillDependencies[i][1];						
						var relevantInput = inputs[skill];
						if ( parseInt(relevantInput.val()) > limit) {
							relevantInput.val(limit);
						}
					}
					
					// Validate wpf inputs
					for (i = 0; i < wpfInputs.length; i++) {
						var inputName = wpfInputs[i];
						var input = inputs[inputName];
						var value = 1;
						try {						
							value = parseInt(input.val());							
							
							if (value < 1 || value > 500 || isNaN(value)) {
								throw ("Invalid value");
							}
							
						} catch(exc) {
							value = 1;
							input.val(value);
						}
					}
					
					
					// Create output
					createOutput();
				}
				
				var createOutput = function() {
				
					// Attribute totals
					
					// 1 per level, 6 to start with, increase starts at level 2
					var availableAttribute = 6 - 1 + parseInt(inputs["Level"].val()) + Math.floor( parseInt(inputs["Converted"].val()) / 2);
					availableAttributeOutput.text(availableAttribute);
					
					var usedAttribute = 0;
					for(var i = 0; i < attrInputs.length; i++) {
						usedAttribute += parseInt(inputs[attrInputs[i]].val());
					}
					usedAttributeOutput.text(usedAttribute).removeClass("error");
					if (usedAttribute > availableAttribute)
						usedAttributeOutput.addClass("error");
				
					// Skill totals
					var availableSkill = getAvailableSkillpoints( parseInt(inputs["Level"].val()) );
					availableSkillOutput.text(availableSkill);
					
					var usedSkill = 0;
					for(var i = 0; i < skillInputs.length; i++) {
						usedSkill += parseInt(inputs[skillInputs[i]].val());
					}
					usedSkillOutput.text(usedSkill).removeClass("error");
					if (usedSkill > availableSkill)
						usedSkillOutput.addClass("error");
				
					// WPP totals					
					var availableWpp = getAvailableWPP( parseInt(inputs["Level"].val()), parseInt(inputs["Weapon Master"].val()) );
					availableWppOutput.text(availableWpp);
					
					var usedWpp = 0;
					for(var i = 0; i < wpfInputs.length; i++) {
						usedWpp += getWPPCost( parseInt(inputs[wpfInputs[i]].val()) );
					}
					usedWppOutput.text(usedWpp).removeClass("error");
					if (usedWpp > availableWpp) 
						usedWppOutput.addClass("error");
					
					// Actual build listing
					outputWrap.children().remove();
					
					outputWrap.append(
						$("<h4 />")
						.text("Level " + inputs["Level"].val() + " (" + getXPForLevel( parseInt(inputs["Level"].val())).separate(" ") + " xp)")
					);
					
					var attributes = new Array(						
						("Strength: " + inputs["Strength"].val()),
						("Agility: " + inputs["Agility"].val())
					);
					if ( !(inputs["Build Listing Style"].val() == "simple") ){
						attributes.push( "Hit points: " + getHitpoints( parseInt(inputs["Strength"].val()), parseInt(inputs["Ironflesh"].val())) );
					}

					
					
					var attributesList = $("<ul />");
					for (var i = 0; i < attributes.length; i++) {
						attributesList.append(
							$("<li />").text(attributes[i])
						);
					}
					outputWrap.append(attributesList);
					
					var freePointsList = $("<ul />");
					if (availableAttribute > usedAttribute) {
						freePointsList.append(
							$("<li />").text("Unused attribute points: " + (availableAttribute - usedAttribute))
						);
					}
					if (availableSkill > usedSkill) {
						freePointsList.append(
							$("<li />").text("Unused skill points: " + (availableSkill - usedSkill))
						);
					}
					if (freePointsList.children().length > 0)
						outputWrap.append(freePointsList);
					
					
					var skillsList = $("<ul />");					
					for (var i = 0; i < skillInputs.length; i++) {
						if (!(inputs["Build Listing Style"].val() == "simple" && parseInt(inputs[skillInputs[i]].val()) < 1))
						skillsList.append(
							$("<li />").text( skillInputs[i] + ": " + inputs[skillInputs[i]].val() )
						);
					}
					outputWrap.append(skillsList);

					
					var proficiencyList = $("<ul />");
					for(var i = 0; i < wpfInputs.length; i++) {
						if (!(inputs["Build Listing Style"].val() == "simple" && parseInt(inputs[wpfInputs[i]].val()) < 2))
						proficiencyList.append(
							$("<li />").text( wpfInputs[i] + ": " + inputs[wpfInputs[i]].val() )
						);
					}
					outputWrap.append(proficiencyList);
				}
				
				var inputContainer = $("<div />")
					.addClass("input");
				$this.append(inputContainer);
				
				var inputs = [], hash;
				
				// General options
				var generalWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("General")
					);
				var input = $("<input />")
					.addClass("controllable controllable_increment_1")
					.attr("name", "input_level")
					.attr("type", "text")
					.attr("value", "1")
					.bind("change", inputChanged);
				
				// Put field to the map
				inputs[ "Level" ] = input;
				
				var label = $("<label />")
					.text( "Level" );
				
				var wrap = $("<div />")
					.addClass("inputWrap");
					
				wrap.append(label)
					.append(input);
					
				generalWrap.append(wrap);
				
				// Build option dropdown
				var buildListingSelect = $("<select />")
						.append(
							$("<option />")
							.val("simple")
							.text("Minimal")
						)
						.append(
							$("<option />")
							.val("full")
							.text("Full")
						)
						.bind("change", inputChanged)
						.val("full");
						
				inputs["Build Listing Style"] = buildListingSelect;
				
				generalWrap.append(
					$("<div />")
					.addClass("inputWrap")
					.append(
						$("<label />")
						.text("Listing style")
					)
					.append(
						buildListingSelect
					)
				);
				
				inputContainer.append(generalWrap);
				
					
				
				// Attributes
				var availableAttributeOutput = $("<span />");
				var usedAttributeOutput = $("<span />");
				var attributeTotals = $("<div />")
					.addClass("inputInfoBlock");
				attributeTotals.append(
					$("<span />")
						.text("Used / available: ")
				)
				.append( usedAttributeOutput )
				.append( $("<span />").text(" / ") )
				.append( availableAttributeOutput );
				
				var attributesWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Attributes")
					)
					.append(
						attributeTotals
					);					
				var attrInputs = ["Strength", "Agility"];
				for (var i = 0; i < attrInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + attrInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "3")
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ attrInputs[i] ] = input;
					
					var label = $("<label />")
						.text( attrInputs[i] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					attributesWrap.append(wrap);
				}
				inputContainer.append(attributesWrap);
				
				// Skills
				var availableSkillOutput = $("<span />");
				var usedSkillOutput = $("<span />");
				var skillTotals = $("<div />")
					.addClass("inputInfoBlock");
				skillTotals.append(
					$("<span />")
						.text("Used / available: ")
				)
				.append( usedSkillOutput )
				.append( $("<span />").text(" / ") )
				.append( availableSkillOutput );
				
				var skillsWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Skills")
					)
					.append(
						skillTotals
					)
					
				var skillInputs = ["Converted", "Ironflesh", "Power Strike", "Shield", "Athletics",
					"Riding", "Horse Archery", "Power Draw", "Power Throw", "Weapon Master"];
				for (var i = 0; i < skillInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_1")
						.attr("name", "input_" + skillInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "0")
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ skillInputs[i] ] = input;
					
					// Replace increment for Converted points with 2
					if (skillInputs[i] == "Converted") {
						input.removeClass("controllable_increment_1")
							.addClass("controllable_increment_2");						
					}
					
					var label = $("<label />")
						.text( skillInputs[i] );
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input);
						
					skillsWrap.append(wrap);
				}
				inputContainer.append(skillsWrap);
				
				
					
				// Proficiencies
				var availableWppOutput = $("<span />");
				var usedWppOutput = $("<span />");
				var wppTotals = $("<div />")
					.addClass("inputInfoBlock");
				wppTotals.append(
					$("<span />")
						
						.text("Used / available: ")
				)
				.append( usedWppOutput )
				.append( $("<span />").text(" / ") )
				.append( availableWppOutput );
				
				var wpfWrap = $("<div />")
					.addClass("inputGroup")
					.append(
						$("<h4 />").text("Weapon proficiencies")
					)
					.append(wppTotals);
				var wpfInputs = ["One Handed", "Two Handed", "Polearm", "Archery", "Crossbow", "Throwing"];
				for (var i = 0; i < wpfInputs.length; i++) {
					var input = $("<input />")
						.addClass("controllable controllable_increment_10")
						.attr("name", "input_" + wpfInputs[i].toLowerCase().replace(/\s/ig, ""))
						.attr("type", "text")
						.attr("value", "1")
						.bind("change", inputChanged);
					
					// Put field to the map
					inputs[ wpfInputs[i] ] = input;
					
					var label = $("<label />")
						.text( wpfInputs[i] );
						
					var maxButton = $("<button />")
						.addClass("button")
						.css({
							"float": "right",
							"clear": "none"
						})
						.text("Max")
						.bind("click", function() {
							// Maximize single wpf
							var thisInput = $(this).parent().find("input");
							thisInput.val(1);
							
							var available = parseInt(availableWppOutput.text());
							var used = parseInt(usedWppOutput.text()) - parseInt(thisInput.val());
							var freeWpp = available - used;
							var newWpfValue = 1;
							
							while (getWPPCost(newWpfValue) <= freeWpp) {
								newWpfValue++;
								if (getWPPCost(newWpfValue) > freeWpp) {
									newWpfValue--;
									break;
								}
							}
							
							// Find the input under buttons parent and update value
							thisInput.val(newWpfValue);
							inputChanged();
						});
					
					var wrap = $("<div />")
						.addClass("inputWrap");
						
					wrap.append(label)
						.append(input)
						.append(maxButton);
						
					wpfWrap.append(wrap);
				}
				inputContainer.append(wpfWrap);
				
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