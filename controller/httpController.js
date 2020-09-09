const http = require("http");
const https = require("https");
const  querystring = require('querystring');
const fetch = require('node-fetch');


exports.getpatients = (req, res, next) => {
    /*
    var apiKey = '561e3c21a07461f5c575f37beeb786bf';
    performRequest(
        '/v2/patients', 
        'GET', 
        { request_key: apiKey }, (data) => {
        return res.json({status:'true', message:'', data, user:req.loggedUser});
    });*/
    getFetch('https://api.sikkasoft.com/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf', (response) => {
        if(response.http_code === undefined || response.length > 0){
            return res.json({status:'true', message:'', data: response, user:req.loggedUser});
        }
        else if(response.http_code !== undefined){
            return res.json({status:'false', message:response.long_message, data: [], user:req.loggedUser});
        }
    }, (err) => {
        return res.json({status:'false', message:err, data: [], user:req.loggedUser});
    });
}



exports.requestApi = (req, res, next) => {
    var apiResponse = '';
    var method = 'GET';
    var headers = {};
    headers = {
        'Content-Type': 'application/json',
        //'Content-Length': dataString.length
      };

    var options = {
        host: 'api.sikkasoft.com',
        path: '/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf',
        headers: headers,
        method: 'GET'
    }

    callback = (resp) => {
        resp.on("data", function(chunk){
            apiResponse+= chunk;
        });

        resp.on("end", function(){
            console.log('api response :' + apiResponse);
        });
    }

    var request = https.request(options,callback);
    request.end();
    //return res.json({status:'true', message:'', responseString, user:req.loggedUser});

} 

function getFetch(endpoint, success, failure){
    fetch(endpoint)
    .then(response => response.json())
    .then(data => {
        success( data);
    })
    .catch(err => {
        failure(err);
    });
}

function performRequest(endpoint, method, data, success) {
    var host = 'api.sikkasoft.com';
    var dataString = JSON.stringify(data);
    var headers = {};
    var apiResponse = '';
    
    if (method == 'GET') {
      endpoint += '?' + querystring.stringify(data);
    }
    else {
      headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      };
    }

    var options = {
      host: host,
      path: endpoint,
      method: method,
      headers: headers
    };

    callback = (resp) => {
        resp.on("data", function(chunk){
            apiResponse+= chunk;
        });

        resp.on("end", function(){
            console.log('api response :' + apiResponse);
            success(JSON.parse(apiResponse));
        });
    }

    var request = https.request(options,callback);
    request.end();
    /*
  
    var request = https.get('https://api.sikkasoft.com/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf',  (resp) => {
        resp.setEncoding('utf-8');
        var responseString = '';

        resp.on('data', function (data) {
            responseString += data;
        });

        resp.on('end', () => {
            console.log(responseString);
            var responseObject = JSON.parse(responseString);
            success(responseObject);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    request.end();
*/
    /*
    var req = https.request(options, function(res) {
      res.setEncoding('utf-8');
  
      var responseString = '';
  
      res.on('data', function(data) {
        responseString += data;
      });
  
      res.on('end', function() {
        console.log(responseString);
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      });
    });
  
    req.write(dataString);
    req.end();
    */

  }


function performRequest1(endpoint, method, data, success) {
    var host = 'https://api.sikkasoft.com';
    var dataString = JSON.stringify(data);
    var headers = {};
    
    if (method == 'GET') {
      endpoint += '?' + querystring.stringify(data);
    }
    else {
      headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      };
    }
    var options = {
      host: host,
      path: endpoint,
      method: method,
      headers: headers
    };
  
    var request = https.get('https://api.sikkasoft.com/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf',  (resp) => {
        resp.setEncoding('utf-8');
        var responseString = '';

        resp.on('data', function (data) {
            responseString += data;
        });

        resp.on('end', () => {
            console.log(responseString);
            var responseObject = JSON.parse(responseString);
            success(responseObject);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    request.end();

    /*
    var req = https.request(options, function(res) {
      res.setEncoding('utf-8');
  
      var responseString = '';
  
      res.on('data', function(data) {
        responseString += data;
      });
  
      res.on('end', function() {
        console.log(responseString);
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      });
    });
  
    req.write(dataString);
    req.end();
    */

  }
