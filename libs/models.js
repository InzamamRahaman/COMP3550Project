/**
 * Created by Inzamam on 11/20/2014.
 */


module.set_up_models = function(db) {

    var seraph_model = require("seraph-model")
    this.User = seraph_model(db, 'user');
    this.User.schema = {
        // a unique string to identifier a user
        // it can be an email, username, ext....
        identifier: {type : String, required: true},
        password: {type: String},
        salt: {type: String}

    }

    this.Hashtag = seraph_model(db, 'hashtag');
    this.Hashtag.schema = {
        name: {type : String, required: true}
    }


};