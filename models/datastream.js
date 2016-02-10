/**
 * Created by David on 2/9/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var iotypes = DataTypes.ENUM(
        'continuous',
        'events',
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
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                Datastream.belongsTo(models.User);

                Datastream.hasMany(models.Datapoint);
            }
        }
    });

    return Datastream;
};