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

  Author.remoteMethod('noParamMethod', {
    http: {path: '/noParamMethod', verb: 'get'},
    accepts: [],
    returns: {arg: 'result', type: 'array'},
  });

  Author.noParamMethod = function my(callback) {
    var responseData = {name: 'hello'};

    callback(null, responseData);
  };
};
