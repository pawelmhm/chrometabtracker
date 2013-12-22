var ChromeTabs = {
    /* 
       - Launches app,
       - listens to changes on browser's tabs, 
       - passes data to app.
       */

    run: function () {
        this.launchApp(); // launches Backbone app
        this.listen(); //defines what to listen for in chrome tabs
    },

    launchApp: function() {
        app.tabs = new app.tabsCollection();
        $(document).ready(function () {
            app.tabsView = new app.allTabsView();
            app.details = new app.detailedWindow();
        });
    },

    listen: function () {
        this.listenToClicks();
        this.listenToActive();
        this.listenToUpdates();
    },

    listenToActive: function () {
        // each time a tab becomes active - pass it to our app
        chrome.tabs.onActivated.addListener(function (activeInfo){
            moment = +new Date();
            chrome.tabs.get(activeInfo.tabId, function (tab) {  
                if (tab["status"] == "complete") {
                console.log("!!! >> activated",tab["url"]);   
                app.tabs.enter(tab,moment);
               }
            });
        });
    }, 
    listenToUpdates: function () {
        chrome.tabs.onUpdated.addListener(function (tabId,changeInfo,tab) {
            if (changeInfo["status"] == "complete") {
                console.log("updated", tab["url"]);
                moment = +new Date();
                app.tabs.enter(tab, moment);
            }
        });
    },
    getBase: function () {
        return 0; 
    },
    listenToClicks: function () {
        // When extension icon is clicked open background page with all the scripts and app
        chrome.browserAction.onClicked.addListener(function (tab) {
            url = chrome.extension.getURL('index.html');
            if (chrome.extension.getViews().length > 1) return false;
            chrome.tabs.create({"url":url}, function (tab) {
           
           });
        });
    },
}

/* 
   App proper - receives input from ChromeTabs object and produces output in form of html page.
*/

var app = app || {};

app.tabModel = Backbone.Model.extend({
    initialize: function () {
        //
    },
    validate: function (attrs,options) {
        // called before save
        console.log("called before save",this.get("url"));
    },
    events: {
        "sync": "isSaved",
        "error": "handleError",
    },
    handleErorr: function () {
        console.error("some error while saving");
    },
    isSaved: function () {
        console.log("model is Saved");
    },
    updateDuration: function (moment) {    
        howLongActive = moment - this.get("lastActive");
        this.set("duration",this.get("duration") + howLongActive);
        console.log("duration for tab",this.get("url"),"updated to",this.get("duration"));
    }
});

app.tabsCollection = Backbone.Collection.extend({
    model: app.tabModel,
    localStorage: new Backbone.LocalStorage('tab-store'), 

    initialize: function () {
        console.log("collection initialized");
        if (!DEBUG_TESTING) this.fetch();
        console.log("this.models",this.models.length);
    },

    comparator: "lastActive",
    
    enter: function (tab,moment) {
        console.log("enter:",tab["url"]);
        
        var baseUrl = this.getBase(tab["url"]);
        // update a tab active before this one became active
        // calculate its duration, but do this only if we have some tracked tabs
        if (this.length > 0) {
            previousTwo = this.lastTab[0];
            previousModel = this.findWhere({"url":previousTwo});
            if(previousModel) {
               previousModel.updateDuration(moment);
               previousModel.save();
            } else {
                console.log("previousTwo", previousTwo);
            }
         }

        var isItThere = this.findWhere({"url":baseUrl});
        if(!isItThere) {
            var newOne = this.addOne(tab,moment,baseUrl); 
            if(newOne) {
                newOne.save();
                console.log("tab",newOne.get("url"),"saved");
            }
        } else {
            // tab is in collection, it becomes active
            isItThere.set("lastActive", moment);
            isItThere.save();
        }
        this.lastTab.pop();
        this.lastTab.push(baseUrl);
        console.log("this.lastTab",this.lastTab[0]);
    },
    lastTab: [],
    getBase: function (url) {
        return url.split("/")[2]; // .splice(1,3).join("/")
    },
    isHttp: function (url) {
        return url.indexOf("http") != -1;
    },
    addOne: function (tab,moment,baseUrl) {
        if (!this.isHttp(tab["url"])) {
            return false
        }
        console.log("addOne with tab",baseUrl)
        var tabModel = new app.tabModel(tab);
        tabModel.set("lastActive",moment);
        tabModel.set("duration", 0);
        tabModel.set("url",baseUrl);
        tabModel.set("id",baseUrl);
        this.add(tabModel);
        //this.save();
        console.log("tab, ", tabModel.get('url'),"added");
        return tabModel;
    },
    getLast: function () {
        //console.log("get Last", this.at(this.length-1).get("url"))
        return this.at(this.length-1);
    },
    nukeCollection : function () {
        while (this.models.length > 0) {
            this.at(this.length-1).destroy()
        }
    },
    getTotal: function () {
        var total = 0;
        this.models.forEach(function (mod) {
            total += mod.get('duration');
        });
        return total;
    }
});

