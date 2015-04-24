import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "pop-over__anchor",

  popOver: null,

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isOpen");
    this.set("popOver", parent);
  }),

  isOpen: Ember.computed.alias("popOver.isOpen"),

  toggle: Ember.on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.toggleProperty("isOpen");
  })

});