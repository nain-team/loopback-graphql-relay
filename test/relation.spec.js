'use strict';

const expect = require('chai').expect;
const chai = require('chai')
  .use(require('chai-http'));
const server = require('../server/server');
const gql = require('graphql-tag');
const Promise = require('bluebird');
const cpx = require('cpx');

describe('Relations', () => {
  before(() => Promise.fromCallback(cb => cpx.copy('./data.json', './data/', cb)));

  it('should query related entity with nested relational data', () => {
    const query = gql`
              {
                Customer {
                  CustomerFind(first: 1) {
                    edges {
                      node {
                        name
                        age
                        orders {
                          edges {
                            node {
                              date
                              description
                              customer {
                                name
                                age
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }`;
    return chai.request(server)
      .post('/graphql')
      .send({
        query,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.Customer.CustomerFind.edges.length).to.equal(1);
      });
  });

  describe('hasManyAndBelongsToMany', () => {
    it('Author should have three books', () => {
      const query = gql`
        {
          node(id: "QXV0aG9yOjE=") {
            ... on Author {
              id
              firstName
              lastName
              books(last: 1) {
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                edges {
                  node {
                    id
                    name
                  }
                  cursor
                }
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.node.firstName).to.equal('Iqbal');
          expect(result.node.books.totalCount).to.equal(3);
        });
    });
  });

  describe('hasMany', () => {
    it('should have one author and more than two notes', () => {
      const query = gql`
        {
          Author {
            AuthorFindById(id: 1) {
              id
              firstName
              lastName
              notes {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.Author.AuthorFindById.firstName).to.equal('Iqbal');
          expect(result.Author.AuthorFindById.notes.edges.length).to.be.above(0);
        });
    });
  });

  describe('referencesMany', () => {
    it('should have one author and 1 friendIds', () => {
      const query = gql`
        {
          node(id: "QXV0aG9yOjE=") {
            ... on Author {
              id
              firstName
              lastName
              friendId
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.node.firstName).to.equal('Iqbal');
          expect(result.node.friendId.length).to.equal(1);
        });
    });
  });

  describe('embedsMany', () => {
    it('should have one book and two links', () => {
      const query = gql`
        {
          Book {
            BookFindById(id: 1) {
              id
              name
              links {
                id
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .set('Authorization', 'PFzHFTtogUDB0l60MvHh4nnqg2DaD8UoHV3XtKEfKvAQJOxnTl151XLXC7ulIXWG')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.Book.BookFindById.name).to.equal('Book 1');
          expect(result.Book.BookFindById.links.length).to.equal(1);
        });
    });
  });

  describe('embedsOne', () => {
    it('should have a billingAddress', () => {
      const query = gql`
        {
          node(id: "Q3VzdG9tZXI6MQ==") {
            ... on Customer {
              id
              billingAddress {
                id
                street
                city
                state
                zipCode
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.node.billingAddress.zipCode).to.equal('54900');
        });
    });
  });

  describe('belongsTo', () => {
    it('should have a note and its owner', () => {
      const query = gql`
        {
          node(id: "Tm90ZTox") {
            ... on Note {
              id
              title
              author {
                id
                firstName
                lastName
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.node.title).to.equal('Note 1');
          expect(result.node.author.firstName).to.equal('Iqbal');
        });
    });
  });

  describe('hasOne', () => {
    it('should have orders with its customer', () => {
      const query = gql`
        {
          Order {
            OrderFindById(id: 1) {
              id
              description
              customer {
                id
                name
              }
            }
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.Order.OrderFindById.customer.name).to.equal('Customer 1');
        });
    });
  });
});