app.tabView = Backbone.View.extend({
    tagName: "div",
    initialize: function () {
        this.listenTo(this.model, "change", this.updateView);
    },
    events: {
        "click .more": "showDetails",
        "click .remove": "remove",
    },
    showDetails: function () {
        detail = new app.DetailView({"model":this.makeReadable()});
        detail.render();
    },
    updateView: function () {
        this.render().el;
    },
    remove: function () {
        this.$el.remove(); 
    },
    template: Mustache.compile($("#temp").html()),
    makeReadable: function () {
        //TODO more efficient way of presenting data
        clone = _.clone(this.model.attributes);
        clone["duration"] = Math.floor((clone["duration"]/1000)) + " s";
        clone["lastActive"] = new Date(clone["lastActive"]);
        return clone; 
    }, 
    render: function () {
        //console.log("render in particular view",this.model.toJSON());
        this.$el.html(this.template(this.makeReadable()));
        return this;
    },
});

app.DetailView = Backbone.View.extend({
    id: "viewer",
    template: Mustache.compile($(".detail").html()),
    render: function () {
        console.log("Detailed view render",this.template(this.model));
        element = this.$el.html(this.template(this.model));
        app.details.$el.append(element);
        return this;
    }
});

app.detailedWindow = Backbone.View.extend( {
    el: ".detailed"
})

app.allTabsView = Backbone.View.extend({
    el: '.tabHistory',
    $tabList: $('#tab-list'),
    // cached references to buttons and forms 
    $clear: $('.clear'), 
    $filter: $('.filter'),
    $timeUnit: $('.timeUnit') ,
    $sort: $(".refreshSort"), 
    initialize: function () {
        this.listenTo(app.tabs,"add", this.addOne);
        this.rendered = [];
        if (!this.options.testing) this.renderFetched();
        this.displayTotal();
    }, 
    events: {
        "click .clear": "clear",
        "keyup .filter": "filter",
        "change .timeUnit": "switchTime",
        "change .refreshSort": "refreshSort"
    },     
    clear: function () {
        if (confirm("are you sure you want to clear all items?")) {
            app.tabs.nukeCollection();
            location.reload();
        }
    },
    filter: function () {
        // Fetch input from filter box,
        // query views to see if something matches input,
        // filter views and hide those that do not match input.
        var query = this.$filter.val(); 
        this.$tabList.children().each(function (index,li) {
            // 'this' in jQuery each loop refers to current
            // dom element of the iteration
            if ($(this).text().indexOf(query) == -1) { 
                $(this).hide(3000); 
            } else {
                $(this).show();
            }
        });
    }, 
    switchTime: function () {
       var unitTo = this.$timeUnit.val(), 
       durations = $('.duration'),
       self = this; 
       durations.each(function (index,tabView) {
           var singleDuration = $(this).text().split(" "),
           duration = singleDuration[1], 
           unitFrom = singleDuration[2],
           result = self.convertTime(unitFrom,unitTo,duration);
       }); 
    },
    convertTime: function (unitFrom,unitTo,duration) {
        // TODO fast and efficient time conversion
        var timeMap = {};   
    },
    refreshSort: function () {
        // TODO resort tabs according to user input (lastActive,duration,alphabetically)
        // 1. loop over all already rendered views
        // 2. get reference to their models
        // 3. sort them on the basis of given model attribute
        // 4. remove all
        // 5. render again according to newly sorted this.rendered
        var dictio = {"Last active": 'lastActive', 'Most visited':'duration',
            'Alphabetically':'url'};
        var criterium = dictio[this.$sort.val()];
        console.log(criterium);
        _.each(this.rendered, function (visibleView) {
            visibleView.remove();
        }, this);
        console.log("about to sort views");
        this.sortViews(criterium);
        _.each(this.rendered, function (view) {
            this.$tabList.append(view.render().el);
        }, this);
    },
    sortViews: function (criterium) {
        if (["duration","url","lastActive"].indexOf(criterium) == -1) {
            throw 'incorrect sort criterium supplied: "' + criterium + '"!' ;
        }
        this.rendered.sort(function (one,two) {
            return two.model.get(criterium) - one.model.get(criterium);
        })
    },
    addOne: function (tabModel) {
        // Takes a model (not a view) 
        // turns it into view, pushes to array of views
        // appends to DOM.
        var view = new app.tabView({model:tabModel});
        this.rendered.push(view);    
        this.$tabList.append(view.render().el);
    },
    renderFetched: function () {
        // displays all models
        app.tabs.models.forEach(function (model) {
            this.addOne(model);
        }, this);
    },
    displayTotal: function () {
        $('.total').append(app.tabs.getTotal()/1000/60/60 + " hours");
    }, 
});

DEBUG_TESTING = false;
ChromeTabs.run();
