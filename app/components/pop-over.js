import Ember from 'ember';

const globalParent = {};

export default Ember.Component.extend({
  classNames:        ["pop-over"],

  isPopOver: true,
  isOpen:    false,
  position: "bottom",
  manual:    false,

  setupScopeParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.scopeParent = parent || globalParent;
  }),

  registerCurrentWhenOpened: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    let current = this.scopeParent.currentPopOver;
    if (this.get("isOpen")) {
      if (current && current !== this) {
        this.send("close");
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

  actions: {
    close() {
      if (!this.get("manual")) {
        this.set("isOpen", false);
      }
      this.sendAction("closed");
    },

    toggle() {
      if (this.get("isOpen")) {
        this.send("close");
      } else {
        this.send("open");
      }
    },

    open() {
      if (!this.get("manual")) {
        this.set("isOpen", true);
      }
      this.sendAction("opened");
    }
  }

});