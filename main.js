$(function () {
	var content = $('.content'); 

	chrome.tabs.query({}, function (tabs) {
		data = tabs.filter(function (tab) {
			return tab["url"].indexOf("http") != -1;
		}).map(function (tab) {
			return tab['url'].split("/")[2]
		})
		toShow = "<ul>";
		data.forEach(function (url) {
			toShow += "<li>";
			toShow += url;
			toShow += "</li>";
		})
		content.append(toShow)		
	})

	chrome.tabs.onCreated.addListener(function (tab) {
		chrome.tabs.onUpdated.addListener(function (tabId,changeInfo,tab) {
			if (changeInfo["status"] == "complete") {
				date = new Date()
				content.append("<li>"+tab["url"]+date"</li>");
			};
		});
	});

	chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab) {
		if (changeInfo["status"] == "complete") {
			content.append("<li>"+tab["url"]+"</li>")
		}
	})
})