/* Return the amount of xp required for given level */
function getXPForLevel(targetLevel) {
	targetLevel = targetLevel - 1;
	if (targetLevel < 1)
		return 0;
		
	// Up to lvl 30, use the cool formula
	if (targetLevel <= 29) {
		return Math.round((250 * Math.pow(1.26, targetLevel - 1) + targetLevel * 550) * 25 - 17000);
	// At level 31, nice value
	} 
	else if (targetLevel == 30) {
		return 8735843;
	}
	else if (targetLevel == 31) {
		return 17784806;
	} 
	else if (targetLevel == 32) {
		return 37332277;
	} 
	else if (targetLevel == 33) {
		return 80873140;
	} 
	else if (targetLevel == 34) {
		return 180977644;
	} 
	else if (targetLevel == 35) {
		return 418780850;
	}
	else if (targetLevel == 36) {
		return 1003125954;
	} 
	else {
		return getXPForLevel(targetLevel) * 2;
	}
}

/* Return the level achievable with given amount of xp */
function getLevelForXp(xp) {
	var level = 1;
	
	while(newGetXpForLevel(level) < xp) {
		level++;
		
		if (newGetXpForLevel(level) > xp) {
			level--;
			break;
		}
	}
	
	return level;
}

function getTimeForXP(xpNeeded, xpGainPerMinute, generation, multiplier) {


	var xpGain = ((xpGainPerMinute + (generation - 1) * 30) * multiplier);
	var minutesNeeded = xpNeeded / xpGain;
	
	var hours = Math.floor(minutesNeeded / 60);
	var minutes = Math.floor(minutesNeeded - hours * 60);
	
	var formattedTime = "";
	if (hours < 10)
		formattedTime += "0";
	
	formattedTime += hours;
	formattedTime += ":";
	
	if (minutes < 10)
		formattedTime += "0";
	
	formattedTime += minutes;
	
	return formattedTime;
}

/* Returns total hit points for given strength and ironflesh */
function getHitpoints(strength, ironflesh) {

	/* 35 base, 1/strength, 2/ironflesh */
	return 35 + strength + ironflesh * 2;
}

/* Returns total WPP cost for given WPF value*/
function getWPPCost(targetWPF) {

	var wpf = 0;
	var wppCost = 0;
	while (wpf < targetWPF) {
		var nextPointCost = getNextWPFCost(wpf);
		wppCost += nextPointCost;
		wpf++;
	}
	return wppCost;
}

/* Returns cost for next WPF point based on current */
function getNextWPFCost(wpf) {
	var cost = Math.floor(0.0005 * Math.pow(wpf,2) + 3);
	
	return cost;
}

/* Gets available WPP at given level, weapon master skill level, and agility attribute level */
function getAvailableWPP(targetLevel, targetWeaponmaster, agility) {
	
	// Starting WPP of 30 + 1 in all 5 WPFs
	var totalWPP = 15 + 55 * targetWeaponmaster + 20 * (targetWeaponmaster * (targetWeaponmaster + 1) / 2) + 14 * agility;
	
	return totalWPP;
}


/* Adds shared wpf to secondary melee classes */
function getSharedWpf(wpfPrimary, wpfSecondary, wpfTertiary)
{
	return Math.floor((Math.max(wpfSecondary*0.7-30, 0) + Math.max(wpfTertiary*0.7-30, 0)) * 0.3 + wpfPrimary);

}

/* Returns available skill points at given level */
function getAvailableSkillpoints(level) {
	/* 2 to start with, 1/level increase starts at level 2 */
	return level - 1 + 2;
}


/* Gets effective wpf properly! */
function getEffectiveWeight(helmet, chest, hand, feet) {
	helmet = parseFloat(helmet);
	chest = parseFloat(chest);
	hand = parseFloat(hand);
	feet = parseFloat(feet);

	var eweight = Math.max(0, 2*helmet + chest + feet + 4*hand - 10);
	return eweight;
}

