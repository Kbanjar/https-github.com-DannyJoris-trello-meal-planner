$(document).ready(function() {

  let app = {};
  // Checklist strings.
  const CHECKLIST_ON_HAND = 'Things you probably have on hand';
  const CHECKLIST_PRODUCE = 'Fresh produce';
  const CHECKLIST_DAIRY = 'Dairy & other refrigerated items';
  const CHECKLIST_GRAINS = 'Grains, legumes, pasta & bulk';
  const CHECKLIST_CANNED = 'Canned & jarred goods';
  const CHECKLIST_MEAT = 'Meat & alternatives';
  const CHECKLIST_OTHER = 'Everything else';
  // Localstorage keys.
  const LOCALSTORAGE_BOARD_ID = 'boardID';
  const LOCALSTORAGE_SHORT_URL = 'shortUrl';
  const LOCALSTORAGE_TRELLO_TOKEN = 'trello_token';
  const LOCALSTORAGE_RECIPES_LIST_ID = 'recipesListID';
  const LOCALSTORAGE_MONDAY_LIST_ID = 'mondayListID';
  const LOCALSTORAGE_TEMPLATE_CARD_ID = 'templateCardID';
  const LOCALSTORAGE_ALLOWED_LIST_IDS = 'allowedListIDs';
  const LOCALSTORAGE_EXTRA_ITEMS = 'extraItems';
  // Other.
  const DEFAULT_LABELS = [
    {color: 'green', name: 'Baked goods'},
    {color: 'yellow', name: 'Breakfast'},
    {color: 'orange', name: 'Lunch'},
    {color: 'red', name: 'Mains'},
    {color: 'purple', name: 'Dessert'},
    {color: 'blue', name: 'Dips, dressings & sauces'},
    {color: 'sky', name: 'Soups & stews'},
    {color: 'lime', name: 'Salads & sides'},
    {color: 'pink', name: 'Drinks'},
    {color: 'black', name: 'Other'}
  ];
  const DEFAULT_LISTS = [
    {name: "Recipes", pos: 1},
    {name: "Monday", pos: 2},
    {name: "Tuesday", pos: 3},
    {name: "Wednesday", pos: 4},
    {name: "Thursday", pos: 5},
    {name: "Friday", pos: 6},
    {name: "Saturday", pos: 7},
    {name: "Sunday", pos: 8},
  ];
  const DEFAULT_INGREDIENTS = [
    {checklist: CHECKLIST_ON_HAND, name: '1 tablespoon olive oil'},
    {checklist: CHECKLIST_ON_HAND, name: 'Salt and pepper to taste'},
    {checklist: CHECKLIST_ON_HAND, name: '2 teaspoons Italian seasoning'},
    {checklist: CHECKLIST_PRODUCE, name: '3 cloves garlic, minced'},
    {checklist: CHECKLIST_PRODUCE, name: '8 ounces sliced cremini mushrooms'},
    {checklist: CHECKLIST_PRODUCE, name: '1 bunch (about 8 ounces) Swiss chard, stems discarded and leaves coarsely chopped'},
    {checklist: CHECKLIST_DAIRY, name: '1 (15-ounce) container ricotta cheese'},
    {checklist: CHECKLIST_DAIRY, name: '1/2 cup shredded mozzarella cheese'},
    {checklist: CHECKLIST_DAIRY, name: '1/2 cup shredded Parmesan cheese'},
    {checklist: CHECKLIST_DAIRY, name: '1 egg, lightly beaten'},
    {checklist: CHECKLIST_GRAINS, name: '16 jumbo pasta shells, cooked according to package directions'},
    {checklist: CHECKLIST_CANNED, name: '1 1/2 cups marinara sauce, divided'}
  ];

  if (localStorage.getItem(LOCALSTORAGE_BOARD_ID)) {
    app.boardID = localStorage.getItem(LOCALSTORAGE_BOARD_ID);
  }
  if (localStorage.getItem(LOCALSTORAGE_SHORT_URL)) {
    app.shortUrl = localStorage.getItem(LOCALSTORAGE_SHORT_URL);
  }

  // Include Trello client script.
  let trelloClient = 'https://trello.com/1/client.js?key=caf98b855b223644b58b7916f7649bca';
  if (localStorage.getItem(LOCALSTORAGE_TRELLO_TOKEN)) {
    trelloClient += `&token=${localStorage.getItem(LOCALSTORAGE_TRELLO_TOKEN)}`;
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
      openAuthenticate();
      let authenticationSuccess = (result) => {
        ifBoardExists();
      };
      let authenticationFailure = () => {
        console.log('Trello authentication failed!');
      };
      $('.authenticate__link').on('click', function(e) {
        e.preventDefault();
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
    else {
      ifBoardExists();
    }
  };

  let openAuthenticate = () => {
    $('.authenticate').removeClass('hide');
    $('.create-board').addClass('hide');
    $('.board').addClass('hide');
  };

  let openCreateBoard = () => {
    $('.authenticate').addClass('hide');
    $('.create-board').removeClass('hide');
    $('.board').addClass('hide');
    Trello.get('/members/me/boards')
      .then(response => {
        let boards = [];
        let sortedBoards = response.sort((a, b) => {
          let nameA = a.name.toLowerCase(),
            nameB = b.name.toLowerCase();
          if (nameA < nameB) { return -1; }
          if (nameA > nameB) { return 1; }
          return 0;
        });
        $.each(sortedBoards, (key, board) => {
          if (board.closed === false && board.idOrganization === null) {
            boards.push($('<a>')
              .attr('href', '#')
              .addClass('collection-item')
              .text(board.name)
              .on('click', function(e) {
                e.preventDefault();
                localStorage.setItem(LOCALSTORAGE_BOARD_ID, board.id);
                localStorage.setItem(LOCALSTORAGE_SHORT_URL, board.shortUrl);
                app.boardID = board.id;
                app.shortUrl = board.shortUrl;
                openHasBoard();
              }));
          }
        });
        $('.create-board__select').removeClass('hide');
        $('.create-board__board-list').append(boards);
      });
  };

  let openHasBoard = () => {
    $('.authenticate').addClass('hide');
    $('.create-board').addClass('hide');
    $('.board').removeClass('hide');
    checklistInit();
    setBoardButton();
  };

  let ifBoardExists = () => {
    if (localStorage.getItem(LOCALSTORAGE_BOARD_ID)) {
      Trello.get(`/board/${localStorage.getItem(LOCALSTORAGE_BOARD_ID)}`)
        .done((response) => {
          openHasBoard();
        })
        .fail((response) => {
          openCreateBoard();
        });
    }
    else {
      openCreateBoard();
    }
  };

  //
  // Create board.
  //
  $('.create-board__link').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('disabled');
    // Create board API call.
    startBoardProgress();
    boardProgress(0);
    $('.create-board__select').addClass('hide');
    Trello.post('/boards', {
      name: 'Meal Planner',
      defaultLabels: false,
      defaultLists: false
    }).then(response => {
      boardProgress(15);
      console.log('Board created');
      app.boardID = response.id;
      localStorage.setItem(LOCALSTORAGE_BOARD_ID, response.id);
      app.shortUrl = response.shortUrl;
      localStorage.setItem(LOCALSTORAGE_SHORT_URL, response.shortUrl);
      let deferreds = [];
      $.each(DEFAULT_LABELS, (key, label) => {
        deferreds.push(Trello.post(`/boards/${app.boardID}/labels`, {color: label.color, name: label.name}));
      });
      $.each(DEFAULT_LISTS, (key, list) => {
        deferreds.push(Trello.post(`/boards/${app.boardID}/lists`, {name: list.name, pos: list.pos}));
      });
      return $.when.apply($, deferreds)
    })
    .then(() => {
      boardProgress(30);
      console.log('Labels & lists added');

      // Add example card.
      return Trello.get(`/boards/${app.boardID}/lists`)
    })
    .then(response => {
      boardProgress(50);
      $.each(response, (key, list) => {
        if (list.name === 'Recipes') {
          app.recipesListID = list.id;
          localStorage.setItem(LOCALSTORAGE_RECIPES_LIST_ID, app.recipesListID);
        }
        if (list.name === 'Monday') {
          app.mondayListID = list.id;
          localStorage.setItem(LOCALSTORAGE_MONDAY_LIST_ID, app.mondayListID);
        }
      });
      return Trello.post('/cards/', {
        name: 'RECIPE TEMPLATE',
        idList: app.recipesListID
      });
    })
    .then(response => {
      boardProgress(60);
      app.templateCardID = response.id;
      localStorage.setItem(LOCALSTORAGE_TEMPLATE_CARD_ID, app.templateCardID);

      // Add checklists.
      return Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_ON_HAND});
    })
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_PRODUCE}))
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_DAIRY}))
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_GRAINS}))
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_CANNED}))
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_MEAT}))
    .then(() => Trello.post(`/cards/${app.templateCardID}/checklists`, {value: null, name: CHECKLIST_OTHER}))
    .then(() => Trello.post('/cards/', {
      name: 'Cremini and chard stuffed shells',
      desc: 'Vegetarian stuffed shells filled with ricotta cheese, cremini mushrooms, and Swiss chard.',
      idList: app.mondayListID,
      idCardSource: app.templateCardID
    }))
    .then(response => {
      boardProgress(70);
      app.recipeCardID = response.id;
      return Trello.post(`/cards/${response.id}/attachments`, {
        url: 'http://ohmyveggies.com/recipe-cremini-and-chard-stuffed-shells/'
      });
    })
    .then(() => Trello.get(`/boards/${app.boardID}/labels`))
    .then(response => {
      let red = $.grep(response, label => label.color === 'red')[0];
      return Trello.post(`/cards/${app.recipeCardID}/idLabels`, { value: red.id });
    })
    .then(() => Trello.get(`/boards/${app.boardID}/checklists`))
    .then((response) => {
      boardProgress(80);
      app.recipeChecklists = {};
      app.recipeChecklists.onHand = $.grep(response, checklist =>
        checklist.name === CHECKLIST_ON_HAND && checklist.idCard === app.recipeCardID)[0].id;
      app.recipeChecklists.produce = $.grep(response, checklist =>
        checklist.name === CHECKLIST_PRODUCE && checklist.idCard === app.recipeCardID)[0].id;
      app.recipeChecklists.dairy = $.grep(response, checklist =>
        checklist.name === CHECKLIST_DAIRY && checklist.idCard === app.recipeCardID)[0].id;
      app.recipeChecklists.grains = $.grep(response, checklist =>
        checklist.name === CHECKLIST_GRAINS && checklist.idCard === app.recipeCardID)[0].id;
      app.recipeChecklists.canned = $.grep(response, checklist =>
        checklist.name === CHECKLIST_CANNED && checklist.idCard === app.recipeCardID)[0].id;

      let deferreds = [];
      $.each(DEFAULT_INGREDIENTS, (key, ingredient) => {
        deferreds.push(Trello.post(`/cards/${app.recipeCardID}/checklist/${ingredient.checklist}/checkItem`, {
          idChecklist: ingredient.checklist,
          name: ingredient.name
        }));
      });
      return $.when.apply($, deferreds);
    })
    .then(() => {

      boardProgress(100);
      console.log('Create board completed');
      setTimeout(() => {
        endBoardProgress();
        $(this).removeClass('disabled');
        openHasBoard();
      }, 500);
    });
  });

  //
  // Create board progress.
  //
  let boardProgress = (progress = 0) => {
    $('.create-board__determinate').css('width', `${progress}%`);
  };

  let startBoardProgress = () => {
    $('.create-board__progress').removeClass('hide');
  };

  let endBoardProgress = () => {
    $('.create-board__progress').addClass('hide');
  };

  //
  // Checklist init.
  //
  let checklistInit = () => {
    // Get lists.
    Trello.get(`/boards/${app.boardID}/lists`)
      .then(response => {
        app.checklist = {};
        app.checklist.allowedListNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        app.checklist.allowedListIDs = [];
        $.each(response, (key, list) => {
          if (list.name === 'Recipes') {
            app.recipesListID = list.id;
          }
          if (app.checklist.allowedListNames.indexOf(list.name) != -1) {
            app.checklist.allowedListIDs.push(list.id);
          }
        });
        localStorage.setItem(LOCALSTORAGE_ALLOWED_LIST_IDS, JSON.stringify(app.checklist.allowedListIDs));
        return app.checklist.allowedListIDs;
      })
      .then(response => Trello.get(`/boards/${app.boardID}/cards`, {fields: ['name', 'idList', 'idChecklist']}))
      .then(response => response.filter(card => app.checklist.allowedListIDs.indexOf(card.idList) != -1))
      .then(response => {
        app.checklist.recipes = response;
        let recipes = [];
        $.each(response, (key, recipe) => {
          recipes.push($('<a>')
            .attr('href', '#')
            .addClass('recipes__item')
            .addClass('collection-item')
            .data('id', recipe.id)
            .text(recipe.name)
            .on('click', function(e) {
              e.preventDefault();
              if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $('.checklist__item').removeClass('checklist__item--highlighted');
              }
              else {
                $('.recipes__item').removeClass('active');
                $(this).addClass('active');
                let id = $(this).data('id');
                $('.checklist__item')
                  .removeClass('checklist__item--highlighted')
                  .each(function() {
                    if ($(this).find('input').data('idCard') == id) {
                      $(this).addClass('checklist__item--highlighted');
                    }
                  });
              }
            }));
        });
        if (app.checklist.recipes.length !== 0) {
          $('.recipes__list')
            .removeClass('hide')
            .html('')
            .append(recipes);
          $('.recipes__empty').addClass('hide');
        }
        else {
          $('.recipes__list')
            .html('')
            .addClass('hide');
          $('.recipes__empty')
            .removeClass('hide')
            .html('')
            .append($('<p></p>').html(`No recipes added yet. Move some recipes to the day columns in your <a href="${app.shortUrl}">Trello board</a> to get started.`));
        }
        return response;
      })
      .then(response => {
        let deferreds = [];
        app.checklist.checklists = [];
        $.each(response, (key, card) => {
          deferreds.push(Trello.get(`/cards/${card.id}/checklists`).then(response => {
            app.checklist.checklists.push(response);
          }));
        });
        return $.when.apply($, deferreds);
      })
      .then(() => {
        app.checklist.preRender = {};
        $.each(app.checklist.checklists, (key, card) => {
          $.each(card, (key, checklist) => {
            if (!app.checklist.preRender[checklist.name]) {
              app.checklist.preRender[checklist.name] = {
                idCard: checklist.idCard,
                pos: checklist.pos,
                items: []
              }
            }
            $.each(checklist.checkItems, (key, item) => {
              item.idCard = checklist.idCard;
              app.checklist.preRender[checklist.name].items.push(item);
            });
          });
        });
        let $checklists = [];
        let checklistArray = $.map(app.checklist.preRender, (checklist, key) => {
          let checklistItems = checklist.items.sort((a, b) => {
            let nameA = a.name.toLowerCase(),
              nameB = b.name.toLowerCase();
            if (removeMeasurements(nameA) < removeMeasurements(nameB)) { return -1; }
            if (removeMeasurements(nameA) > removeMeasurements(nameB)) { return 1; }
            return 0;
          });
          return {
            name: key,
            pos: checklist.pos,
            items: checklistItems
          };
        }).sort((a, b) => a.pos > b.pos);
        $.each(checklistArray, (key, checklist) => {
          if (checklist.items.length === 0) {
            return;
          }
          $checklists.push($('<h2>')
            .addClass('checklist__title')
            .text(checklist.name));
          $.each(checklist.items, (key, item) => {
            let $input = $('<input>')
              .attr('type', 'checkbox')
              .addClass('filled-in')
              .attr('id', item.id)
              .data('idCard', item.idCard)
              .prop('checked', () => item.state == 'complete')
              .on('change', function() { // For some reason () => {} breaks the "this" variable.
                Trello.put(`/cards/${item.idCard}/checklist/${item.idChecklist}/checkItem/${item.id}/state`, {
                  idChecklist: item.idChecklist,
                  idCheckItem: item.id,
                  value: $(this).prop('checked')
                });
              });
            let $label = $('<label>')
              .attr('for', item.id)
              .text(item.name);
            let $wrapper = $('<div></div>')
              .addClass('checklist__item')
              .append($input)
              .append($label);
            $checklists.push($wrapper);
          });
        });
        // Add to DOM.
        $('.checklist')
          .html('')
          .append($checklists);
      });
  };

  //
  // Remove measurements from string.
  //
  // @TODO could be improved.
  let removeMeasurements = (str) => {
    return str.replace(/^[^a-zA-Z]+(cups|cup|tin|tins|can|cans|ounce|ounces|gram|grams|liter|liters|litre|litres|quart|gallon|pint|tablespoon|tablespoons|teaspoon|teaspoons|tsp|bunch|clove|cloves|sliced|chopped)*[^a-zA-Z]+/g, '');
  };

  //
  // Extra items.
  //

  // Bind extra item change.
  let bindExtraItemsCheckbox = () => {
    $('.extra-items__list').find(':checkbox').each((key, value) => {
      $(value).on('change', function(e) {
        e.preventDefault();
        let extraItems = JSON.parse(localStorage.getItem(LOCALSTORAGE_EXTRA_ITEMS));
        extraItems[key].checked = $(value).is(':checked');
        localStorage.setItem(LOCALSTORAGE_EXTRA_ITEMS, JSON.stringify(extraItems));
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
    if (!localStorage.getItem(LOCALSTORAGE_EXTRA_ITEMS)) {
      $('.extra-items__checklist')
        .html('')
        .append($('<p></p>')
          .addClass('extra-items__empty')
          .text('No extra items yet.')
          .on('click', function(e) {
            e.preventDefault();
            toggleExtraItems();
            updateExtraItemsTextarea();
          }));
    } else {
      // Populate checklist.
      $('.extra-items__checklist').empty();
      let extraItems = JSON.parse(localStorage.getItem(LOCALSTORAGE_EXTRA_ITEMS));
      $.each(extraItems, (key, item) => {
        let $checkbox = $('<div></div>')
          .addClass('extra-items__item')
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
    if (!localStorage.getItem(LOCALSTORAGE_EXTRA_ITEMS)) {
      $('#extra-items__textarea').val('');
    }
    else {
      let extraItemsTextareaVal = '';
      let extraItems = JSON.parse(localStorage.getItem(LOCALSTORAGE_EXTRA_ITEMS));
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
  $('.extra-items__edit').on('click', function(e) {
    e.preventDefault();
    toggleExtraItems();
    updateExtraItemsTextarea();
  });

  // Extra items cancel.
  $('.extra-items__cancel').on('click', function(e) {
    e.preventDefault();
    toggleExtraItems();
  });

  // Extra items save.
  $('.extra-items__save').on('click', function(e) {
    e.preventDefault();
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
      localStorage.setItem(LOCALSTORAGE_EXTRA_ITEMS, JSON.stringify(extraItemsStorage));
    }
    else {
      localStorage.setItem(LOCALSTORAGE_EXTRA_ITEMS, '');
    }

    toggleExtraItems();
    updateExtraItemsList();
  });

  //
  // Refresh board
  //
  $('.refresh-board').on('click', function(e) {
    e.preventDefault();
    checklistInit();
  });

  //
  // Set Board Button.
  //
  let setBoardButton = () => {
    if (app.shortUrl) {
      $('.open-board')
        .removeClass('hide')
        .attr('href', app.shortUrl);
    }
  };

  //
  // Reset board & shopping list.
  //
  $('.modal').modal();

  $('.modal-reset').on('click', function(e) {
    e.preventDefault();
    $('.checklist__item input:checked').click();
    let deferreds = [];
    $.each(app.checklist.recipes, (key, recipe) => {
      deferreds.push(Trello.put(`/cards/${recipe.id}/idList`, { value: app.recipesListID }));
    });
    $.when.apply($, deferreds)
      .done(() => {
        $('.refresh-board').click();
        console.log('Board reset.');
      });
  });

  //
  // Log out.
  //
  $('.log-out').on('click', function(e) {
    e.preventDefault();
    Trello.deauthorize();
    localStorage.removeItem(LOCALSTORAGE_BOARD_ID);
    localStorage.removeItem(LOCALSTORAGE_SHORT_URL);
    openAuthenticate();
  });

});
