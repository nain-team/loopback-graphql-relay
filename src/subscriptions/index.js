'use strict';

const _ = require('lodash');

const PubSub = require('./pubsub');
//const SubscriptionManager = require('./subscriptionManager');
const SubscriptionServer = require('./server');
const patchChangeStream = require('./patchChangeStream');

module.exports = function startSubscriptionServer(app, schema, options) {
  const models = app.models();

  _.forEach(models, (model) =>  {
    patchChangeStream(model);
  });

  //const subscriptionManager = SubscriptionManager(models, schema, new PubSub());
  SubscriptionServer(app, schema, options);

  // test(subscriptionManager);
};