function getWeightMulti(effectiveWeight)
{
	effectiveWeight = parseFloat(effectiveWeight);
	return (1 - 0.01 * (effectiveWeight));
}

function getPowerPenalty(ps, weaponType)
{
	var penalty = 0;

	if(weaponType == "Bow")
		penalty = - Math.round((Math.max(14 * ps - Math.pow(1.5,ps), 0)) * 10) / 10; //round to nearest decimal place
	if(weaponType == "Throwing")
		penalty = - (ps * 11);
	return penalty;
}

/* Gets effective wpf properly! */
function getEffectiveWPF(wpf, ps, effectiveWeight, weaponType) {

	wpf = parseInt(wpf);
	effectiveWeight = parseFloat(effectiveWeight);					
	ps = parseInt(ps);



	var nerfed_wpf = wpf + getPowerPenalty(ps, weaponType);


	var weightMulti = getWeightMulti(effectiveWeight);


	nerfed_wpf = weightMulti * nerfed_wpf;


	if (nerfed_wpf < 1) 
		nerfed_wpf = 1;					
	
	
	return nerfed_wpf;
}

/* Find the knockdown chance of a weapon if it hits the body*/
function getKnockdownChanceBody(weaponWeight, rawDamage)
{
	var kdChance = Math.max(0,(Math.min(weaponWeight * 0.33, 2.0) * Math.min((rawDamage - 40.0) * 0.2, 5.0) * 0.015) - 0.05);
	return kdChance;
}

/* Find the knockdown chance of a weapon if it hits the head or legs*/
function getKnockdownChanceHeadLegs(weaponWeight, rawDamage)
{
	var kdChance = Math.min(Math.max(item_weight * 0.33, 1.0), 2.0) * (Math.min(Math.max((rawDamage - 40.0) * 0.5, 5.0), 15.0) * 0.015);
	return kdChance;
}

