// remap jQuery to $
(function($) {
  // Setup//{{{
  var draggableOptions = {
    containment: "#main",
    stop: function (ev, ui) {
      var noteId = $(this).attr("id").replace(/^note_/, "");
      Note.update(noteId, {
        left: ui.position.left,
        top: ui.position.top
      });
    }
  };

  $(document).ajaxError(function (ev, xhr, ajaxOptions, err) {
    if (ajaxErrorHandler.hasOwnProperty(xhr.status))
    ajaxErrorHandler[xhr.status] (xhr);
    else console.log(ev, xhr, ajaxOptions, err);
  });

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
  };//}}}


  //Event Bindings//{{{
  $(".note .delete").live("click", function () {
    Note.del($(this).closest(".note").attr("id").replace(/^note_/, ""));
  });

  $(".note").dblclick(function (evt) {
    evt.stopPropagation();
  });

  $(".note .title, .note .content, .note .actions").mousedown(function (evt) {
    // Prevents "drag" event to trigger. Makes contenteditable still work
    evt.stopPropagation();
  });

  $(document).dblclick(function (evt) {
    NotesController.createBlank(evt.pageX, evt.pageY);
    evt.preventDefault();
  });

  $("#add_note").click(function (evt) {
    NotesController.createBlank(evt.pageX + 20, evt.pageY + 20);
  });

  $("#main").mousedown(function (evt) {
    if (evt.button !== 0 || evt.target !== this) return;
    evt.preventDefault();
    var curx, cury
    curx = evt.clientX;
    cury = evt.clientY;

    $(this).mousemove(function (ev) {
      var dx, dy;
      dx = curx - ev.clientX;
      dy = cury - ev.clientY;

      curx = ev.clientX;
      cury = ev.clientY;

      $("body").addClass("scrolling");
      window.scrollBy(dx, dy);
    });
  });

  $(document).mouseup(function (evt) {
    $("body").removeClass("scrolling");
    $("#main").unbind("mousemove");
  });

  $(".note").draggable(draggableOptions);

  $(window).load(function () {
    $(window).resize(adjustSize);
    adjustSize();

    function adjustSize () {
      $("#main").css({
        height: $(document).height() - 10,
        width: $(document).width() - 10
      });
    }
  });


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
  });//}}}


  // Note Model//{{{
  var Note = this.Note = function (attrs) {
    attrs = attrs || {};
    this.newRecord = true;
    this.title = attrs.title;
    this.content = attrs.content;
    this.top = attrs.top;
    this.left = attrs.left;
  };

  Note.prototype.properties = function () {
    return {
      title: this.title,
      top: this.top,
      left: this.left,
      content: this.content
    }
  };

  Note.prototype.save = function () {
    var self = this;
    if (this.newRecord) {
      $.post("/notes", { note: self.properties() }, function (data, textStatus, xhr) {
        var ev = $.Event("Note.save");
        self.id = data.id;
        ev.note = self;
        $(document).trigger(ev);
        self.newRecord = false;
      });
    }
  };

  Note.del = function (id) {
    var self = this;
    $.post("/notes/" + id, {"_method": "delete"}, function (data, textStatus, xhr) {
      if (/^ok$/.test(data)) {
        var ev = $.Event("Note.del");
        ev.noteId = id;
        $(document).trigger(ev);
        console.log(data);
      }
      else {
        console.log(data, textStatus, xhr);
      }
    });
  };

  Note.update = function (id, attrs) {
    attrs = {note: attrs, "_method": "put"};
    $.post("/notes/" + id, attrs, function (data, textStatus, xhr) {
      if (/^ok$/.test(data)) console.log(data);
      else console.log(data, textStatus, xhr);
    });
  };//}}}


  // Notes Controller//{{{
  var NotesController = {
    init: function () {
      $(document).bind("Note.save", this.save);
      $(document).bind("Note.del", this.del);
    },

    save: function (ev) {
      var self = ev.note,
      note = $("<li class='note' style='left:" + self.left + "px; top:" + self.top + "px'>");
      note.append($("<h3 contenteditable='true' class='title'>")
      .html(self.properties().title));
      note.append($("<section contenteditable='true' class='content'>")
      .html(self.properties().content));
      note.append($("<section class='actions'>")
      .html("<a href='javascript:void(0)' class='delete'>x</a>"));

      note.hide();
      $("#notes").append(note);
      note.fadeIn(300, function () {
        $(document).scrollTo(note, {duration: 200});
        note.draggable(draggableOptions);
        note.dblclick(function (evt) { evt.stopPropagation(); });
        note.find(".title, .content").mousedown(function (evt) {
          evt.stopPropagation();
        });
      });
      note.attr("id", "note_" + self.id);
    },

    del: function (ev) {
      var id = ev.noteId;

      $("#note_" + id).fadeOut(300, function () {
        $("#note_" + id).remove();
      });
    },

    createBlank: function (x,y) {
      var n = new Note({
        title: "Edit Me!",
        content: "Edit this!",
        left: x,
        top: y
      });
      n.save();
    }

  };
  NotesController.init();//}}}

})(window.jQuery);



// usage: log('inside coolFunc',this,arguments);//{{{
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
})(document);//}}}

// vim: set foldmethod=marker:
