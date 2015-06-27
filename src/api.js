var http = require('http');
var https = require('https');

var unitAbbrev = {
	'tbs' : 'tablespoon',
	'tbsp' : 'tablespoon',
	'tbl' : 'tablespoon',
	'tsp' : 'teaspoon',
	'oz' : 'ounce',
	'lb' : 'pound',
	'fl oz' : 'fluid ounce',
	'c' : 'cup',
	'pt' : 'pint',
	'qt' : 'quart',
	'gal' : 'gallon',
	'doz' : 'dozen',
	'to taste' : ''
}

module.exports.getInstructions = function (recipe) {
	https.get(recipe['url'], function(res) {
	  var body = '';
	  res.setEncoding('utf8');
	  res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
      	var content = JSON.parse(body);

      	var category = content['cuisine'];
      	var index = category.indexOf(':');
      	if (index !== -1) {
      		category = category.substring(0, index);
        }

        var ingredients = {};
        for (var i = 0; i < content['ingredients'].length; i++) {
        	var ingrd = content['ingredients'][i];

        	var quantity = parseInt(ingrd['quantity']);
        	if (!quantity) {
        		quantity = 0
        	}

        	var unit = ingrd['unit'].toLowerCase();
        	if (unit in unitAbbrev) {
        		unit = unitAbbrev[unit];
        	}

        	ingredients[ingrd['name']] = [quantity, unit];
        }

        var details = {
  			'category' : category,
  			'serves' : content['serves'],
  			'ingredients' : ingredients,
  			'steps' : content['directions']
  		};

      	var result = {};
      	result[recipe['name']] = details;

      	console.log(result);
      });

	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}
