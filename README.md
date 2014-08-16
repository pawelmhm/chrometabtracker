Chrome History Tracker
======================

Google chrome extension which tracks all browsing activity in chrome and stores data in localstorage.
If you're curious how much time you spend browsing or how much time you spent on each site you visit, then you're in for a treat. 
Displays all the data it gathers at separate page, which can be accessed by simply clicking on chrome extension icon. It counts total time of browsing for each day, and total time browsing for each page.   

Created with [Backbone](http://backbonejs.org/), mostly as exercise in JavaScript MVC framework. Tests are written in [Jasmine](http://pivotal.github.io/jasmine/), they are run when you access separate extension page, tests.html.

Results are displayed in nice way with [Twitter Bootstrap 3.0](http://getbootstrap.com/), you can sort results and filter them as you see fit, sorting from most visited to least visited or most recently active however are the most important options.  

How it works
------------
There is one object Chrometabs which runs in the background and listens to events on chrome tabs, if a tab becomes active or updated (url changed) then the data 
is passed to backbone app. App collection parses the data, checks if the url is tracked or not, updates previous active tab, and handles all the procedures necessary. Most importantly it creates appropriate models when it detects that you entered a new unknown territory (untracked url). As for displaying the data, when the extension icon is clicked, document.ready event fires and the views displaying all the activity is loaded into browser. Views listen to models, so the page is automatically updated when something happens. 

All the data is stored locally, nothing is sent to the server, extension does not ask for permission to make XmlHTTP requests. 

TODO
----
Visualization of all data with d3.js is under way. 

License 
-------
MIT license
