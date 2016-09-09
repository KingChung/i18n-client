/**
 * i18n-client.js v1.0.0
 * MIT licensed
 */
(function(root, factory) {

    "use strict";
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery", "underscore"], function($, _) {
            return root.i18n = factory($, _);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery", "underscore"));
    } else {
        // Browser globals (root is window)
        root.i18n = factory(root.jQuery, root._);
    }
}(this, function($, _) {

    var Store = function(data, options) {
        this.store = {};
    }

    Store.prototype.prefix = function () {
        return "__i18n__";
    };

    Store.prototype.getData = function(lang, key) {
        this.store[lang] = this.store[lang] || {};
        var output = {};
        if (key) {
            output = this.store[lang][key];
        } else {
            output = this.store[lang];
        }
        return output;
    }

    Store.prototype.setData = function(lang, key, value) {
        this.store[lang] = this.store[lang] || {};
        if (_.isObject(key)) {
            value = key;
            key = '';
        }

        if (key) {
            this.store[lang][key] = value;
        } else {
            this.store[lang] = value;
        }
    }

    var I18n = function() {
        this.defaults = {
            lang: 'en_US',
            enable: true,
            direction: 'ltr'
        };
        this.__langLib = {
            id: this.defaults.lang
        }
    },
    __proto = I18n.prototype;

    __proto._getApi = function(source, params) {
        var url = '',
            params = params || [];
        if (this.settings.json.length) {
            url = this.settings.json + '/' + source + '.json';
        } else if (this.settings.api.length) {
            url = this.settings.api + '/translation/' + source;
        }
        return url + '?' + params.join('&');
    }

    __proto.init = function(config, callback) {
        var self = this;
        this.settings = $.extend({}, this.defaults, config || {});
        if (this.settings.api == '' && this.settings.json == '') {
            console.warn('i18n Library is invalid.');
        }

        // Auto language
        if (!config.lang && this.settings.auto_detect) {
            var lang = window.navigator.userLanguage || window.navigator.language || '',
                group = lang.split('-');
            if(group[0] !== '' && group[1] !== '') {
                this.settings.lang = [group[0].toLowerCase(), group[1].toUpperCase()].join('_');
            }
        }

        this.__store = new Store();

        return this.changeLang(this.settings.lang, callback);
    }

    __proto.changeLang = function(lang, callback, options) {
        if (!lang) {
            return console.error('Language does not exsist.');
        }
        return this.fetch(this.settings.lang = lang, callback || new Function);
    }

    __proto.fetch = function(lang, callback) {
        if (!this.settings.enable || !lang) {
            return ;
        }

        var self = this;
        callback = callback || function(){};
        //Init current library
        this.__langLib = {};
        this.__langLib.id = lang;

        //@hack
        if(lang == 'en_US') {
            return callback(this.__langLib);
        }

        //Use Cache
        if (!_.isEmpty(this.__langLib = this.__store.getData(lang))) {
            return callback(this.__langLib);
        }

        $.ajax({
            type: "GET",
            url: this._getApi(lang)
        }).done(function(res) {
            if (res.result) {
                for (var i = 0; i < res.data.length; i++) {
                    var section = res.data[i],
                        items = {};
                    for (var k in section.items) {
                        if (section.items.hasOwnProperty(k)) {
                            items[k] = section.items[k].translate_to;
                        }
                    }
                    self.__langLib[section.section] = items;
                }
            }

            //Set direction
            for(var i in self.settings.options) {
                var option = self.settings.options[i];
                if(option && option.type === lang) {
                    self.settings.direction = option.direction;
                }
            }

            //Cache lib
            self.__store.setData(lang, self.__langLib);
            callback(self.__langLib);
        });
    }

    __proto.assign = function(source) {
        var self = this,
            variables = [].slice.call(arguments, 1),
            value = '';
        return source.replace(/\${(\d+)}/g, function(m, index) {
            value = variables[parseInt(index - 1)];
            return value !== void(0) ? value : '';
        });
    }

    __proto.translate = function(section, source) {
        var variables = [].slice.call(arguments, 2);
        if (!this.settings.enable) {
            return this.assign.apply(this, [source].concat(variables));
        }

        if (!this.__langLib) {
            throw new Error('Language library is not exists');
        }

        var langLib = this.__langLib;
        var section = (langLib && langLib[section]) || {};
        source = section[source.replace('\'', '\\\'')] || source; //@TODO just for doT
        if (source.length) {
            source = this.assign.apply(this, [source].concat(variables));
        }
        return source;
    }

    __proto.compile = function(el) {
        if (!this.settings.enable) {
            return el;
        }

        var $wrapper = $('<div>');
        $wrapper.append(el);
        $wrapper.find("[i18n-bind]").each(function() {
            var that = this;
            var args = $(this).attr('i18n-bind').split(',');
            var section = $.trim(args[0]),
                source = $.trim(args[1] || $(this).text());
            var translateTo = i18n.translate.call(i18n, section, source);
            translateTo && $(this).text(translateTo);
        });
        return $wrapper.html();
    }

    var i18n = new I18n();
    return {
        init: function(config, callback) {
            return i18n.init.apply(i18n, arguments);
        },
        changeLang: function(lang) {
            return i18n.changeLang.apply(i18n, arguments);
        },
        t: function(section, source) {
            return i18n.translate.apply(i18n, arguments);
        },
        compile: function(el) {
            return i18n.compile.apply(i18n, arguments);
        },
        getInfo: function () {
            return {
                lang: i18n.settings.lang,
                direction: i18n.settings.direction
            }
        }
    };
}));
