/**
 * Created by David on 2/12/2016.
 */
/*
Contains general configuration information for the app on the live server
 */

var config = {};

config.jwt_secret = "A#RLLXFpH1%L1c%9xIO963@b3g23#Ii!gnuJmv^MvZdw%#";
config.port = 80;

config.pg_conn_URL = 'postgres://postgres:postgres@localhost:5432/intellihaus';

module.exports = config;