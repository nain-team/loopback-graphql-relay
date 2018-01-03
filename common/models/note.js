module.exports = function (model) {
  const Note = Object.assign({}, model, { model });

  Note.clear = () => ({
    note: {
      Content: '',
    },
    previousClear: new Date(),
  });

  Note.remoteMethod('clear', {
    http: {
      path: '/clear',
      verb: 'post',
    },
    returns: [{
      arg: 'note',
      type: 'object',
    }, {
      arg: 'previousClear',
      type: 'Date',
    }],
  });
};
