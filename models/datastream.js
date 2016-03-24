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

    var Datastream = sequelize.define("Datastream", {
        name: {
            type: DataTypes.STRING
        },
        public: {
            type: DataTypes.BOOLEAN
        },
        datatype: {
            type: iotypes
        },
        discreteLabels: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        }
    }, {
        classMethods: {
            associate: function(models) {
                // A datastream belongs to a user
                Datastream.belongsTo(models.User);
                // A datastream can get data from multiple nodes
                Datastream.hasMany(models.Node);
                // A datastream can have many points
                Datastream.hasMany(models.Datapoint);
                // A datastream can be used in multiple rules
                Datastream.belongsToMany(models.Rule, {
                    through: 'RuleDatastream'
                });

            }
        }
    });

    return Datastream;
};