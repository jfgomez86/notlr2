var express = module.parent.exports.express
,   Notes   = module.exports = express.createServer()
,   Note    = require("models/note.js")
,   path    = require("path");

var template_path = path.join(__dirname, "../views/notes");

// Configuration//{{{
Notes.configure(function(){
  Notes.set("views", template_path);
  Notes.set("view engine", "jade");
  Notes.set("view options", {
    layout: getLayout()
  });
  Notes.use(Notes.router);
  Notes.dynamicHelpers({
  });
});

function getLayout() {
  var layout = false;
  if (path.existsSync(path.join(template_path, "layout.jade")))
  layout = "layout.jade";
  if (path.existsSync(path.join(__dirname, "../views/layout.jade")))
  layout = path.join(__dirname, "../views/layout.jade");
  return layout;
}
//}}}

Notes.get("/", function (req, res) {
  Note.find().all(function (notes) {
    res.render("index", {
      locals: {
        title: "Notes: List",
        notes: notes
      }
    });
  });
});

// vim: set foldmethod=marker:
