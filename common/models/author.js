'use strict';
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

  Author.remoteMethod('searchByName', {
    http: {path: '/searchByName', verb: 'get'},
    accepts: [{arg: 'name', type: 'string'}],
    returns: {arg: 'result', type: 'array'},
  });

  Author.searchByName = function searchByName(name, callback) {
    callback(null, [name]);
  };
};
