/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Datapoint = sequelize.define("Datapoint", {
        data: {
            type: DataTypes.FLOAT
        },
        time: {
            type: DataTypes.DATE
        }
    }, {
        classMethods: {
            associate: function(models) {
                Datapoint.belongsTo(models.Datastream, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return Datapoint;
};