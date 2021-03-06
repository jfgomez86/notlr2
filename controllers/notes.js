var express = module.parent.exports.express
,   Notes   = module.exports = express.createServer()
,   Note    = require("models/note.js")
,   path    = require("path")
,   NotesController;

var template_path = path.join(__dirname, "../views/notes");

// Configuration//{{{
Notes.configure(function(){
  Notes.set("views", template_path);
  Notes.set("view engine", "jade");
  Notes.set("view options", {
    layout: getLayout()
  });
  Notes.use(express.bodyDecoder());
  Notes.use(express.methodOverride());
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

NotesController = {
  index: function (req, res) {
    Note.find().all(function (notes) {
      res.render("index", {
        locals: {
          title: "Notes: List",
          notes: notes
        }
      });
    });
  },

  create: function (req, res) {
    var note = new Note(req.param("note"));
    if (note.valid()) {
      note.save(function () {
        res.headers["Content-Type"] = "application/json";
        res.send(JSON.stringify({id: note._id}));
      });
    } else {
      res.headers["Content-Type"] = "application/json";
      res.send(JSON.stringify({errors: note.errors}), 422);
    }
  },

  update: function (req, res) {
    Note.findById(req.param("id"), function (note) {
      if (!note) {
        res.headers["Content-Type"] = "application/json";
        res.send(JSON.stringify({errors: "couldn't update note"}), 422);
      } else {
        (function (attr) {
          if (req.param("note") && req.param("note").hasOwnProperty(attr)) {
            note[attr] = req.param("note")[attr];
          }
          return arguments.callee;
        })("title")("content")("top")("left");
        note.save(function () {
          res.send("ok");
        });
      }
    });
  },

  del: function (req, res) {
    Note.findById(req.param("id"), function (note) {
      if (!note) {
        res.headers["Content-Type"] = "application/json";
        res.send(JSON.stringify({errors: "couldn't delete note"}), 422);
      } else {
        note.remove(function () {
          res.send("ok");
          res.end();
        });
      }
    });
  }
};

Notes.get("/", NotesController.index);
Notes.post("/", NotesController.create);
Notes.del("/:id", NotesController.del);
Notes.put("/:id", NotesController.update);

// vim: set foldmethod=marker:
