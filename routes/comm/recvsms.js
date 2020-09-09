//https://www.youtube.com/watch?v=NMFhtWm2Lno
const http = require('http');
const express = require('express');
const messageResponse  = require('twilio').twiml.MessagingResponse;

const app = express();

app.post('/sms', (req, res) => {
    const twiml = new messageResponse();
    twiml.message('Some response from bots');
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});


http.createServer(app).listen(4000, () => { 
    console.log('Express server is listening on PORT 4000');
});