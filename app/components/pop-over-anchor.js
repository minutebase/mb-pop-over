import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "pop-over__anchor",

  popOver: null,
  on:     "click",

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("popOver", parent);
  }),

  isOpen: Ember.computed.reads("popOver.isOpen"),

  onClick: Ember.on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.get("on") !== "click") {
      return;
    }

    this.get("popOver").send("toggle");
  }),

  // show on focus
  // TODO - how to handle blur? we don't necessarily want to auto-hide
  //        on blur as otherwise it'll hide as soon as you interact with the popover
  onFocus: Ember.on("focusIn", function() {
    if (this.get("on") !== "focus") {
      return;
    }

    this.get("popOver").send("open");
  })

});