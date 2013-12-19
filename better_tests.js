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

describe("Collection ", function () {
    it("should clear all items", function () {
        app.tabs.nukeCollection(); 
        expect(app.tabs.length).toBe(0);
    }); 

    it("should return true if url is http", function () {
        var url ="http://lovestruck.com";
        expect(app.tabs.isHttp(url)).toBe(true);
    });

    it("should return false if it's not http", function () {
        var url = "chrome-extension://jako.ja";
        expect(app.tabs.isHttp(url)).toBe(false);
    });

    it("should correctly set base domain name", function () {
        var url = "http://love.me/nola/mola/kola";
        expect(app.tabs.getBase(url)).toEqual('love.me');
    });
});

describe("Test integration with chrome", function () {
    it('asynchronous support', function () {
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

