'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const chai = require('chai').use(require('chai-http'));
const server = require('../server/server');
const gql = require('graphql-tag');

describe('Queries', () => {
  it('Single entity', () => {
    const query = gql `
      {
        viewer {
          sites {
            totalCount
          }
        }
      }`;
    chai.request(server)
      .post('/graphql')
      .send(query)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
      });
  });
});
