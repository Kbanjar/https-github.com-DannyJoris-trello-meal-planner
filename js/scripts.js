$(document).ready(function() {

  let app = {};
  const TRELLO_APP_TOKEN = 'caf98b855b223644b58b7916f7649bca';
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
  const DEFAULT_BOARD_NAME = 'Meal Planner';
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
  const DEFAULT_RECIPE_NAME = 'Cremini and chard stuffed shells';
  const DEFAULT_RECIPE_DESC = 'Vegetarian stuffed shells filled with ricotta cheese, cremini mushrooms, and Swiss chard.';
  const DEFAULT_RECIPE_URL = 'http://ohmyveggies.com/recipe-cremini-and-chard-stuffed-shells/';
  const DEFAULT_RECIPE_INGREDIENTS = [
    {checklistName: CHECKLIST_ON_HAND, name: '1 tablespoon olive oil'},
    {checklistName: CHECKLIST_ON_HAND, name: 'Salt and pepper to taste'},
    {checklistName: CHECKLIST_ON_HAND, name: '2 teaspoons Italian seasoning'},
    {checklistName: CHECKLIST_PRODUCE, name: '3 cloves garlic, minced'},
    {checklistName: CHECKLIST_PRODUCE, name: '8 ounces sliced cremini mushrooms'},
    {checklistName: CHECKLIST_PRODUCE, name: '1 bunch (about 8 ounces) Swiss chard, stems discarded and leaves coarsely chopped'},
    {checklistName: CHECKLIST_DAIRY, name: '1 (15-ounce) container ricotta cheese'},
    {checklistName: CHECKLIST_DAIRY, name: '1/2 cup shredded mozzarella cheese'},
    {checklistName: CHECKLIST_DAIRY, name: '1/2 cup shredded Parmesan cheese'},
    {checklistName: CHECKLIST_DAIRY, name: '1 egg, lightly beaten'},
    {checklistName: CHECKLIST_GRAINS, name: '16 jumbo pasta shells, cooked according to package directions'},
    {checklistName: CHECKLIST_CANNED, name: '1 1/2 cups marinara sauce, divided'}
  ];

  /**
   * Set LocalStorage item.
   */
  let setItem = (key, value) => {
    localStorage.setItem(key, value);
    return value;
  };

  /**
   * Get LocalStorage item.
   */
  let getItem = (key) => {
    return localStorage.getItem(key);
  };

  /**
   * Remove LocalStorage item.
   */
  let removeItem = (key) => {
    localStorage.removeItem(key);
    delete app[key];
  };

  /**
   * Extra items class.
   */
  class ExtraItems {
    constructor() {
      this.setSelectors();
      this.bindElements();
      // Why is this here?
      this.updateExtraItemsList();
    }

    /**
     * Set selectors.
     */
    setSelectors() {
      this.$extraItemsList = $('.extra-items__list');
      this.$extraItemsChecklist = $('.extra-items__checklist');
      this.$extraItemsTextarea = $('#extra-items__textarea');
      this.$extraItemsInput = $('.extra-items__input');
      this.$extraItemsEdit = $('.extra-items__edit');
      this.$extraItemsCancel = $('.extra-items__cancel');
      this.$extraItemsSave = $('.extra-items__save');
    }

    /**
     * Bind elements.
     */
    bindElements() {
      this.bindExtraItemsCheckbox();
      this.bindExtraItemsEdit();
      this.bindExtraItemsCancel();
      this.bindExtraItemsSave();
    }

    /**
     * Bind extra item checkbox change.
     */
    bindExtraItemsCheckbox()  {
      this.$extraItemsList.find(':checkbox').each((key, value) => {
        $(value).on('change', function(e) {
          e.preventDefault();
          let extraItems = JSON.parse(getItem(LOCALSTORAGE_EXTRA_ITEMS));
          extraItems[key].checked = $(this).is(':checked');
          setItem(LOCALSTORAGE_EXTRA_ITEMS, JSON.stringify(extraItems));
        });
      });
    }

    /**
     * Populate extra items.
     *
     * [
     *   {
     *     value: 'Extra item',
     *     checked: true
     *   }
     * ]
     */
    updateExtraItemsList() {
      let self = this;
      if (!getItem(LOCALSTORAGE_EXTRA_ITEMS)) {
        this.$extraItemsChecklist
          .html('')
          .append($('<p></p>')
            .addClass('extra-items__empty')
            .text('No extra items yet.')
            .on('click', function(e) {
              e.preventDefault();
              self.toggleExtraItems();
              self.updateExtraItemsTextarea();
            }));
      } else {
        // Populate checklist.
        this.$extraItemsChecklist.empty();
        let extraItems = JSON.parse(getItem(LOCALSTORAGE_EXTRA_ITEMS));
        $.each(extraItems, (key, item) => {
          let $checkbox = $('<div></div>')
            .addClass('extra-items__item')
            .append(`<input type="checkbox" class="filled-in" id="extra-item__item-${key}" ${item.checked ? 'checked="checked"': ""}/>`)
            .append(`<label for="extra-item__item-${key}">${item.value}</label>`);
          self.$extraItemsChecklist.append($checkbox);
        });
        this.bindExtraItemsCheckbox();
      }
    }

    /**
     * Update extra items textarea.
     */
    updateExtraItemsTextarea() {
      if (!getItem(LOCALSTORAGE_EXTRA_ITEMS)) {
        this.$extraItemsTextarea.val('');
      }
      else {
        let value = '';
        let extraItems = JSON.parse(getItem(LOCALSTORAGE_EXTRA_ITEMS));
        $.each(extraItems, (key, item) => {
          if (item.checked) {
            value += '- [x] ';
          }
          else {
            value += '- [ ] ';
          }
          value += item.value + '\n';
        });
        this.$extraItemsTextarea.val(value);
      }
    }

    /**
     * Toggle extra items.
     */
    toggleExtraItems() {
      let self = this;
      this.$extraItemsInput.toggleClass('hide');
      this.$extraItemsList.toggleClass('hide');
      // Autoresize and focus.
      if (!this.$extraItemsInput.hasClass('hide')) {
        setTimeout(() => {
          self.$extraItemsTextarea.trigger('autoresize').focus();
        }, 100);
      }
    }

    /**
     * Extra items edit.
     */
    bindExtraItemsEdit() {
      let self = this;
      this.$extraItemsEdit.on('click', function(e) {
        e.preventDefault();
        self.toggleExtraItems();
        self.updateExtraItemsTextarea();
      });
    }

    /**
     * Extra items cancel.
     */
    bindExtraItemsCancel() {
      let self = this;
      this.$extraItemsCancel.on('click', function(e) {
        e.preventDefault();
        self.toggleExtraItems();
      });
    }

    /**
     * Extra items save.
     */
    bindExtraItemsSave() {
      let self = this;
      this.$extraItemsSave.on('click', function(e) {
        e.preventDefault();
        // Store in localStorage.
        let values = self.$extraItemsTextarea.val().trim();
        if (values) {
          values = values.split(/\r?\n/);
          let extraItemsStorage = values.map((item) => {
            let checked = false;
            if (item.match(/^(- \[x])+/)) {
              checked = true;
            }
            return {
              value: item.replace(/^(- \[x])/, '').replace(/^[^A-Za-z0-9]+/, ''),
              checked: checked
            }
          });
          setItem(LOCALSTORAGE_EXTRA_ITEMS, JSON.stringify(extraItemsStorage));
        }
        else {
          setItem(LOCALSTORAGE_EXTRA_ITEMS, '');
        }
        self.toggleExtraItems();
        self.updateExtraItemsList();
      });
    }

  }

  /**
   * Meal planner class.
   */
  class MealPlanner {
    constructor() {
      let self = this;
      // Set variables.
      this.setVariables();
      // Set selectors.
      this.setSelectors();
      // Get Trello client js.
      this.getTrelloClient()
        .done(() => self.trelloAuthenticate())
        .fail(() => console.error('Failed to load Trello client.'));
      this.bindActions();
    }

    /**
     * Set variables.
     */
    setVariables() {
      // Extra Items.
      this.extraItems = new ExtraItems();
      // Get stored values.
      app.boardID = getItem(LOCALSTORAGE_BOARD_ID);
      app.shortUrl = getItem(LOCALSTORAGE_SHORT_URL);
    }

    /**
     * Set selectors.
     */
    setSelectors() {
      // Authenticate.
      this.$authenticate = $('.authenticate');
      this.$authenticateLink = this.$authenticate.find('.authenticate__link');
      // Create board.
      this.$createBoard = $('.create-board');
      this.$createBoardLink = this.$createBoard.find('.create-board__link');
      this.$createBoardSelect = this.$createBoard.find('.create-board__select');
      this.$createBoardList = this.$createBoard.find('.create-board__board-list');
      this.$createBoardDeterminate = this.$createBoard.find('.create-board__determinate');
      this.$createBoardProgress = this.$createBoard.find('.create-board__progress');
      // Board.
      this.$board = $('.board');
      this.$shoppingCompleted = this.$board.find('.shopping-completed');
      this.$noItems = this.$board.find('.no-items');
      this.$checklists = this.$board.find('.checklists');
      this.$checklist = this.$board.find('.checklist');
      // Actions.
      this.$turnOffShoppingMode = $('.turn-off-shopping-mode');
      this.$refreshBoard = $('.refresh-board');
      this.$shoppingMode = $('.shopping-mode');
      this.$openBoard = $('.open-board');
      this.$modal = $('.modal');
      this.$modalReset = $('.modal-reset');
      this.$logOut = $('.log-out');
    }

    /**
     * Include the Trello client script. Authenticate if a token is available.
     */
    getTrelloClient() {
      let trelloClient = `https://trello.com/1/client.js?key=${TRELLO_APP_TOKEN}`;
      let trelloToken = getItem(LOCALSTORAGE_TRELLO_TOKEN);
      if (trelloToken) {
        trelloClient += `&token=${trelloToken}`;
      }
      // Include Trello script.
      return $.getScript(trelloClient);
    }

    /**
     * Check if authorized.
     */
    trelloAuthenticate() {
      let self = this;
      if (!Trello.authorized()) {
        this.open('authenticate');
        this.$authenticateLink.on('click', function(e) {
          e.preventDefault();
          Trello.authorize({
            type: 'popup',
            name: 'Trello Meal Planner',
            scope: {
              read: 'true',
              write: 'true' },
            expiration: 'never',
            success: (result) => self.getBoard(),
            error: () => console.error('Trello authentication failed!')
          });
        });
      }
      else {
        this.getBoard();
      }
    }

    /**
     * Generic function to show sections of the app.
     *
     * @param {string} section
     *   Which section to open.
     */
    open(section) {
      switch (section) {
        case 'authenticate':
          this.$authenticate.removeClass('hide');
          this.$createBoard.addClass('hide');
          this.$board.addClass('hide');
          break;
        case 'board':
          this.$authenticate.addClass('hide');
          this.$createBoard.addClass('hide');
          this.$board.removeClass('hide');
          this.buildBoard();
          break;
        case 'create-board':
          this.openCreateBoard();
          break;
      }

    }

    /**
     * Open "create board" section.
     */
    openCreateBoard() {
      let self = this;
      this.$authenticate.addClass('hide');
      this.$createBoard.removeClass('hide');
      this.$board.addClass('hide');
      // Create board button.
      this.$createBoardLink.on('click', function(e) {
        e.preventDefault();
        $(this).addClass('disabled');
        self.$createBoardSelect.addClass('hide');
        self.createBoard();
      });
      // List available boards.
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
                  // Store board values & open board.
                  app.boardID = setItem(LOCALSTORAGE_BOARD_ID, board.id);
                  app.shortUrl = setItem(LOCALSTORAGE_SHORT_URL, board.shortUrl);
                  self.open('board');
                }));
            }
          });
          // Append and display boards.
          self.$createBoardSelect.removeClass('hide');
          self.$createBoardList.append(boards);
        });
    }

    /**
     * Get board. If no board ID is stored or a stored board ID isn't found,
     * open the Board creation section.
     */
    getBoard() {
      let self = this;
      if (getItem(LOCALSTORAGE_BOARD_ID)) {
        Trello.get(`/board/${getItem(LOCALSTORAGE_BOARD_ID)}`)
          .done(() => self.open('board'))
          .fail(() => self.open('create-board'));
      }
      else {
        this.open('create-board');
      }
    }

    /**
     * Create board.
     */
    createBoard() {
      let self = this;
      // Create board API call.
      this.startBoardProgress();
      this.boardProgress(0);
      Trello.post('/boards', {
        name: DEFAULT_BOARD_NAME,
        defaultLabels: false,
        defaultLists: false
      }).then(response => {
        self.boardProgress(15);
        console.log('Board created');
        app.boardID = setItem(LOCALSTORAGE_BOARD_ID, response.id);
        app.shortUrl = setItem(LOCALSTORAGE_SHORT_URL, response.shortUrl);
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
          self.boardProgress(30);
          console.log('Labels & lists added');
          // Add example card.
          return Trello.get(`/boards/${app.boardID}/lists`)
        })
        .then(response => {
          self.boardProgress(50);
          $.each(response, (key, list) => {
            if (list.name === 'Recipes') {
              app.recipesListID = setItem(LOCALSTORAGE_RECIPES_LIST_ID, list.id);
            }
            if (list.name === 'Monday') {
              app.mondayListID = setItem(LOCALSTORAGE_MONDAY_LIST_ID, list.id);
            }
          });
          return Trello.post('/cards/', {
            name: 'RECIPE TEMPLATE',
            idList: app.recipesListID
          });
        })
        .then(response => {
          self.boardProgress(60);
          app.templateCardID = setItem(LOCALSTORAGE_TEMPLATE_CARD_ID, response.id);

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
          name: DEFAULT_RECIPE_NAME,
          desc: DEFAULT_RECIPE_DESC,
          idList: app.mondayListID,
          idCardSource: app.templateCardID
        }))
        .then(response => {
          self.boardProgress(70);
          app.recipeCardID = response.id;
          return Trello.post(`/cards/${response.id}/attachments`, {
            url: DEFAULT_RECIPE_URL
          });
        })
        .then(() => Trello.get(`/boards/${app.boardID}/labels`))
        .then(response => {
          let red = $.grep(response, label => label.color === 'red')[0];
          return Trello.post(`/cards/${app.recipeCardID}/idLabels`, { value: red.id });
        })
        .then(() => Trello.get(`/boards/${app.boardID}/checklists`))
        .then((response) => {
          self.boardProgress(80);
          let ingredients = $.map(DEFAULT_RECIPE_INGREDIENTS, function(el, i) {
            let checklistID = $.grep(response, checklist => checklist.name === el.checklistName && checklist.idCard === app.recipeCardID)[0].id;
            return Object.assign({} , el, {
              checklistID: checklistID
            });
          });
          let deferreds = [];
          $.each(ingredients, (key, ingredient) => {
            deferreds.push(Trello.post(`/cards/${app.recipeCardID}/checklist/${ingredient.checklistID}/checkItem`, {
              idChecklist: ingredient.checklistID,
              name: ingredient.name
            }));
          });
          return $.when.apply($, deferreds);
        })
        .then(() => {
          self.boardProgress(100);
          console.log('Create board completed');
          setTimeout(() => {
            self.endBoardProgress();
            self.$createBoardLink.removeClass('disabled');
            self.open('board');
          }, 500);
        });
    }

    /**
     * Create board progress.
     *
     * @param progress
     *   Integer between 0 and 100 to indicate a progress status.
     */
    boardProgress(progress = 0) {
      this.$createBoardDeterminate.css('width', `${progress}%`);
    }

    startBoardProgress() {
      this.$createBoardProgress.removeClass('hide');
    }

    endBoardProgress() {
      this.$createBoardProgress.addClass('hide');
    }

    /**
     * Build board.
     */
    buildBoard() {
      let self = this;
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
          setItem(LOCALSTORAGE_ALLOWED_LIST_IDS, JSON.stringify(app.checklist.allowedListIDs));
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
          let checklistArray = $.map(app.checklist.preRender, (checklist, key) => {
            let checklistItems = checklist.items.sort((a, b) => {
              let nameA = a.name.toLowerCase(),
                nameB = b.name.toLowerCase();
              if (self.removeMeasurements(nameA) < self.removeMeasurements(nameB)) { return -1; }
              if (self.removeMeasurements(nameA) > self.removeMeasurements(nameB)) { return 1; }
              return 0;
            });
            return {
              name: key,
              pos: checklist.pos,
              items: checklistItems
            };
          }).sort((a, b) => a.pos > b.pos);
          $.each(checklistArray, (key, checklist) => {
            let $checklistItems = [];
            if (checklist.items.length === 0) {
              return;
            }
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
                  self.checkedItemShoppingMode(this);
                  self.updateCount(checklist.name);
                });
              let $label = $('<label>')
                .attr('for', item.id)
                .text(item.name);
              let $wrapper = $('<div></div>')
                .addClass('checklist__item')
                .append($input)
                .append($label);
              $checklistItems.push($wrapper);
            });
            // Add to appropriate section.
            $('.checklist[data-checklist-name="' + checklist.name + '"]')
              .find('.checklist__items')
              .html('')
              .append($checklistItems);
            self.updateCount(checklist.name);
          });
          // Trigger shopping mode action.
          self.triggerShoppingMode();
          // Unhide the checklists.
          self.$checklists.removeClass('is-loading');
          // Set the "Open board" button in the actions.
          self.setOpenBoardButton();
        });
    }

    /**
     * Remove measurements from string to improve sorting.
     *
     * @param str
     *   String to remove measurements from.
     * @return {void|string|XML|*}
     *  String without measurements.
     *
     * @TODO could be improved.
     */
    removeMeasurements(str) {
      return str.replace(/^[^a-zA-Z]+(cups|cup|tin|tins|can|cans|ounce|ounces|gram|grams|liter|liters|litre|litres|quart|gallon|pint|tablespoon|tablespoons|teaspoon|teaspoons|tsp|bunch|clove|cloves|sliced|chopped)*[^a-zA-Z]+/g, '');
    }

    /**
     * Update the checklist count.
     */
    updateCount(checklistName) {
      let $checklist = $('.checklist[data-checklist-name="' + checklistName + '"]');
      let total = $checklist.find('.checklist__item').length;
      let checked = $checklist.find('input:checked').length;
      $checklist.find('.checklist__count').text(checked + '/' + total);
      if (total > 0 && total === checked) {
        $checklist.find('.checklist__meta .material-icons')
          .addClass('teal-text')
          .removeClass('hide')
          .end()
          .find('.checklist__count')
          .removeClass('grey-text')
          .addClass('teal-text');
      }
      else {
        $checklist.find('.checklist__meta .material-icons')
          .addClass('hide')
          .removeClass('teal-text')
          .end()
          .find('.checklist__count')
          .removeClass('grey-text')
          .removeClass('teal-text');
      }
      if (total === 0) {
        $checklist.find('.checklist__meta').addClass('grey-text');
      }
      else {
        $checklist.find('.checklist__meta').removeClass('grey-text');
      }
    }

    /**
     * Bind Action elements.
     */
    bindActions() {
      let self = this;
      // Refresh board.
      this.$refreshBoard.on('click', function(e) {
        e.preventDefault();
        self.buildBoard();
      });

      // Hide checked items.
      this.$shoppingMode
        .find('input')
        .on('change', function() {
          if ($(this).prop('checked')) {
            self.enableShoppingMode(500);
          }
          else {
            self.disableShoppingMode();
          }
      });

      // Turn off shopping mode.
      this.$turnOffShoppingMode.on('click', function() {
        if (self.isShoppingModeEnabled()) {
          self.$shoppingMode.find('input').click();
        }
      });

      // Modal init.
      this.$modal.modal();
      // Reset board & shopping list.
      this.$modalReset.on('click', function(e) {
        e.preventDefault();
        // Uncheck all checked items.
        $('.checklist__item input:checked').click();
        // Move cards back into recipes list.
        let deferreds = [];
        $.each(app.checklist.recipes, (key, recipe) => {
          deferreds.push(Trello.put(`/cards/${recipe.id}/idList`, { value: app.recipesListID }));
        });
        // Aplly and refresh board.
        $.when.apply($, deferreds)
          .done(() => self.$refreshBoard.click());
      });

      // Logout.
      this.$logOut.on('click', function(e) {
        e.preventDefault();
        self.logOut();
      });
    }

    /**
     * Hide messages.
     */
    hideMessages() {
      this.$shoppingCompleted.addClass('hide');
      this.$noItems.addClass('hide');
    }

    /**
     * Check if there's a message to be displayed.
     */
    checkMessages() {
      if (this.isShoppingModeEnabled()) {
        let total = this.$checklists.find('.checklist__item').length;
        let checked = this.$checklists.find('input:checked').length;
        if (!total) {
          this.$noItems.removeClass('hide');
        }
        if (total && total === checked) {
          this.$shoppingCompleted.removeClass('hide');
        }
      }
    }

    /**
     * Disable shopping mode.
     */
    disableShoppingMode() {
      this.$checklist.find('input:checked').closest('.checklist__item').stop().fadeIn(0);
      this.shoppingModeShowChecklists();
      this.hideMessages();
    }

    /**
     * Enable shopping mode.
     */
    enableShoppingMode(duration) {
      duration = duration || 0;
      this.$checklist.find('input:checked').closest('.checklist__item').stop().fadeOut(duration);
      this.shoppingModeHideChecklists(duration);
      this.checkMessages();
    }

    /**
     * Checked item shopping mode.
     */
    checkedItemShoppingMode(el) {
      let self = this;
      let duration = 3000;
      if ($(el).prop('checked') && this.isShoppingModeEnabled()) {
        $(el).parent().stop().fadeOut(duration);
        this.shoppingModeHideChecklists(duration);
        setTimeout(function() {
          self.checkMessages();
        }, duration);
      }
      else {
        $(el).closest('.checklist__item').stop().fadeIn(0);
        this.shoppingModeShowChecklists();
        this.hideMessages();
      }
    }

    /**
     * Trigger shopping mode action.
     */
    triggerShoppingMode() {
      if (this.isShoppingModeEnabled()) {
        this.enableShoppingMode(0);
      }
      else {
        this.disableShoppingMode();
      }
    }

    /**
     * Returns the value of the "Shopping mode" checkbox.
     */
    isShoppingModeEnabled() {
      return this.$shoppingMode.find('input').is(':checked');
    }

    /**
     * Shopping mode hide checklists.
     */
    shoppingModeHideChecklists(duration) {
      let self = this;
      $.each(self.$checklist, function() {
        let total = $(this).find('.checklist__item').length;
        let checked = $(this).find('input:checked').length;
        if (!total || total === checked) {
          $(this).stop().fadeOut(duration);
        }
      });
    }

    /**
     * Shopping mode show checklists.
     */
    shoppingModeShowChecklists() {
      let self = this;
      $.each(self.$checklist, function() {
        $(this).stop().fadeIn(0);
      });
    }

    /**
     * Set button that links to the Trello board.
     */
    setOpenBoardButton() {
      if (app.shortUrl) {
        this.$openBoard
          .removeClass('hide')
          .attr('href', app.shortUrl);
      }
    }

    /**
     * Log out.
     */
    logOut() {
      Trello.deauthorize();
      removeItem(LOCALSTORAGE_BOARD_ID);
      removeItem(LOCALSTORAGE_SHORT_URL);
      this.open('authenticate');
    }

  }

  new MealPlanner();

});
