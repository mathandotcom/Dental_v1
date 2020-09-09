const fetch = require('node-fetch');
const logger = require('../logger/logconfig');
const  querystring = require('querystring');

var host = 'https://api.sikkasoft.com';
var requestKey = '364b1e91a7bedefd0ce789069797e616';



var httpService = class HttpService{

    constructor(){    }

    getFetch(endpoint, data, success, failure){

        var apiUrl = this.buildUrl(endpoint);
        if(data !== null){
            apiUrl += '&' + querystring.stringify(data);
        }
        logger.info(`Requset url: ${apiUrl}`);
        
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            success( data);
        })
        .catch(err => {
            failure(err);
        });
    }

    getchByUrl(endpoint, data, success, failure){

        var apiUrl = this.AppendRequestKey(endpoint);

        if(Object.entries(data).length > 0){
            apiUrl += '&' + querystring.stringify(data);
        }
        logger.info(`Requset url: ${apiUrl}`);
        
        fetch(apiUrl)
        .then(response => response.json())
        .then(data1 => {
            success( data1);
        })
        .catch(err => {
            failure(err);
        });
    }

    buildUrl(url){
        var apiUrl = `${host}/${url}?request_key=${requestKey}`;
        return apiUrl;
    }

    AppendRequestKey(url){
        var apiUrl = `${url}?request_key=${requestKey}`;
        return apiUrl;
    }

}

module.exports = httpService;