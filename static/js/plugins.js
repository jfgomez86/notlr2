// remap jQuery to $
(function($) {

  var ajaxErrorHandler = {
    422: function (xhr) {
      var errors;
      try {
        errors = JSON.parse(xhr.responseText).errors;
      } catch (e) {
        errors = xhr.responseText;
      }

      if (typeof errors === "object") {
        for (var label in errors) {
          if (errors[label] instanceof Array) {
            errors[label].forEach(function (errorMsg) {
              console.log(label, errorMsg);
            });
          } else console.log(label, errors[label]);
        }
      } else console.log(errors);
    }
  };

  $(".note .delete").live("click", function () {
    Note.del($(this).closest(".note").attr("id").replace(/^note_/, ""));
  });

  $("#new_note").click(function () {
    var n = new Note("Edit Me!", "Edit this!");
    n.save();
  });

  /*
   *$(".note").draggable({
   *  containment: "body"
   *});
   */

  var updateLocalRecords = (function (callback) {
    return setTimeout(function () {
      var needUpdate = false, updatedNotes = {};
      $(".note").each(function () {
        var noteId = $(this).attr("id"),
        curValue = localStorage.getItem(noteId),
        actualValue = {
          title: $(this).find(".title").text(),
          content: $(this).find(".content").text()
        },
        storageObj = JSON.stringify(actualValue);
        if (!curValue || curValue !== storageObj) {
          needUpdate = true;
          updatedNotes[noteId] = actualValue;
          localStorage.setItem(noteId, storageObj);
        }
      });
      if (needUpdate && typeof callback === "function") {
        callback(updatedNotes);
      }
    }, 0);
  });
  updateLocalRecords();

  var curUpdateTimeout;
  $(".note .title, .note .content").live("keydown", function () {
    clearTimeout(curUpdateTimeout);
    curUpdateTimeout = setTimeout(function () {
      updateLocalRecords(function (notes) {
        $.each(notes, function (noteId, attrs) {
          noteId = noteId.replace(/note_/, "");
          Note.update(noteId, attrs);
        });
      });
    }, 1000);
  });

  $(document).ajaxError(function (ev, xhr, ajaxOptions, err) {
    if (ajaxErrorHandler.hasOwnProperty(xhr.status))
    ajaxErrorHandler[xhr.status] (xhr);
    else console.log(ev, xhr, ajaxOptions, err);
  });

  // Note Model
  var Note = this.Note = function (title, content) {
    this.newRecord = true;
    this.title = title;
    this.content = content;
  };

  Note.prototype.properties = function () {
    return {
      title: this.title,
      content: this.content
    }
  };

  Note.prototype.save = function () {
    var self = this;
    if (this.newRecord) {
      var note = $("<li class='note'>");
      note.append($("<h3 contenteditable='true' class='title'>")
      .html(self.properties().title));
      note.append($("<section contenteditable='true' class='content'>")
      .html(self.properties().content));
      note.append($("<section class='actions'>")
      .html("<a href='javascript:void(0)' class='delete'>Delete</a>"));

      note.hide();
      $("#notes").append(note);
      note.fadeIn(300, function () {
        $.post("/notes", { note: self.properties() }, function (data, textStatus, xhr) {
          self.newRecord = false;
          note.attr("id", "note_" + data.id);
        });
        $(document).scrollTo(note, {duration: 200});
      });
    }
  };

  Note.del = function (id) {
    $("#note_" + id).fadeOut(300, function () {
      $.post("/notes/" + id, {"_method": "delete"}, function (data, textStatus, xhr) {
        if (/^ok$/.test(data)) {
          $("#note_" + id).remove();
          console.log(data);
        }
        else {
          $("#note_" + id).show(300);
          console.log(data, textStatus, xhr);
        }
      });
    });
  };

  Note.update = function (id, attrs) {
    attrs = {note: attrs, "_method": "put"};
    $.post("/notes/" + id, attrs, function (data, textStatus, xhr) {
      if (/^ok$/.test(data)) console.log(data);
      else console.log(data, textStatus, xhr);
    });
  };

})(window.jQuery);



// usage: log('inside coolFunc',this,arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};



// catch all document.write() calls
(function(doc){
  var write = doc.write;
  doc.write = function(q){
    log('document.write(): ',arguments);
    if (/docwriteregexwhitelist/.test(q)) write.apply(doc,arguments);
  };
})(document);


