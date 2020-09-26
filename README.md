# tz-ega-sms

[![Build Status](https://travis-ci.org/lykmapipo/tz-ega-sms.svg?branch=master)](https://travis-ci.org/lykmapipo/tz-ega-sms)
[![Dependencies Status](https://david-dm.org/lykmapipo/tz-ega-sms/status.svg)](https://david-dm.org/lykmapipo/tz-ega-sms)

Send SMS over Tanzania EGA API

## Requirements

- [nodejs v8.11.1+](https://nodejs.org)
- [npm v5.6.0+](https://www.npmjs.com/)

## Installation

```sh
npm install --save @lykmapipo/tz-ega-sms
```

## Usage

```js
const transport = require('@lykmapipo/tz-ega-sms')({
  apiKey: process.env.SMS_EGA_TZ_API_KEY,
  apiUser: process.env.SMS_EGA_TZ_API_USER,
  apiUrl: process.env.SMS_EGA_TZ_API_URL,
  apiSender: process.env.SMS_EGA_TZ_DEFAULT_SENDER_ID
  apiServiceId: process.env.SMS_EGA_TZ_DEFAULT_SERVICE_ID
});

const sms = ({
  message: 'Hello Juma, Your water bill is TZS 17,439/=',
  datetime: '2018-08-06 13:43:15',
  'sender_id': 'BILLING',
  'mobile_service_id': '400',
  recipients: '255714565656'
});

transport.send(sms, function (error, response) {
  expect(error).to.not.exist;
  expect(response).to.exist;
});
```

## Test

- Clone this repository

- Install all dependencies

```sh
npm install
```

- Then run test

```sh
npm test
```

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence

The MIT License (MIT)

Copyright (c) 2018 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
