var express = require('express');
var app = express();
var request = require('request');
var q = require('q');
//var path = require('path');
//app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    console.log('server is running on port - ' + port);

});

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true,
    keepExtensions: true,
    uploadDir: "uploads"
}));
app.use(bodyParser.json());

app.get('/character', function (req, res) {
    //res.send("Hello a this is test routeeeeeee");
	var char = {};
	var finalData = [];
	var sortParam = req.param("name");
	request.get("http://swapi.co/api/people/", function (error, response, body) {
		if (error) {
			console.log(error);
		} else {
			var result = response.body;
			var data = JSON.parse(result);
			var totalResults = data.count;
			var totalPages = totalResults / 10;
			getAllPeople(totalPages).then(function (result) {
				for (i = 0; i < result.length; i++) {
					for (j = 0; j < result[i].results.length; j++) {
						finalData.push(result[i].results[j]);
					}
				}
				data = finalData;
				for (i = 0; i < data.length; i++) {
					var dataString = data[i].name.toLowerCase();
					if (dataString.indexOf(sortParam.toLowerCase()) >= 0) {
						char = data[i];
						res.render('index', { person: char });
						break;
					}
				}

			});
		}
	})
});

app.get('/characters', function (req, res) {
	var finalData = [];
	var sortParam = (req.param("sort"));
	request.get("http://swapi.co/api/people/", function (error, response, body) {
		if (error) {
			console.log(error);
		} else {
			var result = response.body;
			var data = JSON.parse(result);
			var totalResults = data.count;
			var totalPages = totalResults / 10;
			getAllPeople(totalPages).then(function (result) {
				for (i = 0; i < result.length; i++) {
					for (j = 0; j < result[i].results.length; j++) {
						finalData.push(result[i].results[j]);
					}
				}
				data = finalData;
				if (sortParam == "height") {
					data.sort(sortByHeight);
				} else if (sortParam == "mass") {
					data.sort(sortByMass);
				} else {
					data.sort(sortByName);
				}
				res.send(data);
			});
		}
	})
});

var getPeople = function (pageNumber) {
    return new Promise(function (resolve, reject) {
		request.get("http://swapi.co/api/people/?page=" + pageNumber, function (error, response, body) {
			var result = response.body;
			var data = JSON.parse(result);
			resolve(data);
		});
    });
};

var getAllPeople = function (totalPages) {
    var result = [];
    var promise;
    for (var i = 1; i <= totalPages + 1; i++) {
        (function (i) {
            if (!promise) {
                promise = getPeople(i);
            } else {
                promise = promise.then(function (response) {
                    result.push(response);
                    return getPeople(i);
                }, function () {
                    console.log('error occurred');
                });
            }
        })(i);
    }
    return promise.then(function () {
        return result;
    });
};

function sortByHeight(a, b) {
	if (a.height < b.height)
		return -1;
	if (a.height > b.height)
		return 1;
	return 0;
}

function sortByMass(a, b) {
	if (a.mass < b.mass)
		return -1;
	if (a.mass > b.mass)
		return 1;
	return 0;
}

function sortByName(a, b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	return 0;
}

app.get('/planetresidents', function (req, res) {
	request.get("http://swapi.co/api/planets/", function (error, response, body) {
		if (error) {
			console.log(error);
		} else {
			var result = response.body;
			var data = JSON.parse(result);
			var totalResults = data.count;
			var totalPages = totalResults / 10;
			var finalData = {};
			getAllPlanets(totalPages).then(function (result) {
				for (i = 0; i < result.length; i++) {
					for (j = 0; j < result[i].results.length; j++) {
						finalData[result[i].results[j]['name']] = result[i].results[j]['residents'];
					}
				}
				res.send(finalData);
			});
		}
	})
});

var getPlanets = function (pageNumber) {
    return new Promise(function (resolve, reject) {
		request.get("http://swapi.co/api/planets/?page=" + pageNumber, function (error, response, body) {
			var result = response.body;
			var data = JSON.parse(result);
			resolve(data);
		});
    });
};

var getAllPlanets = function (totalPages) {
    var result = [];
    var promise;
    for (var i = 1; i <= totalPages + 1; i++) {
        (function (i) {
            if (!promise) {
                promise = getPlanets(i);
            } else {
                promise = promise.then(function (response) {
                    result.push(response);
                    return getPlanets(i);
                }, function () {
                    console.log('error occurred');
                });
            }
        })(i);
    }
    return promise.then(function () {
        return result;
    });
};









