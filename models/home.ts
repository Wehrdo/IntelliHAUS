/**
 * Created by David on 1/24/2016.
 */
/// <reference path="../typefiles/header.d.ts" />

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Home = sequelize.define("Home", {
        Name: DataTypes.STRING
        }, {
        classMethods: {
            associate: function(models) {
                Home.hasOne(models.User)
            }
        }
    });
    return Home
};