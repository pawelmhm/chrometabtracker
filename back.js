var ChromeTabs = {
  /* 
  - Launches app,
  - listens to changes on browser's tabs, 
  - passes data to app.
  */

  run: function () {
    this.launchApp() // launches Backbone app
    this.listen() //defines what to listen for in chrome tabs
  },

  launchApp: function() {
    app.tabs = new app.tabsCollection();
    $(document).ready(function () {
        app.tabsView = new app.allTabsView();
        app.details = new app.detailedWindow();
    })
  },

  listen: function () {
    this.listenToClicks();
    this.listenToActive();
  },

  listenToActive: function () {
    // each time a tab becomes active - pass it to our app
    chrome.tabs.onActivated.addListener(function (activeInfo){
      moment = +new Date();
      chrome.tabs.get(activeInfo["tabId"], function (tab) {  
        app.tabs.enter(tab,moment);
      })
    })
  }, 

  listenToClicks: function () {
    // When extension icon is clicked open background page with all the scripts and app
    chrome.browserAction.onClicked.addListener(function (tab) {
        url = chrome.extension.getURL('index.html');
        if (chrome.extension.getViews().length > 1) return false;
        chrome.tabs.create({"url":url}, function (tab) {
        })
    })
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

  },
  checkIfHttp:function () {
    //console.log("checkIfHttp",this.get("url"))
    return this.get("url").indexOf("http") != -1;
  },
  fixDomain: function () {
    // returns domain name, without subpages
    this.set("url", this.get("url").split("/")[2]);
  },
  updateDuration: function (moment) {    
    howLongActive = moment - this.get("lastActive");
    this.set("duration",this.get("duration") + howLongActive)
    console.log("duration for tab",this.get("url"),"updated to",this.get("duration"))
  }
});

app.tabsCollection = Backbone.Collection.extend({
  model: app.tabModel,
  localStorage: new Backbone.LocalStorage('tab-store'), 
  
  initialize: function () {
    console.log("collection initialized");
    this.fetch();
    console.log("this.models",this.models.length);
  },

  comparator: "lastActive",
  
  enter: function (tab,moment) {
    newTab = new app.tabModel(tab);
    //console.log(">>>>>>>> enter",newTab.get("url"),newTab.get('lastActive'))
    this.sort()

    // update a tab active before this one became active
    // calculate its duration, but do this only if we have some tracked tabs
    if (this.length > 0) {
        this.getLast().updateDuration(moment);
        this.getLast().save();
    }
    
    // if not http stop right there
    if (!newTab.checkIfHttp()) return false;
    
    //console.log(this.isTracked(newTab),'is it tracked result')
    // if not tracked start tracking it; add it to collection
    newTab.fixDomain();
    if(!this.isTracked(newTab)) this.addOne(newTab,moment);  

    // tab is in collection, it becomes active
    this.findWhere({"url":newTab.get("url")}).set("lastActive", moment).save();
  },

  isTracked: function (newTab) {
    var tracked = false;
    this.models.forEach(function (model) {
        if (newTab.get('url') == model.get("url")) {
            tracked = true;
        };
    }); 
    return tracked;
  },

  addOne: function (tabModel,moment) {
    tabModel.set("lastActive",moment);
    tabModel.set("duration", 0);
    this.add(tabModel);
    tabModel.save();
    console.log("tab, ", tabModel.get('url'),"added")
  },
  getLast: function () {
    //console.log("get Last", this.at(this.length-1).get("url"))
    return this.at(this.length-1)
  },
  nukeCollection : function () {
    while (this.models.length > 0) {
        this.at(this.length-1).destroy();
    };
  }
});

app.tabView = Backbone.View.extend({
  tagName: "div",
  initialize: function () {
    this.listenTo(this.model, "change", this.updateView);
  },
  events: {
    "click .more": "showDetails",
  },
  showDetails: function () {
    detail = new app.DetailView({"model":this.makeReadable()});
    te = detail.render();
  },
  updateView: function () {
      this.render().el;
  }, 
  template: Mustache.compile($("#temp").html()),
  makeReadable: function () {
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
        console.log("Detailed view render",this.template(this.model))
        element = this.$el.html(this.template(this.model))
        //app.tabsView.$el.append(element); 
        app.details.$el.append(element)
        //document.body.style.backgroundColor = "black";
        return this
    }
});

app.detailedWindow = Backbone.View.extend( {
    el: ".detailed"
})

app.allTabsView = Backbone.View.extend({
  el: '#tab-list',
  initialize: function () {
    this.listenTo(app.tabs,"add",this.addOne);
    this.renderFetched();
  }, 
  addOne: function (tabModel) {
    //console.log("render one")
    var view = new app.tabView({model:tabModel});
    this.$el.append(view.render().el);
  },
  renderFetched: function () {
    app.tabs.models.forEach(function (model) {
        this.addOne(model);
    }, this);
  }
});

ChromeTabs.run()
