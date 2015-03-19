var express = require('express'),
	request = require("request"),
	async = require("async"),
	Ns = require('namecheap-checker'),
	Datastore = require('nedb'),
	db = new Datastore();

var router = express.Router(),
	checker = new Ns(process.env.NC_USER, process.env.NC_KEY, process.env.NC_IP);

var tlds = ["com", "net", "org", "fr", "es"];

router.get('/', function(req, res) {
  res.render('index', { title: 'Punttu.com, domeinu bat eta punttu!' });
});

router.get('/check', function(req, res) {

	var domain = req.param('domain');

	var isCached = function(domain, callback) {

		var cutoffDate = new Date();
			cutoffDate.setMinutes(cutoffDate.getMinutes() - 10);

		db.find({
			domain: domain,
			time: {
				$gte: cutoffDate
			}
		}).limit(1).exec(function (err, response) {

			if (response.length > 0) {
				console.log("Cache hit!", response[0]);
				callback(null, response[0].response);
				return;
			}

			// No cache
			callback();

		});

	};

	var checkDomain = function(domain) {

		var response = [];

		var checkNamecheap = function(callback) {

			var domains = [];
			tlds.forEach(function(tld) {
				domains.push(domain + "." + tld);
			});

			checker.checkDomains(domains, function(err, result) {

				if (err) {
					callback(err, "Namecheap");
					console.log(err);
					return;
				}

				response = response.concat(result);
				callback(null, "Namecheap");

			});

		};

		var checkDomeinuak = function(callback) {

			request.post("http://www.domeinuak.eus/whois/", {
				form: {domeinua: domain},
				headers: {
					'Cache-Control': 'no-cache',
					'User-Agent': 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:36.0) Gecko/20100101 Firefox/36.0'
				}
			}, function (err, result, body) {

				if (err) {
					callback(err, "Domeinuak");
				}

			    response.unshift({
			    	domain: domain + ".eus",
			    	available: (body === "1") ? true : false
			    });

			    callback(null, "Domeinuak");

			});

		};

		async.parallel([checkNamecheap, checkDomeinuak], function(err, data) {

			var call = {
				time: new Date(),
				domain: domain,
				response: response
			};

			db.insert(call, function (err, doc) {});

			res.json(response);

		});

	};

	isCached(domain, function(err, response) {

		if (response) {
			res.json(response);
		} else {
			checkDomain(domain);
		}

	});

});

module.exports = router;
