import Ember from 'ember';

export default Ember.Controller.extend({
  clickNum: 0,

  actions: {
    clicked: function() {
      this.incrementProperty("clickNum");
    }
  }
});