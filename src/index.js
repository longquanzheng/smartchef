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
    recipes = require('./recipes');

var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * MinecraftHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MinecraftHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MinecraftHelper.prototype = Object.create(AlexaSkill.prototype);
MinecraftHelper.prototype.constructor = MinecraftHelper;

MinecraftHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = "Welcome to the Smart Chef. What would you like to cook today.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "sorry, what would you like to cook indeed.";
    response.ask(speechOutput, repromptText);
};

MinecraftHelper.prototype.intentHandlers = {
    RecipeIntent: function (intent, session, response) {
        var itemName = intent.slots.ItemName.value.toLowerCase();
        var cardTitle = "Recipe for " + itemName;
        if (recipes[itemName]) {
            //response.tellWithCard(recipe, cardTitle, recipe);
            response.ask("Do you want to know the ingredients or the instructions? Say ingredients for " + itemName + " or instructions for " + itemName);
        } else {
            response.ask("I'm sorry, I currently do not know the recipe for " + itemName + ". What else can I help?");
        }
    },
    IngredientIntent: function (intent, session, response) {
        var itemName = intent.slots.ItemName.value.toLowerCase();
        var ingredients = recipes[itemName]['ingredients'];
        var cardTitle = "Ingredients for " + itemName;
        if (ingredients) {
            response.askWithCard(ingredients, cardTitle, ingredients);
          //  response.ask(ingredients);
        } else {
            response.ask("I'm sorry, I currently do not know the recipe for " + itemName + ". What else can I help?");
        }
    },
    InstructionIntent: function (intent, session, response) {
        var itemName = intent.slots.ItemName.value.toLowerCase();
        var instructions = recipes[itemName]['instructions'];
        var cardTitle = "Instructions for " + itemName;
        if (instructions) {
            response.askWithCard(instructions, cardTitle, instructions);
           // response.ask(instructions);
        } else {
            response.ask("I'm sorry, I currently do not know the recipe for " + itemName + ". What else can I help?");
        }

    },
    HelpIntent: function (intent, session, response) {
        var cardTitle = intent.name;
        var speechOutput = "You can ask questions about minecraft such as, what's the recipe for a chest, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, what's the recipe for a chest, or you can say exit... Now, what can I help you with?";
        response.ask(speechOutput, repromptText);
    }
};

exports.handler = function (event, context) {
    var minecraftHelper = new MinecraftHelper();
    minecraftHelper.execute(event, context);
};
