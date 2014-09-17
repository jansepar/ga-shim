var assert = chai.assert;
 
describe("gaShim", function() {
    describe("bindShim", function() {
        it("should convert and execute commands on the old GA queue", function() {
            var gaq = [
                ['_addItem',
                    '1234',           // Transaction ID. Required
                    'DD44',           // SKU/code. Required
                    'T-Shirt',        // Product name
                    'Green Medium',   // Category or variation
                    '11.99',          // Unit price. Required
                    '1'               // Quantity. Required
                ]
            ];
            var expectedCommandArray = ['ecommerce:addItem',
                {
                    id: '1234',
                    sku: 'DD44',
                    name: 'T-Shirt',
                    category: 'Green Medium',
                    price: '11.99',
                    quantity: '1'
                }
            ];
            window.GAShim.bindShim(gaq, function(){
                var args = Array.prototype.slice.call(arguments);
                assert.deepEqual(args, expectedCommandArray);
            })
        });
        it("should shim the push method", function() {
            var gaq = [];
            var commandArrayToPush = ['_addItem',
                '1234',           // Transaction ID. Required
                'DD44',           // SKU/code. Required
                'T-Shirt',        // Product name
                'Green Medium',   // Category or variation
                '11.99',          // Unit price. Required
                '1'               // Quantity. Required
            ];
            var expectedCommandArray = ['ecommerce:addItem',
                {
                    id: '1234',
                    sku: 'DD44',
                    name: 'T-Shirt',
                    category: 'Green Medium',
                    price: '11.99',
                    quantity: '1'
                }
            ];
            window.GAShim.bindShim(gaq, function(){
                var args = Array.prototype.slice.call(arguments);
                assert.deepEqual(args, expectedCommandArray);
            });
            gaq.push(commandArrayToPush)
        });
    });
    describe("convertGACommandToNewGUAFormat", function() {
        it("should shim _addTrans", function() {
            var addTrans = ['_addTrans',
                '1234',           // Transaction ID. Required
                'Acme Clothing',  // Affiliation or store name
                '11.99',          // Total. Required
                '1.29',           // Tax
                '5',              // Shipping
                'San Jose',       // City
                'California',     // State or Province
                'USA'             // Country
            ];
            var expectedCommandArray = ['ecommerce:addTransaction',
                {
                    affiliation: 'Acme Clothing',
                    id: '1234',
                    revenue: '11.99',
                    shipping: '5',
                    tax: '1.29'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _addTrans without optional requirements", function() {
            var addTrans = ['_addTrans',
                '1234',           // Transaction ID. Required
                null,             // Affiliation or store name
                '11.99',          // Total. Required
            ];
            var expectedCommandArray = ['ecommerce:addTransaction',
                {
                    id: '1234',
                    revenue: '11.99',
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _addTrans with namespace", function() {
            var addTrans = ['_addTrans',
                '1234',           // Transaction ID. Required
                'Acme Clothing',  // Affiliation or store name
                '11.99',          // Total. Required
                '1.29',           // Tax
                '5',              // Shipping
                'San Jose',       // City
                'California',     // State or Province
                'USA'             // Country
            ];
            var expectedCommandArray = ['mobifyTracker.ecommerce:addTransaction',
                {
                    affiliation: 'Acme Clothing',
                    id: '1234',
                    revenue: '11.99',
                    shipping: '5',
                    tax: '1.29'
                }
            ]
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray)
        });
        it("should shim _addItem", function() {
            var addTrans = ['_addItem',
                '1234',           // Transaction ID. Required
                'DD44',           // SKU/code. Required
                'T-Shirt',        // Product name
                'Green Medium',   // Category or variation
                '11.99',          // Unit price. Required
                '1'               // Quantity. Required
            ];
            var expectedCommandArray = ['ecommerce:addItem',
                {
                    id: '1234',
                    sku: 'DD44',
                    name: 'T-Shirt',
                    category: 'Green Medium',
                    price: '11.99',
                    quantity: '1'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _addItem without optional requirements", function() {
            var addTrans = ['_addItem',
                '1234',           // Transaction ID. Required
                'DD44',           // SKU/code. Required
                null,             // Product name
                null,             // Category or variation
                '11.99',          // Unit price. Required
                '1'               // Quantity. Required
            ];
            var expectedCommandArray = ['ecommerce:addItem',
                {
                    id: '1234',
                    sku: 'DD44',
                    price: '11.99',
                    quantity: '1'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans)
        });
        it("should shim _addItem with namespace", function() {
            var addTrans = ['_addItem',
                '1234',           // Transaction ID. Required
                'DD44',           // SKU/code. Required
                'T-Shirt',        // Product name
                'Green Medium',   // Category or variation
                '11.99',          // Unit price. Required
                '1'               // Quantity. Required
            ];
            var expectedCommandArray = ['mobifyTracker.ecommerce:addItem',
                {
                    id: '1234',
                    sku: 'DD44',
                    name: 'T-Shirt',
                    category: 'Green Medium',
                    price: '11.99',
                    quantity: '1'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackTrans", function() {
            var addTrans = ['_trackTrans'];
            var expectedCommandArray = ['ecommerce:send']
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
        });
        it("should shim _trackTrans with namespace", function() {
            var addTrans = ['_trackTrans'];
            var expectedCommandArray = ['mobifyTracker.ecommerce:send']
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackEvent", function() {
            var addTrans = ['_trackEvent',
              'button',         // Category. Required.
              'click',          // Action. Required.
              'nav buttons',    // Label.
              4,                // Value for label
              1                 // Non-interaction
            ];
            var expectedCommandArray = ['send',
                {
                    hitType: 'event',
                    eventCategory: 'button',
                    eventAction: 'click',
                    eventLabel: 'nav buttons',
                    eventValue: 4,
                    nonInteraction: 1
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackEvent without optional arguments", function() {
            var addTrans = ['_trackEvent',
              'button',         // Category. Required.
              'click',          // Action. Required.
            ];
            var expectedCommandArray = ['send',
                {
                    hitType: 'event',
                    eventCategory: 'button',
                    eventAction: 'click',
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackEvent with namespace", function() {
            var addTrans = ['_trackEvent',
              'button',         // Category. Required.
              'click',          // Action. Required.
              'nav buttons',    // Label.
              4,                // Value for label
              1                 // Non-interaction
            ];
            var expectedCommandArray = ['mobifyTracker.send',
                {
                    hitType: 'event',
                    eventCategory: 'button',
                    eventAction: 'click',
                    eventLabel: 'nav buttons',
                    eventValue: 4,
                    nonInteraction: 1
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackPageview", function() {
            var addTrans = ['_trackPageview',
                '/foo'          // Page Path. Optional
            ];
            var expectedCommandArray = ['send',
                {
                    hitType: 'pageview',
                    page: '/foo'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackPageview without optional", function() {
            var addTrans = ['_trackPageview',
                '/foo'
            ];
            var expectedCommandArray = ['send',
                {
                    hitType: 'pageview',
                    page: '/foo'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _trackPageview with namespace", function() {
            var addTrans = ['_trackPageview',
                '/foo'          // Page Path. Optional
            ];
            var expectedCommandArray = ['mobifyTracker.send',
                {
                    hitType: 'pageview',
                    page: '/foo'
                }
            ];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _setCustomVar", function() {
            var addTrans = ['_setCustomVar',
                3,                   // This custom var is set to slot #1.  Required parameter.
                'Items Removed',     // The name acts as a kind of category for the user activity.  Required parameter.
                'Yes',               // This value of the custom variable.  Required parameter.
                2                    // Sets the scope to session-level.  Optional parameter.
            ];
            var expectedCommandArray = ['set', 'dimension3', 'Yes'];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _setCustomVar without optional args", function() {
            var addTrans = ['_setCustomVar',
                3,                   // This custom var is set to slot #1.  Required parameter.
                'Items Removed',     // The name acts as a kind of category for the user activity.  Required parameter.
                'Yes',               // This value of the custom variable.  Required parameter.
            ];
            var expectedCommandArray = ['set', 'dimension3', 'Yes'];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans);
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
        it("should shim _setCustomVar with namespace", function() {
            var addTrans = ['_setCustomVar',
                3,                   // This custom var is set to slot #1.  Required parameter.
                'Items Removed',     // The name acts as a kind of category for the user activity.  Required parameter.
                'Yes',               // This value of the custom variable.  Required parameter.
                2                    // Sets the scope to session-level.  Optional parameter.
            ];
            var expectedCommandArray = ['mobifyTracker.set', 'dimension3', 'Yes'];
            var newCommandArray = window.GAShim.convertGACommandToNewGUAFormat(addTrans, 'mobifyTracker');
            assert.deepEqual(newCommandArray, expectedCommandArray);
        });
    });
});