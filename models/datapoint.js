/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var iotypes = DataTypes.ENUM(
        'continuous',
        'discrete',
        'binary'
    );

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