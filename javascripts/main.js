
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/routers/router',[],function() {

  // Router.
  //
  // @file app/routers/router.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Router = Backbone.Router.extend({

    // Router methods
    // ==============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    after: function(route, arguments) {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    before: function(route, arguments) {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    initialize: function() {
      // Tracks every route change as a PageView in Google Analytics
      this.bind('route', this.trackPageview);
    },

    // Pave over Backbone.Router.prototype.route, the public method
    // used for adding routes to a router instance on the fly, and the
    // method which backbone uses internally for binding routes to
    // handlers on the Backbone.history singleton once it's
    // instantiated.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    route: function(route, name, callback) {

      // If there is no callback present for this route, then set it to
      // be the name that was set in the routes property of the
      // constructor, or the name argument of the route method
      // invocation. This is what Backbone.Router.route already does.
      // We need to do it again, because we are about to wrap the
      // callback in a function that calls the before and after filters
      // as well as the original callback that was passed in.
      if(!callback) callback = this[name];

      // Create a new callback to replace the original callback that
      // calls the before and after filters as well as the original
      // callback internally.
      var wrappedCallback = _.bind(function() {

        // Call the before filter and if it returns false, run the
        // route's original callback, and after filter. This allows
        // the user to return false from within the before filter
        // to prevent the original route callback and after
        // filter from running.
        if (this.before.apply(this, _.union([name], arguments)) === false) {
          return;
        }
        // If the callback exists, then call it. This means that the
        // before and after filters will be called whether or not an
        // actual callback function is supplied to handle a given route.
        if(callback) callback.apply(this, arguments);

        // Call the after filter.
        this.after.apply(this, _.union([name], arguments));

      }, this);

      // Call our original route, replacing the callback that was
      // originally  passed in when Backboun.Router.route was invoked
      // with our wrapped callback that calls the before and after
      // callbacks as well as the original callback.
      return Router.__super__.route.call(this, route, name, wrappedCallback);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    trackPageview: function (name, args) {
      var url = Backbone.history.getFragment();

      // prepend slash
      if (!/^\//.test(url) && url != "") url = "/" + url;

      if (typeof ga !== 'undefined') ga('send', 'pageview', url);
    }

  });

  return Router;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/collection',[],function() {

  // Collection.
  //
  // @file app/collections/collection.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Collection = Backbone.Collection.extend({

    // Collection attributes
    // =====================

    // Additional data to include on every request.
    // i.e. filter or sort parameters.
    _data: null,


    // Pagination parameters
    // ---------------------

    // Pagination parameter: maximum number of items per request.
    per_page: 20,

    // Pagination parameter: page
    page: 1,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetch: function(options) {
      options = _.extend(options, { data: $.param(this._params()) });

      Collection.__super__.fetch.call(this, options);
    },

    // Basic constructor.
    //
    // @param [Array] models (optional)
    //        Initial array of models.
    // @param [Hash] options (optional)
    //        Options.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    initialize: function(models, options) {
      _.defaults(this, options);

      Collection.__super__.initialize(models, options);
    },

    // Additional parameters passed when fetching items.
    //
    // @return [Hash]
    //         API request's additional parameters.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _params: function() {
      var data = { page: this.page, per_page: this.per_page };

      return _.extend(data, this._data || {});
    }

  });

  return Collection;

});
// Copyright (c) 2013 DESIGNERBOARD - designerboard.co

