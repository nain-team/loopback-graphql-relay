const _ = require('lodash');
const { LoopbackPubSub } = require('graphql-loopback-subscriptions');
const { withFilter } = require('graphql-subscriptions');
const { getType } = require('../types/type');
const app = require('../../server/server');

const {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');

const loopbackPubSub = new LoopbackPubSub();

function resolveMaybeThunk(maybeThunk) {
  return typeof maybeThunk === 'function' ? maybeThunk() : maybeThunk;
}

function defaultGetPayload(obj) {
  return (obj && obj.object) ? obj : null;
}

module.exports = function subscriptionWithPayload({ modelName, subscribeAndGetPayload = defaultGetPayload }) {
  const inputType = new GraphQLInputObjectType({
    name: `${modelName}SubscriptionInput`,
    fields: () => Object.assign(
      {},
      // resolveMaybeThunk(inputFields),
      { options: { type: getType('JSON') } },
      { create: { type: getType('Boolean') } },
      { update: { type: getType('Boolean') } },
      { remove: { type: getType('Boolean') } },
      { clientSubscriptionId: { type: getType('Int') } },
    ),
  });

  const outputFields = {};
  const modelFieldName = _.camelCase(_.lowerCase(modelName));
  outputFields[modelFieldName] = {
    type: getType(modelName),
    resolve: o => o.object,
  };

  const outputType = new GraphQLObjectType({
    name: `${modelName}SubscriptionPayload`,
    fields: () => Object.assign(
      {},
      resolveMaybeThunk(outputFields),
      { where: { type: getType('JSON') } },
      { type: { type: getType('String') } },
      { target: { type: getType('String') } },
      { clientSubscriptionId: { type: getType('Int') } },
    ),
  });

  return {
    type: outputType,
    args: {
      input: { type: new GraphQLNonNull(inputType) },
    },
    resolve(subscribedData, { input }, context, info) {
      const clientSubscriptionId = (subscribedData) ? subscribedData.subscriptionId : null;
      const object = (subscribedData) ? subscribedData.object : null;
      const where = (subscribedData) ? subscribedData.object.where : null;
      const type = (subscribedData) ? subscribedData.object.type : null;
      const target = (subscribedData) ? subscribedData.object.target : null;

      return Promise.resolve(subscribeAndGetPayload(
        subscribedData, { input }, context,
        info,
      ))
        .then(payload => ({
          clientSubscriptionId, where, type, target, object: payload.object.data,
        }));
    },
    subscribe: withFilter(
      () => loopbackPubSub.asyncIterator(modelName),
      (payload, variables, arg0, arg1) => {
        const subscriptionPayload = {
          clientSubscriptionId: variables.input.clientSubscriptionId,
          remove: variables.input.remove,
          create: variables.input.create,
          update: variables.input.update,
        };

        subscriptionPayload.model = app.models[modelName];

        try {
          loopbackPubSub.subscribe(arg1.fieldName, null, subscriptionPayload);
        } catch (ex) {
          console.log(ex);
        }
        return true;
      },
    ),
  };
};
