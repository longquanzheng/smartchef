// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - LITERAL slot: demonstrates literal handling for a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Minecraft Helper how to make paper."
 *  Alexa: "(reads back recipe for paper)"
 */

'use strict';

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

var AlexaSkill = require('./AlexaSkill'),
    getInstructions = require('./api').getInstructions,
    recipes = require('./recipes'),
    db = require('./db');

var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * MyChef is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MyChef = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MyChef.prototype = Object.create(AlexaSkill.prototype);
MyChef.prototype.constructor = MyChef;

MyChef.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = "Hey there. Let's think about recipes. What would you like to make? For example, say something like, how do I make steak.";
    var repromptText = "Just ask something like how do I make steak, or something, and I'll see what I can turn up.";
    response.askWithCard(speechOutput, repromptText);
};

MyChef.prototype.intentHandlers = {
    RecipeIntent: function (intent, session, response) {

        // get the Dish's name (lowercase)
        var recipeName = intent.slots.Recipe.value.toLowerCase();
        var cardTitle = "Recipe intent received: " + recipeName;
        var cardContent = "Recipe found. Maybe add info here about ingredient/instruction count.";

        http.get('http://api.pearson.com:80/kitchen-manager/v1/recipes?name-contains=' + recipeName, function(res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function() {
                var content = JSON.parse(body);
                console.log(content);
                console.log(content['count']);

                if (content["count"] === 0) {
                    response.ask("Sorry, I have no idea how to make " + recipeName + ". Any other requests???");
                } else {
                    var recipe = content['results'][0];
                    
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

                            //if (recipes[recipeName]) { // step 0
                            // recipe exists

                            // step 1
                            //db.putRecipe(recipes[recipeName]);

                            // step 2
                            //db.updateSize(1);

                            // step 3
                            //db.updateStep(0);

                            db.putRecipe(result[recipe['name']],function(){
                                //db.getRecipe(function(recipe){

                                    console.log("logged recipe",recipe);
                                    db.putSize("1",function(){

                                        console.log("succ put size2");
                                        //db.getSize(function(size){

                                    
                                            db.putStep("0",function(){

                                                console.log("succ put step");
                                               // db.getStep(function(step){
                                                    response.ask("Sorry, I");
                                                    // response.askWithCard(
                                                    // "I know about " + recipeName + "! Do you want to hear the ingredients or shall I explain instructions?",
                                                    // "Sorry, didn't quite catch that. Ingredients, or instructions?", 
                                                    // cardTitle, cardContent);
                                                });
                                          //  }); 
                                        //});
                                    //});
                                });
                            });

                            // response.askWithCard(
                            //     "I know about " + recipeName + "! Do you want to hear the ingredients or shall I explain instructions?",
                            //     "Sorry, didn't quite catch that. Ingredients, or instructions?", 
                            //     cardTitle, cardContent);
                            // } else {
                            //     response.ask("Sorry, I have no idea how to make " + recipeName + ". Any other requests?");
                            // }
                        });
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });
                }
            });

        }).on('error', function(e) {
            console.log("Got error: ", e);
        });
    },

    IngredientIntent: function (intent, session, response) {
        var servingModified = intent.slots.Servings,
            servings;
        
        var cardTitle = "Ingredient intent received.";
        var cardContent = "";

        var recipizzles = recipes["steak"]["ingredients"];

        if (servingModified) {
            servings = parseInt(servingModified.value);
            db.putSize(servings,function() {
                db.getRecipe(function(recipe) {
                    // the ingredientFunction
                    //move this to function
                        var ingredient_list = recipizzles;//recipe["ingredient_lists"];
                        var str = "You need ";
                        var i = 0;
                        var size = 1;//getSize() / recipe.serves;
                        db.getSize(function(serv_size){
                            size = serv_size;

                           for (var key in ingredient_list) {
                            i++;
                            if (i != Object.keys(ingredient_list).length) {

                                var ingredient = ingredient_list[key];
                                ingredient[0] *= size;

                                if (ingredient[0] == 0) {

                                    str = str + (key + ", ");
                                } else if (ingredient[0] == 1) {

                                    if (ingredient[1] == "") {
                                        str = str + (ingredient[0] + " " + key + ", ");
                                    } else {
                                        str = str + (ingredient[0] + " " + ingredient[1] + " of " + key + ", ");
                                    }

                                } else {
                                    if (ingredient[1] == "") {
                                        str = str + (ingredient[0] + " " + key + "s, ");
                                    } else {
                                        str = str + (ingredient[0] + " " + ingredient[1] + "s of " + key + ", ");
                                    }
                                }
                            } else {
                                var ingredient = ingredient_list[key];
                                ingredient[0] *= size;

                                if (ingredient[0] == 0) {
                                    str = str + ("and " + key + ".");

                                } else if(ingredient[0] == 1) {

                                    if (ingredient[1] == "") {

                                        str = str + ("and " + ingredient[0] + " " + key + ".");
                                    } else {
                                        str = str + ("and " + ingredient[0] + " " + ingredient[1] + " of " + key + ".");

                                    }
                                } else{
                                    if (ingredient[1] == "") {
                                        str = str + ("and " + ingredient[0] + " " + key + "s.");
                                    } else {
                                        str = str + ("and " + ingredient[0] + " " + ingredient[1] + "s of " + key + ".");
                                    }
                                }
                            }
                        }
                        
                        //respond
                        response.askWithCard(
                            str, "Now, would you like to hear the ingredients again or shall I explain the instructions?",
                            cardTitle, cardContent); 
                        // move above to function
                });
            });
        });
        } else {
            db.getRecipe(function(recipe) {
                // the ingredientFunction
                //move this to function
                        var ingredient_list = recipe["ingredient_lists"];
                        var str = "You need ";
                        var i = 0;
                        var size = 1;//getSize() / recipe.serves;
                        db.getSize(function(serv_size){
                            size = serv_size;

                            console.log(size);

                           for (var key in ingredient_list) {
                            i++;
                            if (i != Object.keys(ingredient_list).length) {

                                var ingredient = ingredient_list[key];
                                ingredient[0] *= size;

                                if (ingredient[0] == 0) {

                                    str = str + (key + ", ");
                                } else if (ingredient[0] == 1) {

                                    if (ingredient[1] == "") {
                                        str = str + (ingredient[0] + " " + key + ", ");
                                    } else {
                                        str = str + (ingredient[0] + " " + ingredient[1] + " of " + key + ", ");
                                    }

                                } else {
                                    if (ingredient[1] == "") {
                                        str = str + (ingredient[0] + " " + key + "s, ");
                                    } else {
                                        str = str + (ingredient[0] + " " + ingredient[1] + "s of " + key + ", ");
                                    }
                                }
                            } else {
                                var ingredient = ingredient_list[key];
                                ingredient[0] *= size;

                                if (ingredient[0] == 0) {
                                    str = str + ("and " + key + ".");

                                } else if(ingredient[0] == 1) {

                                    if (ingredient[1] == "") {

                                        str = str + ("and " + ingredient[0] + " " + key + ".");
                                    } else {
                                        str = str + ("and " + ingredient[0] + " " + ingredient[1] + " of " + key + ".");

                                    }
                                } else{
                                    if (ingredient[1] == "") {
                                        str = str + ("and " + ingredient[0] + " " + key + "s.");
                                    } else {
                                        str = str + ("and " + ingredient[0] + " " + ingredient[1] + "s of " + key + ".");
                                    }
                                }
                            }
                        }
                        
                        //respond
                        response.askWithCard(
                            str, "Now, would you like to hear the ingredients again or shall I explain the instructions?",
                            cardTitle, cardContent); 
                        // move above to function
            });
        });
}
    },

    InstructionIntent: function (intent, session, response) {
        var servingsOrRecipe = intent.slots.Servings,
            servings;
        
        var cardTitle = "Step #(step number from db)";

        if(servingsOrRecipe){
            servings = parseInt(servingsOrRecipe.value);
            if (isNaN(servings)) //recipe
            {
                console.log("hi");//do same stuff as recipeIntent
                db.getStep(function(step){
                    doInterpretStep(step);
                });
            }
            else                         //servings
            { console.log("no");
                db.putSize(servings,function(){
                    db.putStep(1,function(){
                        doInterpretStep(1);
                    });    
                });
                
            }
        }else{
            db.getStep(function(step){
                doInterpretStep(step);
            });
        }

        function doInterpretStep(stepIndexRaw){
            //interpret step
            var stepIndex = stepIndexRaw-1;//getStep() - 1;
            var recipe = recipes["steak"];//getRecipe();

            if(recipe["steps"].length <= stepIndex){
                console.log("step is ",stepIndex);
                db.putStep(1,function(){
                    response.ask("Congratulations! You have completed all the steps!");
                });
            }else{
                console.log(recipe["steps"][stepIndex]);
            

                var step = recipe["steps"][stepIndex];
                var str = "";
                var size = 1;//getSize() / recipe.serves;
                

                for(var i = 0; i < step.length; i++) {
                    if(step.charAt(i) == '~') {
                        var numstr = "";
                        i+=2;
                        for(var j = i; j < step.length; j++) {
                            if(step.charAt(i) == '~') {
                                i++;
                                var num = parseInt(numstr) * size;
                                str += "" + num;
                                break;
                            }
                            numstr += step.charAt(j);
                            i++;
                        }
                    }
                    else if(step.charAt(i) == '*'){
                        var numstr = "";
                        i+=2;
                        for(var j = i; j < step.length; j++) {
                            if(step.charAt(i) == '*') {
                                i++;
                                var num = parseInt(numstr);
                                var hrs = num/3600;
                                num %= 3600;
                                var min = num/60;
                                num %= 60;
                                var sec = num;
                                if(hrs > 0){
                                    
                                }
                                if(min > 0){
                                    
                                }
                                if(sec > 0)
                                {
                                    str += "" + sec + " seconds";
                                }
                                break;
                            }
                            numstr += step.charAt(j);
                            i++;
                        }               
                    }
                    else {
                        str += step.charAt(i);
                    }
                }
                
                if (step) {
                    db.putStep( parseInt(stepIndexRaw)+1 ,function(){
                        response.askWithCard(str + ". Let me know when you're ready for the next step.", cardTitle, str);
                    });
                } else {
                    response.ask("Hmm. Weird. I had some problems getting the instructions. Try asking again.");
                }
            }
        }
    },  


    // InstructionIntent: function (intent, session, response) {
    //     var numServings = 1;
    //     if (intent.slots.Servings.value) {
    //         numServings = parseInt(intent.slots.Servings.value);
    //     }
    //     var instructions = "";

    //     for (var i = 0; i < recipes["steak"]["steps"].length; i = i+1) {
    //         instructions = instructions +" "+ recipes["steak"]["steps"][i];
    //     }

    //     var cardTitle = "Instructions for " + numServings;
    //     if (instructions) {
    //         response.tellWithCard(instructions + " Enjoy ya little shit.", cardTitle, instructions);
    //     } else {
    //         response.ask("I'm sorry, I currently do not know the recipe for " + numServings + ". What else can I help? ");
    //     }

    // },
    HelpIntent: function (intent, session, response) {
        var cardTitle = intent.name;
        var speechOutput = "You can ask how to cook something, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can ask how to cook something, or, you can say exit... Now, what can I help you with?";
        response.ask(speechOutput, repromptText);
    },

    TimerIntent: function(intent, session, response) {
        if (intent.slots.Time) {
            var time = parseInt(intent.slots.Time.value)*1000;
            var cardTitle = "Timer for " + time + " milliseconds.";
            var output = "Sleeping for " + time + " milliseconds.";
            setTimeout(function() {
                response.ask("It's been " + time + " milliseconds. Now what?", "I waited, what else do you want?");
            }, time);
        }
    },
    MistakeIntent: function (intent, session, response) {
        var amount = intent.slots.Amount.value;
        var type = intent.slots.Ingredient.value;
        response.ask("sorr to know that you put "+amount+" of "+type +" by mistake");
    }
};

exports.handler = function (event, context) {
    var myChef = new MyChef();
    myChef.execute(event, context);
};
