import Ember from 'ember';

const globalParent = {};

export default Ember.Component.extend({
  classNames:        ["pop-over"],
  classNameBindings: ["positionClass"],

  isPopOver: true,
  isOpen:    false,
  position: "bottom",

  setupScopeParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.scopeParent = parent || globalParent;
  }),

  registerCurrentWhenOpened: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    let current = this.scopeParent.currentPopOver;
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
  })),

  unregisterCurrentWhenClosed: Ember.on("willDestroyElement", function() {
    if (this.scopeParent.currentPopOver === this) {
      this.scopeParent.currentPopOver = null;
    }
  }),

  positionClass: Ember.computed("position", {
    get() {
      const position = this.get("position");
      return "pop-over--"+position;
    }
  })

});