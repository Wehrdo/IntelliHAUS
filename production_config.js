/**
 * Created by David on 2/12/2016.
 */
/*
Contains general configuration information for the app on the live server
 */

var config = {};

config.jwt_secret = "A#RLLXFpH1%L1c%9xIO963@b3g23#Ii!gnuJmv^MvZdw%#";
config.port = 80;

// Database connection options
config.db_name = 'intellihaus';
config.db_username = 'postgres';
config.db_password = 'gobildegook';
config.db_options = {
    'dialect': 'postgres',
    'port': 5432,
    'timezone': 'America/Chicago',
    'host': '127.0.0.1'
};

module.exports = config;
