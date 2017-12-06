'use strict';

const _ = require('lodash');

const PubSub = require('./pubsub');
// const SubscriptionManager = require('./subscriptionManager');
const SubscriptionServer = require('./server');
const patchChangeStream = require('./patchChangeStream');

module.exports = function startSubscriptionServer(app, schema, options) {
  const models = app.models();

  _.forEach(models, (model) => {
    patchChangeStream(model);
  });

  const setupFunctions = {};
  _.forEach(models, (model) => {
    if (!model.shared) {
      return;
    }

    setupFunctions[model.modelName] = (options, args) => {
      const ret = {};
      ret[_.lowerCase(model.modelName)] = {
        // filter: comment => comment.repository_name ===
        // args.repoFullName,
        channelOptions: getOptions(model, options, args),
      };

      return ret;
    };
  });
  // const subscriptionManager = SubscriptionManager(models, schema, new
  // PubSub());
  SubscriptionServer(app, schema, setupFunctions);

  // test(subscriptionManager);
};

function getOptions(model, options, args) {
  const basicOpts = {
    context: options.context,
    create: (!_.isNil(args.input.create)) ? args.input.create : false,
    update: (!_.isNil(args.input.update)) ? args.input.update : false,
    remove: (!_.isNil(args.input.remove)) ? args.input.remove : false,
    options: (!_.isNil(args.input.options)) ? args.input.options : false,
    clientSubscriptionId: (!_.isNil(args.input.clientSubscriptionId)) ?
      args.input.clientSubscriptionId : false,
  };

  basicOpts.model = model;

  return basicOpts;
}
