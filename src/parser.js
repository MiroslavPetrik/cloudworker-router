const pathToRegexp = require('path-to-regexp');

function parseRoute({ host = '.*', path = '/*', method = ['.*'], handler, data }) {
  const hostVariables = [];
  const pathVariables = [];

  const hostRegexpString = host
    // Replace any variables in the host
    .replace(/(:([^.]+))/g, ($1, $2, $3) => {
      hostVariables.push($3);
      return '([^.]+)';
    });

  const hostRegex = new RegExp(`^${hostRegexpString}$`, 'i');
  const pathRegex = pathToRegexp(path, pathVariables);
  const methodRegex = new RegExp(`^${method.join('|')}$`, 'i');

  return {
    hostVariables,
    pathVariables,
    host: hostRegex,
    path: pathRegex,
    method: methodRegex,
    handler,
    data,
  };
}

function parseRequest(request) {
  const url = new URL(request.url);

  return {
    headers: request.headers,
    href: request.url,
    host: url.host,
    hostname: url.hostname,
    method: request.method,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), // Remove the semicolon at the end
    query: url.searchParams,
  };
}

module.exports = {
  parseRoute,
  parseRequest,
};
