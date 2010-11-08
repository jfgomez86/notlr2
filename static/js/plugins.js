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
            errors[label].forEach(function (error_msg) {
              console.log(label, error_msg);
            });
          } else console.log(label, errors[label]);
        }
      } else console.log(errors);
    }
  };

  $(".note .delete").click(function () {
    Note.del($(this).parent("li.note").attr("id").replace(/^note_/, ""));
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
      $.post("/notes", { note: this.properties() }, function (data, textStatus, xhr) {
        if (/^ok$/.test(data)) self.newRecord = false;
        else console.log(data, textStatus, xhr);
      });
    }
  };

  Note.del = function (id) {
    $.post("/notes/" + id, {"_method": "delete"}, function (data, textStatus, xhr) {
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


