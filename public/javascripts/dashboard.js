var IATI = IATI || {};

(function(IATI, $, _){
  var storage = window.localStorage,
      data = [];
  
  /* Data Format
  [{
    href:'/some/content/endpoint',
    key:'activities',
    subkey:'My USA AID Activities'
  },{
    href:'/some/content/endpoint.df',
    key:'datafile'
  }]
  */
  
  function persist(){
    storage.setItem('dashboard', JSON.stringify(data));
  }
  
  function fetch(){
    data = JSON.parse(storage.getItem('dashboard')) || [];
  }
  fetch();
  
  // see if a url is in any of the sections of the dashboard
  function contains(url){
    return _.any(data, function(part){
      return part.href == url;
    });
  }
  
  
  //public interface
  IATI.dashboard = {
    data:data,
    clear:function(){
      data = [];
      persist();
    },
    add:function(key, url){
      this.aadd({
        href:url,
        key:key
      });
    },
    aadd:function(obj){
      data.push(obj);
      persist();
    },
    subkeysFor:function(key){
      return _(data).chain().filter(function(d){
        return d.key == key;
      }).pluck('subkey').uniq().value();
    },
    get:function(key){
      return _.filter(data,function(d){
        return d.key == key;
      });
    },
    contains:contains
  };
  
  
  // jQuery helper to put the content in the dashboard page
  $.fn.dashboardContent = function(){
    var $this = this;
    _.each(data, function(d){
      var section = $this.find('section.' + d.key + ' .content');
      
      var widget = $('<li class="widget">');
      widget.appendTo(section);
      $('<iframe>', {
        src: d.href,  frameborder: 0, scrolling: "no",
        css: {width: widget.width(), height: widget.height()}
      }).appendTo(widget);
    });
  };
  
  //update the class based on if this is on the dashboard
  $.fn.favourite = function(){
    return this.each(function(){
      var $this = $(this);
      var href = $this.data('dash') ? 
        $this.data('dash').href :
        $this.attr('href');
      
      $this.toggleClass('added', contains(href));
    });
  };
  
  
  var subkeyChoiceTmpl = '<ol><li><form><input type="text" name="groupname"/><input type="submit" value="create"/></form></li></ol>';
  
  $('[data-dash]').live('click', function(e){
    e.preventDefault();
    
    var _data = _.clone($(this).data('dash'));
    
    if(_data.subkey === false){
      //subkey required, display dialog
      
      var content = $(subkeyChoiceTmpl);
      
      
      // add in the sub keys
      //find the sub keys
      _.each(IATI.dashboard.subkeysFor(_data.key), function(subkey){
        var k = $('<li>').text(subkey);
        k.click(function(){
          _data.subkey = subkey;
          IATI.dashboard.aadd(_data);
          
          $.iatiDialog('added');
        });
        content.prepend(k);
      });
      
      
      content.find('form').submit(function(e){
        e.preventDefault();
        
        // get the input text, and create a subkey
        var subkey = content.find('input').val();
        if(subkey === '') return;
        
        _data.subkey = subkey;
        
        IATI.dashboard.aadd(_data);
        
        $.iatiDialog('added');
        
      });
      
      $.iatiDialog("Add to group",content);
      
      
    } else {
      // add to the dashboard
      $.iatiDialog("Add to favourites","added to dashboard");
      
      IATI.dashboard.aadd(_data);
      
    }
    
    console.log(_data);
  });
  
  /*
  $('.favouritex').live('click', function(e){
    e.preventDefault();
    var $this = $(this);
    
    var key = $this.data('dashkey');
    var type = $this.data('dashtype') || 'iframe';
    
    if(key == 'activities'){
      //choose a subgroup
      
      
    } else {
      // just assign it
      
      IATI.dashboard.add($this.data('dashkey'), $this.attr('href'));

      $this.addClass('added');
    }
    
    
      var c = $('<ol><li><a href="#">Group one</a></li><li><a href="#">Group two</a></li><li><input type="text" name="groupname"/><button>create</button></li></ol>');
      $.iatiDialog("Add to favourites…",c)
    
    
  });*/
  
})(IATI, jQuery, _);

