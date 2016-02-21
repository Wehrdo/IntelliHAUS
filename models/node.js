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

    var Node = sequelize.define("Node", {
        name: {
            type: DataTypes.STRING
        },
        inputTypes: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        inputNames: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        outputType: {
            type: iotypes
        },
        outputName: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                Node.belongsTo(models.Home, {
                    foreignKey: {
                        allowNull: false
                    }
                });

                Node.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });

                Node.belongsTo(models.Datastream);
            }
        }
    });

    return Node;
};