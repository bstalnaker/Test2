// scripts.js;
// students_wc.js

(function ($) {

// main menu - right nav
//------------------------------------------------------------------------------
Drupal.behaviors.studentMainNav = {
  attach: function (context, settings) {
    var context = $('.block-menu-block-students-nav');

    // MY CAMPUS - RIGHT SIDEBAR MENU
    // add menu expanding trigger links
    $('li.expanded a', context).not($('li.expanded ul li a', context)).each(function(i){
      $(this).parent('li').prepend('<a class="menu-more" href="">›</a>');
    });
  
    // SHOWING AND HIDING BLOCK MENU CHILDREN
    $('li.expanded a.menu-more', context).not($('li.expanded.active-trail a.menu-more', context)).click(
      function(){
        $(this).parent('li').find('ul.menu').not($('ul.menu ul.menu ul.menu')).slideToggle('slow');
        $(this).parent('li').toggleClass('open');
        return false;
      }
    );
    // ALLOW ALREADY EXPANDED (active-trail) ELEMENTS TO COLLAPSE
    $('li.expanded.active-trail a.menu-more', context).click(
      function(){
      $(this).parent('li').find('ul.menu').not($('ul.menu ul.menu ul.menu')).slideToggle('slow');
      $(this).parent('li').toggleClass('closed');
      return false;
      }
    );

  }
}

// student programs nav block
//------------------------------------------------------------------------------
Drupal.behaviors.programsNav = {
  attach: function (context, settings) {
    var context = $('#block-psu-student-program-student-program-menu');
    // STUDENT PROGRAMS NAV
    // add menu expanding trigger links
    $('.block-title', context).append('<span class="menu-more" href="">›</span>').addClass('open');
    $('.block-title', context).click(
      function(){
        $('.block-content', context).slideToggle('slow');
        $(this).toggleClass('open');
      }
    );
  
  }
}

// homepage block titles
//------------------------------------------------------------------------------
Drupal.behaviors.homeBlocks = {
  attach: function (context, settings) {
 
    // homepage blocks need first word spans
    $('.front .block-psu-students-blocks-home-community h3.block-title').firstwordSpantastic();
    // homepage blocks need first word spans
    $('.front .block-aggregator-feed-1 h3.block-title').first2wordsSpantastic();
  
  }
}

// function to wrap first word of a THING in a span tag
// NOTE - ie bug - if the content you apply this to contains HTML 
// IE will not render properly. only use on plain text
$.fn.firstwordSpantastic = function(){
  return this.each(function(){
    if(typeof $(this).text != "undefined"){
      var text = $(this).html();
      var wordarr = text.split(" ");
      wordarr[0] = '<span>' + wordarr[0] + '</span>';
      $(this).html(wordarr.join(" "));
      $(this).addClass("title-fancy");
    }
  });
}

// function to wrap first 2 words of a THING in a span tag
// this is slightly dumb but the comps require it
$.fn.first2wordsSpantastic = function(){
  return this.each(function(){
    if(typeof $(this).text != "undefined"){
      var text = $(this).html();
      var wordarr = text.split(" ");
      wordarr[0] = '<span>' + wordarr[0];
      wordarr[1] = wordarr[1] + '</span> ';
      $(this).html(wordarr.join(" "));
      $(this).addClass("title-fancy");
    }
  });
}

})(jQuery);;
