'use strict';

const Engine = require('apollo-engine').Engine;
const {getSchema} = require('./schema/index');
const startSubscriptionServer = require('./subscriptions');

module.exports = function(app, options) {
  const models = app.models();
  const schema = getSchema(models, options);
  const apollo = options.apollo;
  const path = options.path || '/graphql';

  if (apollo) {
    if (!apollo.apiKey) {
      throw new Error('Apollo engine api key is not defined');
    }
    const engine = new Engine({
      engineConfig: {
        apiKey: apollo.apiKey,
        logging: {
          level: apollo.debugLevel || 'DEBUG',
          // DEBUG, INFO, WARN or ERROR
        },
      },
      graphqlPort: apollo.graphqlPort || 2000,
      endpoint: path || '/graphql',
      dumpTraffic: true,
    });

    engine.start();

    app.use(engine.expressMiddleware());
  }

  try {
    startSubscriptionServer(app, schema, options);
  } catch (ex) {
    console.log(ex);
  }
};
