var loopback = require('loopback');
var async = require('async');

module.exports = function(Animal) {

  Animal.beforeSave = function(next, model) {
    if (!model.unique_id) model.unique_id = 't-' + Math.floor(Math.random() * 10000).toString();
    next();
  };

  Animal.adopt = function(cb) {
    cb(null, 'OK');
  }

  Animal.remoteMethod(
    'adopt',
    {
      accepts: [],
      returns: {arg: 'status', type: 'string'}
    }
  );

};
