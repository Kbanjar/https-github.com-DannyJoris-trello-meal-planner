$(document).ready(function() {

  // Include Trello client script.
  let trelloClient = 'https://trello.com/1/client.js?key=caf98b855b223644b58b7916f7649bca';
  if (localStorage.getItem('trello_token')) {
    trelloClient += `&token=${localStorage.getItem('trello_token')}`;
  }
  $.getScript(trelloClient)
    .done(( script, textStatus ) => {
      appInit();
    })
    .fail(( jqxhr, settings, exception ) => {
      console.error('Failed to load Trello client.');
    });

  //
  // Check if authorized.
  //
  let appInit = () => {
    if (!Trello.authorized()) {
      $('.authenticate').removeClass('hide');
      let authenticationSuccess = () => {
        $('.authenticate').addClass('hide');
        if (!boardExists()) {
          $('.create-board').removeClass('hide');
        }
        else {
          $('.create-board').addClass('hide');
          $('.has-board').removeClass('hide');
        }
      }
      let authenticationFailure = () => {
        console.log('Trello authentication failed!');
      }
      $('.authenticate__link').on('click', () => {
          Trello.authorize({
            type: 'popup',
            name: 'Trello Meal Planner',
            scope: {
              read: 'true',
              write: 'true' },
            expiration: 'never',
            success: authenticationSuccess,
            error: authenticationFailure
          });
        });
    }
    else if (!boardExists()) {
      $('.authenticate').addClass('hide');
      $('.create-board').removeClass('hide');
    }
    else {
      $('.authenticate').addClass('hide');
      $('.create-board').addClass('hide');
      $('.has-board').removeClass('hide');
    }
  };

  //
  // Log out.
  //
  $('.log-out').on('click', () => {
    Trello.deauthorize();
    $('.is-authenticated').addClass('hide');
    $('.authenticate').removeClass('hide');
  });

  //
  // Check if board exists.
  //
  function boardExists() {
    // Check localStorage for boardID. In this case the user can re-name the
    // Meal Planner board, and still be identified.
    if (localStorage.getItem('boardID')) {
      return true;
    }
    // If not found check boards with the title "Meal Planner".

    return false;
  };

  //
  // Create board.
  //
  $('.create-board__link').on('click', () => {
    // Create board API call.
    Trello.post('/boards', {
      name: 'Meal Planner',
      defaultLabels: false
    }).done((responseText) => {
      console.log('responseText', responseText);
      // On success:
      $('.create-board').addClass('hide');
      $('.has-board').removeClass('hide');
    });




  });

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
