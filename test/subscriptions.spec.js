'use strict';
const ws = require('ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const { ApolloClient } = require('apollo-client');
const { HttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');


const Promise = require('bluebird');
const expect = require('chai').expect;
const chai = require('chai').use(require('chai-http'));
const server = require('../server/server');
const gql = require('graphql-tag');


let apollo;
let networkInterface;
const GRAPHQL_ENDPOINT = 'ws://localhost:5000/subscriptions';


describe('Subscription', () => {
    it('Subscribe to ', async () => {

        const query = gql `subscription {
          Customer(input: {create: true, clientSubscriptionId: 5500, options: {where: {age: {gt: 100}}}}) {
            customer {
              name
            }
          }
        }
        `;

        const GRAPHQL_ENDPOINT = 'ws://localhost:5000/graphql';

        const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
            reconnect: true,
        }, ws);


        const apolloClient = new ApolloClient({
            networkInterface: client,
            link: new HttpLink(),
            cache: new InMemoryCache()
        });

        apolloClient.subscribe({
            query: query,
            variables: {}
        }).subscribe({
            next (data) {
                console.log(data);
            }
        });
    });
});
