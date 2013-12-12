$(function (){
  var display = $('.chart');
  var topPages = [];
  count = 0;
  chrome.history.search({"text":"", "maxResults":10000},function (histPages) {
    histPages.forEach(function (page) {
      count += 1
      topPages.push([page,page.visitCount])
    });
    topPages.sort(function (a,b) {return b[1] - a[1]});
    
    topTen = Array.prototype.splice.call(topPages,0,30);
    message = ""
    data = []
    topTen.forEach(function (page) {
      siteDesc = "<li>";
      siteDesc += page[0].title + page[1];
      //console.log(page[0].title,page[1]);
      siteDesc += "</li>\n";
      message += siteDesc
      data.push(page[1])
    })

       var chart = d3.select('.chart');
    console.log(chart);
    chartData = chart.selectAll("div").data(topTen);
    console.log(chartData);
    styled = chartData.enter().append("div").style("width", function(dat) { 
      console.log(dat[1])
      return x(dat[1]) + "px";
    })
    texted = styled.text(function(d){ return d[0].url
  })
});


