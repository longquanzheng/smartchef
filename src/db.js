// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var AWS = require("aws-sdk");

var db = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-10-17'});
    var oneId = "qlong_chef";

    return {

        // recipe
        putRecipe : function(recipe,callback){
            console.log("put recipe:",recipe);
            var str = JSON.stringify(recipe);
            var putS = {
                AttributeUpdates: {
                    recipe: {
                        Action : "PUT",
                        Value: {
                            S: str
                        }
                    }
                },
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("putS",putS);
            dynamodb.updateItem(putS, function (err, recipe) {
                console.log("succ put recipe");
                callback();
            });
        },

        getRecipe : function(callback){
            console.log("here to get recipe");
            var getR = {
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("request to db",getR);
            dynamodb.getItem(getR, function (err,retData) {
                console.log("got u",retData);
                callback(retData.Item.recipe.S);
            });
        },


        // size
        putSize : function(size,callback){
            console.log("put size:",size);
            var str = JSON.stringify(size);
            var putS = {
                AttributeUpdates: {
                    size: {
                        Action : "PUT",
                        Value: {
                            S: str
                        }
                    }
                },
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("putS",putS);
            dynamodb.updateItem(putS, function (err, recipe) {
                console.log("succ put size");
                callback();
            });
        },

        getSize : function(callback){
            console.log("here to get size");
            var getR = {
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("request to db",getR);
            dynamodb.getItem(getR, function (err,retData) {
                console.log("got u",retData);
                callback(retData.Item.size.S);
            });
        },


        // step
        putStep : function(step,callback){
            console.log("put step:",step);
            var str = JSON.stringify(step);
            var putS = {
                AttributeUpdates: {
                    step: {
                        Action : "PUT",
                        Value: {
                            S: str
                        }
                    }
                },
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("putS",putS);
            dynamodb.updateItem(putS, function (err, recipe) {
                console.log("succ put step");
                callback();
            });
        },

        getStep : function(callback){
            console.log("here to get step");
            var getR = {
                TableName: 'chef',
                Key : {
                    rid: {
                        S: 'qlong_chef'
                    }
                }
            };
            console.log("request to db",getR);
            dynamodb.getItem(getR, function (err,retData) {
                console.log("got u",retData);
                callback(retData.Item.step.S);
            });
        }
    };

})();
module.exports = db;
