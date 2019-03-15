var dust = require('dust')();
var form = require('form');
var utils = require('utils');
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'locations-create'));

var ACCOUNTS_API = utils.resolve('accounts:///apis/v/locations');

var configs = {
    name: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please specify a name for your locations');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    phones: {
        find: function (context, source, done) {
            var value = $('input', source).val();
            value = value.trim().split(/\s*,\s*/);
            value = _.filter(value, function (val) {
                return !!val;
            });
            done(null, value);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done();
            }
            var i;
            var number;
            var length = value.length;
            for (i = 0; i < length; i++) {
                number = value[i];
                if (number && !/^\+[1-9]\d{1,14}$/.test(number)) {
                    return done(null, 'Please enter a valid phone number');
                }
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.phones', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value ? value.join(', ') : ''
            }, done);
        }
    },
    email: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (value && !is.email(value)) {
                return done(null, 'Please enter a valid email address');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    viber: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (value && !/^\+[1-9]\d{1,14}$/.test(value)) {
                return done(null, 'Please enter a valid phone number');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    whatsapp: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (value && !/^\+[1-9]\d{1,14}$/.test(value)) {
                return done(null, 'Please enter a valid phone number');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    messenger: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    skype: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    _: {
        validate: function (data, done) {
            var field;
            for (field in data) {
                if (!data.hasOwnProperty(field)) {
                    continue;
                }
                if (field === 'name') {
                    continue;
                }
                var value = data[field];
                if (Array.isArray(value)) {
                    if (!value.length) {
                        continue;
                    }
                    return done(null, null, data);
                }
                if (value) {
                    return done(null, null, data);
                }
            }
            done(null, {
                _: 'Please specify at least one contact information'
            }, data);
        }
    }
};

var findOne = function (id, done) {
    $.ajax({
        method: 'GET',
        url: ACCOUNTS_API + '/' + id,
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

var create = function (id, data, done) {
    var contact = {};
    Object.keys(data).forEach(function (key) {
        var value = data[key];
        if (Array.isArray(value)) {
            if (!value.length) {
                return;
            }
            contact[key] = data[key];
            return;
        }
        if (value) {
            contact[key] = value;
        }
    });
    $.ajax({
        method: id ? 'PUT' : 'POST',
        url: ACCOUNTS_API + (id ? '/' + id : ''),
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(contact),
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

var render = function (ctx, container, data, done) {
    var id = data.id;
    var sandbox = container.sandbox;
    dust.render('locations-create', data, function (err, out) {
        if (err) {
            return done(err);
        }
        var elem = sandbox.append(out);
        var locationsForm = form.create(container.id, elem, configs);
        locationsForm.render(ctx, data, function (err) {
            if (err) {
                return done(err);
            }
            sandbox.on('click', '.create', function (e) {
                locationsForm.find(function (err, data) {
                    if (err) {
                        return console.error(err);
                    }
                    locationsForm.validate(data, function (err, errors, data) {
                        if (err) {
                            return console.error(err);
                        }
                        locationsForm.update(errors, data, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            if (errors) {
                                return;
                            }
                            create(id, data, function (err, data) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log('contact created successfully', data);
                                serand.redirect('/locations');
                            });
                        });
                    });
                });
            });
            done(null, function () {
                $('.locations-create', sandbox).remove();
            });
        });
    });
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        render(ctx, container, {
            _: {
                container: container.id
            }
        }, done);
        return;
    }
    findOne(id, function (err, contact) {
        if (err) {
            return done(err);
        }
        contact._ = {
            container: container.id
        };
        render(ctx, container, contact, done);
    });
};



