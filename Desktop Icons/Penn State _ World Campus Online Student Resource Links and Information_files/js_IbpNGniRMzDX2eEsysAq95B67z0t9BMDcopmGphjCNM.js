(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
/*!
 * FooTable - Awesome Responsive Tables
 * http://themergency.com/footable
 *
 * Requires jQuery - http://jquery.com/
 *
 * Copyright 2012 Steven Usher & Brad Vincent
 * Released under the MIT license
 * You are free to use FooTable in commercial projects as long as this copyright header is left intact.
 *
 * Date: 18 Nov 2012
 */
(function(d,a,f){a.footable={options:{delay:100,breakpoints:{phone:480,tablet:1024},parsers:{alpha:function(g){return d(g).data("value")||d.trim(d(g).text())}},toggleSelector:" > tbody > tr:not(.footable-row-detail)",createDetail:function(h,j){for(var g=0;g<j.length;g++){h.append("<div><strong>"+j[g].name+"</strong> : "+j[g].display+"</div>")}},classes:{loading:"footable-loading",loaded:"footable-loaded",sorted:"footable-sorted",descending:"footable-sorted-desc",indicator:"footable-sort-indicator"},debug:false},version:{major:0,minor:1,toString:function(){return a.footable.version.major+"."+a.footable.version.minor},parse:function(g){version=/(\d+)\.?(\d+)?\.?(\d+)?/.exec(g);return{major:parseInt(version[1])||0,minor:parseInt(version[2])||0,patch:parseInt(version[3])||0}}},plugins:{_validate:function(g){if(typeof g.name!=="string"){if(a.footable.options.debug==true){console.error('Validation failed, plugin does not implement a string property called "name".',g)}return false}if(!d.isFunction(g.init)){if(a.footable.options.debug==true){console.error('Validation failed, plugin "'+g.name+'" does not implement a function called "init".',g)}return false}if(a.footable.options.debug==true){console.log('Validation succeeded for plugin "'+g.name+'".',g)}return true},registered:[],register:function(h,g){if(a.footable.plugins._validate(h)){a.footable.plugins.registered.push(h);if(g!=f&&typeof g==="object"){d.extend(true,a.footable.options,g)}if(a.footable.options.debug==true){console.log('Plugin "'+h.name+'" has been registered with the Foobox.',h)}}},init:function(g){for(var h=0;h<a.footable.plugins.registered.length;h++){try{a.footable.plugins.registered[h]["init"](g)}catch(j){if(a.footable.options.debug==true){console.error(j)}}}}}};var c=0;d.fn.footable=function(g){g=g||{};var h=d.extend(true,{},a.footable.options,g);return this.each(function(){c++;this.footable=new e(this,h,c)})};function b(){var g=this;g.id=null;g.busy=false;g.start=function(i,h){if(g.busy){return}g.stop();g.id=setTimeout(function(){i();g.id=null;g.busy=false},h);g.busy=true};g.stop=function(){if(g.id!=null){clearTimeout(g.id);g.id=null;g.busy=false}}}function e(i,j,l){var k=this;k.id=l;k.table=i;k.options=j;k.breakpoints=[];k.breakpointNames="";k.columns={};var h=k.options;var g=h.classes;k.timers={resize:new b(),register:function(m){k.timers[m]=new b();return k.timers[m]}};a.footable.plugins.init(k);k.init=function(){var o=d(a),n=d(k.table);if(n.hasClass(g.loaded)){k.raise("footable_already_initialized");return}n.addClass(g.loading);n.find("> thead > tr > th, > thead > tr > td").each(function(){var q=k.getColumnData(this);k.columns[q.index]=q;var p=q.index+1;var r=n.find("> tbody > tr > td:nth-child("+p+")");if(q.className!=null){r.not(".footable-cell-detail").addClass(q.className)}});for(var m in h.breakpoints){k.breakpoints.push({name:m,width:h.breakpoints[m]});k.breakpointNames+=(m+" ")}k.breakpoints.sort(function(q,p){return q.width-p.width});k.bindToggleSelectors();k.raise("footable_initializing");n.bind("footable_initialized",function(p){k.resize();n.removeClass(g.loading);n.find('[data-init="hide"]').hide();n.find('[data-init="show"]').show();n.addClass(g.loaded)});o.bind("resize.footable",function(){k.timers.resize.stop();k.timers.resize.start(function(){k.raise("footable_resizing");k.resize();k.raise("footable_resized")},h.delay)});k.raise("footable_initialized")};k.bindToggleSelectors=function(){var m=d(k.table);m.find(h.toggleSelector).unbind("click.footable").bind("click.footable",function(o){if(m.is(".breakpoint")){var n=d(this).is("tr")?d(this):d(this).parents("tr:first");k.toggleDetail(n.get(0))}})};k.parse=function(m,n){var o=h.parsers[n.type]||h.parsers.alpha;return o(m)};k.getColumnData=function(p){var o=d(p),n=o.data("hide");n=n||"";n=n.split(",");var q={index:o.index(),hide:{},type:o.data("type")||"alpha",name:o.data("name")||d.trim(o.text()),ignore:o.data("ignore")||false,className:o.data("class")||null};q.hide["default"]=(o.data("hide")==="all")||(d.inArray("default",n)>=0);for(var m in h.breakpoints){q.hide[m]=(o.data("hide")==="all")||(d.inArray(m,n)>=0)}var r=k.raise("footable_column_data",{column:{data:q,th:p}});return r.column.data};k.getViewportWidth=function(){return window.innerWidth||(document.body?document.body.offsetWidth:0)};k.getViewportHeight=function(){return window.innerHeight||(document.body?document.body.offsetHeight:0)};k.hasBreakpointColumn=function(m){for(var n in k.columns){if(k.columns[n].hide[m]){return true}}return false};k.resize=function(){var n=d(k.table);var s={width:n.width(),height:n.height(),viewportWidth:k.getViewportWidth(),viewportHeight:k.getViewportHeight(),orientation:null};s.orientation=s.viewportWidth>s.viewportHeight?"landscape":"portrait";if(s.viewportWidth<s.width){s.width=s.viewportWidth}if(s.viewportHeight<s.height){s.height=s.viewportHeight}var t=n.data("footable_info");n.data("footable_info",s);if(!t||((t&&t.width&&t.width!=s.width)||(t&&t.height&&t.height!=s.height))){var r=null,m;for(var p=0;p<k.breakpoints.length;p++){m=k.breakpoints[p];if(m&&m.width&&s.width<=m.width){r=m;break}}var o=(r==null?"default":r.name);var q=k.hasBreakpointColumn(o);n.removeClass("default breakpoint").removeClass(k.breakpointNames).addClass(o+(q?" breakpoint":"")).find("> thead > tr > th").each(function(){var v=k.columns[d(this).index()];var u=v.index+1;var w=n.find("> tbody > tr > td:nth-child("+u+"), > tfoot > tr > td:nth-child("+u+"), > colgroup > col:nth-child("+u+")").add(this);if(v.hide[o]==false){w.show()}else{w.hide()}}).end().find("> tbody > tr.footable-detail-show").each(function(){k.createOrUpdateDetailRow(this)});n.find("> tbody > tr.footable-detail-show:visible").each(function(){var u=d(this).next();if(u.hasClass("footable-row-detail")){if(o=="default"&&!q){u.hide()}else{u.show()}}});k.raise("footable_breakpoint_"+o,{info:s})}};k.toggleDetail=function(p){var m=d(p),o=k.createOrUpdateDetailRow(m.get(0)),n=m.next();if(!o&&n.is(":visible")){m.removeClass("footable-detail-show");n.hide()}else{m.addClass("footable-detail-show");n.show()}};k.createOrUpdateDetailRow=function(s){var m=d(s),n=m.next(),q,o=[];if(m.is(":hidden")){return}m.find("> td:hidden").each(function(){var t=k.columns[d(this).index()];if(t.ignore==true){return true}o.push({name:t.name,value:k.parse(this,t),display:d.trim(d(this).html())})});var r=m.find("> td:visible").length;var p=n.hasClass("footable-row-detail");if(!p){n=d('<tr class="footable-row-detail"><td class="footable-cell-detail"><div class="footable-row-detail-inner"></div></td></tr>');m.after(n)}n.find("> td:first").attr("colspan",r);q=n.find(".footable-row-detail-inner").empty();h.createDetail(q,o);return !p};k.raise=function(m,n){n=n||{};var o={ft:k};d.extend(true,o,n);var p=d.Event(m,o);if(!p.ft){d.extend(true,p,o)}d(k.table).trigger(p);return p};k.init();return k}})(jQuery,window);;
(function ($) {

/**
 * Retrieves the summary for the first element.
 */
$.fn.drupalGetSummary = function () {
  var callback = this.data('summaryCallback');
  return (this[0] && callback) ? $.trim(callback(this[0])) : '';
};

/**
 * Sets the summary for all matched elements.
 *
 * @param callback
 *   Either a function that will be called each time the summary is
 *   retrieved or a string (which is returned each time).
 */
$.fn.drupalSetSummary = function (callback) {
  var self = this;

  // To facilitate things, the callback should always be a function. If it's
  // not, we wrap it into an anonymous function which just returns the value.
  if (typeof callback != 'function') {
    var val = callback;
    callback = function () { return val; };
  }

  return this
    .data('summaryCallback', callback)
    // To prevent duplicate events, the handlers are first removed and then
    // (re-)added.
    .unbind('formUpdated.summary')
    .bind('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    })
    // The actual summaryUpdated handler doesn't fire when the callback is
    // changed, so we have to do this manually.
    .trigger('summaryUpdated');
};

/**
 * Sends a 'formUpdated' event each time a form element is modified.
 */
Drupal.behaviors.formUpdated = {
  attach: function (context) {
    // These events are namespaced so that we can remove them later.
    var events = 'change.formUpdated click.formUpdated blur.formUpdated keyup.formUpdated';
    $(context)
      // Since context could be an input element itself, it's added back to
      // the jQuery object and filtered again.
      .find(':input').andSelf().filter(':input')
      // To prevent duplicate events, the handlers are first removed and then
      // (re-)added.
      .unbind(events).bind(events, function () {
        $(this).trigger('formUpdated');
      });
  }
};

/**
 * Prepopulate form fields with information from the visitor cookie.
 */
Drupal.behaviors.fillUserInfoFromCookie = {
  attach: function (context, settings) {
    $('form.user-info-from-cookie').once('user-info-from-cookie', function () {
      var formContext = this;
      $.each(['name', 'mail', 'homepage'], function () {
        var $element = $('[name=' + this + ']', formContext);
        var cookie = $.cookie('Drupal.visitor.' + this);
        if ($element.length && cookie) {
          $element.val(cookie);
        }
      });
    });
  }
};

})(jQuery);
;

(function($) {

/**
 * Drupal FieldGroup object.
 */
Drupal.FieldGroup = Drupal.FieldGroup || {};
Drupal.FieldGroup.Effects = Drupal.FieldGroup.Effects || {};
Drupal.FieldGroup.groupWithfocus = null;

Drupal.FieldGroup.setGroupWithfocus = function(element) {
  element.css({display: 'block'});
  Drupal.FieldGroup.groupWithfocus = element;
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processFieldset = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.fieldset', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $('legend span.fieldset-legend', $(this)).eq(0).append(' ').append($('.form-required').eq(0).clone());
        }
        if ($('.error', $(this)).length) {
          $('legend span.fieldset-legend', $(this)).eq(0).addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processAccordion = {
  execute: function (context, settings, type) {
    $('div.field-group-accordion-wrapper', context).once('fieldgroup-effects', function () {
      var wrapper = $(this);

      wrapper.accordion({
        autoHeight: false,
        active: '.field-group-accordion-active',
        collapsible: true,
        changestart: function(event, ui) {
          if ($(this).hasClass('effect-none')) {
            ui.options.animated = false;
          }
          else {
            ui.options.animated = 'slide';
          }
        }
      });

      if (type == 'form') {
        // Add required fields mark to any element containing required fields
        wrapper.find('div.accordion-item').each(function(i){
          if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
            $('h3.ui-accordion-header').eq(i).append(' ').append($('.form-required').eq(0).clone());
          }
          if ($('.error', $(this)).length) {
            $('h3.ui-accordion-header').eq(i).addClass('error');
            var activeOne = $(this).parent().accordion("activate" , i);
            $('.ui-accordion-content-active', activeOne).css({height: 'auto', width: 'auto', display: 'block'});
          }
        });
      }
    });
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processHtabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any element containing required fields
      $('fieldset.horizontal-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('horizontalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('horizontalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('horizontalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processTabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.vertical-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('verticalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('verticalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('verticalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 *
 * TODO clean this up meaning check if this is really
 *      necessary.
 */
Drupal.FieldGroup.Effects.processDiv = {
  execute: function (context, settings, type) {

    $('div.collapsible', context).once('fieldgroup-effects', function() {
      var $wrapper = $(this);

      // Turn the legend into a clickable link, but retain span.field-group-format-toggler
      // for CSS positioning.

      var $toggler = $('span.field-group-format-toggler:first', $wrapper);
      var $link = $('<a class="field-group-format-title" href="#"></a>');
      $link.prepend($toggler.contents());

      // Add required field markers if needed
      if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
        $link.append(' ').append($('.form-required').eq(0).clone());
      }

      $link.appendTo($toggler);

      // .wrapInner() does not retain bound events.
      $link.click(function () {
        var wrapper = $wrapper.get(0);
        // Don't animate multiple times.
        if (!wrapper.animating) {
          wrapper.animating = true;
          var speed = $wrapper.hasClass('speed-fast') ? 300 : 1000;
          if ($wrapper.hasClass('effect-none') && $wrapper.hasClass('speed-none')) {
            $('> .field-group-format-wrapper', wrapper).toggle();
          }
          else if ($wrapper.hasClass('effect-blind')) {
            $('> .field-group-format-wrapper', wrapper).toggle('blind', {}, speed);
          }
          else {
            $('> .field-group-format-wrapper', wrapper).toggle(speed);
          }
          wrapper.animating = false;
        }
        $wrapper.toggleClass('collapsed');
        return false;
      });

    });
  }
};

/**
 * Behaviors.
 */
Drupal.behaviors.fieldGroup = {
  attach: function (context, settings) {
    if (settings.field_group == undefined) {
      return;
    }

    // Execute all of them.
    $.each(Drupal.FieldGroup.Effects, function (func) {
      // We check for a wrapper function in Drupal.field_group as
      // alternative for dynamic string function calls.
      var type = func.toLowerCase().replace("process", "");
      if (settings.field_group[type] != undefined && $.isFunction(this.execute)) {
        this.execute(context, settings, settings.field_group[type]);
      }
    });

    // Fixes css for fieldgroups under vertical tabs.
    $('.fieldset-wrapper .fieldset > legend').css({display: 'block'});
    $('.vertical-tabs fieldset.fieldset').addClass('default-fallback');

  }
};

})(jQuery);;