function getWeaponDamage(str, ps, ha, wpf, dmg, dmgType, weaponCat, mounted, shield, arm) {

	str = parseInt(str);
	ps = parseInt(ps);
	ha = parseInt(ha);
	wpf = parseInt(wpf);
	dmg = parseInt(dmg);
	arm = parseInt(arm);

	// Calculate penalty modifier. Magical numbers by Urist
	var penalty_mod = null;
	if (mounted) {
		// Mounted		
		if (shield) {
			switch (weaponCat) {
				case "1H":
					penalty_mod = 0.9; // Mounted + shield + 1h
					break;
				case "1/2H":
					penalty_mod = 0.85; // Mounted + shield + 1.5h
					break;
				case "Polearm (1h)":
					penalty_mod = 0.85; // Mounted + shield + polearm
					break;
				case "Bow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Crossbow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Throwing":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				default:
					penalty_mod = null; // Error
					break;
			}		
		} else {
			switch (weaponCat) {
				case "1H":
					penalty_mod = 0.9; // Mounted + 1h
					break;
				case "1/2H":
					penalty_mod = 0.85; // Mounted + 1.5h
					break;
				case "2H":
					penalty_mod = 0.85; // Mounted + 2h
					break;
				case "Polearm (1h)":
					penalty_mod = 0.85; // Mounted + 1h polearm
					break;
				case "Polearm (2h)":
					penalty_mod = 0.85*0.9; // Mounted + 2h polearm
					break;
				case "Bow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Crossbow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Throwing":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				default:
					penalty_mod = null; // Error
					break;				
			}
		}
		
	} else {
		// On foot
		if (shield) {
			// With shield
			switch (weaponCat) {
				case "1H":
					penalty_mod = 1; // 1h + shield
					break;
				case "1/2H":
					penalty_mod = 0.9; // 1,5h + shield
					break;
				case "Polearm (1h)":
					penalty_mod = 0.9; // polearm + shield
					break;
				case "Bow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Crossbow":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				case "Throwing":
					penalty_mod = 1; // Mounted + shield + 1h
					break;
				default:
					penalty_mod = null; // Error
					break;			
			}
		} else {
			// Without shield and on foot penalty modifier is 1 for all weapons
			penalty_mod = 1;
		}
	}	
	if (penalty_mod == null) {
		throw "Invalid weapon combination";
	}
	
	// Magical numbers
	var ps_bonus = 0.08;
	var wpf_bonus = 0.15;
	var basewpfbonus = 0.85;
	var strengthbonus = str / 5;
	var hamod = 1;
	var armor_soak_factor_against_cut = 0.65;
	var armor_soak_factor_against_pierce = 0.5;
	var armor_soak_factor_against_blunt = 0.4;
	var armor_reduction_factor_against_cut = 1.6;
	var armor_reduction_factor_against_pierce = 1.1;
	var armor_reduction_factor_against_blunt = 1.3;
	

	if(weaponCat == "Throwing")
	{
		ps_bonus = 0.1;
		if(mounted)
		{
			hamod = 0.8 + ha * 0.019;
		}
	}
	if(weaponCat == "Bow")
	{
		ps_bonus = 0.14;
		if(mounted)
		{
			hamod = 0.8 + ha * 0.019;
		}
	}
	if(weaponCat == "Crossbow")
	{
		basewpfbonus = 1;
		ps_bonus = 0;
		wpf_bonus = 0;
		strengthbonus = 0;
	}
	
	// Potential maximum damage swing can inflict
	var potential_damage = penalty_mod * ( dmg * hamod * ( 1 + ps * ps_bonus ) * ( basewpfbonus + wpf / 100.0 * wpf_bonus ) + strengthbonus );
	

	// Armor soak and reduction factors based on damage type
	var soak_factor = arm;
	var reduction_factor = arm;
	switch (dmgType) {
		case "Cut":
			soak_factor *= armor_soak_factor_against_cut;
			reduction_factor *= armor_reduction_factor_against_cut;
			break;
		case "Pierce":
			soak_factor *= armor_soak_factor_against_pierce;
			reduction_factor *= armor_reduction_factor_against_pierce;
			break;
		case "Blunt":
			soak_factor *= armor_soak_factor_against_blunt;
			reduction_factor *= armor_reduction_factor_against_blunt;
			break;
		default:
			break;
	}	
	if (soak_factor == null || reduction_factor == null) {
		throw "Invalid damage type: " + dmgType;
	}

	//Randomized damage
	var randomized_damage_max = potential_damage;
	var randomized_damage_min = potential_damage * 0.9;
	
	// Damage soak

	//Randomization of damage has been reduced

	var soak_min =  (0.75 * soak_factor);
	var soak_max =  (0.7  * soak_factor);
	var soaked_damage_min = Math.max(0, randomized_damage_min - soak_min);
	var soaked_damage_max = randomized_damage_max - soak_max;
	//Damage reduction
	
	// Urist:
	// "The same random armor between the half and full armor points
	// of the armor is used."
	
	var reduction_max = Math.exp(0.7 * reduction_factor * 0.014);
	var reduction_min = Math.exp(reduction_factor * 0.014);
	var reduced_damage_min = (1.0 - 1.0 / reduction_min) * soaked_damage_min;
	var reduced_damage_max = (1.0 - 1.0 / reduction_max) * soaked_damage_max;

	if (reduction_factor < 0.00001){
		reduced_damage_min  = 0;
		reduced_damage_max  = 0;
	}


	var damage_difference_min = reduced_damage_min + soak_min;
	var effective_damage_min = randomized_damage_min - damage_difference_min;

	var damage_difference_max = reduced_damage_max + soak_max;
	var effective_damage_max = randomized_damage_max - damage_difference_max;
	
	// Round to nearest 2nd decimal, avoiding NaN from 0
	var min_damage = Math.max(0, Math.round(effective_damage_min * 100) / 100);
	var max_damage = Math.max(0, Math.round(effective_damage_max * 100) / 100);
	
	// No negative damage (no healing ;__; )
	if (min_damage < 0) {
		min_damage = 0;
	}
	if (max_damage < 0) {
		max_damage = 0;
	}
	
	return [min_damage, max_damage];
}