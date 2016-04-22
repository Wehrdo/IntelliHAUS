/**
 * Created by David on 2/9/2016.
 */

module.exports = function(sequelize, DataTypes) {
    var Home = sequelize.define("Home", {
        latitude: {
            type: DataTypes.DOUBLE
        },
        longitude: {
            type: DataTypes.DOUBLE
        },
        name: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                Home.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });

                Home.hasMany(models.Node, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return Home;
};