import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "pop-over__anchor",

  popOver: null,

  setupParent: function() {
    var parent = this.nearestWithProperty("isOpen");
    this.set("popOver", parent);
  }.on("init"),

  isOpen: Ember.computed.alias("popOver.isOpen"),

  toggle: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.toggleProperty("isOpen");
  }.on("click")

});