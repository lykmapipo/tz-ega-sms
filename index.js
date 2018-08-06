'use strict';


/* dependencies */
const crypto = require('crypto');
const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const request = require('request');
const defaults =
  ({ apiKey: undefined, apiUser: undefined, apiUrl: undefined, apiSender: undefined });
const X_AUTH_REQUEST_TYPE = 'api';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';


/**
 * @name tzEGASMS
 * @description sms api client for tanzania ega
 * @param  {Object} options valid client options
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @license MIT
 * @example
 * const transport = require('@lykmapipo/tz-ega-sms')({
 *   apiKey: '<generate api key from ega sms portal>',
 *   apiUser: '<use id for the api key>',
 *   apiUrl: '<given ega quick sms public url>',
 *   apiSender: '<your sender id from ega>'
 * });
 *
 * const sms = ({
 *   message: 'MESSAGE BODY',
 *   datetime: '2018-08-06 13:43:15',
 *   sender_id: 'SENDERID',
 *   mobile_service_id: 'SERVICEID',
 *   recipients: 'RECIPIENT PHONE NUMBER in E.164'
 * });
 *
 * transport.send(sms, function(error, response){
 *   ...
 * });
 */
exports = module.exports = function tzEGASMS(options) {

  //merge options
  const _options = _.merge({}, defaults, exports.options, options);

  //ensure apiKey, apiUser and apiUrl
  const { apiKey, apiUser, apiUrl } = _options;
  if (_.isEmpty(apiKey)) { throw new Error('Missing API Key'); }
  if (_.isEmpty(apiUser)) { throw new Error('Missing API User'); }
  if (_.isEmpty(apiUrl)) { throw new Error('Missing API URL'); }

  //set options
  exports.options = _options;

  return exports;

};


/**
 * @name hash
 * @description sign message body
 * @param {String} secret valid ega api(secret) key
 * @param {Object} data message body
 * @param {Function} done a callback to invoke on success or failure
 * @return {String} base64 signed message body
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @license MIT
 */
exports.hash = function hash(secret, data, done) {

  //try generate signature
  try {
    //convert data to string
    const _data = _.isString(data) ? data : JSON.stringify(data);

    //generate base64 signature
    const signature =
      crypto.createHmac('sha256', secret).update(_data).digest('base64');

    //return value
    return done(null, signature);
  }

  //capture error and foward
  catch (error) {
    //return error
    return done(error);
  }

};


/**
 * @name send
 * @description send single sms
 * @param {Object} sms valid ega sms payload
 * @param {Function} done a callback to invoke success or failure
 * @return {Object|Error} success response or error
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @license MIT
 * @example
 * const transport = require('@lykmapipo/tz-ega-sms')(<options>);
 * transport
 *  .send({recipients:'255716111888', message: 'Test', sender_id:'DAWASCO'}, done);
 */
exports.send = function send(sms, done) {
  //TODO validate sms payload

  //obtain api params
  const { apiKey, apiUser, apiSender, apiUrl } = exports.options;

  //ensure sms datetime & sender
  const dateTime = moment(new Date()).format(DATE_TIME_FORMAT);
  /*jshint camelcase:false*/
  const _sms = {
    message: sms.message,
    datetime: sms.datetime || dateTime,
    sender_id: sms.sender_id || apiSender,
    mobile_service_id: sms.mobile_service_id,
    recipients: sms.recipients
  };
  /*jshint camelcase:true*/

  //send sms
  async.waterfall([

    //prepare body(sms) hash
    function hashSMS(next) {
      exports.hash(apiKey, _sms, next);
    },

    //prepare api headers
    function prepareHeaders(hash, next) {
      const headers = {
        'X-Auth-Request-Hash': hash,
        'X-Auth-Request-Id': apiUser,
        'X-Auth-Request-Type': X_AUTH_REQUEST_TYPE,
      };

      next(null, headers);
    },

    //send request to ega api
    function sendSMS(headers, next) {
      request.post({
        url: apiUrl,
        headers: headers,
        json: {
          data: JSON.stringify(_sms),
          datetime: _sms.datetime
        }
      }, next);
    }

  ], function (error, response, body) {

    //handle error
    if (error) {
      error.code = (error.code || 500);
      error.data = (error.data || undefined);
      done(error);
    }

    //handle & normalize fail response
    if (body && body.error) {
      const {
        statusMessage = 'Invalid Request', statusCode = 500, data = null
      } = body;
      error = new Error(statusMessage);
      error.code = statusCode;
      error.data = data;
      error.raw = body;
      done(error);
    }

    //handle & normalize success response
    else {
      const {
        statusMessage = 'Success', statusCode = 200, data = null
      } = body;
      const result =
        ({ message: statusMessage, code: statusCode, data: data });
      result.raw = body;
      done(null, result);
    }

  });

};
