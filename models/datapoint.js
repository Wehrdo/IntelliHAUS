/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Datapoint = sequelize.define("Datapoint", {
        continuousData: {
            type: DataTypes.FLOAT
        },
        discreteData: {
            type: DataTypes.INTEGER
        },
        binaryData: {
            type: DataTypes.BLOB
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false
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
        },
        timestamps: false
    });

    return Datapoint;
};