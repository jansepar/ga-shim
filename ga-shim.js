/**
 * ga-shim.js 0.0.2
 *
 * (c) 2014 Shawn Jansepar, Mobify 
 * ga-shim.js may be freely distributed under the MIT license.
 *
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.GAShim = factory();
    }
}(this, function () {

    var GAShim = {};

    /**
     * Maps old GA commands to it's respective GUA equivalent
     *
     * apiName - name of new API in GUA that corresponds with the
     *           key name.
     * args    - Defines the name of the arguments that will be used to
     *           construct the argument map to be passed into the GUA API.
     *           The ordering also corresponds to the order of these fields
     *           in the old GA API.
     * send    - Send should be set to 'true' if the first argument passed
     *           into the GUA API is 'send'. We differentiate on this because
     *           the API is called slightly differently for this case.
     *
     * For commands that aren't simple to convert, you can define a function that
     * will convert into the format needed for the `ga` GUA API. The function
     * provides the arguments of the old API, and expects exact arguments
     * that should be applied to `ga` in return.
     */
    GAShim._gaCommandShimMap = {
        // GA:  https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
        '_addTrans': {
            'apiName': 'ecommerce:addTransaction',
            'args': ['id', 'affiliation', 'revenue', 'tax', 'shipping']
        },
        // GA:  https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
        '_addItem': {
            'apiName': 'ecommerce:addItem',
            'args': ['id', 'sku', 'name', 'category', 'price', 'quantity']
        },
        // GA:  https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
        '_trackTrans': {
            'apiName': 'ecommerce:send'
        },
        // GA:  https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
        //      https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEventTracking#_gat.GA_EventTracker_._trackEvent
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
        '_trackEvent': {
            'send': true,
            'apiName': 'event',
            'args': ['eventCategory', 'eventAction', 'eventLabel', 'eventValue', 'nonInteraction']
        },
        // GA:  https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
        '_trackPageview': {
            'send': true,
            'apiName': 'pageview',
            'args': ['page']
        },
        // GA: https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables
        // GUA: https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
        '_setCustomVar': function(args, trackerNamespace) {
            // Args 1 (name) and 3 (scope) that were required in the old GA API
            // are not required in GUA because these vars must be set in the
            // admin interface of Google Analytics.
            // This function must return the arguments passed to the `ga` GUA API
            // in an array.
            var apiName = trackerNamespace + 'set';
            var dimension = 'dimension' + args[0];
            var value = args[2];
            return [apiName, dimension, value];
        }
    };

    GAShim._isArray = function(someVar) {
        return Object.prototype.toString.call(someVar) === '[object Array]';
    };

    GAShim._isFunction = function(someVar) {
        return Object.prototype.toString.call(someVar) === '[object Function]';
    };

    /**
     * Given a particular GA commandArray, convert it into an array that we can apply
     * to the new GUA API.
     *
     * commandArray     - The GA command being shimmed. Name from:
     *                    https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApi_gaq#_gaq.push
     * trackerNamespace - (optional) The custom tracker name on the GUA object
     */
    GAShim.convertGACommandToNewGUAFormat = function(commandArray, trackerNamespace) {
        trackerNamespace = trackerNamespace ? trackerNamespace + '.' : '';
        // The name of the command in the classic GA API is contained
        // in the first argument of the commandArray.
        var commandName = commandArray[0];

        // The arguments of the command in the classic GA API are
        // contained in the 1..n elements of the commandArray.
        var commandArgs = commandArray.slice(1);

        // Identify which new command this maps to.
        var commandMapObj = GAShim._gaCommandShimMap[commandName];
        if (!commandMapObj) {
            return;
        }

        // If there are arguments, attempt to create the key-value
        // arguments object needed for the corresponding GUA command.
        if (commandMapObj['args']) {
            var newArgs = {};

            for (var i=0, argsLen=commandArgs.length; i<argsLen; i++) {
                var argId = commandMapObj['args'][i];
                if (!argId) {
                    continue;
                }
                // if commandArg is undefined or null (which it can be for
                // optional arguments), don't set it.
                var commandArg = commandArgs[i];
                if (!commandArg) {
                    continue;
                }
                newArgs[argId] = commandArg;
            }

            // Call ga using the new command name and corresponding arguments
            // If 'send' is true, this means this type of API has a special syntax
            // where the first argument is 'trackerNamespace.send' or 'send', rather then
            // the event name directly, and the name of the event will actually
            // be stored in the newArgs object as 'hitType'
            if (commandMapObj.send) {
                newArgs['hitType'] = commandMapObj['apiName'];
                return [trackerNamespace + 'send', newArgs];
            } else {
                return [trackerNamespace + commandMapObj['apiName'], newArgs];
            }
        // If commandMapObj is a function, then the arguments to `ga` will be
        // constructed from that command, which must return an array when executed.
        } else if (GAShim._isFunction(commandMapObj)) {
            return commandMapObj.call(null, commandArgs, trackerNamespace);
        // If there are no arguments, simply execute without any
        } else {
            return [trackerNamespace + commandMapObj['apiName']];
        }
    };

    /**
     * Calls the shim on all existing events in the queue, and overrides
     * the old gaq to push events to the new GUA object
     */
    GAShim.bindShim = function(gaq, ga, trackerNamespace) {
        // Grab all commandArrays on the old queue and shim them
        if (gaq.length > 0) {
            for (var i=0, len=gaq.length; i<len; i++) {
                var newCommandArray = GAShim.convertGACommandToNewGUAFormat(gaq[i], trackerNamespace);
                ga.apply(window, newCommandArray);
            }
        }

        // Shim all future calls to `gaq.push`
        gaq.push = function() {
            for (var i=0, len=arguments.length; i<len; i++) {
                // Attempt to shim the command array
                var commandArray = arguments[i];
                try {
                    var newCommandArray = GAShim.convertGACommandToNewGUAFormat(commandArray, trackerNamespace);
                    ga.apply(window, newCommandArray);
                } catch (e) {
                    throw e
                    console.error('There was an issue with shimming the following command: ' + commandArray[i], e);
                }
            }
        };
    };

    return GAShim;

}));
