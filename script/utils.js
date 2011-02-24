// Returns url variables in a hashtable
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// Adds chunking method to strings. Splits string into
// an array containing substrings of n chars each
String.prototype.chunk = function(n) {
    var ret = [];
		
	for(var i=0, len=this.length; i < len; i += n) {
	   ret.push(this.substr(i, n))
	}

    return ret;
};

// Adds separation method to numbers. Allows adding separator chars for thousands,
// so that 1000000 becomes 1,000,000
Number.prototype.separate = function(separator) {

	var s = this.toString()

	var decimalPosition = s.indexOf(".");
	var length = s.length;

	// Check for decimals, alter "number" part length if necessary
	if (decimalPosition > -1)
		length = decimalPosition;
		
	var formattedNumber = "";
	
	// Add the decimal part first
	formattedNumber = s.substring(length, s.length);
	
	// Start adding numbers from right to left, adding separator when necessary
	for (var i = length - 1; i >= 0; i--) {	
		if ( (length - i - 1) % 3 == 0 && i != length - 1)
			formattedNumber = s.charAt(i) + separator + formattedNumber;
		else
			formattedNumber = s.charAt(i) + formattedNumber;
	}
	
	return formattedNumber;
}