
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise = require('bluebird'),
    _       = require('underscore');

/**
 * Returns a promise of a document's save operation
 */

function saveP(doc) {
  return Promise.promisify(doc.save, doc)()
    .then(_.first);
}

/**
 * Returns a promise of a document's remove operation
 */

function removeP(doc) {
  return Promise.promisify(doc.remove, doc)()
    .then(_.first);
}

/**
 * Returns a promise of a Model's findOne operation, with an optional not found
 * error message
 */

function findOneP(model, query, not_found_msg) {
  var findOne = model.findOneAsync || Promise.promisify(model.findOne, model),
      docP = findOne(query);

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
  saveP:     saveP,
  removeP:   removeP,
  findOneP:  findOneP,
  findByIdP: findByIdP
};
