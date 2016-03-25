/**
 * Created by David on 3/22/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Rule = sequelize.define("Rule", {
        name: {
            type: DataTypes.STRING
        },
        rule: {
            type: DataTypes.JSONB
        }
    }, {
        classMethods: {
            // A rule can affect one node
            associate: function(models) {
                // A rule could actuate multiple different nodes
                Rule.hasMany(models.Node);

                // A rule can use multiple datastreams
                Rule.belongsToMany(models.Datastream, {
                    through: 'RuleDatastream'
                });

            }

        }
    });

    return Rule;
};