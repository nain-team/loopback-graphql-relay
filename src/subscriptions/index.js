const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const bodyParser = require('body-parser');
const graphql = require('graphql-server-express');

module.exports = function (app, schema, opts) {
  const PORT = 3000;
  const graphiqlPath = '/graphiql';
  const path = '/graphql';

  app.use(path, bodyParser.json(), graphql.graphqlExpress(req => ({
    schema,
    context: {
      app,
      req,
    },
  })));

  app.use(graphiqlPath, graphql.graphiqlExpress({
    endpointURL: path,
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
