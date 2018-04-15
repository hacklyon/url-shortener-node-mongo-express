require('dotenv').load({silent: true});
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const base58 = require('./base58.js');

const port            = process.env.PORT || 3000;
const database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

// grab the url model
const Url = require('./models/url');
const Data = require('./models/data');

mongoose.connect(database);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/api/shorten', function (req, res) {
    var longUrl = req.body.url;
    var shortUrl = '';

    // check if url already exists in database
    Url.findOne({long_url: longUrl}, function (err, doc) {
        if (doc) {
            shortUrl = config.webhost + base58.encode(doc._id);

            // the document exists, so we return it without creating a new entry
            res.send({'shortUrl': shortUrl});
        } else {
            // since it doesn't exist, let's go ahead and create it:
            let newUrl = Url({
                long_url: longUrl
            });

            // save the new link
            newUrl.save(function (err) {
                if (err) {
                    console.log(err);
                }

                shortUrl = config.webhost + base58.encode(newUrl._id);

                res.send({'shortUrl': shortUrl});
            });
        }

    });

});

app.get('/:encoded_id', function (req, res) {

    let base58Id = req.params.encoded_id;

    let id = base58.decode(base58Id);

    // check if url already exists in database
    Url.findOne({_id: id}, function (err, doc) {
        if (doc) {
            let d = new Data();
            d.headers = req.headers;
            if(req.query.u)
                d.user = req.query.u;
            d.save();
            res.redirect(doc.long_url);
        } else {
            res.redirect(config.webhost);
        }
    });

});

app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