define('app/models/model',[],function() {

  // Model.
  //
  // @file app/models/model.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Model = Backbone.RelationalModel.extend({

    // Model methods
    // =============

    // Backbone parse method. Updates pagination parameters and Session
    // variables.
    //
    // @param [Hash] response (required)
    //        Server response.
    //
    // @return [Hash]
    //         Parsed response.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      var attributes = response.response || response;

      if (!attributes) return null;
      if (attributes.parsed) return attributes;

      return this._parse(attributes);
    },

    // Internal parse method.
    //
    // @note This method should be overridden instead of the
    //       Backbone's original "parse" method.
    //
    // @param [Hash] attributes (required)
    //        Attributes to parse.
    //
    // @return [Hash]
    //         Parsed response.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      return {
        id: attributes.id,
        parsed: true
      };
    }

  }, {

    // Class method: parse, creates a new Model instance and calls its
    // parsing function.
    //
    // @param [Hash] attributes (required)
    //        Model attributes.
    //
    // @return [Hash]
    //         Parsed attributes.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(attributes) {
      if (attributes && !attributes.parsed) {
        return new this()._parse(attributes);
      } else {
        return attributes;
      }
    }

  });

  return Model;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/behance_job',[
  'app/models/model'
],
function(
  Model
) {

  // BehanceJob.
  //
  // @file app/models/behance_job.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var BehanceJob = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      console.log("BEHANCE JOB");
      console.log(attributes);

      attributes = attributes.div.a;

      if (attributes instanceof Array) attributes = attributes[1];

      return {
        id: 'behance-job-' + attributes.href.replace('/jobs/', ''),
        company: attributes.span[0].strong.span.content,
        position: attributes.span[0].span.content,
        location: attributes.span[1].content,
        url: 'http://dribbble.com' + attributes.href,

        startsWithVowel: this._parseStartstWithVowel(attributes),

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseStartstWithVowel: function(attributes) {
      var position = attributes.span[0].span.content.toLowerCase();
      var firstLetter = position.slice(0, 1);

      return _.contains(['a', 'e', 'i', 'o', 'u', 'h'], firstLetter);
    }

  });

  return BehanceJob;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/behance_jobs',[
  'app/collections/collection',
  'app/models/behance_job'
],
function(
  Collection,
  BehanceJob
) {

  // BehanceJobs.
  //
  // @file app/collections/behance_jobs.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var BehanceJobs = Collection.extend({

    // Collection attributes
    // =====================

    model: BehanceJob,


    // Collection methods
    // ==================

    // Backbone's parse method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      return response.query.results ? response.query.results.li : [];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _query: function(url) {
      return 'SELECT * FROM html WHERE url="' + url +
      '" and xpath="//ul[@class=\'job-list\']/li"';
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        url: 'http://query.yahooapis.com/v1/public/yql?q=' +
             this._query(model.url()),
        dataType: 'jsonp',
        processData: false
      }, options);

      return $.ajax(params);
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'http://www.behance.net/joblist';
    }

  });

  return BehanceJobs;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/dn_job',[
  'app/models/model'
],
function(
  Model
) {

  // DNJob.
  //
  // @file app/models/dn_job.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DNJob = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      attributes = attributes.a;

      console.log(attributes);

      return {
        id: 'dn-job-' + attributes.href.replace(/\/|:|%|-|\./g, ''),
        company: this._parseCompany(attributes),
        position: this._parsePosition(attributes),
        location: this._parseLocation(attributes),
        url: attributes.href,

        startsWithVowel: this._parseStartstWithVowel(attributes),
        index: this._parseIndex(attributes),

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseCompany: function(attributes) {
      return attributes.span[0].match(/(.*?) is looking.*?/)[1];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseIndex: function(attributes) {
      return this._parseCompany(attributes).toLowerCase() +
             this._parsePosition(attributes).toLowerCase() +
             this._parseLocation(attributes).toLowerCase();
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseLocation: function(attributes) {
      return attributes.span[1];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parsePosition: function(attributes) {
      return attributes.span[0].match(/is looking for an?\s(.*?)$/)[1];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseStartstWithVowel: function(attributes) {
      var position = this._parsePosition(attributes).toLowerCase();
      var firstLetter = position.slice(0, 1);

      return _.contains(['a', 'e', 'i', 'o', 'u', 'h'], firstLetter);
    }

  });

  return DNJob;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/dn_jobs',[
  'app/collections/collection',
  'app/models/dn_job'
],
function(
  Collection,
  DNJob
) {

  // DNJobs.
  //
  // @file app/collections/dn_jobs.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DNJobs = Collection.extend({

    // Collection attributes
    // =====================

    model: DNJob,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _params: function() {
      return _.extend({ format: 'json' }, this._data || {});
    },

    // Backbone's parse method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      return response.query.results ? response.query.results.li : [];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _query: function(url) {
      return 'SELECT * FROM html WHERE url="' + url +
      '" and xpath="//div[@class=\'InnerPage\']/ul/li"';
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        url: 'http://query.yahooapis.com/v1/public/yql?q=' +
             this._query(model.url()),
        dataType: 'jsonp',
        processData: false
      }, options);

      return $.ajax(params);
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'https://news.layervault.com/jobs';
    }

  });

  return DNJobs;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/dribbble_job',[
  'app/models/model'
],
function(
  Model
) {

  // DribbbleJob.
  //
  // @file app/models/dribbble_job.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DribbbleJob = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      attributes = attributes.div.a;
      if (attributes instanceof Array) attributes = attributes[1];

      return {
        id: 'dribbble-job-' + attributes.href.replace('/jobs/', ''),
        company: this._parseCompany(attributes),
        position: this._parsePosition(attributes),
        location: this._parseLocation(attributes),
        url: 'http://dribbble.com' + attributes.href,

        startsWithVowel: this._parseStartstWithVowel(attributes),
        index: this._parseIndex(attributes),

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseCompany: function(attributes) {
      return attributes.span[0].strong.span.content;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseIndex: function(attributes) {
      return this._parseCompany(attributes).toLowerCase() +
             this._parsePosition(attributes).toLowerCase() +
             this._parseLocation(attributes).toLowerCase();
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseLocation: function(attributes) {
      return attributes.span[1].content;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parsePosition: function(attributes) {
      return attributes.span[0].span.content;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseStartstWithVowel: function(attributes) {
      var position = attributes.span[0].span.content.toLowerCase();
      var firstLetter = position.slice(0, 1);

      return _.contains(['a', 'e', 'i', 'o', 'u', 'h'], firstLetter);
    }

  });

  return DribbbleJob;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/dribbble_jobs',[
  'app/collections/collection',
  'app/models/dribbble_job'
],
function(
  Collection,
  DribbbleJob
) {

  // DribbbleJobs.
  //
  // @file app/collections/dribbble_jobs.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DribbbleJobs = Collection.extend({

    // Collection attributes
    // =====================

    model: DribbbleJob,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _params: function() {
      return _.extend({ format: 'json' }, this._data || {});
    },

    // Backbone's parse method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      return response.query.results ? response.query.results.li : [];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _query: function(url) {
      return 'SELECT * FROM html WHERE url="' + url +
      '" and xpath="//ol[@class=\'jobs\']/li"';
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        url: 'http://query.yahooapis.com/v1/public/yql?q=' +
             this._query(model.url()),
        dataType: 'jsonp',
        processData: false
      }, options);

      return $.ajax(params);
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'http://dribbble.com/jobs';
    }

  });

  return DribbbleJobs;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('config/session',[],function() {

  // Session.
  //
  // @file config/session.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Session = {

    // Attributes
    // ==========

    // Active State
    flagActive: false,

    // Size of the images
    flagLargeImage: true,

    // Current section: popular, new
    section: null,

    viewHeader: null,

    cache: [],


    // Methods
    // =======

    // @since 0.9.0
    // @version 0.9.0
    // @author Fernando Tapia Rico
    init: function() {
      // TODO Get image size from localstorage
      this.setFlagLargeImage(true);
    },

    // @since 0.9.0
    // @version 0.9.0
    // @author Fernando Tapia Rico
    setFlagLargeImage: function(flagLargeImage) {
      this.flagLargeImage = flagLargeImage;

      // TODO store on localstorage image size
    },

    // @since 0.9.0
    // @version 0.9.0
    // @author Fernando Tapia Rico
    setSection: function(section) {
      $('[data-section="' + this.section +'"]').removeClass('active');

      this.section = section;

      $toggle_size = $('header').find('[data-action="toggle_size"]');

      if (section == 'news' || section == 'jobs') $toggle_size.hide();
      else $toggle_size.show();

      $('[data-section="' + this.section +'"]').addClass('active');
    },

    // @since 0.9.0
    // @version 0.9.0
    // @author Fernando Tapia Rico
    setViewHeader: function(viewHeader) {
      this.viewHeader = viewHeader;
    }

  };

  return Session;

});


