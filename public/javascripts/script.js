//Colour palette for activity bubbles
var palette = [
  {colour: '#3366FF', text: '#fff'},
  {colour: '#6633FF', text: '#fff'},
  {colour: '#CC33FF', text: '#fff'},
  {colour: '#FF33CC', text: '#fff'},
  {colour: '#33CCFF', text: '#fff'},
  {colour: '#003DF5', text: '#fff'},
  {colour: '#002EB8', text: '#fff'}
];

(function() {

  var content = $("#content");
  var popup = $("#popup");
  var dimmer = $("#dimmer");
  var embed = $("#embed");
  var dimmed = false;
  query = window.location.search.replace(/^\?/, "");
  var activeChange = false;
  var cacheBugFix = function(xhr, settings) { settings.url = settings.url.replace("?&", "?"); };
  //This calls all of the inline scripts, set on page/dynamic content load
  var runInlines = function() { while(inlines.length) { inlines.pop()(); } }
  
  //Dim the page when requested
  dimmer.click(function() {
    if (dimmed) {
      embed.addClass("hidden");
      dimmer.fadeOut(180);
      dimmed = false;
    }
  });
  
  $(".widget").each(function() {
    var widget = $(this);
    widget.find(".save").click(function() {
      dimmer.fadeIn(180, function() { 
        embed.removeClass("hidden");
        embed.children(".widget").empty().append(widget.children(".content").clone());
        dimmed = true; 
      });
    });
  });
  
  //Monitor state changes for Back request
  window.History.Adapter.bind(window,'statechange',function() {
    var State = window.History.getState(),
        url = State.url;
    
    //Add the xhr param (allows for caching + doesn't clash with 'full' pages)
    var separator = State.url.indexOf('?') == -1 ? '?' : '&';
    url += separator + 'xhr=true';
    
    //jQuery Cache bug fix
    url = url.replace("?&", "?");
    
    $('#content_inner').load(url, function(){
      if(State.data.enter == 'slideUp'){
        $(this).css('margin-top',600).animate({'margin-top':0});
      }
      runInlines();
    });
  });
  
  //Callback for when a filter is opened
  var filterLoaded = function(html) {
    popup.html(html);
    popup.removeClass("hidden");
    popup.css("left", content.outerWidth()/2 - popup.outerWidth()/2);
    popup.css("top", content.outerHeight()/2 - popup.outerHeight()/2);
    popup.find("form.filter").submit(function(e){
      e.preventDefault();
      var $form = $(this);
      var url = $form.attr('action') + '?' + $form.serialize();
      
      window.History.pushState(null, null, url);
      
      popup.addClass("hidden");
    });
  };

  $("a.filter").click(function(e) {
    $.ajax({
      url: $(this).attr("href"),
      type: 'get',
      dataType: 'html', 
      success: filterLoaded
    });
    return false;
  });
  
  $('a.xhr').live('click', function(e) {
    e.preventDefault();
    var $this = $(this);
    window.History.pushState($this.data('history'), "", $this.attr('href'));
  });
  
  $(".activity_wrapper").each(function() {
    var activityWrapper = $(this);
    activityWrapper.width($("#content").width()).height($("#content").height() - 230);
    var activities = activityWrapper.children(".activities").children(".activity");
    var content = activities.find(".content");

    activities.scaleValues({min: 100, max: 250});
    
    activityWrapper.activityZoom({
      transition2d: false,
      afterZoom: function(zoom, zoomed) {
        var min = Math.round(11 / zoom);
        var filter = zoomed > 0 ? ".truncated" : function() { return parseInt($(this).css("font-size"), 10) < min; };
        content.filter(filter).fitText('circular', {font: {min: min, max: 25}});
      },
      onResize: function() {
        activityWrapper.width($("#content").width()).height($("#content").height() - 230);
      }
    });
  });
  
  $(runInlines);

})();