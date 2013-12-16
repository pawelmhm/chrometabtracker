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
        console.log(testModel.get("url"))
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
    
    it("app.tabs (our collection) should be defined",function () {
        expect(app.tabs).toBeDefined();
    });

    it("after opening new tab it should be in app.tabs", function () {
        expect(app.tabs.length).toBe(1);
    });

    it("collections.getLast() should return last active page", function () {
        expect(app.tabs.getLast()).toBeDefined();
        expect(app.tabs.getLast().get('lastActive')).toBeDefined();
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

