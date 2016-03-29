/**
 * Created by David on 3/28/2016.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var RuleTime = sequelize.define("RuleTime", {
        time: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        classMethods: {
            // A rule can affect one node
            associate: function(models) {
                RuleTime.belongsTo(models.Rule);
            }
        },
        indexes: [
            {
                name: 'time_index',
                method: 'BTREE',
                fields: [{attribute: 'time', order: 'ASC'}]
            }
        ],
        timestamps: false
    });

    return RuleTime;
};