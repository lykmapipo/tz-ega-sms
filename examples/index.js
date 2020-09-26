'use strict';

const { getString } = require('@lykmapipo/env');
const transport = require('../')({});

const SMS_EGA_TZ_TEST_RECEIVER = getString('SMS_EGA_TZ_TEST_RECEIVER');
if (SMS_EGA_TZ_TEST_RECEIVER) {
  const sms = {
    message: 'Test SMS',
    recipients: SMS_EGA_TZ_TEST_RECEIVER
  };

  transport.send(sms, function (error, response) {
    console.log(error, response);
  });
}
