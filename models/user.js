/**
 * Created by David on 1/24/2016.
 */
/// <reference path="../typefiles/header.d.ts" />
"use strict";
var UserModel = (function () {
    function UserModel() {
    }
    return UserModel;
})();
exports.UserModel = UserModel;
function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: DataTypes.STRING
    }, {
        firstName: DataTypes.STRING
    }, {
        lastName: DataTypes.STRING
    }, {
        passHash: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Home);
            }
        }
    });
    return User;
}
;
//# sourceMappingURL=user.js.map