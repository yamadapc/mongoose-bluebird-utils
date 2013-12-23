
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise = require('bluebird'),
    _       = require('underscore');

/**
 * Invokes a promisified version of method on an object
 */

function invokeP(obj, method_name, args) {
  return Promise.promisify(obj[method_name], obj).apply(obj, args);
}

/**
 * Returns a promise of a document's save operation
 */

function saveP(doc) {
  return invokeP(doc, 'save')
    .then(_.first, function(err) {
      if(err.name === 'ValidationError') err.status = 400;
      throw err;
    });
}

/**
 * Returns a promise of a document's remove operation
 */

function removeP(doc) {
  return invokeP(doc, 'remove').then(_.first);
}

/**
 * Returns a promise of a Model's count operation
 */

function countP(model, query) {
  var count = model.countAsync || Promise.promisify(model.count, model),
      resultP = count.call(model, query);
  return resultP;
}

/**
 * Returns a promise of the count of documents matching a query aggregated by
 * the 'by' _id
 */

function countByP(model, query, by) {
  var aggregation = model.aggregate({$match: query}, {$group: {_id: by}});
  return execP(aggregation).then(_.size);
}

/**
 * Returns a promise of a Model's find operation
 */

function findP(model, query) {
  var find = model.findAsync || Promise.promisify(model.find, model),
      docP = find.call(model, query);
  return docP;
}

/**
 * Returns a promise of a Model's findOne operation, with an optional not found
 * error message
 */

function findOneP(model, query, not_found_msg) {
  var findOne = model.findOneAsync || Promise.promisify(model.findOne, model),
      docP = findOne.call(model, query);

  if(not_found_msg) {
    return docP.then(function(doc) {
      if(!doc) throw _.extend(new Error(not_found_msg), { status: 400 });
      else     return doc;
    });
  } else return docP;
}

function findByIdP(model, id, not_found_msg) {
  return findOneP(model, {_id: id}, not_found_msg);
}

/**
 * Execs a mongoose query returning a Promise for its results
 */

function execP(query, not_found_msg) {
  var resultsP = invokeP(query, 'exec');
  if(not_found_msg) {
    return resultsP.then(function(results) {
      if(!results || (_.isArray(results) && _.isEmpty(results)))
        throw _.extend(new Error(not_found_msg), { status: 400 });
      else return results;
    });
  } else return resultsP;
}

module.exports = {
  invokeP:   invokeP,
  saveP:     saveP,
  removeP:   removeP,
  countP:    countP,
  countByP:  countByP,
  findP:     findP,
  findOneP:  findOneP,
  findByIdP: findByIdP,
  execP:     execP
};
