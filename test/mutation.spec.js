/* eslint-disable camelcase */
'use strict';

const Promise = require('bluebird');

const expect = require('chai').expect;
const chai = require('chai')
  .use(require('chai-http'));
const server = require('../server/server');
const cpx = require('cpx');

const gql = require('graphql-tag');
// var _ = require('lodash');

describe('Mutations', () => {
  before(() => Promise.fromCallback(cb => cpx.copy('./data.json', './data/', cb)));

  it('should add a single entity', () => {
    const query = gql `
      mutation save($data: JSON!) {
        Author {
          AuthorCreate(input: {data: $data}) {
            obj {
              first_name
              last_name
              birth_date
            }
          }
        }
      }`;
    const variables = {
      data: {
        first_name: 'Unit Test',
        last_name: 'Author',
        birth_date: new Date(),
      },
    };

    return chai.request(server)
      .post('/graphql')
      .send({
        query,
        variables,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        const result = res.body.data;
        expect(result.Author.AuthorCreate.obj.first_name).to.equal(variables.data.first_name);
        expect(result.Author.AuthorCreate.obj.last_name).to.equal(variables.data.last_name);
      });
  });

  it('should add a single entity with sub type', () => {
    const body = 'Heckelbery Finn';
    const query = gql `
      mutation save($data: JSON!) {
        Note {
          NoteCreate(input: { data: $data }) {
            obj {
              id
              title
              content {
                body
              }
              author {
                first_name
                last_name
              }
            }
          }
        }
      }`;
    const variables = {
      data: {
        title: 'Heckelbery Finn',
        authorId: 8,
        content: {
          body,
          footer: 'The end',
        },
      },
    };

    return chai.request(server)
      .post('/graphql')
      .send({
        query,
        variables,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        const result = res.body.data;
        expect(result.Note.NoteCreate.obj.content.body).to.equal(body);
        expect(result.Note.NoteCreate.obj.author.first_name).to.equal('Jane');
        expect(result.Note.NoteCreate.obj.author.last_name).to.equal('Austin');
      });
  });

  it('should delete a single entity', () => {
    const query = gql `
      mutation delete($input: AuthorDeleteByIdInput!) {
        Author {
          AuthorDeleteById(input: $input) {
            clientMutationId
          }
        }
      }`;
    const variables = {
      input: {id: '1'},
    };

    return chai.request(server)
      .post('/graphql')
      .send({
        query,
        variables,
      })
      .then((res) => {
        expect(res).to.have.status(200);
      }).catch((err) =>{
        throw err;
      });
  });

  it('should login and return an accessToken', () => {
    const query = gql `
      mutation login ($input: UserLoginInput!){
        User {
          UserLogin(input: $input) {
            obj
          }
        }
      }`;
    const variables = {
      input: {credentials: {username: 'naveenmeher', password: '123'}},
    };

    return chai.request(server)
      .post('/graphql')
      .send({
        query,
        variables,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.User.UserLogin.obj).to.have.property('id');
      });
  });

  it('should not login and return an error', () => {
    const query = gql `
    mutation login ($input: UserLoginInput!){
      User {
        UserLogin(input: $input) {
          obj
        }
      }
    }`;

    const variables = {
      input: {credentials: {username: 'naveenmeher', password: '1234'}},
    };

    return chai.request(server)
      .post('/graphql')
      .send({
        query,
        variables,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('errors');
      }).catch((err) => {
        console.log(err);
      });
  });
});
