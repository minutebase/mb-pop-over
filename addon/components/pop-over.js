import Ember from 'ember';

const globalParent = {};

export default Ember.Component.extend({
  classNames:        ["pop-over"],

  isPopOver:     true,
  isOpen:        false,
  position:     "bottom",
  manual:        false,

  _scopeParent: null,

  parentPopOver: Ember.computed("_scopeParent", function() {
    const parent = this.get("_scopeParent");
    if (parent === globalParent) {
      return null;
    } else {
      return parent;
    }
  }),

  body:   null,
  anchor: null,

  // for setting z-index so we can ensure child pop-overs have a higher z-index
  depth: Ember.computed("_scopeParent", function() {
    const parent = this.get("_scopeParent");
    if (!parent || parent === globalParent) {
      return 1;
    }

    return parent.get("depth") + 1;
  }),

  setupScopeParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("_scopeParent", parent || globalParent);
  }),

  registerCurrentWhenOpened: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    let current = this.get("_scopeParent").currentPopOver;
    if (this.get("isOpen")) {
      if (current && current !== this) {
        current.send("close");
      }
      current = this;
    } else {
      if (current === this) {
        current = null;
      }
    }
    this.get("_scopeParent").currentPopOver = current;
  })),

  unregisterCurrentWhenClosed: Ember.on("willDestroyElement", function() {
    if (this.get("_scopeParent").currentPopOver === this) {
      this.get("_scopeParent").currentPopOver = null;
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