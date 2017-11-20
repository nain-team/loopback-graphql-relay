'use strict';
const _ = require('lodash');
const loopbackUtils = require('loopback/lib/utils');

module.exports = function(Author) {
  Author.remoteMethod(
    'addFriend', {
      http: {
        path: '/addFriend',
        verb: 'post',
      },

      accepts: [{
        arg: 'author',
        type: 'number',
      }, {
        arg: 'friend',
        type: ['number'],
      }],

      returns: {
        arg: 'result',
        type: 'object',
      },
    }
  );

  Author.addFriend = function(author, friend) {
    return Author.findById(author)
      .then((res) => {
        const updated = res;
        updated.friendIds.push(friend);
        return updated.save();
      }).then((res) => {});
  };

  Author.getFilterAuthors = function FilterAuthorsByParams(filter, cb) {
    cb(null, {response: filter});
  };

  Author.remoteMethod('getFilterAuthors', {
    accepts: [
      {arg: 'filter', type: 'object'},
    ],
    returns: {arg: 'data', type: ['Author']},
    http: {path: '/filteredAuthor', verb: 'get'},
  });

  Author.getNonParamFilterAuthors = function FilterAuthors(cb) {
    cb = cb || loopbackUtils.createPromiseCallback();
    Author.find({}, (err, resp) => {
      return cb(null, resp);
    });

    return cb.promise;
  };

  Author.remoteMethod('getNonParamFilterAuthors', {
    returns: {arg: 'data', type: ['Author'], root: true},
    http: {path: '/getNonParamFilteredAuthor', verb: 'get'},
  });
};
