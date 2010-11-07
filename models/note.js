var mongoose = module.parent.parent.exports.mongoose;

mongoose.model("Note", {
  properties: ["title", "content", "updated_at"],

  methods: {
    save: function(fn){
      this.updated_at = new Date();
      this.__super__(fn);
    }
  }

});

module.exports = global.db.model("Note");
