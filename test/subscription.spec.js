
const {
  before, describe, it,
} = require('mocha');
const expect = require('chai').expect;
const chai = require('chai')
  .use(require('chai-http'));
const server = require('../server/server');
const gql = require('graphql-tag');
const Promise = require('bluebird');
const cpx = require('cpx');

describe('Subscription', () => {
  describe('Subscribe', () => {
    it('should subscrine on model', () => {
      const query = gql`
        subscription {
            Note(input: {create: true}) {
                note {
                    title
                }
            }
        } `;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result).to.equal('Your subscription data will appear here after server publication!');
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});
