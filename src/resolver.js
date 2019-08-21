function getParams(req, pathMatch, route) {
  const params = {};

  const hostMatch = route.host.exec(req.host);
  route.hostVariables.forEach((name, index) => {
    params[name] = hostMatch[index + 1];
  });

  route.pathVariables.forEach((pathVariable, index) => {
    params[pathVariable.name] = pathMatch[index + 1];
  });

  return params;
}

/**
 * Checks if the route is valid for a request
 * @param {route} route
 * @param {*} request
 */
function testPath(route, request) {
  // Check the method and host first
  if (!route.method.test(request.method) || !route.host.test(request.host)) {
    return null;
  }

  return route.path.exec(request.path);
}

async function recurseRoutes(ctx, routes) {
  const [route, ...nextRoutes] = routes;
  if (!route) {
    // eslint-disable-next-line
    return new Response('NOT_FOUND', {
      status: 404,
    });
  }

  const match = testPath(route, ctx.request);

  if (!match) {
    return recurseRoutes(ctx, nextRoutes);
  }

  ctx.params = getParams(ctx.request, match, route);

  try {
    return route.handler(ctx, async (result) => recurseRoutes(result, nextRoutes));
  } catch (err) {
    err.route = route.handler.name;
    throw err;
  }
}

module.exports = {
  recurseRoutes,
};
