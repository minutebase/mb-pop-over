import Ember from 'ember';
import scrollParent from 'mb-pop-over/utils/scroll-parent';

var alias = Ember.computed.alias;

export default Ember.Component.extend({
  classNames: ["pop-over__body"],

  popOver: null,

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

  setupListeners: function() {
    this._scrollHandler = this._scrollHandler || Ember.run.debounce(this, this.reposition, 10);
    this._clickHandler  = this._clickHandler || this.hideIfClickedOutside.bind(this);

    scrollParent(this.$()).on("scroll", this._scrollHandler);
    Ember.$(document).on("mouseup", this._clickHandler);
  },

  teardownListeners: function() {
    if (this._scrollHandler) {
      scrollParent(this.$()).on("scroll", this._scrollHandler);
    }
    if (this._clickHandler) {
      Ember.$(document).off("mouseup", this._clickHandler);
    }
  }.on("willDestroyElement"),

  anchorPosition: function() {
    var $parent = this.get("popOver").$();

    var height  = $parent.outerHeight();
    var width   = $parent.outerWidth();
    var offset  = $parent.offset();
    var top     = offset.top;
    var left    = offset.left;

    var bottom = top  + height;
    var right  = left + width;

    return {
      left:   left,
      right:  right,
      top:    top,
      bottom: bottom,
      height: height,
      width:  width
    };
  },

  // TODO - refactor
  reposition: function() {
    var anchor, arrowDiff, edgeBuffer, height, idealLeft, idealTop, left, maxLeft, maxTop, move, top, width;
    if (this._state !== "inDOM") {
      return;
    }
    anchor = this.anchorPosition();
    if (!anchor) {
      return;
    }
    height = this.$().outerHeight(true);
    width = this.$().outerWidth(true);
    edgeBuffer = 10;
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
    return this.$().css(move);
  }
});