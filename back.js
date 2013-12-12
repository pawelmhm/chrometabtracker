var app = app || {};

app.tabModel = Backbone.Model.extend({
	defaults: {
		"id": 0,
		'index':0,
		'active':false,
		'url':""
	},
	initialize: function () {
		//this["domain"] = this.getDomain()
		this.set("url", this.getDomain())
		console.log(this.get("url"))
	},
	validate: function (attrs,options) {
		// called before save
		console.log("model valid",this.attributes)
	},
	getDomain: function (url) {
		// returns domain name, without subpages
		return this.get("url").split("/")[2]
	},
	checkHttp:function (url) {
		// if url is http return true
		return true
		//return this.get("url").indexOf("http") != -1;
	}
});

app.ChromeTabs = Backbone.Collection.extend({
	/* 
	listens to changes on browser's tabs, launches proper functions of our app. 
	*/
	initialize: function () {
		self = this
		chrome.tabs.onUpdated.addListener(function (tabId,changeInfo,tab) {
			self.handleUpdate(tabId,changeInfo,tab)
		});
  		chrome.tabs.onCreated.addListener(function (tab) {
  			chrome.tabs.onUpdated.addListener(function (tabId,changeInfo,tab) {
  				self.handleUpdate(tabId,changeInfo,tab)
  			})
  		});
	}, 
	handleUpdate: function (tabId,changeInfo,tab) {
		// gets a tab from chrome, turns it into backbone model, and adds it
		// to our collection (of course only if tab is fully loaded == status complete)
		if (changeInfo["status"] != "complete") return false;
		
		// ... and it's not yet in collection
		newTab = new app.tabModel(tab)
		if (newTab.checkHttp()) app.tabs.add(newTab)	  		
	}
})

app.tabsCollection = Backbone.Collection.extend({
  model: app.tabModel,
  localStorage: new Backbone.LocalStorage('tab-store'), 
  initialize: function () {
  	this.on("add",function (tab) {
  		console.log("logging it!",tab)
  	})
  },
  logger: function () {
  	console.log("logger run")
  },
  parseTabs: function (tabId,changeInfo,tab) {
  	console.log("parse tabs", tab);
  	if (!tab) { console.error("no tab here")};

  },
  newTab: function (tab) {
  	console.log("newTab",tab)
  }
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

$(function () {  
  app.tabs = new app.tabsCollection();
  app.tabsView = new app.allTabsView();
  app.chromeTabs = new app.ChromeTabs()
  //some = new app.tabModel({"url":"none"})
  //some.validate()
  //app.tabs.add({'tabUrl':"nothing"});
});