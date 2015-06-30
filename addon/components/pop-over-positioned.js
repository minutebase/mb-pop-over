import Ember from 'ember';

import TetheredComponent from 'ember-tether/components/ember-tether';
import computedJoin from '../computed/join';

export default TetheredComponent.extend({
  classNames: ["pop-over__body"],
  classNameBindings: [
    "visibleClass",
    "classNamesFromBody",
    "classNamesFromParent",
    "popOver.body-class"
  ],

  // auto-registered parent components
  popOver:     null,
  popOverBody: null,

  target:           Ember.computed.reads("popOver.anchor"),
  targetAttachment: Ember.computed.reads("popOver.anchor-attachment"),
  attachment:       Ember.computed.reads("popOver.body-attachment"),
  constraints:      Ember.computed.reads("popOver.body-constraints"),

  showingChanged: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    if (this.get("isOpen")) {
      this.setupListeners();
    } else {
      this.teardownListeners();
    }
  })),

  addTether() {
    if (this.get("_state") !== "inDOM") {
      Ember.run.scheduleOnce("afterRender", this, "addTether");
      return;
    }
    this._super();
  },

  reposition() {
    this._tether.position();
  },

  interactive: Ember.computed.reads("popOverBody.interactive"),

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("popOver", parent);
    parent.set("body", this);

    const body = this.nearestWithProperty("isPopOverBody");
    this.set("popOverBody", body);
  }),

  classNamesFromBody: Ember.computed.reads("popOverBody.class"),
  classNamesFromParent: computedJoin("popOver.bodyClassNames"),

  isOpen: Ember.computed.reads("popOver.isOpen"),

  visibleClass: Ember.computed("isOpen", {
    get() {
      if (this.get("isOpen")) {
        return "pop-over__body--visible";
      } else {
        return "pop-over__body--hidden";
      }
    }
  }),

  setupListeners() {
    this._clickHandler  = this._clickHandler || this.hideIfClickedOutside.bind(this);
    Ember.$(document).on("mousedown", this._clickHandler);
  },

  teardownListeners: Ember.on("willDestroyElement", function() {
    if (this._clickHandler) {
      Ember.$(document).off("mousedown", this._clickHandler);
    }
  }),

  hideIfClickedOutside(e) {
    if (!this.get("isOpen")) {
      return;
    }

    // did we click inside this pop-over, or a child of this one?
    const body = Ember.$(e.target).closest(".pop-over__body");
    if (body.length) {
      const thisPopOver   = this.get("popOver");
      const bodyComponent = this.container.lookup("-view-registry:main")[body[0].id];

      let popOver = bodyComponent.get("popOver");

      while (popOver) {
        if (popOver === thisPopOver) {
          return;
        }
        popOver = popOver.get("parentPopOver");
      }
    }

    this.get("popOver").send("close");
  },

  hideIfClicked: Ember.on("click", function() {
    if (!this.get("interactive")) {
      this.get("popOver").send("close");
    }
  })

});