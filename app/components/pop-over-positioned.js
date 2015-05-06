import Ember from 'ember';
import scrollParent from 'mb-pop-over/utils/scroll-parent';

function pxVal(val) {
  if (val === "auto") {
    return val;
  } else {
    return `${val}px`;
  }
}

export default Ember.Component.extend({
  classNames: ["pop-over__body"],
  classNameBindings: ["visibleClass"],

  top:    null,
  left:   null,
  bottom: null,
  right:  null,

  // auto-registered parent components
  popOver:     null,
  popOverBody: null,

  interactive: Ember.computed.reads("popOverBody.interactive"),

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isPopOver");
    this.set("popOver", parent);
    parent.set("body", this);

    const body = this.nearestWithProperty("isPopOverBody");
    this.set("popOverBody", body);
  }),

  depth:     Ember.computed.reads("popOver.depth"),
  isOpen:    Ember.computed.reads("popOver.isOpen"),
  position:  Ember.computed.reads("popOver.position"), // top, bottom, left, right, (TODO - top-left, top-right, bottom-left, bottom-right?)

  updatePositionCSS() {
    const { top, left, bottom, right } = this.getProperties("top", "left", "bottom", "right");

    this.$().css({
      top: pxVal(top),
      left: pxVal(left),
      bottom: pxVal(bottom),
      right: pxVal(right),
      zIndex: this.get("depth") + 1000 // sufficiently high to be above everything else?
    });
  },

  visibleClass: Ember.computed("isOpen", {
    get() {
      if (this.get("isOpen")) {
        return "pop-over__body--visible";
      } else {
        return "pop-over__body--hidden";
      }
    }
  }),

  showingChanged: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    if (this.get("isOpen")) {
      Ember.run.scheduleOnce('afterRender', this, 'calculateNewPosition');
      this.setupListeners();
    } else {
      this.teardownListeners();
    }
  })),

  hideIfClickedOutside(e) {
    if (!this.get("isOpen")) {
      return;
    }

    const element = this.get("element");
    if (e.target === element || Ember.$.contains(element, e.target)) {
      return;
    }

    this.get("popOver").send("close");
  },

  hideIfClicked: Ember.on("click", function() {
    if (!this.get("interactive")) {
      this.get("popOver").send("close");
    }
  }),

  scrollParent() {
    return scrollParent(this.get("popOver").$());
  },

  setupListeners() {
    this._scrollHandler = this._scrollHandler || this.repositionDebounced.bind(this);
    this._clickHandler  = this._clickHandler || this.hideIfClickedOutside.bind(this);

    this.scrollParent().on("scroll", this._scrollHandler);
    Ember.$(document).on("mousedown", this._clickHandler);
  },

  teardownListeners: Ember.on("willDestroyElement", function() {
    if (this._scrollHandler) {
      this.scrollParent().off("scroll", this._scrollHandler);
    }
    if (this._clickHandler) {
      Ember.$(document).off("mousedown", this._clickHandler);
    }
  }),

  calculateNewPosition() {
    if (this._state !== "inDOM") {
      return;
    }

    switch (this.get("position")) {
      case "right":
        this.positionRight();
        break;

      case "left":
        this.positionLeft();
        break;

      case "bottom":
        this.positionBottom();
        break;

      case "top":
        this.positionTop();
        break;
    }
  },

  move(css) {
    this.setProperties(css);
    Ember.run.scheduleOnce("afterRender", this, "updatePositionCSS");
  },

  anchorPosition() {
    return this.get("popOver").$(".pop-over__anchor")[0].getBoundingClientRect();
  },

  repositionDebounced() {
    return Ember.run.debounce(this, this.calculateNewPosition, 10);
  },

  positionLeft(flipped) {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const width       = this.$().outerWidth(false);
    const popOverLeft = anchor.left - width;

    if (popOverLeft < 0 && !flipped) {
      if (this.positionRight(true)) {
        return true;
      }
    }

    const vpWidth  = Ember.$(window).width();
    const top      = this.topToFitInViewport(anchor);
    const right    = vpWidth - anchor.left;
    const bottom   = "auto";
    const left     = "auto";

    this.move({top, left, bottom, right});
    return true;
  },

  positionRight(flipped) {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const width        = this.$().outerWidth(false);
    const popOverRight = anchor.right + width;

    if (popOverRight > Ember.$(window).width() && !flipped) {
      if (this.positionLeft(true)) {
        return true;
      }
    }

    const top    = this.topToFitInViewport(anchor);
    const right  = "auto";
    const bottom = "auto";
    const left   = anchor.right;

    this.move({top, left, bottom, right});
    return true;
  },

  positionTop(flipped) {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const height     = this.$().outerHeight(false);
    const popOverTop = anchor.top - height;

    if (popOverTop < 0 && !flipped) {
      if (this.positionBottom(true)) {
        return true;
      }
    }

    const top     = "auto";
    const left    = this.leftToFitInViewport(anchor);
    const bottom  = Ember.$(window).height() - anchor.top;
    const right   = "auto";

    this.move({top, left, bottom, right});
    return true;
  },

  positionBottom(flipped) {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const height        = this.$().outerHeight(false);
    const popOverBottom = anchor.bottom + height;

    if (popOverBottom > Ember.$(window).height() && !flipped) {
      if (this.positionTop(true)) {
        return;
      }
    }

    const top    = anchor.bottom;
    const left   = this.leftToFitInViewport(anchor);
    const bottom = "auto";
    const right  = "auto";

    this.move({top, left, bottom, right});
    return true;
  },

  topToFitInViewport(anchor) {
    const height   = this.$().outerHeight(false);
    const vpHeight = Ember.$(window).height();

    if (anchor.top < 0) {
      return anchor.top;
    } else if (anchor.bottom > vpHeight) {
      return anchor.bottom - height;
    } else {
      const top = anchor.top + (anchor.height / 2) - (height / 2);
      if (top < 0) {
        return 0;
      } else if (top + height > vpHeight) {
        return vpHeight - height;
      } else {
        return top;
      }
    }
  },

  leftToFitInViewport(anchor) {
    const width   = this.$().outerWidth(false);
    const vpWidth = Ember.$(window).width();

    if (anchor.left < 0) {
      return anchor.left;
    } else if (anchor.right > vpWidth) {
      return anchor.right - width;
    } else {
      const left = anchor.left + (anchor.width / 2) - (width / 2);
      if (left < 0) {
        return 0;
      } else if (left + width > vpWidth) {
        return vpWidth - width;
      } else {
        return left;
      }
    }
  }

});