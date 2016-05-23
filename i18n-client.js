/**
 * i18n-client.js v0.2.0
 * MIT licensed
 */
(function(root, factory) {

    "use strict";
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], function($){
            return root.i18n = factory($);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        // Browser globals (root is window)
        root.i18n = factory(root.jQuery);
    }
}(this, function($) {

    var I18n = function() {
        this.settings = {
            lang: 'en_US',
            api: '',
            enable: true
        };
        this.__globalLib = {};
        this.__langLib = {
            id: this.settings.lang
        }
    };

    var __proto = I18n.prototype;

    __proto._getApi = function(source, params) {
        params = params || [];
        return this.settings.api + '/' + source + '?' + params.join('&');
    }

    __proto.init = function(config, callback) {
        var self = this;
        $.extend(this.settings, config || {});
        if(this.settings.api == '') {
            console.error('i18n Api is invalid.');
            this.settings.enable = false;
        }
        this.fetch(this.settings.lang, function() {
            callback && callback();
        });
    }

    __proto.fetch = function(lang, callback) {
        if(!this.settings.enable) {
            return;
        }

        var self = this,
            lang = lang || this.settings.lang;
        this.__langLib.id = lang;

        //Use Cache
        if(this.__globalLib[lang]) {
            $.extend(this.__langLib, this.__globalLib[lang]);
            return callback && callback(this.__langLib);
        }
        $.ajax({
            type: "GET",
            url: this._getApi('translation/' + lang)
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

                //Cache lib
                self.__globalLib[self.__langLib.id] = $.extend({}, self.__langLib);
                callback && callback(self.__langLib);
            }
        });
    }

    __proto.translate = function(section, source, lang) {
        if(!this.settings.enable) {
            return source;
        }

        var langLib = this.__langLib;
        if (lang) {
            langLib = this.__globalLib[lang];
        }
        var section = (langLib && langLib[section]) || {};
        return section[source.replace('\'', '\\\'')] || source;
    }

    __proto.compile = function(el) {
        if(!this.settings.enable) {
            return el;
        }

        var $wrapper = $('<div>');
        $wrapper.append(el);
        $wrapper.find("[i18n-bind]").each(function() {
            var that = this;
            var args = $(this).attr('i18n-bind').split(',');
            var section = $.trim(args[0]), source = $.trim(args[1] || $(this).text());
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
        t: function(section, source) {
            return i18n.translate.apply(i18n, arguments);
        },
        compile: function(el) {
            return i18n.compile.apply(i18n, arguments);
        }
    };
}));
