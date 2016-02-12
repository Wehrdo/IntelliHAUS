/**
 * Created by David on 1/24/2016.
 *
 * Source taken from docs.sequelizejs.com
 */
/// <reference path="../typefiles/header.d.ts" />
/// <reference path="./user.ts" />
"use strict";
var fs = require("fs");
var path = require("path");
//var Sequelize = require("sequelize");
var Sequelize = require("sequelize");
var Models = (function () {
    function Models(db_url) {
        this.env = process.env.NODE_ENV || "development";
        this.config = require(path.join(__dirname, '..', 'config', 'config.json'))[this.env];
        this.sequelize = new Sequelize(db_url);
        this.User =
            fs
                .readdirSync(__dirname)
                .filter(function (file) {
                return (file.indexOf(".") !== 0) && (file !== "index.js");
            })
                .forEach(function (file) {
                var model = this.sequelize.import(path.join(__dirname, file));
                this.db[model.name] = model;
            });
        Object.keys(this.db).forEach(function (modelName) {
            if ("associate" in this.db[modelName]) {
                this.db[modelName].associate(this.db);
            }
        });
    }
    return Models;
})();
module.exports = Models;
//# sourceMappingURL=index.js.map