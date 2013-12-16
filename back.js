$(function () {  
  ChromeTabs.run()
});

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
    app.tabsView = new app.allTabsView();
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
      chrome.tabs.create({"url":url})
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
    // console.log("fix domain",this.get('url'));
    this.set("url", this.get("url").split("/")[2]);
  },
  updateDuration: function (moment) {    
    howLongActive = moment - this.get("lastActive");
    this.set("duration",this.get("duration") + howLongActive)
   // console.log("duration for tab",this.get("url"),"updated to",this.get("duration"))
  }
});

app.tabsCollection = Backbone.Collection.extend({
  model: app.tabModel,
  localStorage: new Backbone.LocalStorage('tab-store'), 
  
  initialize: function () {

  },

  comparator: "lastActive",
  
  enter: function (tab,moment) {
    console.log(">>>>>>>> enter",tab["url"])
    newTab = new app.tabModel(tab);
    this.sort()

    // update a tab active before this one became active
    // calculate its duration, but do this only if we have some tracked tabs
    if (this.length > 0) this.getLast().updateDuration(moment)
    
    // if not http stop right there
    if (!newTab.checkIfHttp()) return false;
    
    //console.log(this.isTracked(newTab),'is it tracked result')
    // if not tracked start tracking it; add it to collection
    newTab.fixDomain();
    if(!this.isTracked(newTab)) this.addOne(newTab,moment);  

    // tab is in collection, it becomes active
    this.get(tab["id"]).set("lastActive", moment);
  },
  isTracked: function (newTab) {
    var tracked = false;
    //console.log("isTracked tabModel", tabMod.get('url'));
    this.models.forEach(function (model) {
        if (newTab.get('url') == model.get("url")) {
            console.log("same url is tracked", model.get("url"));
            tracked = true;
        };
    }); 
    return tracked;

   // console.log("candidate", cand.get('url'));

  },
  addOne: function (tabModel,moment) {
    //tabModel.fixDomain();
    tabModel.set("lastActive",moment);
    tabModel.set("duration", 0);
   // tabModel.fixDomain();
    this.add(tabModel);
    console.log("tab, ", tabModel.get('url'),"added")
  },
  getLast: function () {
    //console.log("get Last", this.at(this.length-1).get("url"))
    return this.at(this.length-1)
  }, 
});

app.tabView = Backbone.View.extend({
  tagName: "li",
  template: Mustache.compile($("#temp").html()),
  render: function () {
    //console.log("render in particular view",this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});

app.allTabsView = Backbone.View.extend({
  el: '#tab-list',
  initialize: function () {
    this.listenTo(app.tabs,"add",this.addOne);
  }, 
  addOne: function (tabModel) {
    //console.log("render one")
    var view = new app.tabView({model:tabModel});
    this.$el.append(view.render().el);
  }
});
