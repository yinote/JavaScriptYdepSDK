(function() {
  var DURATION, Note, Notebook, Screen, Tag, addTagComponent, addTagToNote, bindNotebookEventHandler, bindTagEventHandler, containsTag, current_note, current_notebook, deleteNote, deleteNotebook, endEditingNote, enrichNotes, getNoteContent, getNotebooks, getNotes, getTags, hideAllScreens, insertNotebookComponent, note_dict, note_editing, notebookNameChange, notebook_dict, populateNotebookDropdown, promptForNotebookName, removeNoteComponent, removeNotebookComponent, removeTagComponent, removeTagFromNote, resetAddTagBtn, resetNoteContent, saveNote, saveNotebook, saveTag, screen, selectNote, setCurrentContentNotebook, setCurrentNotebook, setCurrentSummaryNotebook, setScreenMode, showDropdownNotebooks, showNoteContent, showNoteSummaries, showNotebooks, showSummaryAndContentNotebooks, showSummaryNotebooks, startEditingNote, tag_dict, updateNote, updateNotebook;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  if (typeof $ === "undefined" || $ === null) {
    $ = require('jquery');
  }
  if (typeof crypto === "undefined" || crypto === null) {
    crypto = require('crypto');
  }
  note_dict = {};
  current_note = null;
  notebook_dict = {};
  current_notebook = null;
  tag_dict = {};
  DURATION = 400;
  note_editing = false;
  screen = null;
  Screen = {
    NOTE: 0,
    MAP: 1,
    NOTEBOOK: 2,
    TIMELINE: 3,
    TAG: 4,
    TODO: 5,
    APP_CENTER: 6
  };
  Note = (function() {
    function Note() {
      this.tags = [];
      this.tagIds = [];
      this.tagNames = [];
    }
    Note.prototype.id = function(newId) {
      this.id = newId;
      return this;
    };
    Note.prototype.usn = function(newUsn) {
      this.usn = newUsn;
      return this;
    };
    Note.prototype.title = function(newTitle) {
      this.title = newTitle;
      return this;
    };
    Note.prototype.summary = function(newSummary) {
      this.summary = newSummary;
      return this;
    };
    Note.prototype.content = function(newContent) {
      this.content = newContent;
      return this;
    };
    Note.prototype.created = function(newCreated) {
      this.created = newCreated;
      return this;
    };
    Note.prototype.createdDate = function(newCreatedDate) {
      this.createdDate = newCreatedDate;
      return this;
    };
    Note.prototype.updated = function(newUpdated) {
      this.updated = newUpdated;
      return this;
    };
    Note.prototype.updatedDate = function(newUpdatedDate) {
      this.updatedDate = newUpdatedDate;
      return this;
    };
    Note.prototype.notebookId = function(newNotebookId) {
      this.notebookId = newNotebookId;
      return this;
    };
    Note.prototype.tagIds = function(newTagIds) {
      this.tagIds = newTagIds;
      return this;
    };
    Note.prototype.tagNames = function(newTagNames) {
      this.tagNames = newTagNames;
      return this;
    };
    Note.prototype.tags = function(newTags) {
      this.tags = newTags;
      return this;
    };
    Note.prototype.largestResourceId = function(newLargestResourceId) {
      this.largestResourceId = newLargestResourceId;
      return this;
    };
    Note.prototype.hasImage = function(newHasImage) {
      this.hasImage = newHasImage;
      return this;
    };
    return Note;
  })();
  Notebook = (function() {
    function Notebook() {}
    Notebook.prototype.id = function(newId) {
      this.id = newId;
      return this;
    };
    Notebook.prototype.usn = function(newUsn) {
      this.usn = newUsn;
      return this;
    };
    Notebook.prototype.name = function(newName) {
      this.name = newName;
      return this;
    };
    Notebook.prototype.defaultNotebook = function(newDefaultNotebook) {
      this.defaultNotebook = newDefaultNotebook;
      return this;
    };
    return Notebook;
  })();
  Tag = (function() {
    function Tag() {}
    Tag.prototype.id = function(newId) {
      this.id = newId;
      return this;
    };
    Tag.prototype.usn = function(newUsn) {
      this.usn = newUsn;
      return this;
    };
    Tag.prototype.name = function(newName) {
      this.name = newName;
      return this;
    };
    return Tag;
  })();
  enrichNotes = function(notes) {
    return notes = notes.map(function(note) {
      var i, length;
      if (note.created != null) {
        note.createdDate = new Date(note.created).toLocaleDateString();
      }
      if (note.updated != null) {
        note.updatedDate = new Date(note.updated).toLocaleDateString();
      }
      if (note.largestResourceId != null) {
        note.hasImage = true;
      }
      note.tags = note.tagIds.map(function(tag_id) {
        return new Tag().id(tag_id);
      });
      if (note.tagNames != null) {
        length = Math.min(note.tags.length, note.tagNames.length);
        for (i = 0; 0 <= length ? i < length : i > length; 0 <= length ? i++ : i--) {
          note.tags[i].name = note.tagNames[i];
        }
      }
      return note;
    });
  };
  getNotes = function(render, notebook_id, with_tag_name, tag_id) {
    return $.ajax('/api/notes.json', {
      type: 'GET',
      contentType: 'application/json',
      data: {
        notebook_id: notebook_id,
        with_tag_name: with_tag_name,
        tag_id: tag_id
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("get note - AJAX Error: " + textStatus);
      },
      success: function(notes, textStatus, jqXHR) {
        var note, _i, _len;
        notes = enrichNotes(notes);
        note_dict = {};
        for (_i = 0, _len = notes.length; _i < _len; _i++) {
          note = notes[_i];
          note_dict[note.id] = note;
        }
        return typeof render === "function" ? render(notes) : void 0;
      }
    });
  };
  getNoteContent = function(render, note) {
    return $.ajax('/api/notes.json/' + note.id + '/content', {
      type: 'GET',
      contentType: 'application/json',
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("get note - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        note.content = data.content;
        return typeof render === "function" ? render(note) : void 0;
      }
    });
  };
  saveNote = function(note, render) {
    return $.ajax('/api/notes.json', {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        title: note.title,
        contentHtml: note.content,
        contentHash: $.md5(note.content),
        created: note.created,
        notebookId: note.notebookId,
        tagIds: note.tagIds
      }),
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("note - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        note.id = data.id;
        note.usn = data.usn;
        if (typeof render === "function") {
          render(note);
        }
        return console.log("note - Successful AJAX call: " + data);
      }
    });
  };
  updateNote = function(note, render) {
    return $.ajax('/api/notes.json/' + note.id, {
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        usn: note.usn,
        title: note.title,
        contentHtml: note.content,
        contentHash: $.md5(note.content),
        updated: note.updated,
        notebookId: note.notebookId,
        tagIds: note.tagIds
      }),
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("update note - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        note.usn = data.usn;
        if (typeof render === "function") {
          render(note);
        }
        return console.log("update note - Successful AJAX call: " + data);
      }
    });
  };
  deleteNote = function(note, render) {
    return $.ajax('/api/notes.json/' + note.id + '?' + $.param({
      expunged: new Date().getTime(),
      usn: note.usn
    }), {
      type: 'DELETE',
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("delete note - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        note.usn = data.usn;
        note_dict[note.id] = null;
        if (typeof render === "function") {
          render(note);
        }
        return console.log("delete note - Successful AJAX call: " + data);
      }
    });
  };
  getNotebooks = function(render) {
    return $.ajax('/api/notebooks.json', {
      type: 'GET',
      contentType: 'application/json',
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("get notebook - AJAX Error: " + textStatus);
      },
      success: function(notebooks, textStatus, jqXHR) {
        var default_notebooks, notebook, _i, _len;
        notebook_dict = {};
        for (_i = 0, _len = notebooks.length; _i < _len; _i++) {
          notebook = notebooks[_i];
          notebook_dict[notebook.id] = notebook;
        }
        default_notebooks = notebooks.filter(function(notebook) {
          return notebook.defaultNotebook;
        });
        current_notebook = current_notebook != null ? current_notebook = notebook_dict[current_notebook.id] : default_notebooks.length > 0 ? default_notebooks[0] : notebooks.length > 0 ? notebooks[0] : null;
        return typeof render === "function" ? render(notebooks) : void 0;
      }
    });
  };
  saveNotebook = function(notebook, render, duplicateHandler) {
    return $.ajax('/api/notebooks.json', {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: notebook.name,
        defaultNotebook: notebook.defaultNotebook
      }),
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("notebook - AJAX Error: " + textStatus);
        if (jqXHR.status === 400 && jqXHR.responseText.indexOf('DuplicatedResource') !== -1) {
          return typeof duplicateHandler === "function" ? duplicateHandler() : void 0;
        }
      },
      success: function(data, textStatus, jqXHR) {
        notebook.id = data.id;
        notebook.usn = data.usn;
        console.log('save notebook id: ' + notebook.id);
        notebook_dict[notebook.id] = notebook;
        if (typeof render === "function") {
          render(notebook);
        }
        return console.log("notebook - Successful AJAX call: " + data);
      }
    });
  };
  updateNotebook = function(notebook, render, duplicateHandler) {
    return $.ajax('/api/notebooks.json/' + notebook.id, {
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        usn: notebook.usn,
        name: notebook.name,
        defaultNotebook: notebook.defaultNotebook
      }),
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("update notebook - AJAX Error: " + textStatus);
        if (jqXHR.status === 400 && jqXHR.responseText.indexOf('DuplicatedResource') !== -1) {
          return typeof duplicateHandler === "function" ? duplicateHandler() : void 0;
        }
      },
      success: function(data, textStatus, jqXHR) {
        notebook.usn = data.usn;
        if (typeof render === "function") {
          render(notebook);
        }
        return console.log("update notebook - Successful AJAX call: " + data);
      }
    });
  };
  deleteNotebook = function(notebook, render) {
    return $.ajax('/api/notebooks.json/' + notebook.id + '?' + $.param({
      expunged: new Date().getTime(),
      usn: notebook.usn
    }), {
      type: 'DELETE',
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("delete notebook - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        notebook.usn = data.usn;
        if (typeof render === "function") {
          render(notebook);
        }
        return console.log("delete notebook - Successful AJAX call: " + data);
      }
    });
  };
  getTags = function(render, notebook_id, name_like) {
    return $.ajax('/api/tags.json', {
      type: 'GET',
      contentType: 'application/json',
      data: {
        notebook_id: notebook_id != null ? notebook_id : void 0,
        name_like: name_like
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("get tags - AJAX Error: " + textStatus);
      },
      success: function(tags, textStatus, jqXHR) {
        return typeof render === "function" ? render(tags) : void 0;
      }
    });
  };
  containsTag = function(note, tag) {
    return note.tags.some(function(element, index, array) {
      return element.name === tag.name;
    });
  };
  addTagToNote = function(note, tag) {
    note.tags.push(tag);
    note.tagIds.push(tag.id);
    if (note.tagNames != null) {
      return note.tagNames.push(tag.name);
    }
  };
  removeTagFromNote = function(note, tag_id) {
    var index;
    index = note.tagIds.indexOf(tag_id);
    console.log("remove index = " + index);
    if (index === -1) {
      return;
    }
    note.tagIds.splice(index, 1);
    note.tagNames.splice(index, 1);
    return note.tags.splice(index, 1);
  };
  saveTag = function(tag, render) {
    return $.ajax('/api/tags.json', {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: tag.name
      }),
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log("tag - AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        tag.id = data.id;
        tag.usn = data.usn;
        if (typeof render === "function") {
          render(tag);
        }
        return console.log("tag - Successful AJAX call: " + data);
      }
    });
  };
  showNoteSummaries = function(notes) {
    var html, source, template;
    source = $("#note-summary-template").html();
    template = Handlebars.compile(source);
    html = template({
      'note_summary': notes
    });
    $('#summary-list').html(html);
    current_note = notes.length > 0 ? notes[0] : null;
    console.log("show note summaries current_note: ");
    console.log(current_note);
    if (current_note != null) {
      selectNote(current_note);
    } else {
      resetNoteContent();
    }
    return $('.note-summary').click(__bind(function(event) {
      var note;
      note = note_dict[event.currentTarget.getAttribute("data-note-id")];
      selectNote(note);
      return getNoteContent(showNoteContent, note);
    }, this));
  };
  selectNote = function(note) {
    $('#summary-list > li').removeClass('summary-selected');
    $('#summary-list > li[data-note-id="' + note.id + '"]').addClass('summary-selected');
    return getNoteContent(showNoteContent, note);
  };
  showNoteContent = function(note) {
    var template;
    console.log("show note content");
    current_note = note;
    resetAddTagBtn();
    setCurrentContentNotebook(notebook_dict[note.notebookId]);
    template = Handlebars.compile($("#note-tag-template").html());
    $('#note-tags').html(template({
      'tag': note.tags
    }));
    bindTagEventHandler();
    $('#note-created-txt').text(note.createdDate);
    $('#note-updated-txt').text(note.updatedDate);
    $('#note-title-text').val(note.title);
    return tinyMCE.activeEditor.setContent(note.content);
  };
  resetNoteContent = function() {
    console.log("reset note content");
    resetAddTagBtn();
    $('#note-created-txt').text('');
    $('#note-updated-txt').text('');
    $('#note-title-text').val('');
    tinyMCE.activeEditor.setContent('');
    $('#note-tags').html('');
    return current_note = null;
  };
  removeNoteComponent = function(note) {
    console.log("remove note component");
    $('#summary-list > li[data-note-id="' + note.id + '"]').remove();
    return resetNoteContent();
  };
  showSummaryNotebooks = function(notebooks) {
    populateNotebookDropdown(notebooks, $('#content-notebook-dropdown'));
    if (current_notebook != null) {
      setCurrentContentNotebook(current_notebook);
    }
    return $('#content-notebook-dropdown > li').click(__bind(function(event) {
      var notebook;
      notebook = notebook_dict[event.currentTarget.getAttribute("data-notebook-id")];
      return setCurrentContentNotebook(notebook);
    }, this));
  };
  showSummaryAndContentNotebooks = function(notebooks) {
    showDropdownNotebooks(notebooks, $('#summary-notebook-dropdown'), setCurrentSummaryNotebook);
    return showDropdownNotebooks(notebooks, $('#content-notebook-dropdown'), setCurrentContentNotebook);
  };
  showDropdownNotebooks = function(notebooks, container, setCurrentNotebook) {
    populateNotebookDropdown(notebooks, container);
    if (current_notebook != null) {
      setCurrentNotebook(current_notebook);
    }
    return container.children('li').click(__bind(function(event) {
      var notebook;
      notebook = notebook_dict[event.currentTarget.getAttribute("data-notebook-id")];
      return setCurrentNotebook(notebook);
    }, this));
  };
  populateNotebookDropdown = function(notebooks, container) {
    var html, source, template;
    source = $("#notebook-dropdown-choice-template").html();
    template = Handlebars.compile(source);
    html = template({
      'notebook': notebooks
    });
    return container.html(html);
  };
  addTagComponent = function(note, tag) {
    var template;
    if (!containsTag(note, tag)) {
      addTagToNote(note, tag);
      template = Handlebars.compile($("#note-tag-template").html());
      $('#note-tags').append(template({
        'tag': [tag]
      }));
    }
    resetAddTagBtn();
    return bindTagEventHandler();
  };
  removeTagComponent = function(tag_id) {
    return $('li[data-tag-id="' + tag_id + '"].note-tag').remove();
  };
  resetAddTagBtn = function() {
    $('#new-tag-input').val('');
    $('#new-tag-input').hide();
    return $('#new-tag-btn').show();
  };
  setCurrentSummaryNotebook = function(notebook) {
    setCurrentNotebook(notebook, $('#summary-notebook-current'), $('#summary-notebook-dropdown'));
    setCurrentContentNotebook(notebook);
    return getNotes(showNoteSummaries, notebook.id, true);
  };
  setCurrentContentNotebook = function(notebook) {
    return setCurrentNotebook(notebook, $('#content-notebook-current'), $('#content-notebook-dropdown'));
  };
  setCurrentNotebook = function(notebook, current_label, container) {
    current_label.attr('data-notebook-id', notebook.id);
    current_label.text(notebook.name);
    current_label.append(" <b class='caret'></b>");
    container.children('li').removeClass('dropdown-selected').removeClass('dropdown-selected');
    return container.children('li[data-notebook-id="' + notebook.id + '"]').addClass('dropdown-selected');
  };
  setScreenMode = function(btn, mode) {
    $('.nav-btn').removeClass('nav-btn-selected');
    btn.addClass('nav-btn-selected');
    screen = mode;
    hideAllScreens();
    switch (screen) {
      case Screen.NOTE:
        getNotebooks(showSummaryAndContentNotebooks);
        return $('#note-screen').fadeIn(DURATION);
      case Screen.MAP:
        createMap("map-screen");
        return $('#map-screen').fadeIn(DURATION);
      case Screen.TIMELINE:
        createStoryJS({
          type: 'timeline',
          width: '100%',
          height: '600',
          source: '/api/notes.timeline?access_token=' + getAccessToken(),
          embed_id: 'timeline-screen',
          css: '/assets/stylesheets/timeline/timeline.css',
          js: '/assets/javascripts/timeline/timeline-min.js'
        });
        return $('#timeline-screen').fadeIn(DURATION);
      default:
        getNotebooks(showNotebooks);
        return $('#notebook-screen').fadeIn(DURATION);
    }
  };
  hideAllScreens = function() {
    $('#note-screen').fadeOut(DURATION);
    $('#notebook-screen').fadeOut(DURATION);
    $('#map-screen').fadeOut(DURATION);
    return $('#timeline-screen').fadeOut(DURATION);
  };
  showNotebooks = function(notebooks) {
    var html, source, template;
    if ($('#notebook-show-panel').children().size() === 0) {
      source = $("#notebook-show-template").html();
      template = Handlebars.compile(source);
      html = template({
        'notebook': notebooks
      });
      $('#notebook-show-panel').html(html);
      return bindNotebookEventHandler();
    }
  };
  notebookNameChange = function(event) {
    var notebook, notebook_id, old_notebook_name;
    notebook_id = event.currentTarget.parentNode.getAttribute('data-notebook-id');
    console.log('notebook_id: ' + notebook_id);
    if (notebook_id != null) {
      notebook = notebook_dict[notebook_id];
    }
    console.log(notebook);
    if ((notebook != null) && notebook.name !== event.currentTarget.value) {
      old_notebook_name = notebook.name;
      notebook.name = event.currentTarget.value;
      console.log('update notebook id : ' + notebook_id);
      return updateNotebook(notebook, null, function() {
        return event.currentTarget.value = old_notebook_name;
      });
    }
  };
  insertNotebookComponent = function(notebook) {
    var html, source, template;
    source = $("#notebook-show-template").html();
    template = Handlebars.compile(source);
    html = template({
      'notebook': [notebook]
    });
    $('#notebook-show-panel').append(html);
    bindNotebookEventHandler();
    return console.log('new notebook:' + $('.notebook-show[data-notebook-id="' + notebook.id + '"]').children('input.notebook-name').val());
  };
  removeNotebookComponent = function(notebook) {
    return $('.notebook-show[data-notebook-id="' + notebook.id + '"]').remove();
  };
  bindNotebookEventHandler = function() {
    $('div.notebook-show > a.notebook-goto').unbind('click');
    $('div.notebook-show > a.notebook-goto').click(__bind(function(event) {
      var notebook_id;
      notebook_id = event.currentTarget.parentNode.getAttribute('data-notebook-id');
      console.log('bind notebookd id: ' + notebook_id);
      if (notebook_id != null) {
        current_notebook = notebook_dict[notebook_id];
      }
      return $('#note-nav-btn').click();
    }, this));
    $('.notebook-name').keypress(__bind(function(event) {
      var code;
      code = event.keyCode != null ? event.keyCode : event.which;
      console.log("pressed code: " + code);
      if (code === 13) {
        notebookNameChange(event);
        return $('.notebook-name').blur();
      }
    }, this));
    $('.notebook-name').focusout(__bind(function(event) {
      return notebookNameChange(event);
    }, this));
    return $.contextMenu({
      selector: '.notebook-config',
      trigger: 'left',
      callback: function(key, options) {
        var notebook, notebook_id;
        notebook_id = options.$trigger.context.parentNode.getAttribute('data-notebook-id');
        if (notebook_id != null) {
          notebook = notebook_dict[notebook_id];
        }
        switch (key) {
          case "delete":
            if (notebook != null) {
              return deleteNotebook(notebook, removeNotebookComponent);
            }
            break;
          case "setDefault":
            notebook.defaultNotebook = true;
            if (notebook != null) {
              return updateNotebook(notebook);
            }
        }
      },
      items: {
        "delete": {
          name: "删除笔记本"
        }
      }
    });
  };
  bindTagEventHandler = function() {
    return $('.note-tag-remove').click(__bind(function(event) {
      var tag_id;
      console.log('click note-tag-remove');
      if (!(current_note != null)) {
        return;
      }
      console.log('asdfasdfasdf');
      tag_id = event.currentTarget.parentNode.getAttribute('data-tag-id');
      removeTagFromNote(current_note, tag_id);
      return removeTagComponent(tag_id);
    }, this));
  };
  promptForNotebookName = function(question) {
    return bootbox.prompt(question, '取消', '确认', function(result) {
      var notebook;
      if (result === null || result === '') {
        return console.log("Notebook creation is cancelled.");
      } else {
        notebook = new Notebook().name(result);
        return saveNotebook(notebook, insertNotebookComponent, function() {
          return promptForNotebookName('笔记本已存在，请重新输入笔记本名');
        });
      }
    });
  };
  $().ready(function() {
    $(".sortable").sortable();
    $(".sortable").disableSelection();
    return $('#note-nav-btn').click();
  });
  $('#note-save').click(__bind(function(event) {
    var notebook_id;
    notebook_id = $('#content-notebook-current').attr('data-notebook-id');
    if (!(notebook_id != null) || notebook_id.length === 0) {
      alert("您尚未指定笔记本，请先创建笔记本。");
      return;
    }
    current_note.title = $('#note-title-text').val();
    current_note.content = tinyMCE.activeEditor.getContent();
    current_note.notebookId = notebook_id;
    if (typeof current_note.id === 'function') {
      current_note.created = new Date().getTime();
      saveNote(current_note);
    } else {
      current_note.updated = new Date().getTime();
      updateNote(current_note);
    }
    return setCurrentSummaryNotebook(notebook_dict[notebook_id]);
  }, this));
  $('#note-delete').click(__bind(function(event) {
    if (current_note != null) {
      return deleteNote(current_note, removeNoteComponent);
    }
  }, this));
  $('#new-note-btn').click(__bind(function(event) {
    var notebook, notebook_id;
    notebook_id = $('#summary-notebook-current').attr('data-notebook-id');
    notebook = notebook_dict[notebook_id];
    if (!(notebook != null)) {
      return;
    }
    console.log('new note belong to ' + notebook.name);
    if (notebook != null) {
      setCurrentContentNotebook(notebook);
    }
    $('#note-created-txt').text(new Date().toLocaleDateString());
    $('#note-updated-txt').text(new Date().toLocaleDateString());
    $('#note-title-text').val('');
    tinyMCE.activeEditor.setContent('');
    $('#note-tags').html('');
    return current_note = new Note();
  }, this));
  $('#new-notebook-btn').click(__bind(function(event) {
    return promptForNotebookName('请输入笔记本名');
  }, this));
  $('#new-tag-btn').click(__bind(function(event) {
    $('#new-tag-btn').hide();
    $('#new-tag-input').show();
    return $('#new-tag-input').focus();
  }, this));
  $('#new-tag-input').keypress(__bind(function(event) {
    var code, tag, tag_name;
    if (!(current_note != null)) {
      return;
    }
    code = event.keyCode != null ? event.keyCode : event.which;
    console.log("pressed code: " + code);
    if (code === 13) {
      tag_name = $('#new-tag-input').val();
      tag = tag_dict[tag_name];
      if (!(tag != null)) {
        tag = new Tag().name(tag_name);
      }
      return getTags(function(tags) {
        if (tags.length !== 0 && tags[0].name === tag.name) {
          tag.id = tags[0].id;
          tag.usn = tags[0].usn;
          console.log('tag.id: ' + tag.id);
          console.log('tag.name: ' + tag.name);
          addTagComponent(current_note, tag);
        } else {
          saveTag(tag, function(tag) {
            return addTagComponent(current_note, tag);
          });
        }
        return $('#content-head > ul.typeahead').hide();
      }, null, tag.name);
    }
  }, this));
  $('#new-tag-input').focusout(__bind(function(event) {
    return resetAddTagBtn();
  }, this));
  $('#new-tag-input').typeahead({
    source: function(query, process) {
      return $.get('/api/tags.json', {
        name_like: query
      }, function(tags) {
        var names;
        tag_dict = {};
        names = tags.map(function(tag) {
          tag_dict[tag.name] = tag;
          return tag.name;
        });
        return process(names);
      });
    },
    updater: function(tag_name) {
      var tag;
      if (!(current_note != null)) {
        return;
      }
      tag = tag_dict[tag_name];
      addTagComponent(current_note, tag);
      return console.log(tag_dict[tag_name]);
    }
  });
  $("#note-save").click(__bind(function(event) {
    return tinymce.activeEditor.save();
  }, this));
  startEditingNote = function(editor_id) {
    $('#content-sub-head').fadeOut(DURATION);
    if (!note_editing) {
      $('#content-container').animate({
        top: '-=40'
      }, DURATION);
    }
    $('#' + editor_id + '_tbl ' + '.mceToolbar').fadeIn(DURATION);
    return note_editing = true;
  };
  endEditingNote = function(editor_id) {
    $('#' + editor_id + '_tbl ' + '.mceToolbar').fadeOut(DURATION);
    if (note_editing) {
      $('#content-container').animate({
        top: '+=40'
      }, DURATION);
    }
    $('#content-sub-head').fadeIn(DURATION);
    return note_editing = false;
  };
  tinyMCE.init({
    mode: "exact",
    elements: "editor",
    theme: "advanced",
    plugins: "autolink,lists,autosave",
    width: "100%",
    height: "100%",
    setup: function(ed) {
      ed.onInit.add(function(ed) {
        return endEditingNote(ed.id);
      });
      ed.onKeyDown.add(function(ed) {
        return startEditingNote(ed.id);
      });
      ed.onPaste.add(function(ed) {
        return startEditingNote(ed.id);
      });
      return ed.onSaveContent.add(function(ed) {
        return endEditingNote(ed.id);
      });
    },
    theme_advanced_buttons1: ",bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect,|,bullist,numlist,|,outdent,indent,|,forecolor,backcolor,|,sub,sup,",
    theme_advanced_toolbar_location: "top",
    theme_advanced_toolbar_align: "left",
    theme_advanced_statusbar_location: "none",
    theme_advanced_path: false,
    theme_advanced_resizing: false
  });
  $('#note-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#note-nav-btn'), Screen.NOTE);
  }, this));
  $('#map-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#map-nav-btn'), Screen.MAP);
  }, this));
  $('#notebook-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#notebook-nav-btn'), Screen.NOTEBOOK);
  }, this));
  $('#timeline-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#timeline-nav-btn'), Screen.TIMELINE);
  }, this));
  $('#tag-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#tag-nav-btn'), Screen.TAG);
  }, this));
  $('#todo-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#todo-nav-btn'), Screen.TODO);
  }, this));
  $('#appcenter-nav-btn').click(__bind(function(event) {
    return setScreenMode($('#appcenter-nav-btn'), Screen.APP_CENTER);
  }, this));
}).call(this);
