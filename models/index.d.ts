/// <reference path="../typefiles/header.d.ts" />
/// <reference path="user.d.ts" />
declare class Models {
    private env;
    private config;
    sequelize: any;
    db: any;
    constructor(db_url: string);
}
export = Models;
