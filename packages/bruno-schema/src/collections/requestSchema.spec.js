const { expect } = require('@jest/globals');
const { uuid, validationErrorWithMessages } = require("../utils/testUtils");
const { requestSchema } = require("./index");

describe('Request Schema Validation', () => {
  it('request schema must validate successfully - simple request', async () => {
    const request = {
      type: 'http',
      url: 'https://restcountries.com/v2/alpha/in',
      method: 'GET',
      headers: [],
      params: [],
      body: {
        mode: 'none'
      }
    };

    const isValid = await requestSchema.validate(request);
    expect(isValid).toBeTruthy();
  });

  it('request schema must throw an error of type is invalid', async () => {
    const request = {
      type: 'http-junk',
      url: 'https://restcountries.com/v2/alpha/in',
      method: 'GET',
      headers: [],
      params: [],
      body: {
        mode: 'none'
      }
    };

    return Promise.all([
      expect(requestSchema.validate(request)).rejects.toEqual(
        validationErrorWithMessages('type must be one of the following values: http, graphql')
      )
    ]);
  });

  it('request schema must throw an error of method is invalid', async () => {
    const request = {
      type: 'http',
      url: 'https://restcountries.com/v2/alpha/in',
      method: 'GET-junk',
      headers: [],
      params: [],
      body: {
        mode: 'none'
      }
    };

    return Promise.all([
      expect(requestSchema.validate(request)).rejects.toEqual(
        validationErrorWithMessages('method must be one of the following values: GET, POST, PUT, DELETE, PATCH, HEAD')
      )
    ]);
  });

  it('request schema must throw an error of header name is missing', async () => {
    const request = {
      type: 'http',
      url: 'https://restcountries.com/v2/alpha/in',
      method: 'GET',
      headers: [{
        uid: uuid(),
        value: 'Check',
        description: '',
        enabled: true
      }],
      params: [],
      body: {
        mode: 'none'
      }
    };

    return Promise.all([
      expect(requestSchema.validate(request)).rejects.toEqual(
        validationErrorWithMessages('headers[0].name must be defined')
      )
    ]);
  });

  it('request schema must throw an error of param value is missing', async () => {
    const request = {
      type: 'http',
      url: 'https://restcountries.com/v2/alpha/in',
      method: 'GET',
      headers: [],
      params: [{
        uid: uuid(),
        name: 'customerId',
        description: '',
        enabled: true
      }],
      body: {
        mode: 'none'
      }
    };

    return Promise.all([
      expect(requestSchema.validate(request)).rejects.toEqual(
        validationErrorWithMessages('params[0].value must be defined')
      )
    ]);
  });
});