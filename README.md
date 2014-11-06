mongoose-bluebird-utils [![Build Status](https://travis-ci.org/yamadapc/mongoose-bluebird-utils.png)](https://travis-ci.org/yamadapc/mongoose-bluebird-utils)
==================================================

**DEPRECATED**

This module is deprecated, since it's a better and faster approach now to just
promisify your models. This can be achieved with:
```javascript
var Promise = require('bluebird');
var User = mongoose.model('User');
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

// Example:
var user = new User();
user.saveAsync()
  // We need to use `spread` because `user.save` yields an array
  .spread(function(user) {
  });
```

The `promisifyAll` bluebird function will add a `Async` posfixed promisified
method for all the methods in an object. This will be faster and more consistent
than using this module.
- - -

This is basically just a bunch of simple functions that serve as tiny sugars
very often.

But, I find it kind of useful and don't want to flood a helper module into
*every* project just to keep things tidy, so it's here.


Instalation
--------------------------------------------------

```npm install mongoose-bluebird-utils```

```javascript
// [...]

var mpUtils = require('mongoose-bluebird-utils');

// [...]
```

Examples
--------------------------------------------------

**Before:**
*Don't ever do this. This is terrible*

```javascript
var Promise = require('bluebird'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

function setNameToJohn (old_name) {
  // note a mpromise promise is being returned, which may be harmful
  return User.findOne({ name: old_name })
    .then(function(user) {
      if(!user){
        var err = new Error('User not found');
        err.status = 404; // I do this to bind HTTP response codes into errors
        throw err;
      }
      user.name = 'John';
      return Promise.promisify(user.save, user)();
    });
}
```

**After:**

```javascript
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    mpUtils = require('mongoose-bluebird-utils');

function setNameToJohn (old_name) {
  return mpUtils.findOneP(User, { name: old_name }, 'User not found')
    .then(function(user) {
      user.name = 'John';
      return mpUtils.saveP(user);
    });
}
```
