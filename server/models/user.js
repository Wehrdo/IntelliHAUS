/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING
        },
        lastName: {
            type: DataTypes.STRING
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pwHash: {
            type: DataTypes.STRING(270),
            allowNull: false
        }
    },
    {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Home);
                User.hasMany(models.Node);
                User.hasMany(models.Rule);
            }
        }
    });

    return User;
};