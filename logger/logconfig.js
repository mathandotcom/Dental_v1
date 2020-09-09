var moment = require('moment');

// /https://github.com/darrylwest/simple-node-logger/pull/31  - update the if condition to fix an issue

// create a rolling file logger based on date/time that fires process events
const opts = {
  errorEventName:'error',
      logDirectory:'logger/logs', // NOTE: folder must exist and be writable...
      fileNamePattern:`daily-${moment().format('YMMDD')}.log`,
      dateFormat:'YYYY.MM.DD HH:mm:ss',
      timestampFormat:'YYYY-MM-DD HH:mm:ss'
};
const logger = require('simple-node-logger').createRollingFileLogger( opts );

// require('winston-daily-rotate-file');

// const { createLogger, format, transports } = require('winston');
// const { combine, timestamp, label, printf } = format;
// var currentdate = moment().format('YMMDD');

// const myFormat = printf(({ level, message, label, timestamp }) => {
//   var currTime = moment(timestamp).format('Y-MM-DD H:mm:ss');
//   return `${currTime} [${level}]: ${message}`;
// });

// var logger = createLogger({
//   level: 'info',
//   format: combine(
//     //label({ label: 'right meow!' }),
//     timestamp(),
//     myFormat
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.DailyRotateFile({ dirname: 'logger/logs', filename: `daily-${moment().format('YMMDD')}.log`, level: 'info', maxSize: '20m', maxFiles: '1d', frequency: '24h' }),
//     new transports.DailyRotateFile({ dirname: 'logger/logs', filename: `error-${moment().format('YMMDD')}.log`, level: 'error', maxSize: '20m', maxFiles: '1d', frequency: '24h' })
//   ]
// });


// //Second approach
// const winston = require('winston');
// const {LoggingWinston} = require('@google-cloud/logging-winston');

// //const loggingWinston = new LoggingWinston();
// const loggingWinston = new LoggingWinston({
//   projectId: 'api-node-docker',
//   keyFilename: 'api-node-docker-48fc0939e3c7.json'
// });

// // Create a Winston logger that streams to Stackdriver Logging
// // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
// const logger = winston.createLogger({
//   level: 'info',
//   transports: [
//     new winston.transports.Console(),
//     // Add Stackdriver Logging
//     loggingWinston,
//   ],
// });

module.exports = logger;