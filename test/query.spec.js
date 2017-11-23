'use strict';

const expect = require('chai').expect;
const chai = require('chai')
  .use(require('chai-http'));
const server = require('../server/server');
const gql = require('graphql-tag');
const Promise = require('bluebird');
const cpx = require('cpx');

describe('Queries', () => {
  before(() => Promise.fromCallback(cb => cpx.copy('./data.json', './data/', cb)));

  describe('Single entity', () => {
    it('should execute a single query with relation', () => {
      const query = gql `
            query {
              viewer {
                sites(first: 1) {
                  edges {
                    node {
                      name
                      owner {
                        username
                      }
                    }
                  }
                }
              }
            }`;
      return chai.request(server)
        .post('/graphql')
        .set('Authorization', 'iZF7aA2eXoadDrPDhFiqj6HvrbHNl2akDcoZ5DDD716QKI9h8ERqcLgU1EIQDlGo')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          const result = res.body.data;
          expect(result.viewer.sites.edges.length).to.equal(1);
          expect(result.viewer.sites.edges[0].node.name).to.equal('Site B of owner 5');
          expect(result.viewer.sites.edges[0].node.owner.username).to.equal('aatif');
        });
    });
  });

  it('should have a total count of 3', () => {
    const query = gql `
      {
        viewer {
          sites {
            totalCount
          }
        }
      }`;
    return chai.request(server)
      .post('/graphql')
      .set('Authorization', 'iZF7aA2eXoadDrPDhFiqj6HvrbHNl2akDcoZ5DDD716QKI9h8ERqcLgU1EIQDlGo')
      .send({
        query,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.viewer.sites.totalCount).to.equal(3);
      });
  });

  it('should sort books by name in descending order', () => {
    const query = gql `
      {
        viewer {
          sites (order: "name DESC") {
            totalCount
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }`;
    return chai.request(server)
      .post('/graphql')
      .set('Authorization', 'iZF7aA2eXoadDrPDhFiqj6HvrbHNl2akDcoZ5DDD716QKI9h8ERqcLgU1EIQDlGo')
      .send({
        query,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.viewer.sites.totalCount).to.equal(3);
        expect(res.body.data.viewer.sites.edges[0].node.name).to.equal('Site C of owner 5');
      });
  });

  it('should return current logged in user', () => {
    const query = gql `
      {
        viewer {
          me { id username email }
        }
      }`;
    return chai.request(server)
      .post('/graphql')
      .set('Authorization', 'iZF7aA2eXoadDrPDhFiqj6HvrbHNl2akDcoZ5DDD716QKI9h8ERqcLgU1EIQDlGo')
      .send({
        query,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.viewer.me.username).to.equal('aatif');
        expect(res.body.data.viewer.me.email).to.equal('aatif@email.com');
      });
  });

  describe('Remote hooks', () => {
    it('count', () => {
      const query = gql `
        {
          Author {
            count: AuthorCount
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.Author.count).to.be.above(1);
        });
    });

    it('exists', () => {
      const query = gql `
        {
          Reader {
            exists: ReaderExists(id: 1) 
          }
        }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.Reader.exists).to.equal(true);
        });
    });

    it('findOne', () => {
      const query = gql `
        {
          Author {
            AuthorFindOne(filter: { where: {id: 3}}) {
              id
              first_name
              last_name
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
          expect(res.body.data.Author.AuthorFindOne.first_name).to.equal('Virginia');
          expect(res.body.data.Author.AuthorFindOne.last_name).to.equal('Wolf');
        });
    });

    it('findById', () => {
      const query = gql `
        {
          Author {
            AuthorFindById(id: 3) {
              id
              first_name
              last_name
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
          expect(res.body.data.Author.AuthorFindById.first_name).to.equal('Virginia');
          expect(res.body.data.Author.AuthorFindById.last_name).to.equal('Wolf');
        });
    });

    it('find', () => {
      const query = gql `
        {
          Book {
            BookFind {
              edges {
                node {
                  id
                  name
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
          expect(res.body.data.Book.BookFind.edges.length).to.be.above(2);
        });
    });

    it('should call a remoteHook and return the related data', () => {
      const query = gql `
        {
          Customer {
            CustomerFindById(id: 3) {
              name
              age
              billingAddress {
                id
              }
              emailList {
                id
              }
              accountIds
              orders {
                edges {
                  node {
                    id
                    date
                    description
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
          expect(res.body).to.have.deep.property('data');
          expect(res.body.data).to.have.deep.property('Customer');
          expect(res.body.data.Customer).to.have.deep.property('CustomerFindById');
          expect(res.body.data.Customer.CustomerFindById).to.have.deep.property('name');
        });
    });
  });

  describe('Remote methods', () =>{
    it('should work custom remote end point', ()=>{
      const query = gql `
         { Author{ AuthorSearchByName (filter:"atif") {edges { node }} }  }`;
      return chai.request(server)
        .post('/graphql')
        .send({
          query,
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.deep.property('data');
          expect(res.body.data.Author.AuthorSearchByName.edges[0].node).to.have.deep.property('input');
        }).catch((err)=> {
          throw err;
        });
    });
  });
});
