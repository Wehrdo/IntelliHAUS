/**
 * Created by David on 2/12/2016.
 */
/*
Contains general configuration information for the app on your development server
 */

var config = {};

config.jwt_secret = "secret";
config.port = 8080;

config.pg_conn_URL = 'postgres://postgres:postgres@localhost:5432/intellihaus';

module.exports = config;