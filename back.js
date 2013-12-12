var app = app || {};

app.tabModel = Backbone.Model.extend({
	defaults: {
		"id": 0,
		'index':0,
		'active':false,
		'url':""
	}
});

app.tabsCollection = Backbone.Collection.extend({
  model: app.tabModel,
  localStorage: new Backbone.LocalStorage('tab-store'), 
  initialize: function () {
  	this.on("add",function () {
  		console.log("logging it!")
  	}),
  	chrome.tabs.onUpdated.addListener(this.parseTabs);
  	chrome.tabs.onCreated.addListener(this.newTab);
  },
  logger: function () {
  	console.log("logger run")
  },
  parseTabs: function (tabId,changeInfo,tab) {
  	console.log(changeInfo["status"])
  },
  newTab: function (tab) {
  	console.log(tab["url"])
  }
});


app.tabView = Backbone.View.extend({
  tagName: "li",
  template: Mustache.compile($("#temp").html()),
  render: function () {
    console.log("render in particular view",this.model.toJSON());
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
  	console.log("render one")
    var view = new app.tabView({model:tabModel});
    this.$el.append(view.render().el);
  }
});

$(function () {  
  app.tabs = new app.tabsCollection();
  app.tabsView = new app.allTabsView();
  app.tabs.add({'tabUrl':"nothing"});
});