/*
 RequireJS text 0.27.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
(function(){var k=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],n=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,o=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,i=typeof location!=="undefined"&&location.href,p=i&&location.protocol&&location.protocol.replace(/\:/,""),q=i&&location.hostname,r=i&&(location.port||void 0),j=[];define('text',[],function(){var g,h,l;typeof window!=="undefined"&&window.navigator&&window.document?h=function(a,b){var c=g.createXhr();c.open("GET",a,!0);c.onreadystatechange=
function(){c.readyState===4&&b(c.responseText)};c.send(null)}:typeof process!=="undefined"&&process.versions&&process.versions.node?(l=require.nodeRequire("fs"),h=function(a,b){b(l.readFileSync(a,"utf8"))}):typeof Packages!=="undefined"&&(h=function(a,b){var c=new java.io.File(a),e=java.lang.System.getProperty("line.separator"),c=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(c),"utf-8")),d,f,g="";try{d=new java.lang.StringBuffer;(f=c.readLine())&&f.length()&&
f.charAt(0)===65279&&(f=f.substring(1));for(d.append(f);(f=c.readLine())!==null;)d.append(e),d.append(f);g=String(d.toString())}finally{c.close()}b(g)});return g={version:"0.27.0",strip:function(a){if(a){var a=a.replace(n,""),b=a.match(o);b&&(a=b[1])}else a="";return a},jsEscape:function(a){return a.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")},createXhr:function(){var a,b,c;if(typeof XMLHttpRequest!==
"undefined")return new XMLHttpRequest;else for(b=0;b<3;b++){c=k[b];try{a=new ActiveXObject(c)}catch(e){}if(a){k=[c];break}}if(!a)throw Error("createXhr(): XMLHttpRequest not available");return a},get:h,parseName:function(a){var b=!1,c=a.indexOf("."),e=a.substring(0,c),a=a.substring(c+1,a.length),c=a.indexOf("!");c!==-1&&(b=a.substring(c+1,a.length),b=b==="strip",a=a.substring(0,c));return{moduleName:e,ext:a,strip:b}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(a,b,c,e){var d=g.xdRegExp.exec(a),
f;if(!d)return!0;a=d[2];d=d[3];d=d.split(":");f=d[1];d=d[0];return(!a||a===b)&&(!d||d===c)&&(!f&&!d||f===e)},finishLoad:function(a,b,c,e,d){c=b?g.strip(c):c;d.isBuild&&d.inlineText&&(j[a]=c);e(c)},load:function(a,b,c,e){var d=g.parseName(a),f=d.moduleName+"."+d.ext,m=b.toUrl(f),h=e&&e.text&&e.text.useXhr||g.useXhr;!i||h(m,p,q,r)?g.get(m,function(b){g.finishLoad(a,d.strip,b,c,e)}):b([f],function(a){g.finishLoad(d.moduleName+"."+d.ext,d.strip,a,c,e)})},write:function(a,b,c){if(b in j){var e=g.jsEscape(j[b]);
c.asModule(a+"!"+b,"define(function () { return '"+e+"';});\n")}},writeFile:function(a,b,c,e,d){var b=g.parseName(b),f=b.moduleName+"."+b.ext,h=c.toUrl(b.moduleName+"."+b.ext)+".js";g.load(f,c,function(){var b=function(a){return e(h,a)};b.asModule=function(a,b){return e.asModule(a,h,b)};g.write(a,f,b,d)},d)}}})})();

define('text!app/templates/base/view.html.mustache',[],function () { return '<!-- BaseViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<div id="{{view.id}}" class="{{resource}} {{path}} {{type}}">\n  <div class="view-content" data-present="view-content"></div>\n</div>';});

// Copyright DESIGNERBOARD.CO - designerboard.co

define('app/views/base/view',[
  'config/session',
  'text!app/templates/base/view.html.mustache'
],
function(
  Session,
  BaseViewTemplate
) {

  // BaseView.
  //
  // @file app/views/base/view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var BaseView = Backbone.View.extend({

    // View attributes
    // ===============

    // Action associated with the View.
    path: null,

    // Parent element. If provided, the element will be appended to it
    parentEl: null,

    // Main resource of the View. Usually matches the Model or
    // Collection names of the View
    resource: null,

    // Section where this view should appear
    section: null,

    // Type of view: view, row-view, list-view
    type: 'view',


    // Flags
    // -----

    // Indicates View status. If true, it indicates the View is
    // processing information or an event
    flagActive: false,

    // Flag that indicates if the View should fetch model the first
    // time is rendered.
    flagFetch: true,

    // Flag that indicates if the View should ignore 'section' filter
    flagIgnoreSection: false,

    // Flag that indicates if the view have been removed
    flagRemoved: false,


    // Models & Collections
    // --------------------

    // Backbone collection (View collection, lists)
    collection: null,

    // Backbone model (View model)
    model: null,

    // Backbone models (View model)
    models: [],


    // Templates
    // ---------

    // View's Content template
    template: null,

    // View's Base template: basic layout.
    templateBase: BaseViewTemplate,

    // View's Load template
    templateLoad: null,


    // View methods
    // ============

    // After #initialize callback. This function is called on #initalize
    // function after creating the View.
    //
    // @note This is not a traditional callback, since it's being called
    //       inside the #initialize function and not after it.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    afterInitialize: function() {},

    // Before #initialize callback. This function is called on #initalize
    // function before creating the View.
    //
    // @note This is not a traditional callback, since it's being called
    //       inside the #initialize function and not before it.
    //
    // @param [Backbone.Model, Backbone.collection] object (optional)
    //        Model or Collection associated with the View.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    beforeInitialize: function(object) {},

    // Binds external events.
    //
    // @param [String('on', 'off')] method
    //        'on/off' string to bind/unbind events.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindExternalEvents: function(method) {
      if (method == 'on') Backbone.Events.trigger('close');
      Backbone.Events[method]('close', this.close, this);
    },

    // Binds keyboard events.
    //
    // @param [String('bind', 'unbind')] metho
    //        String to bind/unbind events.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindKeyEvents: function(method) {},

    // Binds model events.
    //
    // @param [String('on', 'off')] method
    //        'on/off' string to bind/unbind events.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindModelEvents: function(method) {},

    // Binds all non-view related events: external events, keyboard events and
    // model events.
    //
    // @param [String('on', 'off')] method
    //        'on/off' string to bind/unbind events.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindNonViewEvents: function(method) {
      method = method || 'on';

      if (this.model || this.collection) this.bindModelEvents(method);

      this.bindExternalEvents(method);
      this.bindKeyEvents(method == 'on' ? 'bind' : 'unbind');
    },

    // Closes View: deletes it and remove all events and dependencies
    // associated to the View.
    //
    // @note To "close" a View it must not be present on the DOM.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    close: function() {
      if (!this.exists()) this._close();
    },

    // Closes View: unbinds all events and removes it.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _close: function() {
      this.bindNonViewEvents('off');
      this.remove();
      this.unbind();

      this.flagRemoved = true;
      this.flagActive = false;
    },

    // Disables default event behaviors.
    //
    // @param [Event] event (required)
    //        Event.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    disableEvent: function(event) {
      if (event) {
        event.stopPropagation()
        event.preventDefault();
      }
    },

    // View events (Backbone event delegation).
    //
    // @return [Hash] List of events to bind to the View.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    events: function() {
      return {};
    },

    // Checks if the View is rendered in the current DOM
    //
    // @return [Boolean]
    //         True if the View is present in the current DOM;
    //         False if not.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    exists: function() {
      return $(this.$el.selector).length;
    },

    // Fetchs data from the server, updates the Model or Collection
    // associated with the view
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetch: function() {},

    // Finds a DOM element inside the view.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    find: function(selector) {
      return $(this.$el.selector).find(selector);
    },

    // Constructor.
    //
    // @param [Backbone.Model, Backbone.collection] object (optional)
    //        Model or Collection associated with the View.
    // @param [Hash] options (optional)
    //        View additional params.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    initialize: function(object, options) {
      // Before callback
      this.beforeInitialize(object);

      // Make 'this' to point to this View on every method.
      _.bindAll(this);

      // Set View ID (view's element)
      this.setElement('#' + this.cid, false);

      if (object instanceof Backbone.Model) this.model = object;
      if (object instanceof Backbone.Collection) {
        this.collection = object;
        this.models = object.models;
      }

      // Prepares the DOM to render the View.
      this.reset();

      // Renders the view.
      this.render();

      if (!this.flagRemoved) {
        // Binds non-view related events.
        this.bindNonViewEvents('on');

        // After callback
        this.afterInitialize();
      }
    },

    // Gets View parameters.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    params: function () {
      var params = {
        path: this.path,
        resource: this.resource,
        session: Session,
        type: this.type,
        view: {
          id: this.cid
        }
      };

      return params;
    },

    // Renders View and bind all View events.
    //
    // @return [Backbone.View] The View itself.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    render: function(event) {
      // Checks if the view should be rendered on this section
      if (this.shouldRender) {
        // Renders base layout
        this.renderBase();

        // Renders View content
        if (this.model ||
            this.collection ||
            this.models.length ||
            this.flagStatic) {
          this.renderContent();
        }

        if (this.flagFetch) this.fetch();

        this.setElement(this.$el.selector, false);
      } else {
        this._close();
      }

      return this;
    },

    // Inserts Base HTML layout.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderBase: function() {
      if (!this.exists()) {
        var html = Mustache.render(this.templateBase, this.params());

        $(this.parentEl).append(html);

        this.setElement(this.$el.selector, false);
      }
    },

    // Renders View.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderContent: function() {
      var html = Mustache.render(this.template, this.params());

      this.setElement(this.$el.selector, true);

      this.find('[data-present="view-content"]').html(html);
    },

    // Prepares the DOM to render the View.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    reset: function() {
      if (this.parentEl) $(this.parentEl).empty();
    },

    // Changes View model.
    //
    // @param [Backbone.Model] model (required)
    //        Model to be set.
    //
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    setModel: function(model) {
      if (this.model) this.bindModelEvents('off');

      this.model = model;

      this.bindModelEvents('on');
    },

    // Checks if the View should be rendered.
    //
    // @return [Boolean]
    //         True, if the view should be rendered; False, if not.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    shouldRender: function() {
      return this.flagIgnoreSection || this.section == Session.section;
    }

  });

  return BaseView;

});
define('text!app/templates/base/list_view.html.mustache',[],function () { return '<!-- BaseListViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<div class="list-content clearfix" data-present="list-content"></div>';});

// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/base/list_view',[
  'app/views/base/view',
  'text!app/templates/base/list_view.html.mustache'
],
function(
  BaseView,
  BaseListViewTemplate
) {

  // BaseListView.
  //
  // @file app/views/base/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var BaseListView = BaseView.extend({

    // View attributes
    // ===============

    // Distance from bottom to start fetching more elements (pagination)
    paginateMargin: 1000,

    type: 'list-view',


    // Templates
    // ---------

    template: BaseListViewTemplate,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindExternalEvents: function(method) {
      BaseListView.__super__.bindExternalEvents.call(this, method);

      $(window)[method]('resize', this.resizeHandler);
      $(window)[method]('scroll', this.scrollHandler);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindModelEvents: function(method) {
      if (this.collection) this.collection[method]('reset', this.render, this);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchCallback: function(collection, response) {},

    // Fetches the next items of the collection.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchNext: function() {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderContent: function() {
      this.flagActive = false;

      this.renderList();
      this.renderRows();

      this.resizeHandler();
    },

    // Render helper: checks that basic list template is rendered.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderList: function() {
      if (!this.find('[data-present="list-content"]').length) {
        var html = Mustache.render(this.template, this.params());

        this.find('[data-present="view-content"]').html(html);

        this.setElement(this.$el.selector, false);
      }
    },

    // Render helper: presents each model of the collection.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderRows: function() {
      var rowView = this.rowView();

      if (rowView) _.each(this.models, function(model) { new rowView(model); });
    },

    // Scroll handler.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    resizeHandler: function(event) {
      this.scrollHandler();
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    rowView: function() {
      return null;
    },

    // Scroll handler.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    scrollHandler: function(event) {
      this.disableEvent(event);

      if (this.exists()) {
        var scrollBottom = $(window).scrollTop() + $(window).height();

        if (this.$el.outerHeight() - scrollBottom < this.paginateMargin) {
          this.fetchNext();
        }
      }
    }

  });

  return BaseListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/application/base/list_view',[
  'app/views/base/list_view'
],
function(
  BaseListView
) {

  // ApplicationBaseListView.
  //
  // @file app/views/application/base/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var ApplicationBaseListView = BaseListView.extend({

    // View attributes
    // ===============

    parentEl: '#content',

    modelsBehance: [],

    modelsDN: [],

    modelsDribbble: [],


    // Flags
    // -----

    flagBehanceFetched: false,

    flagDNFetched: false,

    flagDribbbleFetched: false,


    // Pagination
    // ----------

    paginateBehancePage: 1,

    paginateBehanceLast: false,

    paginateBehanceLastPage: 38,

    paginateDNPage: 1,

    paginateDNLast: false,

    paginateDNLastPage: false,

    paginateDribbblePage: 1,

    paginateDribbbleLast: false,

    paginateDribbbleLastPage: 38,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    beforeInitialize: function() {
      this.models = [];
      this.modelsBehance = [];
      this.modelsDN = [];
      this.modelsDribbble = [];

      $('footer').hide();
      $(window).scrollTop(0);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetch: function() {
      $('#loading').addClass('active');

      if (!this.paginateBehanceLast) {
        this.flagBehanceFetched = false;
        this.modelsBehance = [];
        this.fetchBehances();
      }

      if (!this.paginateDNLast) {
        this.flagDNFetched = false;
        this.modelsDN = [];
        this.fetchDNs();
      }

      if (!this.paginateDribbbleLast) {
        this.flagDribbbleFetched = false;
        this.modelsDribbble = [];
        this.fetchDribbbles();
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchNext: function() {
      if (!this.flagActive) {
        console.log("FETCHING NEXT!!!!");
        this.flagActive = true;

        this.paginateBehancePage++;
        this.paginateDNPage++;
        this.paginateDribbblePage++;

        if (this.paginateBehancePage > this.paginateBehanceLastPage) {
          this.paginateBehanceLast = true;
        }

        if (this.paginateDNPage > this.paginateDNLastPage) {
          this.paginateDNLast = true;
        }

        if (this.paginateDribbblePage > this.paginateDribbbleLastPage) {
          this.paginateDribbbleLast = true;
        }

        if (this.paginateBehanceLast &&
            this.paginateDNLast &&
            this.paginateDribbbleLast) {
          $('footer').show();
        } else {
          this.fetch();
        }
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchBehances: function() {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchBehancesCallback: function(collection, response) {
      this.flagBehanceFetched = true;

      this.modelsBehance = collection.models;

      this.fetchCallback(collection, response);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchCallback: function(collection, response) {
      if (this.flagBehanceFetched &&
          this.flagDNFetched &&
          this.flagDribbbleFetched) {
        this.flagActive = false;

        this.models = this.mergeModels();

        this.render(true);

        this.setElement(this.$el.selector, true);

        $('#loading').removeClass('active');
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDNs: function() {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDNsCallback: function(collection, response) {
      this.flagDNFetched = true;

      this.modelsDN = collection.models;

      this.fetchCallback(collection, response);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDribbbles: function() {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDribbblesCallback: function(collection, response) {
      this.flagDribbbleFetched = true;

      this.modelsDribbble = collection.models;

      this.fetchCallback(collection, response);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    mergeModels: function() {
      models = [];

      models = models.concat(this.modelsBehance)
                     .concat(this.modelsDN)
                     .concat(this.modelsDribbble);

      return models;
    }

  });

  return ApplicationBaseListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/base/row_view',[
  'app/views/base/view'
],
function(
  BaseView
) {

  // BaseRowView.
  //
  // @file app/views/base/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var BaseRowView = BaseView.extend({

    // View attributes
    // ===============

    type: 'row-view',


    // Flags
    // -----

    flagFetch: false,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    events: function() {
      var events = BaseRowView.__super__.events.call(this);

      events['click'] = this.show;

      return events;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    params: function () {
      var params = BaseRowView.__super__.params.call(this);

      params.model = this.model ? this.model.attributes : {};

      return params;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    reset: function() {},

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderBase: function() {
      if (!this.exists()) {
        // Sets on each row a data-* attribute with the model's ID to
        // avoid repeated content
        var base = '.' + this.resource + '.' + this.path;
        var $el = $(base + '[data-model-id="' + this.model.id + '"]');

        if ($el.length) {
          console.log("EXISTENT: " + this.model.id);
          this._close();
        } else {
          var html = Mustache.render(this.templateBase, this.params());

          $(this.parentEl).find('[data-present="list-content"]').append(html);

          this.setElement(this.$el.selector, false);
        }
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    renderContent: function() {
      BaseRowView.__super__.renderContent.call(this);

      if (this.model && this.model.id) {
        this.$el.attr('data-model-id', this.model.id);
      }
    },

    // Goes to the main view of the model or the URI provided by the
    // href attribute
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    show: function(event) {}

  });

  return BaseRowView;

});
define('text!app/templates/jobs/index/row_view.html.mustache',[],function () { return '<!-- JobsIndexRowViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<a href="{{model.url}}" target="_blank" data-index="{{model.index}}">\n  <span class="company">{{model.company}}</span>\n  is hiring a{{#model.startsWithVowel}}n{{/model.startsWithVowel}}\n  <span class="position">{{model.position}}</span>\n  <span class="location">{{model.location}}</span>\n</div>';});

// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/jobs/index/row_view',[
  'app/views/base/row_view',
  'text!app/templates/jobs/index/row_view.html.mustache'
],
function(
  BaseRowView,
  JobsIndexRowViewTemplate
) {

  // JobsIndexRowView.
  //
  // @file app/views/jobs/index/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var JobsIndexRowView = BaseRowView.extend({

    // View attributes
    // ===============

    parentEl: '.jobs.index.list-view',

    path: 'index',

    resource: 'jobs',

    section: 'jobs',


    // Templates
    // ---------

    template: JobsIndexRowViewTemplate

  });

  return JobsIndexRowView;

});
define('text!app/templates/jobs/index/list_view.html.mustache',[],function () { return '<!-- JobsIndexListViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<div class="search">\n  <i class="icon-search"></i>\n  <input data-input="search" placeholder="Type to search">\n</div>\n\n<div class="list-content clearfix" data-present="list-content"></div>';});

// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/jobs/index/list_view',[
  'app/collections/behance_jobs',
  'app/collections/dn_jobs',
  'app/collections/dribbble_jobs',
  'app/views/application/base/list_view',
  'app/views/jobs/index/row_view',
  'text!app/templates/jobs/index/list_view.html.mustache'
],
function(
  BehanceJobs,
  DNJobs,
  DribbbleJobs,
  ApplicationBaseListView,
  JobsIndexRowView,
  JobsIndexListViewTemplate
) {

  // TODO Check if BehanceJobs gets proper format

  // JobsIndexListView.
  //
  // @file app/views/jobs/index/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var JobsIndexListView = ApplicationBaseListView.extend({

    // View attributes
    // ===============

    path: 'index',

    resource: 'jobs',

    section: 'jobs',


    // Flags
    // -----

    flagBehanceFetched: true,


    // Templates
    // ---------

    template: JobsIndexListViewTemplate,


    // Pagination
    // ----------

    paginateBehanceLast: true,

    paginateDNLastPage: 1,

    paginateDribbbleLastPage: 1,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    blurSearch: function(event) {
      this.disableEvent(event);

      console.log(this.find('.search i'));

      this.find('.search i').removeClass('active');
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    events: function() {
      var events = JobsIndexListView.__super__.events.call(this);

      events['focus [data-input="search"]'] = this.focusSearch;
      events['blur  [data-input="search"]'] = this.blurSearch;
      events['keyup [data-input="search"]'] = this.search;

      return events;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchBehances: function() {
      var params = {
        _path: '',
        _data: {
          page: this.paginateBehancePage,
          sort: 'published_date',
          status: 'current'
        }
      };

      this.flagFetch = false;

      new BehanceJobs(null, params).fetch({
        success: this.fetchBehancesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDNs: function() {
      var params = {
        _path: ''
      };

      this.flagFetch = false;

      new DNJobs(null, params).fetch({
        success: this.fetchDNsCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDribbbles: function() {
      var params = {
        _path: ''
      };

      this.flagFetch = false;

      new DribbbleJobs(null, params).fetch({
        success: this.fetchDribbblesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    focusSearch: function(event) {
      this.disableEvent(event);

      this.find('.search i').addClass('active');
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    mergeModels: function() {
      models = []

      while(this.modelsDN.length || this.modelsDribbble.length) {
        var model = this.modelsDribbble.shift();
        if (model) models.push(model);

        model = this.modelsDN.shift();
        if (model) models.push(model);
      }

      return models;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    rowView: function() {
      return JobsIndexRowView;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    search: function(event) {
      var query = this.find('[data-input="search"]').val();

      var row_selector = '.row-view.' + this.resource + '.' + this.path;

      if (query != '') {
        this.find(row_selector + ' .view-content > a').hide();
        this.find(this.searchQuery(query)).show();
      } else {
        this.find(row_selector + ' .view-content > a').show();
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    searchQuery: function(query) {
      var query_words = query.split(/,|\s|\.|;|:/);

      query_words = _.filter(query_words, function(query_word) {
        return query_word && query_word != '';
      });

      var query_selectors = _.map(query_words, function(query_word) {
        return '[data-index*="' + query_word.toLowerCase() + '"]';
      });

      return query_selectors.join('');
    }

  });

  return JobsIndexListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/routers/jobs_router',[
  'app/routers/router',
  'app/views/jobs/index/list_view',
  'config/session'
],
function(
  Router,
  JobsIndexListView,
  Session
) {

  // JobsRouter.
  //
  // @file app/routers/jobs_router.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var JobsRouter = Router.extend({

    // Router attributes
    // =================

    routes: {
      'jobs'
      : 'jobsIndex'
    },


    // Router methods
    // ==============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    jobsIndex: function() {
      Session.setSection('jobs');

      new JobsIndexListView();
    }

  });

  return JobsRouter;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/dn',[
  'app/models/model'
],
function(
  Model
) {

  // DN.
  //
  // @file app/models/dn.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DN = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      return {
        id: 'dn-' + attributes.a.content.replace(/\s/g, '').toLowerCase(),
        title: attributes.a.content,
        url: attributes.a.href,
        comment_url: this._parseCommentUrl(attributes),

        user_name: this._parseName(attributes),

        stats_likes: this._parseLikes(attributes),
        stats_comments: this._parseComments(attributes),
        stats_likes_plural: this._parseLikesPlural(attributes),
        stats_comments_plural: this._parseCommentsPlural(attributes),

        dn: true,

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseComments: function(attributes) {
      return parseInt(attributes.div.p.a[0].content.replace(/\scomments?/, ''));
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseCommentsPlural: function(attributes) {
      var comments = this._parseComments(attributes);
      return comments != 1;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseCommentUrl: function(attributes) {
      return 'http://news.layervault.com' + attributes.div.p.a[0].href;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseLikes: function(attributes) {
      return parseInt(attributes.div.span.content.replace(' points', ''));
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseLikesPlural: function(attributes) {
      var likes = this._parseLikes(attributes);
      return likes != 1;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseName: function(attributes) {
      return attributes.div.p.a[1].content;
    }

  });

  return DN;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/dns',[
  'app/collections/collection',
  'app/models/dn'
],
function(
  Collection,
  DN
) {

  // DNs.
  //
  // @file app/collections/dns.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var DNs = Collection.extend({

    // Collection attributes
    // =====================

    model: DN,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _params: function() {
      var data = DNs.__super__._params.call(this);

      return _.extend({ format: 'json' }, data);
    },

    // Backbone's parse method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      console.log("DNs");
      console.log(response);
      return response.query.results ? response.query.results.li : [];
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _query: function(url) {
      return 'SELECT * FROM html WHERE url="' + url +
      '" and xpath="//*[@class=\'InnerPage\']/ol/li"';
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        url: 'http://query.yahooapis.com/v1/public/yql?q=' +
             this._query(model.url()),
        dataType: 'jsonp',
        processData: false
      }, options);

      return $.ajax(params);
    },

    // Backbone's sync method.
    //
    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'http://news.layervault.com/' + this._path + '/' + this._page;
    }

  });

  return DNs;

});
define('text!app/templates/news/index/row_view.html.mustache',[],function () { return '<!-- NewsIndexRowViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<a href="{{model.url}}" target="_blank" class="title" data-present="title">\n    {{model.title}}\n</a>\n<span class="name">\n    <span class="likes">\n        {{model.stats_likes}} point{{#model.stats_likes_plural}}s{{/model.stats_likes_plural}}\n    </span>\n    and\n    <a href="{{model.comment_url}}" target="_blank" class="comments">\n        {{model.stats_comments}} comment{{#model.stats_comments_plural}}s{{/model.stats_comments_plural}}\n    </a>\n    from\n    <span class="username">\n        {{model.user_name}}\n    </span>\n</span>\n';});

// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/news/index/row_view',[
  'app/views/base/row_view',
  'text!app/templates/news/index/row_view.html.mustache'
],
function(
  BaseRowView,
  NewsIndexRowViewTemplate
) {

  // NewsIndexRowView.
  //
  // @file app/views/news/index/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var NewsIndexRowView = BaseRowView.extend({

    // View attributes
    // ===============

    parentEl: '.news.index.list-view',

    path: 'news',

    section: 'news',


    // Templates
    // ---------

    template: NewsIndexRowViewTemplate

  });

  return NewsIndexRowView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/news/index/list_view',[
  'app/collections/dns',
  'app/views/application/base/list_view',
  'app/views/news/index/row_view'
],
function(
  DNs,
  ApplicationBaseListView,
  NewsIndexRowView
) {

  // NewsIndexListView.
  //
  // @file app/views/news/index/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var NewsIndexListView = ApplicationBaseListView.extend({

    // View attributes
    // ===============

    path: 'index',

    resource: 'news',

    section: 'news',


    // Flags
    // -----

    flagBehanceFetched: true,

    flagDNFetched: false,

    flagDribbbleFetched: true,


    // Pagination
    // ----------

    paginateBehanceLast: true,

    paginateDNLastPage: 30,

    paginateDribbbleLast: true,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDNs: function() {
      var params = {
        _path: 'p',
        _page: this.paginateDribbblePage
      };

      this.flagFetch = false;

      new DNs(null, params).fetch({
        success: this.fetchDNsCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    rowView: function() {
      return NewsIndexRowView;
    }

  });

  return NewsIndexListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/routers/news_router',[
  'app/routers/router',
  'app/views/news/index/list_view',
  'config/session'
],
function(
  Router,
  NewsIndexListView,
  Session
) {

  // NewsRouter.
  //
  // @file app/routers/news_router.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var NewsRouter = Router.extend({

    // Router attributes
    // =================

    routes: {
      'news'
      : 'newsIndex'
    },


    // Router methods
    // ==============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    newsIndex: function() {
      console.log("NEWS");
      Session.setSection('news');

      new NewsIndexListView();
    }

  });

  return NewsRouter;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/behance',[
  'app/models/model'
],
function(
  Model
) {

  // Behance.
  //
  // @file app/models/behance.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Behance = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      return {
        id: 'behance-' + attributes.id,
        title: attributes.name,
        url: attributes.url,
        short_url: attributes.short_url,

        large_image_url: attributes.covers['404'],
        small_image_url: attributes.covers['404'],

        user_name: attributes.owners[0].display_name,
        user_nickname: attributes.owners[0].username,
        user_picture: attributes.owners[0].images['138'],

        stats_views: attributes.stats.views,
        stats_likes: attributes.stats.appreciations,
        stats_comments: attributes.stats.comments,

        date: attributes.created_on,
        score: this._parseScore(attributes),

        behance: true,

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseScore: function(attributes) {
      return attributes.stats.views + 10 * attributes.stats.appreciations;
    }

  });

  return Behance;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/behances',[
  'app/collections/collection',
  'app/models/behance'
],
function(
  Collection,
  Behance
) {

  // Behances.
  //
  // @file app/collections/behances.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Behances = Collection.extend({

    // Collection attributes
    // =====================

    apiKey: '9Bk5yB4JJnhNIMbyRy6UlYCJ6AQSVk1Q',

    model: Behance,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _params: function() {
      var data = Behances.__super__._params.call(this);

      return _.extend({ api_key: this.apiKey }, data);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      console.log("BEHANCE");
      console.log(response);
      return response.projects;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        dataType: 'jsonp',
        url: model.url(),
        processData: false
      }, options);

      return $.ajax(params);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'http://www.behance.net/v2/' + this._path;
    }

  });

  return Behances;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/models/dribbble',[
  'app/models/model'
],
function(
  Model
) {

  // Dribbble.
  //
  // @file app/models/dribbble.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Dribbble = Model.extend({

    // Model methods
    // =============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parse: function(attributes) {
      return {
        id: 'dribbble-' + attributes.id,
        title: attributes.title,
        url: attributes.url,
        short_url: attributes.short_url,

        large_image_url: attributes.image_url,
        small_image_url: attributes.image_teaser_url,

        user_name: attributes.player.name,
        user_nickname: attributes.player.username,
        user_picture: attributes.player.avatar_url,

        stats_views: attributes.views_count,
        stats_likes: attributes.likes_count,
        stats_comments: attributes.comments_count,

        date: moment(attributes.created_at).unix(),
        score: this._parseScore(attributes),

        dribbble: true,

        parsed: true
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    _parseScore: function(attributes) {
      return attributes.views_count + 10 * attributes.likes_count;
    }


  });

  return Dribbble;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/collections/dribbbles',[
  'app/collections/collection',
  'app/models/dribbble'
],
function(
  Collection,
  Dribbble
) {

  // Dribbbles.
  //
  // @file app/collections/dribbbles.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var Dribbbles = Collection.extend({

    // Collection attributes
    // =====================

    model: Dribbble,


    // Collection methods
    // ==================

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    parse: function(response) {
      console.log("DRIBBBLE");
      console.log(response);
      return response.shots;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    sync: function(method, model, options) {
      var params = _.extend({
        type: 'GET',
        dataType: 'jsonp',
        url: model.url(),
        processData: false
      }, options);

      return $.ajax(params);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    url: function() {
      return 'http://api.dribbble.com/' + this._path;
    }

  });

  return Dribbbles;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/base/list_view',[
  'app/views/application/base/list_view'
],
function(
  ApplicationBaseListView
) {

  // PostsBaseListView.
  //
  // @file app/views/posts/base/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsBaseListView = ApplicationBaseListView.extend({

    // View attributes
    // ===============

    resource: 'posts',


    // Flags
    // -----

    flagDNFetched: true,


    // Pagination
    // ----------

    paginateBehanceLastPage: 30,

    paginateDNLast: true,

    paginateDribbbleLastPage: 30

  });

  return PostsBaseListView;

});
define('text!app/templates/posts/base/row_view.html.mustache',[],function () { return '<!-- PostsBaseRowViewTemplate - Since: 1.0.0 - Version: 1.0.0 -->\n<!-- Author: Fernando Tapia Rico -->\n\n<div class="loader">\n  <span class="circle"></span>\n  <span class="circle"></span>\n  <span class="circle"></span>\n</div>\n\n{{#session.flagLargeImage}}\n    <a href="{{model.url}}" target="_blank" class="image large" data-present="link">\n        <img src="{{model.large_image_url}}" data-present="image">\n    </a>\n{{/session.flagLargeImage}}\n\n{{^session.flagLargeImage}}\n    <a href="{{model.url}}" target="_blank" class="image small" data-present="link">\n        <img src="{{model.small_image_url}}" rel="{{model.large_image_url}}" data-present="image">\n    </a>\n{{/session.flagLargeImage}}';});

// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/base/row_view',[
  'app/views/base/row_view',
  'text!app/templates/posts/base/row_view.html.mustache'
],
function(
  BaseRowView,
  PostsBaseRowViewTemplate
) {

  // PostsBaseRowView.
  //
  // @file app/views/posts/base/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsBaseRowView = BaseRowView.extend({

    // View attributes
    // ===============

    resource: 'posts',


    // Templates
    // ---------

    template: PostsBaseRowViewTemplate,


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    bindExternalEvents: function(method) {
      PostsBaseRowView.__super__.bindExternalEvents.call(this, method);

      Backbone.Events[method]('image-size', this.handleImageSize, this);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    events: function() {
      this.find('[data-present="image"]').load(this.handleLoadImage);

      return PostsBaseRowView.__super__.events.call(this);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    handleImageSize: function() {
      this.render(true);

      this.setElement(this.$el.selector, true);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    handleLoadImage: function() {
      this.find('[data-present="link"]').addClass('active');
    }

  });

  return PostsBaseRowView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/popular/row_view',[
  'app/views/posts/base/row_view'
],
function(
  PostsBaseRowView
) {

  // PostsPopularRowView.
  //
  // @file app/views/posts/base/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsPopularRowView = PostsBaseRowView.extend({

    // View attributes
    // ===============

    parentEl: '.posts.popular.list-view',

    path: 'popular',

    section: 'popular'

  });

  return PostsPopularRowView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/popular/list_view',[
  'app/collections/behances',
  'app/collections/dns',
  'app/collections/dribbbles',
  'app/views/posts/base/list_view',
  'app/views/posts/popular/row_view'
],
function(
  Behances,
  DNs,
  Dribbbles,
  PostsBaseListView,
  PostsPopularRowView
) {

  // PostsPopularListView.
  //
  // @file app/views/snippets/newest/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsPopularListView = PostsBaseListView.extend({

    // View attributes
    // ===============

    path: 'popular',

    section: 'popular',


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchBehances: function() {
      var params = {
        _path: 'projects',
        _data: {
          sort: 'featured_date',
          page: this.paginateBehancePage
        }
      };

      this.flagFetch = false;

      new Behances(null, params).fetch({
        success: this.fetchBehancesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDribbbles: function() {
      var params = {
        _path: 'shots/popular',
        _data: {
          page: this.paginateDribbblePage
        }
      };

      this.flagFetch = false;

      new Dribbbles(null, params).fetch({
        success: this.fetchDribbblesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    mergeModels: function() {
      models = []

      while (this.modelsBehance.length || this.modelsDribbble.length) {
        modelDribbble = this.modelsDribbble.shift();
        if (modelDribbble) models.push(modelDribbble);

        modelBehance = this.modelsBehance.shift();
        if (modelBehance) models.push(modelBehance);
      }

      return models;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    rowView: function() {
      return PostsPopularRowView;
    }

  });

  return PostsPopularListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/recent/row_view',[
  'app/views/posts/base/row_view'
],
function(
  PostsBaseRowView
) {

  // PostsRecentRowView.
  //
  // @file app/views/posts/recent/row_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsRecentRowView = PostsBaseRowView.extend({

    // View attributes
    // ===============

    parentEl: '.posts.recent.list-view',

    path: 'recent',

    section: 'recent'

  });

  return PostsRecentRowView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/views/posts/recent/list_view',[
  'app/collections/behances',
  'app/collections/dns',
  'app/collections/dribbbles',
  'app/views/posts/base/list_view',
  'app/views/posts/recent/row_view'
],
function(
  Behances,
  DNs,
  Dribbbles,
  PostsBaseListView,
  PostsRecentRowView
) {

  // PostsRecentListView.
  //
  // @file app/views/snippets/recent/list_view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsRecentListView = PostsBaseListView.extend({

    // View attributes
    // ===============

    path: 'recent',

    section: 'recent',


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchBehances: function() {
      var params = {
        _path: 'projects',
        _data: {
          sort: 'published_date',
          page: this.paginateBehancePage
        }
      };

      this.flagFetch = false;

      new Behances(null, params).fetch({
        success: this.fetchBehancesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    fetchDribbbles: function() {
      var params = {
        _path: 'shots/everyone',
        _data: {
          page: this.paginateDribbblePage
        }
      };

      this.flagFetch = false;

      new Dribbbles(null, params).fetch({
        success: this.fetchDribbblesCallback
      });
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    mergeModels: function() {
      models = [].concat(this.modelsBehance).concat(this.modelsDribbble);
      models = models.sort(function(postA, postB) {
        return postB.get('date') - postA.get('date');
      });

      return models;
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    rowView: function() {
      return PostsRecentRowView;
    }

  });

  return PostsRecentListView;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/routers/posts_router',[
  'app/routers/router',
  'app/views/posts/popular/list_view',
  'app/views/posts/recent/list_view',
  'config/session'
],
function(
  Router,
  PostsPopularListView,
  PostsRecentListView,
  Session
) {

  // PostsRouter.
  //
  // @file app/routers/posts_router.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var PostsRouter = Router.extend({

    // Router attributes
    // =================

    routes: {
      'recent'
      : 'postsRecent',

      '(popular)'
      : 'postsPopular',

      '*route'
      : 'postsPopular'
    },


    // Router methods
    // ==============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    postsPopular: function() {
      Session.setSection('popular');

      new PostsPopularListView();
    },

        // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    postsRecent: function() {
      Session.setSection('recent');

      new PostsRecentListView();
    },

  });

  return PostsRouter;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

define('app/routers/application_router',[
  'app/routers/jobs_router',
  'app/routers/news_router',
  'app/routers/posts_router'
],
function(
  JobsRouter,
  NewsRouter,
  PostsRouter
) {

  // ApplicationRouter.
  //
  // @file app/routers/application_router.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var ApplicationRouter = {

    init: function() {
      new PostsRouter();
      new JobsRouter();
      new NewsRouter();

      Backbone.history.start({ pushState: false });
    }

  };

  return ApplicationRouter;

});
// Copyright © DESIGNERBOARD.CO - designerboard.co

// TODO Bind 'p' s popular and 'n' as new, 'i' grid

define('app/views/application/header/view',[
  'config/session'
],
function(
  Session
) {

  // ApplicationHeaderView.
  //
  // @file app/views/application/header/view.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico
  var ApplicationHeaderView = Backbone.View.extend({

    // View attributes
    // ===============

    el: 'header',


    // View methods
    // ============

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    events: function() {
      return {
        'click [data-action="share_facebook"]': this.shareFacebook,
        'click [data-action="share_twitter"]' : this.shareTwitter,
        'click [data-action="show_recent"]'   : this.showRecent,
        'click [data-action="show_jobs"]'     : this.showJobs,
        'click [data-action="show_news"]'     : this.showNews,
        'click [data-action="show_popular"]'  : this.showPopular,
        'click [data-action="toggle_size"]'   : this.toggleSize,
        'mouseover [data-present="logo"]'     : this.getRandomLogoColor
      };
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    getRandomLogoColor: function() {
      var $logo = $('header').find('[data-present="logo"]');
      var colors = ['blue', 'green', 'yellow', 'purple', 'red'];
      var color = colors[Math.round(Math.random() * 4)] || 'green';
      while($logo.is('.' + color)) {
        color = colors[Math.round(Math.random() * 4)] || 'green';
      }

      $logo.attr('class', 'logo');
      $logo.addClass(color);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    setResizeIcon: function() {
      var $icon = $('header').find('[data-action="toggle_size"] i');

      if (Session.flagLargeImage) {
        $icon.removeClass('icon-sign-blank').addClass('icon-th');
      } else {
        $icon.removeClass('icon-th').addClass('icon-sign-blank');
      }
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    shareFacebook: function() {
      var url = 'http://www.facebook.com/sharer/sharer.php?' +
                'u=http://designerboard.co/&' +
                't=Designerboard - A more convinient way of browsing ' +
                  'your favorite design websites (Behance, Dribbble & ' +
                  'DesignerNews)';
      oiw(url, 661, 338);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    shareTwitter: function() {
      var url = 'https://twitter.com/intent/tweet?' +
                'original_referer=http://designerboard.co/&' +
                'text=Designerboard - A more convinient way of browsing ' +
                      'your favorite design websites&' +
                'tw_p=tweetbutton&' +
                'url=http://designerboard.co&' +
                'via=designerboard';
      oiw(url, 695, 300);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    showRecent: function() {
      $('header').find('[data-action="toggle_size"]').show();

      Backbone.history.navigate('recent', true);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    showJobs: function() {
      $('header').find('[data-action="toggle_size"]').hide();

      Backbone.history.navigate('jobs', true);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    showNews: function() {
      $('header').find('[data-action="toggle_size"]').hide();

      Backbone.history.navigate('news', true);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    showPopular: function() {
      $('header').find('[data-action="toggle_size"]').show();

      Backbone.history.navigate('popular', true);
    },

    // @since 1.0.0
    // @version 1.0.0
    // @author Fernando Tapia Rico
    toggleSize: function() {
      Session.setFlagLargeImage(!Session.flagLargeImage);

      this.setResizeIcon();

      Backbone.Events.trigger('image-size');

      if ($('html').outerHeight() < $(window).scrollTop()) {
        $(window).scrollTop($(document).height());
      }
    }

  });

  return ApplicationHeaderView;

});
// Avoid `console` errors in browsers that lack a console.
//
// HTML5 Boilerplate plugins 4.0.1
(function() {
  var method;
  var noop = function noop() {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());


// jQuery utils
// ============

// Form util: sets cursor to the end of the input-box.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
jQuery.fn.setCursorToTextEnd = function() {
  var initialVal = this.val();
  this.val('');
  this.val(initialVal);
}


// Array utils
// ===========


// Returns the line of the first occurrence of a specified value in a string.
//
// @param [String] string (required)
//        String.
//
// @return [Integer]
//         Line.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
Array.prototype.joinWithLast = function(separator, lastSeparator) {
  if (this.length > 1) {
    return this.slice(0, -1).join(separator + ' ') + ' ' + lastSeparator + ' ' +
           this.slice(-1);
  } else {
    return _.first(this);
  }
}


// String utils
// ============

// Escapes HTML especial chars.
//
// @param [String] string (required)
//        String.
//
// @return [String]
//         String escaped.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.escapeHtml = function() {
  var entityMap = {
    //"&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;'//,
    //"/": '&#x2F;'
  };

  return this.replace(/[<>"']/g, function (s) { // /[&<>"'\/]/g
    return entityMap[s];
  });
}

// Turns new lines into <br/>.
//
// @param [String] string (required)
//        String.
//
// @return [Boolean]
//         String with new lines converted to <br/>.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.newLineHtml = function() {
  return this.replace(/\r?\n/g, function (s) {
    return '<br/>';
  });
}

// String util: compare two Strings case insensitive.
//
// @param [String] string (required)
//        String.
//
// @return [Boolean]
//         True, if they are equal; False, if not.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.equalTo = function(string)
{
  return this.toLowerCase() === string.toLowerCase();
}

// String util: capitalization.
//
// @return [String]
//         String capitalized.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// Checks if String starts with the given string.
//
// @param [String] string (required)
//        String.
//
// @return [Boolean]
//         True, if it starts with the given string; False, if not.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.startsWith = function (str){
  return this.indexOf(str) == 0;
};

// This is the function that actually highlights a text string by
// adding HTML tags before and after all occurrences of the search
// term. You can pass your own tags if you'd like, or if the
// highlightStartTag or highlightEndTag parameters are omitted or
// are empty strings then the default <font> tags will be used.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) {
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = '<em class="hl">';
    highlightEndTag = '</em>';
  }

  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = '';
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();

  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = '';
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf('>', i) >= bodyText.lastIndexOf('<', i)) {
        // skip anything inside a <script> block
        var scriptEndIndex = lcBodyText.lastIndexOf('/script>', i);
        var scriptStartIndex = lcBodyText.lastIndexOf('<script', i);

        if (scriptEndIndex >= scriptStartIndex) {
          newText += bodyText.substring(0, i) + highlightStartTag +
                     bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      }
    }
  }

  return newText;
}

// This is sort of a wrapper function to the doHighlight function.
// It takes the searchText that you pass, optionally splits it into
// separate words, and transforms the text on the current web page.
// Only the "searchText" parameter is required; all other parameters
// are optional and can be omitted.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.highlightTerms = function(searchText,
                                           treatAsPhrase,
                                           highlightStartTag,
                                           highlightEndTag) {
  // if the treatAsPhrase parameter is true, then we should search for
  // the entire phrase that was entered; otherwise, we will split the
  // search string so that each word is searched for and highlighted
  // individually
  var string = this;
  var searchArray = treatAsPhrase ? [searchText] : searchText.split(' ');

  for (var i = 0; i < searchArray.length; i++) {
    if (searchArray[i] != '') {
      string = doHighlight(string,
                           searchArray[i],
                           highlightStartTag,
                           highlightEndTag);
    }
  }

  return string;
}

// Returns the line of the first occurrence of a specified value in a
// string.
//
// @param [String] string (required)
//        String.
//
// @return [Integer]
//         Line.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.lineCount = function() {
  var lines = this.split(/\r\n|\r|\n/);

  if (lines[lines.length - 1] == '') lines.pop();

  return lines.length;
}

// Returns the line of the first occurrence of a specified value in a
// string.
//
// @param [String] string (required)
//        String.
//
// @return [Integer]
//         Line.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.lineOf = function(string) {
  var lines = this.split(/\r?\n/g);

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(string) >= 0) return i;
  }

  return -1;
}

// Returns the line of the first occurrence of a specified value in a
// string.
//
// @param [String] string (required)
//        String.
//
// @return [Integer]
//         Line.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.lineSlice = function(numLines, fromLine) {
  if (!fromLine) fromLine = 0;
  var lines = this.split(/\r?\n/g);
  var slice = [];

  for (var i = fromLine; i < lines.length && numLines > slice.length; i++) {
    slice.push(lines[i]);
  }

  while(!slice[slice.length - 1] || slice[slice.length - 1] == '') slice.pop();

  return slice.join('\n');
}


// Finds URLs within the string and hyperlinks them.
//
// @return [String]
//         String with hyperlinks.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.linkify = function() {
  var string, httpPattern, wwwPattern, emailPattern;
  var urlOpts = 'target="_blank" rel="nofollow"';

  // URLs starting with http://, https://, or ftp://
  httpPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  httpReplace = '<a href="$1" ' + urlOpts + '>$1</a>';
  string = this.replace(httpPattern, httpReplace);

  // URLs starting with "www." (without // before it, or it'd re-link
  // the ones done above)
  wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  wwwReplace = '$1<a href="http://$2" ' + urlOpts + '>$2</a>';
  string = string.replace(wwwPattern, wwwReplace);

  // Change email addresses to mailto:: links
  emailPattern = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  emailReplace = '<a href="mailto:$1">$1</a>';
  string = string.replace(emailPattern, emailReplace);

  return string;
}


// Finds URLs within the string and hyperlinks them.
//
// @return [String]
//         String with hyperlinks.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
String.prototype.checksum = function() {
  var index;
  var checksum = 0x12345678;

  for (index = 0; index < this.length; index++) {
    checksum += (this.charCodeAt(index) * index);
  }

  return checksum;
}

// TODO Description
// Finds URLs within the string and hyperlinks them.
//
// @return [String]
//         String with hyperlinks.
//
// @since 0.9.0
// @version 0.9.0
// @author Fernando Tapia Rico
Date.prototype.timestamp = function() {
  return this.getTime() / 1000;
}

function oiw(url, width, height) {
  var left = screen.width  ? (screen.width - width ) / 2 : 100;
  var top  = screen.height ? (screen.height - height ) / 2 : 100;
  var settings = 'width=' + width + ',' +
                 'height=' + height + ',' +
                 'top=' + top + ',' +
                 'left=' + left + ',' +
                 'location=no,' +
                 'directories=no,' +
                 'status=0,' +
                 'menubar=no,' +
                 'toolbar=no,' +
                 'resizable=no';
  window.open(url, '', settings);
}
;
define("lib/core_ext/utils.js", function(){});

// Copyright © DESIGNERBOARD.CO - designerboard.co

require.config({ paths: { text: 'lib/plugins/text' } });

require([
  'app/routers/application_router',
  'app/views/application/header/view',
  'config/session',
  'lib/core_ext/utils.js'
],
function(
  ApplicationRouter,
  ApplicationHeaderView,
  Session
) {

  // Main.
  //
  // @file main.js
  //
  // @since 1.0.0
  // @version 1.0.0
  // @author Fernando Tapia Rico

  var viewHeader = new ApplicationHeaderView();

  Session.init();

  Session.setViewHeader(viewHeader);

  ApplicationRouter.init();

  Session.viewHeader.setResizeIcon();

});

define("main", function(){});
