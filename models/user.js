/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
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
            type: DataTypes.STRING(270)
        }
    },
    {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Home);
            }
        }
    });

    return User;
};