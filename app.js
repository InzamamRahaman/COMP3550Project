/**
 * Created by Inzamam on 11/20/2014.
 */
var express = require("express");
var config = require("./libs/config");
var app = config.init_server(express());
var db = require("seraph")(config.db_conn_string);
var Models = require("./libs/models")
var models = new Models(db); // Use this to manipulate models
app.listen(config.port);
console.log("Application started at http://127.0.0.1:"
    + config.port);

