const { NodeVM } = require('vm2');
const chai = require('chai');
const path = require('path');
const http = require('http');
const https = require('https');
const stream = require('stream');
const util = require('util');
const zlib = require('zlib');
const url = require('url');
const punycode = require('punycode');
const fs = require('fs');
const Bru = require('../bru');
const BrunoRequest = require('../bruno-request');
const BrunoResponse = require('../bruno-response');
const Test = require('../test');
const TestResults = require('../test-results');
const { cleanJson } = require('../utils');

// Inbuilt Library Support
const atob = require('atob');
const axios = require('axios');
const btoa = require('btoa');
const lodash = require('lodash');
const moment = require('moment');
const uuid = require('uuid');
const nanoid = require('nanoid');
const CryptoJS = require('crypto-js');

class TestRuntime {
  constructor() {}

  async runTests(
    testsFile,
    request,
    response,
    envVariables,
    collectionVariables,
    collectionPath,
    onConsoleLog,
    processEnvVars,
    allowScriptFilesystemAccess
  ) {
    const bru = new Bru(envVariables, collectionVariables, processEnvVars, collectionPath);
    const req = new BrunoRequest(request);
    const res = new BrunoResponse(response);

    const __brunoTestResults = new TestResults();
    const test = Test(__brunoTestResults, chai);

    if (!testsFile || !testsFile.length) {
      return {
        request,
        envVariables,
        collectionVariables,
        results: __brunoTestResults.getResults()
      };
    }

    const context = {
      test,
      bru,
      req,
      res,
      expect: chai.expect,
      assert: chai.assert,
      __brunoTestResults: __brunoTestResults
    };

    if (onConsoleLog && typeof onConsoleLog === 'function') {
      const customLogger = (type) => {
        return (...args) => {
          onConsoleLog(type, cleanJson(args));
        };
      };
      context.console = {
        log: customLogger('log'),
        info: customLogger('info'),
        warn: customLogger('warn'),
        error: customLogger('error')
      };
    }

    const vm = new NodeVM({
      sandbox: context,
      require: {
        context: 'sandbox',
        external: true,
        root: [collectionPath],
        mock: {
          // node libs
          path,
          stream,
          util,
          url,
          http,
          https,
          punycode,
          zlib,
          // 3rd party libs
          atob,
          axios,
          btoa,
          lodash,
          moment,
          uuid,
          nanoid,
          chai,
          'crypto-js': CryptoJS,
          fs: allowScriptFilesystemAccess ? fs : undefined
        }
      }
    });

    const asyncVM = vm.run(`module.exports = async () => { ${testsFile}}`, path.join(collectionPath, 'vm.js'));
    await asyncVM();

    return {
      request,
      envVariables: cleanJson(envVariables),
      collectionVariables: cleanJson(collectionVariables),
      results: cleanJson(__brunoTestResults.getResults())
    };
  }
}

module.exports = TestRuntime;
