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
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        inputNames: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        lastData: {
            type: DataTypes.ARRAY(DataTypes.FLOAT)
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

                // A node can have its output go to one datastrseam
                Node.belongsTo(models.Datastream);

                // A node can be actuated by one rule
                Node.belongsTo(models.Rule);
            }
        }
    });

    return Node;
};