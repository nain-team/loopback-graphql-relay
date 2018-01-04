'use strict';

const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {execute, subscribe} = require('graphql');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

module.exports = function(app, schema, opts) {
  app.use('/graphql', bodyParser.json(), graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: true,
  }));

  const PORT = 3000;

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }));

  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      {execute, subscribe, schema},
      {server, path: '/subscriptions'}
    );
    console.log(`GraphQL server running on port ${PORT}.`);
  });

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

  SubscriptionServer.create({schema, execute, subscribe}, {server: websocketServer, path: '/'});

  return server;
};
