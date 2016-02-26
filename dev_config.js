/**
 * Created by David on 2/12/2016.
 */
/*
Contains general configuration information for the app on your development server
 */

var config = {};

config.jwt_secret = "secret";
config.port = 80;

// Database connection options
config.db_name = 'intellihaus';
config.db_username = 'postgres';
config.db_password = 'postgres';
config.db_options = {
    'dialect': 'postgres',
    'port': 5432,
    'timezone': 'America/Chicago'
};

config.pg_conn_URL = 'postgres://postgres:postgres@localhost:5432/intellihaus';

module.exports = config;