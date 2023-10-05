const { get, each, filter } = require('lodash');

const prepareRequest = (request) => {
  const headers = {};
  let contentTypeDefined = false;
  each(request.headers, (h) => {
    if (h.enabled) {
      headers[h.name] = h.value;
      if (h.name.toLowerCase() === 'content-type') {
        contentTypeDefined = true;
      }
    }
  });

  let axiosRequest = {
    method: request.method,
    url: request.url,
    headers: headers
  };

  // Authentication
  if (request.auth) {
    if (request.auth.mode === 'basic') {
      axiosRequest.auth = {
        username: get(request, 'auth.basic.username'),
        password: get(request, 'auth.basic.password')
      };
    }

    if (request.auth.mode === 'bearer') {
      axiosRequest.headers['authorization'] = `Bearer ${get(request, 'auth.bearer.token')}`;
    }
  }

  request.body = request.body || {};

  if (request.body.mode === 'json') {
    if (!contentTypeDefined) {
      axiosRequest.headers['content-type'] = 'application/json';
    }
    try {
      axiosRequest.data = JSON.parse(request.body.json);
    } catch (ex) {
      axiosRequest.data = request.body.json;
    }
  }

  if (request.body.mode === 'text') {
    if (!contentTypeDefined) {
      axiosRequest.headers['content-type'] = 'text/plain';
    }
    axiosRequest.data = request.body.text;
  }

  if (request.body.mode === 'xml') {
    if (!contentTypeDefined) {
      axiosRequest.headers['content-type'] = 'text/xml';
    }
    axiosRequest.data = request.body.xml;
  }

  if (request.body.mode === 'formUrlEncoded') {
    axiosRequest.headers['content-type'] = 'application/x-www-form-urlencoded';
    const params = {};
    const enabledParams = filter(request.body.formUrlEncoded, (p) => p.enabled);
    each(enabledParams, (p) => (params[p.name] = p.value));
    axiosRequest.data = params;
  }

  if (request.body.mode === 'multipartForm') {
    const params = {};
    const enabledParams = filter(request.body.multipartForm, (p) => p.enabled);
    each(enabledParams, (p) => (params[p.name] = p.value));
    axiosRequest.headers['content-type'] = 'multipart/form-data';
    axiosRequest.data = params;
  }

  if (request.body.mode === 'graphql') {
    const graphqlQuery = {
      query: get(request, 'body.graphql.query'),
      variables: JSON.parse(get(request, 'body.graphql.variables') || '{}')
    };
    if (!contentTypeDefined) {
      axiosRequest.headers['content-type'] = 'application/json';
    }
    axiosRequest.data = graphqlQuery;
  }

  if (request.script && request.script.length) {
    axiosRequest.script = request.script;
  }

  return axiosRequest;
};

module.exports = prepareRequest;
