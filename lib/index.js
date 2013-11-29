
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
 * Returns a promise of a Model's findOne operation, with an optional not found
 * error message
 */

function findOneP(model, query, not_found_msg) {
  var findOne = model.findOneAsync || Promise.promisify(model.findOne, model),
      docP = findOne.call(model, query);

  if(not_found_msg) {
    return docP.then(function(doc) {
      if(!doc) throw _.extend(new Error(not_found_msg), { status: 404 });
      else     return doc;
    });
  } else return docP;
}

function findByIdP(model, id, not_found_msg) {
  return findOneP(model, {_id: id}, not_found_msg);
}

module.exports = {
  invokeP:   invokeP,
  saveP:     saveP,
  removeP:   removeP,
  findOneP:  findOneP,
  findByIdP: findByIdP
};
