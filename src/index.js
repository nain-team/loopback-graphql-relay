'use strict';

const graphql = require('graphql-server-express');
const bodyParser = require('body-parser');
const {getSchema} = require('./schema/index');

const startSubscriptionServer = require('./subscriptions');

module.exports = function(app, options) {
  const models = app.models();
  const schema = getSchema(models, options);

  const graphiqlPath = options.graphiqlPath || '/graphiql';
  const path = options.path || '/graphql';

  app.use(path, bodyParser.json(), graphql.graphqlExpress(req => ({
    schema,
    context: {
      app,
      req,
    },
    tracing: true,
    cacheControl: true,
  })));

  app.use(graphiqlPath, graphql.graphiqlExpress({
    endpointURL: path,
  }));

  // Subscriptions
  try {
    startSubscriptionServer(app, schema, options);
  } catch (ex) {
    console.log(ex);
  }
};
