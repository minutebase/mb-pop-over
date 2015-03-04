import Ember from 'ember';
import scrollParent from 'mb-pop-over/utils/scroll-parent';

var alias = Ember.computed.alias;

export default Ember.Component.extend({
  classNames: ["pop-over__body"],

  popOver: null,
  interactive: false,

  setupParent: function() {
    var parent = this.nearestWithProperty("isOpen");
    this.set("popOver", parent);
  }.on("init"),

  isVisible: alias("isOpen"),
  isOpen:    alias("popOver.isOpen"),
  position:  alias("popOver.position"),

  showingChanged: function() {
    if (this.get("isOpen")) {
      Ember.run.scheduleOnce('afterRender', this, 'reposition');
      this.setupListeners();
    } else {
      this.teardownListeners();
    }
  }.observes("isOpen").on("didInsertElement"),

  hideIfClickedOutside: function(e) {
    if (Ember.$(e.target).closest(".pop-over").length) {
      return;
    }
    this.set("isOpen", false);
  },

  hideIfClicked: function() {
    if (!this.get("interactive")) {
      this.set("isOpen", false);
    }
  }.on("click"),

  setupListeners: function() {
    this._scrollHandler = this._scrollHandler || this.repositionDebounced.bind(this);
    this._clickHandler  = this._clickHandler || this.hideIfClickedOutside.bind(this);

    scrollParent(this.$()).on("scroll", this._scrollHandler);
    Ember.$(document).on("mouseup", this._clickHandler);
  },

  teardownListeners: function() {
    if (this._scrollHandler) {
      scrollParent(this.$()).off("scroll", this._scrollHandler);
    }
    if (this._clickHandler) {
      Ember.$(document).off("mouseup", this._clickHandler);
    }
  }.on("willDestroyElement"),

  anchorPosition: function() {
    return this.get("popOver.element").getBoundingClientRect();
  },

  repositionDebounced: function() {
    return Ember.run.debounce(this, this.reposition, 10);
  },

  // TODO - refactor
  reposition: function() {
    var arrowDiff, idealLeft, idealTop, left, maxLeft, maxTop, move, top;
    if (this._state !== "inDOM") {
      return;
    }

    var anchor = this.anchorPosition();

    if (!anchor) {
      return;
    }

    var height     = this.$().outerHeight(true);
    var width      = this.$().outerWidth(true);
    var edgeBuffer = 10;

    switch (this.get("position")) {
      case "right":
      case "left":
        left = anchor.right;
        maxTop = Ember.$(window).height() - height - edgeBuffer;
        maxLeft = Ember.$(window).width() / 2;
        idealTop = anchor.top + (anchor.height / 2) - (height / 2);
        top = idealTop > maxTop ? maxTop : idealTop;
        top = top < edgeBuffer ? edgeBuffer : top;
        arrowDiff = idealTop - top;
        this.$(".pop-over-arrow").css({
          bottom: (height / 2) - arrowDiff
        });
        if (left > maxLeft) {
          this.set("position", "left");
          move = {
            top: top,
            left: "auto",
            bottom: "auto",
            right: Ember.$(window).width() - anchor.left
          };
        } else {
          this.set("position", "right");
          move = {
            top: top,
            left: left,
            bottom: "auto",
            right: "auto"
          };
        }
        break;

      case "bottom":
      case "top":
        top = anchor.bottom;
        maxTop = Ember.$(window).height() / 2;
        maxLeft = Ember.$(window).width() - width - edgeBuffer;
        idealLeft = anchor.left + (anchor.width / 2) - (width / 2);
        left = idealLeft > maxLeft ? maxLeft : idealLeft;
        left = left < edgeBuffer ? edgeBuffer : left;
        arrowDiff = idealLeft - left;
        this.$(".pop-over-arrow").css({
          left: (width / 2) + arrowDiff
        });
        if (top > maxTop) {
          this.set("position", "top");
          move = {
            top: "auto",
            left: left,
            bottom: Ember.$(window).height() - anchor.top,
            right: "auto"
          };
        } else {
          this.set("position", "bottom");
          move = {
            top: top,
            left: left,
            bottom: "auto",
            right: "auto"
          };
        }
    }

    this.$().css(move);
  }
});