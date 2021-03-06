'use strict';


/* fake process.env */
process.env.SMS_EGA_TZ_DEFAULT_SERVICE_ID = 62;


/* dependencies */
const { expect } = require('chai');
const { parallel } = require('async');
const nock = require('nock');


/* initalize ega sms transport */
const baseUrl = 'http://api.example.com';
const smsUrl = '/sms';
const transport = require('..')({
  apiKey: 'iEPZWTdSU63WNaN',
  apiUser: 'test@example.com',
  apiUrl: `${baseUrl}${smsUrl}`,
  apiSender: 'EGA'
});

describe('tz-ega-sms', function () {

  it('should be a factory function', function () {
    expect(transport).to.exist;
    expect(transport).to.be.a('function');
    expect(transport.name).to.be.equal('tzEGASMS');
    expect(transport).to.have.length(1);
  });

  it('should have required options', function () {
    expect(transport.options).to.exist;
    expect(transport.options.apiKey).to.exist;
    expect(transport.options.apiUser).to.exist;
    expect(transport.options.apiUrl).to.exist;
    expect(transport.options.apiSender).to.exist;
    expect(transport.options.apiServiceId).to.exist;
  });

  it('should be able to hash logic', function () {
    expect(transport.hash).to.exist;
    expect(transport.hash).to.be.a('function');
    expect(transport.hash.name).to.be.equal('hash');
    expect(transport.hash).to.have.length(3);
  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.true;

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: ['255714565656', '255714567656']
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.true;

  });

  it('should be able to validate', function () {

    const sms = ({
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message).to.be.equal('Missing Message Body');

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message).to.be.equal('Missing Message DateTime');

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message).to.be.equal('Missing Message Sender Id');

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'mobile_service_id': 'SERVICEID',
      recipients: []
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message).to.be.equal('Missing Message Sender Id');

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      recipients: '255714565656'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message)
      .to.be.equal('Missing Message Mobile Service Id');

  });

  it('should be able to validate', function () {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID'
    });

    const isValid = transport.validate(sms);
    expect(isValid).to.be.an('error');
    expect(isValid.message)
      .to.be.equal('Missing Message Recipients');

  });

  it('should not send invalid sms', function (done) {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID'
    });

    transport.send(sms, function (error) {
      expect(error).to.exist;
      expect(error).to.be.an('error');
      expect(error.message)
        .to.be.equal('Missing Message Recipients');
      done();
    });

  });

  it('should be able to hash data', function (done) {

    const { apiKey } = transport.options;
    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    transport.hash(apiKey, sms, function (error, signature) {
      expect(error).to.not.exist;
      expect(signature).to.exist;
      expect(signature).to.be.a('string');
      done(error, signature);
    });

  });

  it('should be able to reproduce same hash with same data', function (done) {

    const { apiKey } = transport.options;
    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    parallel({
      one: function (next) { transport.hash(apiKey, sms, next); },
      two: function (next) { transport.hash(apiKey, sms, next); }
    }, function (error, signatures) {
      expect(error).to.not.exist;
      expect(signatures).to.exist;
      expect(signatures.one).to.be.a('string');
      expect(signatures.two).to.be.a('string');
      expect(signatures.one).to.be.eql(signatures.two);
      done(error, signatures);
    });

  });

  it('should be able to send single recipient successfully', function (done) {

    /*jshint camelcase:false*/
    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    nock(baseUrl)
      .post(smsUrl)
      .reply(function (uri, requestBody) {

        //assert headers
        expect(this.req.headers.accept).to.equal('application/json');
        expect(this.req.headers['content-type'])
          .to.equal('application/json');
        expect(this.req.headers.host).to.equal('api.example.com');
        expect(this.req.headers.authorization).to.not.be.null;
        expect(this.req.headers['x-auth-request-hash']).to.not.be.null;
        expect(this.req.headers['x-auth-request-id']).to.not.be.null;
        expect(this.req.headers['x-auth-request-type']).to.not.be.null;

        //assert body
        const _sms = JSON.parse(requestBody.data);
        expect(_sms.message).to.equal(sms.message);
        expect(_sms.datatime).to.equal(sms.datatime);
        expect(_sms.sender_id).to.equal(sms.sender_id);
        expect(_sms.mobile_service_id).to.equal(sms.mobile_service_id);
        expect(_sms.recipients).to.equal(sms.recipients);

        //fake success response
        return [200, {
          error: false,
          statusCode: 48200,
          statusMessage: 'Success',
          data: ['Message accepted delivery']
        }];

      });

    //send a quick
    transport.send(sms, function (error, response) {

      expect(error).to.be.null;
      expect(response).to.exist;

      //assert parsed
      expect(response.message).to.exist;
      expect(response.message).to.be.equal('Success');
      expect(response.code).to.exist;
      expect(response.code).to.be.equal(48200);
      expect(response.data).to.exist;
      expect(response.data).to.be.eql([
        'Message accepted delivery'
      ]);

      //assert original response
      expect(response.raw.error).to.exist;
      expect(response.raw.error).to.be.false;
      expect(response.raw.statusCode).to.exist;
      expect(response.raw.statusCode).to.be.equal(48200);
      expect(response.raw.statusMessage).to.exist;
      expect(response.raw.statusMessage).to.be.equal('Success');
      expect(response.raw.data).to.exist;
      expect(response.raw.data).to.be.eql([
        'Message accepted delivery'
      ]);

      done(error, response);

      /*jshint camelcase:true*/

    });

  });

  it('should be able to send multi recipient successfully', function (done) {

    /*jshint camelcase:false*/
    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: ['255714565656', '255714767676']
    });

    nock(baseUrl)
      .post(smsUrl)
      .reply(function (uri, requestBody) {

        //assert headers
        expect(this.req.headers.accept).to.equal('application/json');
        expect(this.req.headers['content-type'])
          .to.equal('application/json');
        expect(this.req.headers.host).to.equal('api.example.com');
        expect(this.req.headers.authorization).to.not.be.null;
        expect(this.req.headers['x-auth-request-hash']).to.not.be.null;
        expect(this.req.headers['x-auth-request-id']).to.not.be.null;
        expect(this.req.headers['x-auth-request-type']).to.not.be.null;

        //assert body
        const _sms = JSON.parse(requestBody.data);
        expect(_sms.message).to.equal(sms.message);
        expect(_sms.datatime).to.equal(sms.datatime);
        expect(_sms.sender_id).to.equal(sms.sender_id);
        expect(_sms.mobile_service_id).to.equal(sms.mobile_service_id);
        expect(_sms.recipients).to.equal(sms.recipients.join(','));

        //fake success response
        return [200, {
          error: false,
          statusCode: 48200,
          statusMessage: 'Success',
          data: ['Message accepted delivery']
        }];

      });

    //send a quick
    transport.send(sms, function (error, response) {

      expect(error).to.be.null;
      expect(response).to.exist;

      //assert parsed
      expect(response.message).to.exist;
      expect(response.message).to.be.equal('Success');
      expect(response.code).to.exist;
      expect(response.code).to.be.equal(48200);
      expect(response.data).to.exist;
      expect(response.data).to.be.eql([
        'Message accepted delivery'
      ]);

      //assert original response
      expect(response.raw.error).to.exist;
      expect(response.raw.error).to.be.false;
      expect(response.raw.statusCode).to.exist;
      expect(response.raw.statusCode).to.be.equal(48200);
      expect(response.raw.statusMessage).to.exist;
      expect(response.raw.statusMessage).to.be.equal('Success');
      expect(response.raw.data).to.exist;
      expect(response.raw.data).to.be.eql([
        'Message accepted delivery'
      ]);

      done(error, response);

      /*jshint camelcase:true*/

    });

  });

  it('should throw error on unsuccessfully send', function (done) {

    const sms = ({
      message: 'MESSAGE BODY',
      datetime: '2018-08-06 13:43:15',
      'sender_id': 'SENDERID',
      'mobile_service_id': 'SERVICEID',
      recipients: '255714565656'
    });

    nock(baseUrl)
      .post(smsUrl)
      .reply(function ( /*uri, requestBody*/ ) {

        //assert headers
        expect(this.req.headers.accept).to.equal('application/json');
        expect(this.req.headers['content-type'])
          .to.equal('application/json');
        expect(this.req.headers.host).to.equal('api.example.com');
        expect(this.req.headers.authorization).to.not.be.null;
        expect(this.req.headers['x-auth-request-hash']).to.not.be.null;
        expect(this.req.headers['x-auth-request-id']).to.not.be.null;
        expect(this.req.headers['x-auth-request-type']).to.not.be.null;

        //fake success response
        return [200, {
          error: true,
          statusCode: 48205,
          statusMessage: 'Invalid Request',
          data: null
        }];

      });

    //send a quick
    transport.send(sms, function (error, response) {

      expect(response).to.be.undefined;
      expect(error).to.exist;

      //assert parsed
      expect(error.message).to.exist;
      expect(error.message).to.be.equal('Invalid Request');
      expect(error.code).to.exist;
      expect(error.code).to.be.equal(48205);
      expect(error.data).to.be.null;

      //assert original response
      expect(error.raw.error).to.exist;
      expect(error.raw.error).to.be.true;
      expect(error.raw.statusCode).to.exist;
      expect(error.raw.statusCode).to.be.equal(48205);
      expect(error.raw.statusMessage).to.exist;
      expect(error.raw.statusMessage)
        .to.be.equal('Invalid Request');
      expect(error.raw.data).to.be.null;

      done();

    });

  });

});
