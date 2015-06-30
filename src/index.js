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
MyChef.prototype.stepNumber = 0;

MyChef.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = "Hey how's it going. Let's think about recipes. What would you like to make? For example, say something like, how do I make steak.";
    var repromptText = "Just ask something like how do I make steak, or something, and I'll see what I can turn up.";
    response.ask(speechOutput, repromptText);
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

                        res.on('end', function(){  
                            var content = JSON.parse(body);

                            console.log(content);

                            db.putRecipe(content,function(){
                                db.putStep("0",function(){
                                    console.log("succ put step");

                                    response.askWithCard(
                                        "I know about " + recipeName + "! Do you want to hear the ingredients or shall I explain instructions?",
                                        "Sorry, didn't quite catch that. Ingredients, or instructions?", 
                                    cardTitle, cardContent);
                                });
                            });
                        }).on('error', function(e) {
                            response.tell("sorry i have trouble accessing internet");
                            console.log("Got error: " + e.message);
                        });
                    });
                }
            });
        });
    },

    IngredientIntent: function (intent, session, response) {
        
        var cardTitle = "Ingredient intent received.";
        var cardContent = "";
   
            function getIngredient(ingObj){
                return (ingObj['quantity'] +" "+ingObj['unit']+" "+ingObj['name']);
            }

            db.getRecipe(function(recipe) {
                    recipe = JSON.parse(recipe);
                    console.log('IngredientIntent',recipe['directions']);
                    var ingredient_list = recipe["ingredients"];
                    var str = "You need "+ getIngredient(ingredient_list[0]);
                    for (var i=1; i < ingredient_list.length; i++) {
                            str = str + getIngredient(ingredient_list[i]);
                    }
                    
                    //respond
                    response.askWithCard(
                        str, "Now, would you like to hear the ingredients again or shall I explain the instructions?",
                        cardTitle, cardContent); 
            });
    } ,

    InstructionIntent: function (intent, session, response) {
        db.getRecipe(function(recipe) {
            recipe = JSON.parse(recipe);
            console.log("InstructionIntent",recipe);

            db.getStep(function(step){
                step = JSON.parse(step);
                step = parseInt(step);
                if(! (step>=0) ){
                    step = 0;
                }

                var str;
                if(step>=recipe['directions'].length){
                    str = "Congradulations! you have finished the "+ recipe['name'];
                    db.putStep( 0, function(){
                        response.ask(str,"Let me know when you're ready for the next step");
                    });
                }else{
                    str = "step #"+ (step+1) + ": "+ recipe['directions'];
                    db.putStep( step+1, function(){
                        response.ask(str,"Let me know when you're ready for the next ste");
                    });
                }
            }); 
        });
    },



    HelpIntent: function (intent, session, response) {
        var cardTitle = intent.name;
        var speechOutput = "You can ask how to cook something, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can ask how to cook something, or, you can say exit... Now, what can I help you with?";
        response.ask(speechOutput, repromptText);
    },

    TimerIntent: function(intent, session, response) {
        response.ask("I am going to finish it soon"," what?");
    }
};

exports.handler = function (event, context) {
    var myChef = new MyChef();
    myChef.execute(event, context);
};
