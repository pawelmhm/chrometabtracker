describe('Test suite', function () {
    it("should run fine", function () {
        expect(true).toBe(true);
    })
});

describe("Test individual models", function () {
    it("should correctly set duration", function () {
        now = +new Date();
        var testModel = new app.tabModel({"duration":0,"lastActive":now});
        testModel.updateDuration(now+900);
        expect(testModel.get('duration')).toEqual(900);
    });
});

describe("Collection (synchronous methods) ", function () {
    TESTING = true;
    var testTabs = new app.tabsCollection();
    xit("should clear all items", function () {
        // nukes local storage, so far tests are still plugged 
        // to app local storage
        // TODO add separate storage for test collection
        testTabs.nukeCollection(); 
        expect(testTabs.length).toBe(0);
    }); 

    it("should return true if url is http", function () {
        var url ="http://lovestruck.com";
        expect(testTabs.isHttp(url)).toBe(true);
    });

    it("should return false if it's not http", function () {
        var url = "chrome-extension://jako.ja";
        expect(testTabs.isHttp(url)).toBe(false);
    });

    it("should correctly set base domain name", function () {
        var url = "http://love.me/nola/mola/kola";
        expect(testTabs.getBase(url)).toEqual('love.me');
    });

    it("should return correct total for all items", function () {
        expect(testTabs.models[0]).not.toBeDefined();
        expect(testTabs.length).toBe(0);
        var models = [{"duration":10},{"duration":12},{"duration":1}];
        _.each(models,function (almostModel) { 
            model = new app.tabModel(almostModel);
            testTabs.add(model);
        },this);
        expect(testTabs.length).toBe(3);
        expect(testTabs.getTotal()).toBe(23);
        
    });
    it("should set testing to false again", function () {
        TESTING=false;
        expect(TESTING).toBe(false);
    });
});

describe("Test integration with chrome", function () {
    xit('asynchronous support', function () {
        runs(function () {
            newTab = {};
            flag = false;
            chrome.tabs.create({}, function(tab) { flag = true; newTab = tab; }) 
        }); 

        waitsFor(function () {
           // polls and waits until flag becomes true, if not returns message
            return flag;
        }, "tab not created",900); 
        
        runs(function () {
            chrome.tabs.remove(newTab["id"]);
            console.log("value after timeout,", newTab);
            expect(newTab).toBeDefined();
            expect(newTab["id"]).toBeDefined();
        })
    }); 
});

describe("Test time conversion", function () {
    var testModel = new app.tabModel({"duration":60000, 'lastActive': +new Date}), 
        testView = new app.tabView({model:testModel}); 
    it("should convert duration between miliseconds and seconds", function () {
        expect(testView.makeReadable('s')['duration']).toBe(60);
    });
    it("should convert duration between miliseconds and minutes", function () {
        expect(testView.makeReadable("m")['duration']).toBe(1);
    });
    it("should convert miliseconds to hours", function () {
        expect(testView.makeReadable("h")['duration']).toBe(0);
    });
});

describe("Test app.allTabsViews", function () {
    var allViews = new app.allTabsView({testing:true});   
    it("should accept options object", function () {
        expect(allViews.options.testing).toBeDefined();
        expect(allViews.options.testing).toBe(true);
    });

    it("should append all new allViews to main interface", function () {
        var newModel = new app.tabModel({active: true, duration: 12, id: "www.tfl.gov.uk", lastActive: 1387564946167}),
            before = allViews.rendered.length;
        expect(allViews.rendered).toBeDefined();
        expect(allViews.rendered.length).toBe(0);
        allViews.addOne(newModel);
        expect(allViews.rendered.length).toBe(before+1);
    });

    it("should resort views according to a duration", function () {
        var newModel = new app.tabModel({active: true, duration: 10, id: "www.uk.gov.uk", lastActive: 1387564946167}),
        anotherModel = new app.tabModel({active: true, duration: 14, id: "www.usa.today", lastActive: 1387564946167});
        allViews.addOne(newModel); allViews.addOne(anotherModel); 
        expect(allViews.rendered.length).toBe(3);
        expect(allViews.rendered[0].model.get('duration')).toBe(12);
        allViews.sortViews('duration');
        expect(allViews.rendered[0].model.get('duration')).toBe(14);
    })
});


(function() {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 250;

          /**
           *    Create the `HTMLReporter`, which Jasmine calls to provide results of each spec and each suite. The Reporter is responsible for presenting results to the user.
         */
    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);

      /**
       *    Delegate filtering of specs to the reporter. Allows for clicking on single suites or specs in the results to only run a subset of the suite.
       *       */
      jasmineEnv.specFilter = function(spec) {
          return htmlReporter.specFilter(spec);
        };

        /**
         *    Run all of the tests when the page finishes loading - and make sure to run any previous `onload` handler
         *
           Scroll down to see the results of all of these specs.
         *             */
    var currentWindowOnload = window.onload;
    window.onload = function() {
        if (currentWindowOnload) {
            currentWindowOnload();
        }  
            execJasmine();
     };

    function execJasmine() {
        jasmineEnv.execute();
     }
})();

