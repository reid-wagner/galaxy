// ============================================================================
// var txt = require( 'raw!./blah.txt' );
require( './libs/common-libs' );
define([
    'mvc/user/user-model',
    'utils/metrics-logger',
    'utils/add-logging',
    'utils/localization'
], function( userModel, metricsLogger, addLogging, localize ){
// ============================================================================
/** Base galaxy client-side application.
 *      Iniitializes:
 *          logger      : the logger/metrics-logger
 *          localize    : the string localizer
 *          config      : the current configuration (any k/v in
 *              galaxy.ini available from the configuration API)
 *          user        : the current user (as a mvc/user/user-model)
 */
function GalaxyApp( options, bootstrapped ){
    var self = this;
    return self._init( options || {}, bootstrapped || {} );
}

// add logging shortcuts for this object
addLogging( GalaxyApp, 'GalaxyApp' );

/** default options */
GalaxyApp.prototype.defaultOptions = {
    /** monkey patch attributes from existing window.Galaxy object? */
    patchExisting   : true,
    /** root url of this app */
    // move to self.root?
    root            : '/'
};

/** initalize options and sub-components */
GalaxyApp.prototype._init = function init( options, bootstrapped ){
    var self = this;
    // console.debug( 'text:', txt );
    console.debug( 'bootstrapped:', bootstrapped );
    _.extend( self, Backbone.Events );

    self._processOptions( options );
    self.debug( 'GalaxyApp.options: ', self.options );

    self._patchGalaxy( window.Galaxy );

    self._initLogger( options.loggerOptions || {} );
    self.debug( 'GalaxyApp.logger: ', self.logger );

    self._initLocale();
    self.debug( 'GalaxyApp.localize: ', self.localize );

    self.config = options.config || bootstrapped.config || {};
    self.debug( 'GalaxyApp.config: ', self.config );

    self._initUser( options.user || bootstrapped.user || {} );
    self.debug( 'GalaxyApp.user: ', self.user );

    self._setUpListeners();
    self.trigger( 'ready', self );

    return self;
};

/** add an option from options if the key matches an option in defaultOptions */
GalaxyApp.prototype._processOptions = function _processOptions( options ){
    var self = this,
        defaults = self.defaultOptions;
    self.debug( '_processOptions: ', options );

    self.options = {};
    for( var k in defaults ){
        if( defaults.hasOwnProperty( k ) ){
            self.options[ k ] = ( options.hasOwnProperty( k ) )?( options[ k ] ):( defaults[ k ] );
        }
    }
    return self;
};

/** add an option from options if the key matches an option in defaultOptions */
GalaxyApp.prototype._patchGalaxy = function _processOptions( patchWith ){
    var self = this;
    // in case req or plain script tag order has created a prev. version of the Galaxy obj...
    if( self.options.patchExisting && patchWith ){
        self.debug( 'found existing Galaxy object:', patchWith );
        // ...(for now) monkey patch any added attributes that the previous Galaxy may have had
        //TODO: move those attributes to more formal assignment in GalaxyApp
        for( var k in patchWith ){
            if( patchWith.hasOwnProperty( k ) ){
                self.debug( '\t patching in ' + k + ' to Galaxy' );
                self[ k ] = patchWith[ k ];
            }
        }
    }
};

/** set up the metrics logger (utils/metrics-logger) and pass loggerOptions */
GalaxyApp.prototype._initLogger = function _initLogger( loggerOptions ){
    var self = this;
    self.debug( '_initLogger:', loggerOptions );
    self.logger = new metricsLogger.MetricsLogger( loggerOptions );
    return self;
};

/** add the localize fn to this object and the window namespace (as '_l') */
GalaxyApp.prototype._initLocale = function _initLocale( options ){
    var self = this;
    self.debug( '_initLocale:', options );
    self.localize = localize;
    // add to window as global shortened alias
    window._l = self.localize;
    return self;
};

/** set up the current user as a Backbone model (mvc/user/user-model) */
GalaxyApp.prototype._initUser = function _initUser( userJSON ){
    var self = this;
    self.debug( '_initUser:', userJSON );
    self.user = new userModel.User( userJSON );
    //TODO: temp - old alias
    self.currUser = self.user;
    return self;
};

/** Set up DOM/jQuery/Backbone event listeners enabled for all pages */
GalaxyApp.prototype._setUpListeners = function _setUpListeners(){
    var self = this;

    // hook to jq beforeSend to record the most recent ajax call and cache some data about it
    /** cached info about the last ajax call made through jQuery */
    self.lastAjax = {};
    $( document ).bind( 'ajaxSend', function( ev, xhr, options ){
        var data = options.data;
        try {
            data = JSON.parse( data );
        } catch( err ){}

        self.lastAjax = {
            url     : location.href.slice( 0, -1 ) + options.url,
            data    : data
        };
        //TODO:?? we might somehow manage to *retry* ajax using either this hook or Backbone.sync
    });
    self._listenToGalaxyMain();
    return self;
};

/** trigger an event when the main frame loads a new page */
GalaxyApp.prototype._listenToGalaxyMain = function _listenToGalaxyMain(){
    var self = this,
        selector = 'iframe#galaxy_main',
        galaxy_main = $( selector );
    galaxy_main = galaxy_main.size()? galaxy_main.get( 0 ).contentWindow : undefined ;
    if( galaxy_main ){
        // TODO: this would be better external to this function so it can be removed
        var handler = function __galaxyMainOnLoadHandler( ev ){
            try {
                var _galaxy_main = $( selector ).get( 0 ).contentWindow,
                    full = _galaxy_main.location.pathname + _galaxy_main.location.search + _galaxy_main.location.hash;
                self.trigger( 'galaxy_main:load', {
                    fullpath: full,
                    pathname: _galaxy_main.location.pathname,
                    search  : _galaxy_main.location.search,
                    hash    : _galaxy_main.location.hash
                });

            } catch( err ){
                self.debug( 'Error handling main frame load:', err );
            }
        };
        $( selector ).on( 'load', handler );

    } else {
        self.debug( 'No galaxy_main found' );
    }
};

/** string rep */
GalaxyApp.prototype.toString = function toString(){
    var userEmail = this.user.get( 'email' ) || '(anonymous)';
    return 'GalaxyApp(' + userEmail + ')';
};


// ============================================================================
    return {
        GalaxyApp : GalaxyApp
    };
});
