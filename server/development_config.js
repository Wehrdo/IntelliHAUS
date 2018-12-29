/**
 * Created by David on 2/12/2016.
 */
/*
Contains general configuration information for the app on your development server
 */

var config = {};

config.jwt_secret = "secret";
config.port = 8080;

// Database connection options
config.db_name = 'intellihaus';
config.db_username = 'postgres';
config.db_password = 'postgres';
config.db_options = {
    'dialect': 'postgres',
    'port': 5432,
    'timezone': 'America/Chicago',
    'logging': false
};

// Set long-poll timeout to be 30 seconds
// See RFC 6202 Section 5.5 about timeouts
config.long_poll_timeout = 30 * 1000;

module.exports = config;