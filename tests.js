describe('Test suite', function () {
    it("should run fine", function () {
        expect(true).toBe(true);
    })
});

describe("Test individual models", function () {
    it("should return true if url is http", function () {
        var testModel = new app.tabModel({"url":"http://lovestruck.com"});
        expect(testModel.checkIfHttp()).toBe(true);
    });

    it("should return false if it's not http", function () {
        var testModel = new app.tabModel({"url":"chrome-extension://jako.ja"});
        expect(testModel.checkIfHttp()).toBe(false);
    })

    it("should correctly set base domain name", function () {
        var testModel = new app.tabModel({"url":"http://love.me/nola/mola/kola"});
        testModel.fixDomain();
        expect(testModel.get('url')).toEqual('love.me')
    })

    it("should correctly set duration", function () {
        now = +new Date();
        var testModel = new app.tabModel({"duration":0,"lastActive":now});
        testModel.updateDuration(now+900);
        expect(testModel.get('duration')).toEqual(900);
    });
});

    describe("Test collection", function () {
        

        xit("app.tabs (our collection) should be defined",function () {
            expect(app.tabs).toBeDefined();
            expect(app.tabs.length).toBe(1);
        });
        
        xit("after opening new tab it should be in app.tabs", function () {
            chrome.tabs.create({"url":"http://www.google.com"});
            setTimeout(function () {
                expect(app.tabs.length).toBe(1);
                console.log("app.tabs.length after timeout", app.tabs.length);
            },1000);
        }, 1000);

        it("after opening new tab it shoule be in app.tabs", function (done) {
            chrome.tabs.create({"url":"http://www.google.com"}, function () {
                expect(app.tabs.length).toBe(1); //
                console.log("app.tabs.length in callback to chrome.tabs.create",app.tabs.length); //value 0 
            done();
            })
        });
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

