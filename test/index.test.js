
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var should = require('should'),
    Promise = require('bluebird'),
    mbUtils = require('..');

describe('mongoose-bluebird-utils', function() {
  var doc = {
    save: function(cb) { cb(null, ['saveP!', 'loads of mongoose trash']); },
    remove: function(cb) { cb(null, ['removeP!', 'loads of mongoose trash']); }
  };

  var model = {
    count: function(query, cb) { cb(null, Infinity ); },
    findOne: function(query, cb) { cb(null, 'I found it!'); }
  };

  var idModel = {
    findOne: function(query, cb) {
      if(query && query._id) cb(null, 'found');
      else cb(new Error('not found'));
    }
  };

  var query = {
    exec: function(cb) { cb(null, Infinity); }
  };

  describe('invokeP(obj, method_name, args)',
          promiseTests(mbUtils.invokeP, [idModel, 'findOne', [{_id: true}]], 'found'));

  describe('saveP(doc)',
          promiseTests(mbUtils.saveP, [doc], 'saveP!'));

  describe('removeP(doc)',
          promiseTests(mbUtils.removeP, [doc], 'removeP!'));

  describe('execP(Query)',
          promiseTests(mbUtils.execP, [query], Infinity));

  describe('countP(model, query)',
          promiseTests(mbUtils.countP, [model], Infinity));

  describe('findOneP(model, query, not_found_msg)',
          promiseTests(mbUtils.findOneP, [model], 'I found it!'));

  describe('findByIdP(model, id, not_found_msg)',
          promiseTests(mbUtils.findByIdP, [idModel, 'something'], 'found'));
});

function promiseTests(fn, args, expected) {
  return function() {
    var resultP = fn.apply(null, args);

    it('should return a promise', isPromise.bind(null, resultP));
    it('should be fulfillable', isFulfillable.bind(null, resultP));
    it('should fulfill to "'+expected+'"', fulfillsTo.bind(null, resultP, expected));
  };
}

function isPromise(p) {
  should.exist(p);
  p.should.be.instanceof(Promise);
}

function isFulfillable(p) {
  return p; // mocha-as-promised does the work, this is simply a sugar
}

function fulfillsTo(p, to) {
  return p.then(function(result) {
    should.equal(result, to);
  });
}
