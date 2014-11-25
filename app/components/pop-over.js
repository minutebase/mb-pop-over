import Ember from 'ember';

var globalParent = {};

export default Ember.Component.extend({
  classNames: ["pop-over"],
  classNameBindings: ["positionClass"],

  isPopOver: true,

  isOpen: false,

  position: "bottom",

  setupScopeParent: function() {
    var parent = this.nearestWithProperty("isPopOver");
    this.scopeParent = parent || globalParent;
  }.on("init"),

  registerCurrentWhenOpened: function() {
    var current = this.scopeParent.currentPopOver;
    if (this.get("isOpen")) {
      if (current && current !== this) {
        current.set("isOpen", false);
      }
      current = this;
    } else {
      if (current === this) {
        current = null;
      }
    }
    this.scopeParent.currentPopOver = current;
  }.observes("isOpen").on("didInsertElement"),

  unregisterCurrentWhenClosed: function() {
    if (this.scopeParent.currentPopOver === this) {
      this.scopeParent.currentPopOver = null;
    }
  }.on("willDestroyElement"),

  positionClass: function() {
    var position = this.get("position");
    return "pop-over--"+position;
  }.property("position")

});