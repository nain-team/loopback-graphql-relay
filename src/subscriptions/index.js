'use strict';

const _ = require('lodash');

const PubSub = require('./pubsub');
const SubscriptionManager = require('./subscriptionManager');
const SubscriptionServer = require('./server');
const patchChangeStream = require('./patchChangeStream');

// // start a subscription (for testing)
// function test(subscriptionManager) {
//   subscriptionManager.subscribe({
//     query: `
//       subscription AuthorSubscription(
//         $options: JSON
//         $create: Boolean
//         $update: Boolean
//         $remove: Boolean
//       ) {
//         Author(input: {
//           options: $options
//           create: $create
//           update: $update
//           remove: $remove
//           clientSubscriptionId: 85
//         }) {
//           author {
//             id first_name last_name
//           }
//           where type target clientSubscriptionId
//         }
//       }
//     `,
//     variables: {
//       options: { where: { last_name: 'bar' } },
//       create: true,
//       update: true,
//       remove: true,
//     },
//     context: {},
//     callback: (err, data) => {
//       console.log('subs output', data);
//     },
//   }).catch(err => console.log(`An error occured: ${err}`));
// }

module.exports = function startSubscriptionServer(app, schema, options) {
  const models = app.models();

  _.forEach(models, (model) =>  {
    patchChangeStream(model);
  });

  const subscriptionManager = SubscriptionManager(models, schema, new PubSub());
  SubscriptionServer(app, subscriptionManager, options);

  // test(subscriptionManager);
};
