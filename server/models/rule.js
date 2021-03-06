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
        },
        public: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        classMethods: {
            // A rule can affect one node
            associate: function(models) {
                // A user owns a rule
                Rule.belongsTo(models.User, {
                    foreignKey: {
                        allowNull: false
                }});
                
                // A rule could actuate multiple different nodes
                Rule.hasMany(models.Node);

                // A rule can use multiple datastreams
                Rule.belongsToMany(models.Datastream, {
                    through: 'RuleDatastream'
                });
                
                Rule.hasMany(models.RuleTime, {onDelete: "CASCADE"});

            }

        }
    });

    return Rule;
};