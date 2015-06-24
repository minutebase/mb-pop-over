import Ember from 'ember';

export default function(prop) {
  return Ember.computed(prop, {
    get() {
      const parts = this.get(prop);
      if (parts && Ember.isArray(parts)) {
        return parts.join(' ');
      } else {
        return parts;
      }
    }
  });
}