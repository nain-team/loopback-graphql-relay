const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const bodyParser = require('body-parser');
const { graphiqlExpress } = require('apollo-server-express');
const graphqlHTTP = require('express-graphql');

module.exports = function (app, schema, opts) {
  app.use('/graphql', bodyParser.json(), graphqlHTTP({
    schema,
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
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    console.log(`Loopback GraphQL server running on port ${PORT}.`);
  });
};
