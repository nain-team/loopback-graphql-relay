'use strict';

const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {execute, subscribe} = require('graphql');

module.exports = function(app, schema, opts) {
  const subscriptionOpts = opts.subscriptionServer || {};

  const disable = subscriptionOpts.disable || false;

  if (disable === true) {
    return;
  }

  const WS_PORT = subscriptionOpts.port || 5000;
  const options = subscriptionOpts.options || {};
  const socketOptions = subscriptionOpts.socketOptions || {};

  const websocketServer = createServer((request, response) => {
    response.writeHead(404);
    response.end();
  });

  websocketServer.listen(WS_PORT, () => console.log(
    `Websocket Server is now running on http://localhost:${WS_PORT}`
  ));

  const server = SubscriptionServer.create({schema, execute, subscribe}, {server: websocketServer, path: '/'});

  return server;
};
