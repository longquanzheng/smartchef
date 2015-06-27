// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var AWS = require("aws-sdk");

var db = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-17'});

     Game.prototype = {

        oneId : "qlong_chef",

        "putRecipe" : function(recipe,callback){
            dynamodb.putItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    },
                    recipe: {
                        S: recipe
                    }
                }
            }, function (err, recipe) {
                if (err) {
                    console.log(err, err.stack,recipe);
                }
                if (callback) {
                    callback();
                }
            });
        },

        "getRecipe" : function(callback){
            dynamodb.getItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    }
                }
            }, function (err,retData) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback(retData.recipe);
                }
            });
        },

        "updateSize" : function(size,callback){
            dynamodb.putItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    },
                    size: {
                        S: size
                    }
                }
            }, function (err, size) {
                if (err) {
                    console.log(err, err.stack,size);
                }
                if (callback) {
                    callback();
                }
            });
        },

        "getSize" : function(callback){
            dynamodb.getItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    }
                }
            }, function (err,retData) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback(retData.size);
                }
            });
        },

        "updateStep" : function(step,callback){
            dynamodb.putItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    },
                    step: {
                        S: step
                    }
                }
            }, function (err, step) {
                if (err) {
                    console.log(err, err.stack,step);
                }
                if (callback) {
                    callback();
                }
            });
        },

        "getStep" : function(callback){
            dynamodb.getItem({
                TableName: 'chef',
                Item: {
                    rid: {
                        S: Game.prototype.oneId
                    }
                }
            }, function (err,retData) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback(retData.step);
                }
            });
        },
    };

})();
module.exports = db;