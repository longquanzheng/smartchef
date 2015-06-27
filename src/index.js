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

var AlexaSkill = require('./AlexaSkill'),
    api = require('./api'),
    recipes = require('./recipes');
    //db = require('./db');

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
        var cardTitle = "Recipe: " + recipeName;

        if (recipes[recipeName]) { // step 0
            // recipe exists

            // step 1
            //db.putRecipe(recipes[recipeName]);

            // step 2
            //db.updateSize(1);

            // step 3
            //db.updateStep(0);

            response.askWithCard(
                "I know about " + recipeName + ". Do you want the ingredients or the instructions?",
                "Sorry, didn't quite catch that. Ingredients, or instructions?", 
                cardTitle, "Recipe found. Maybe add info here about ingredient/instruction count.");
        } else {
            response.ask("Sorry, no idea how to make " + recipeName + ". Any other requests?");
        }
    },

    IngredientIntent: function (intent, session, response) {
        var servingsOrRecipe = intent.slots.Servings,
            servings;
        
            var cardTitle = "ingredient intent";

        if (servingsOrRecipe) {
            servings = parseInt(servingsOrRecipe.value);
            if (isNaN(servings)) {//recipe
                //do same stuff as recipeIntent
            } else {
                                     //servings
                //updateSize(servings);
            }
        }
        //interpret ingredient
        var recipe = recipes["steak"];//getRecipe();
        var ingredient_list = recipes["steak"]["ingredient_lists"];
        var str = "You need ";
        var i = 0;
        var size = 1;//getSize() / recipe.serves;

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
        response.askWithCard(str + "yo u want instructions o what", "ingredients. speak up yo.", cardTitle, str);
    },

        InstructionIntent: function (intent, session, response) {
        var servingsOrRecipe = intent.slots.Servings,
            servings;
        
        var cardTitle = "instruction intent step";

        if(servingsOrRecipe){
            servings = parseInt(servingsOrRecipe.value);
            if (isNaN(servings)) //recipe
            {
                console.log("hi");//do same stuff as recipeIntent
            }
            else                         //servings
            { console.log("no");
                //updateSize(servings);
                //updateStep(1);
            }
        }
        //interpret step
        var stepIndex = 0//getStep() - 1;
        var recipe = recipes["steak"];//getRecipe();
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
        
        
        
        //respond
        if (step) {
            response.tellWithCard(str + "Lemme know if u wanna keep goin lol.", cardTitle, str);
        } else {
            response.ask("sorry but instructions failed lol idk wat u wanna do");
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
    }
};

exports.handler = function (event, context) {
    var myChef = new MyChef();
    myChef.execute(event, context);
};
