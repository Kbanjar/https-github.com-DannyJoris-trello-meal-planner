$(document).ready(function() {
  //
  // Check if authorized.
  //
  // Trello.authorized()

  //
  // Log out.
  //
  $('.log-out').on('click', () => {
    Trello.deauthorize();
  });

  //
  // Check if board exists.
  //

  //
  // Create board.
  //

  //
  // Retrieve list.
  //

  //
  // Update card values.
  //

  //
  // Reset board & shopping list.
  //

  $('.modal').modal();

  $('.modal-reset').on('click', () => {
    console.log('Reset board.');
  })

  //
  // Extra items.
  //

  // Bind extra item change.
  let bindExtraItemsCheckbox = () => {
    $('.extra-items__list').find(':checkbox').each((key, value) => {
      $(value).on('change', () => {
        let extraItems = JSON.parse(localStorage.getItem('extraItems'));
        extraItems[key].checked = $(value).is(':checked');
        localStorage.setItem('extraItems', JSON.stringify(extraItems));
      });
    });
  };

  // Populate extra items.
  // [
  //   {
  //     value: 'Extra item',
  //     checked: true
  //   }
  // ]
  let updateExtraItemsList = () => {
    if (!localStorage.getItem('extraItems')) {
      $('.extra-items__checklist').html('<p>No extra items yet.</p>')
    } else {
      // Populate checklist.
      $('.extra-items__checklist').empty();
      let extraItems = JSON.parse(localStorage.getItem('extraItems'));
      $.each(extraItems, (key, item) => {
        let $checkbox = $('<div></div>')
          .append(`<input type="checkbox" class="filled-in" id="extra-item__item-${key}" ${item.checked ? 'checked="checked"': ""}/>`)
          .append(`<label for="extra-item__item-${key}">${item.value}</label>`);
        $('.extra-items__checklist').append($checkbox);
      });
      bindExtraItemsCheckbox();
    }
  };

  updateExtraItemsList();

  // Update extra items textarea.
  let updateExtraItemsTextarea = () => {
    if (!localStorage.getItem('extraItems')) {
      $('#extra-items__textarea').val('');
    }
    else {
      let extraItemsTextareaVal = '';
      let extraItems = JSON.parse(localStorage.getItem('extraItems'));
      $.each(extraItems, (key, item) => {
        if (item.checked) {
          extraItemsTextareaVal += '- [x] ';
        }
        else {
          extraItemsTextareaVal += '- [ ] ';
        }
        extraItemsTextareaVal += item.value + '\n';
      });
      $('#extra-items__textarea').val(extraItemsTextareaVal);
    }
  };

  // Toggle extra items.
  let toggleExtraItems = () => {
    $('.extra-items__input').toggleClass('hide');
    $('.extra-items__list').toggleClass('hide');
    // Autoresize and focus.
    if (!$('.extra-items__input').hasClass('hide')) {
      setTimeout(() => {
        $('#extra-items__textarea').trigger('autoresize').focus();
      }, 100);
    }
  };

  // Extra items edit.
  $('.extra-items__edit').on('click', () => {
    toggleExtraItems();
    updateExtraItemsTextarea();

  });

  // Extra items cancel.
  $('.extra-items__cancel').on('click', () => {
    toggleExtraItems();
  });

  // Extra items save.
  $('.extra-items__save').on('click', () => {
    // Store in localStorage.
    let extraItemsTextareaValues = $('#extra-items__textarea').val().trim();
    if (extraItemsTextareaValues) {
      extraItemsTextareaValues = extraItemsTextareaValues.split(/\r?\n/);
      let extraItemsStorage = extraItemsTextareaValues.map((item) => {
        let checked = false;
        if (item.match(/^(- \[x])+/)) {
          checked = true;
        }
        return {
          value: item.replace(/^(- \[x])/, '').replace(/^[^A-Za-z0-9]+/, ''),
          checked: checked
        }
      });
      localStorage.setItem('extraItems', JSON.stringify(extraItemsStorage));
    }
    else {
      localStorage.setItem('extraItems', '');
    }

    toggleExtraItems();
    updateExtraItemsList();
  });

});
