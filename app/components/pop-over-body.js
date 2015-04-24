import Ember from 'ember';
import scrollParent from 'mb-pop-over/utils/scroll-parent';

const alias = Ember.computed.alias;

export default Ember.Component.extend({
  classNames: ["pop-over__body"],

  popOver: null,
  interactive: false,

  setupParent: Ember.on("init", function() {
    const parent = this.nearestWithProperty("isOpen");
    this.set("popOver", parent);
  }),

  isVisible: alias("isOpen"),
  isOpen:    alias("popOver.isOpen"),
  position:  alias("popOver.position"),

  showingChanged: Ember.on("didInsertElement", Ember.observer("isOpen", function() {
    if (this.get("isOpen")) {
      Ember.run.scheduleOnce('afterRender', this, 'reposition');
      this.setupListeners();
    } else {
      this.teardownListeners();
    }
  })),

  hideIfClickedOutside(e) {
    if (Ember.$(e.target).closest(".pop-over").length) {
      return;
    }
    this.set("isOpen", false);
  },

  hideIfClicked: Ember.on("click", function() {
    if (!this.get("interactive")) {
      this.set("isOpen", false);
    }
  }),

  setupListeners() {
    this._scrollHandler = this._scrollHandler || this.repositionDebounced.bind(this);
    this._clickHandler  = this._clickHandler || this.hideIfClickedOutside.bind(this);

    scrollParent(this.$()).on("scroll", this._scrollHandler);
    Ember.$(document).on("mouseup", this._clickHandler);
  },

  teardownListeners: Ember.on("willDestroyElement", function() {
    if (this._scrollHandler) {
      scrollParent(this.$()).off("scroll", this._scrollHandler);
    }
    if (this._clickHandler) {
      Ember.$(document).off("mouseup", this._clickHandler);
    }
  }),

  anchorPosition() {
    return this.get("popOver.element").getBoundingClientRect();
  },

  repositionDebounced() {
    return Ember.run.debounce(this, this.reposition, 10);
  },

  positionHorizontal() {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const height     = this.$().outerHeight(true);
    const edgeBuffer = 10;

    const left      = anchor.right;
    const maxTop    = Ember.$(window).height() - height - edgeBuffer;
    const maxLeft   = Ember.$(window).width() / 2;
    const idealTop  = anchor.top + (anchor.height / 2) - (height / 2);

    let top = idealTop > maxTop ? maxTop : idealTop;
    top = top < edgeBuffer ? edgeBuffer : top;

    const arrowDiff = idealTop - top;
    this.$(".pop-over-arrow").css({
      bottom: (height / 2) - arrowDiff
    });

    if (left > maxLeft) {
      this.set("position", "left");
      return {
        top:    top,
        left:   "auto",
        bottom: "auto",
        right:  Ember.$(window).width() - anchor.left
      };
    } else {
      this.set("position", "right");
      return {
        top:    top,
        left:   left,
        bottom: "auto",
        right:  "auto"
      };
    }
  },

  positionVertical() {
    const anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }

    const width      = this.$().outerWidth(true);
    const edgeBuffer = 10;

    const top       = anchor.bottom;
    const maxTop    = Ember.$(window).height() / 2;
    const maxLeft   = Ember.$(window).width() - width - edgeBuffer;
    const idealLeft = anchor.left + (anchor.width / 2) - (width / 2);

    let left = idealLeft > maxLeft ? maxLeft : idealLeft;
    left = left < edgeBuffer ? edgeBuffer : left;

    const arrowDiff = idealLeft - left;
    this.$(".pop-over-arrow").css({
      left: (width / 2) + arrowDiff
    });

    if (top > maxTop) {
      this.set("position", "top");
      return {
        top: "auto",
        left: left,
        bottom: Ember.$(window).height() - anchor.top,
        right: "auto"
      };
    } else {
      this.set("position", "bottom");
      return {
        top:    top,
        left:   left,
        bottom: "auto",
        right:  "auto"
      };
    }
  },

  reposition() {
    if (this._state !== "inDOM") {
      return;
    }

    let move;
    switch (this.get("position")) {
      case "right":
      case "left":
        move = this.positionHorizontal();
        break;

      case "bottom":
      case "top":
        move = this.positionVertical();
    }

    if (move) {
      this.$().css(move);
    }
  }
});