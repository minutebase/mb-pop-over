import Ember from 'ember';

export default function getScrollParent(el) {
  var $el = Ember.$(el);
  if (!$el.length) {
    return Ember.$(document);
  }

  var position            = $el.css("position");
  var excludeStaticParent = (position === "absolute");
  var $parent;

  var scrollParent = $el.parents().filter(function(i, parent) {
    $parent = Ember.$(parent);
    if (excludeStaticParent && $parent.css("position") === "static") {
      return false;
    }
    return /(auto|scroll)/.test($parent.css("overflow"));
  }).eq(0);

  if (!scrollParent.length) {
    return Ember.$(el.ownerDocument || document);
  } else {
    return scrollParent;
  }
}
