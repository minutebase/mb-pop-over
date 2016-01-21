import Ember from 'ember';
import computedJoin from '../computed/join';

export default Ember.Component.extend({
  classNames: "pop-over__anchor",

  classNameBindings: [
    "isOpenClass",
    "classNamesFromParent",
    "popOver.anchor-class"
  ],

  popOver:    null,
  'open-on':  "click",

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("popOver", parent);
    parent.set("anchor", this);
  }),

  classNamesFromParent: computedJoin("popOver.anchorClassNames"),

  isOpen: Ember.computed.reads("popOver.isOpen"),

  isOpenClass: Ember.computed("isOpen", {
    get() {
      if (this.get("isOpen")) {
        return "pop-over__anchor--open";
      }
    }
  }),

  onClick: Ember.on("click", function(e) {
    if (this.get("open-on") !== "click") {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.get("popOver").send("toggle");
  }),

  // show on focus
  // TODO - how to handle blur? we don't necessarily want to auto-hide
  //        on blur as otherwise it'll hide as soon as you interact with the popover
  onFocus: Ember.on("focusIn", function() {
    if (this.get("open-on") !== "focus") {
      return;
    }

    this.get("popOver").send("open");
  })

});