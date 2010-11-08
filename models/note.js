var mongoose = module.parent.parent.exports.mongoose;

mongoose.model("Note", {
  properties: ["title", "content", "updated_at"],

  methods: {
    save: function(fn){
      this.updated_at = new Date();
      this.__super__(fn);
    },

    valid: function () {
      var valid;
      this.errors = {};
      ["title", "content"].forEach(function (p) {
        if (this[p] && this[p] !== "") {
          valid = true;
        } else {
          valid = false;
          this.errors[p] = this.errors[p] || [];
          this.errors[p].push("can't be blank");
        }
      }, this);
      return valid;
    }
  }

});

module.exports = global.db.model("Note");
