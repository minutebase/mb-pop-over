import Ember from 'ember';

// the actual body comes from pop-over-positioned

export default Ember.Component.extend({
  tagName: '',

  isPopOverBody: true,

  popOver:     null,
  interactive: false,

  service: Ember.inject.service("pop-over"),

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("popOver", parent);
  }),

  isOpen: Ember.computed.reads("popOver.isOpen"),
});