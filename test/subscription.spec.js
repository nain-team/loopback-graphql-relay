/* eslint-disable no-unused-expressions */

'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const chai = require('chai')
  .use(require('chai-http'));
const server = require('../server/server');
const cpx = require('cpx');

const gql = require('graphql-tag');

describe('Subscription Testing', () => {
  it('should allow access with access token', () => {
    const query = gql`query {
            Book {
                BookFind {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        }`;
    return chai.request(server)
      .post('/graphql')
      .set('Authorization',
        'PFzHFTtogUDB0l60MvHh4nnqg2DaD8UoHV3XtKEfKvAQJOxnTl151XLXC7ulIXWG')
      .send({
        query,
      })
      .then((res) => {
        expect(res).to.have.status(200);
      });
  });
});
