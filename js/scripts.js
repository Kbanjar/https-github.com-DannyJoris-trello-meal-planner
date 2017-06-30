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
  const LOCALSTORAGE_EXTRA_ITEMS_CARD_ID = 'extraItemsCardID';
  const LOCALSTORAGE_ALLOWED_LIST_IDS = 'allowedListIDs';
  const LOCALSTORAGE_EXTRA_ITEMS = 'extraItems'; // Deprecated.
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
  const RECIPES_LIST_NAME = 'Recipes';
  const DEFAULT_LISTS = [
    {name: RECIPES_LIST_NAME, pos: 1},
    {name: "Monday", pos: 2},
    {name: "Tuesday", pos: 3},
    {name: "Wednesday", pos: 4},
    {name: "Thursday", pos: 5},
    {name: "Friday", pos: 6},
    {name: "Saturday", pos: 7},
    {name: "Sunday", pos: 8},
  ];
  const TEMPLATE_CARD_NAME = 'RECIPE TEMPLATE';
  const TEMPLATE_CARD_DESC = '';
  const DEFAULT_EXTRA_ITEMS_NAME = 'Extra items';
  const DEFAULT_EXTRA_ITEMS_DESC = 'Card to list extra shopping items that are not part of any recipe. Unlike recipe cards, this card will be included in the shopping list no matter which Trello list it is in.';
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
    }

    /**
     * Set variables.
     */
    setVariables() {
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
      this.$checklistItems = this.$checklist.find('.checklist__items');
      this.$extraItems = this.$checklists.find('.extra-items');
      this.$modalRemove = $('#modal-remove-item').find('.modal-remove');
      // Actions.
      this.$turnOffShoppingMode = $('.turn-off-shopping-mode');
      this.$refreshBoard = $('.refresh-board');
      this.$shoppingMode = $('.shopping-mode');
      this.$openBoard = $('.open-board');
      this.$modal = $('.modal');
      this.$modalReset = $('#modal-reset-board').find('.modal-reset');
      this.$resetBoard = $('.reset-board');
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
      this.startBoardProgress();
      this.boardProgress(0);
      // Create board.
      Trello.post('/boards', {
        name: DEFAULT_BOARD_NAME,
        defaultLabels: false,
        defaultLists: false
      })
      // Add labels and lists.
      .then(response => {
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
      // Get lists.
      .then(() => {
        self.boardProgress(30);
        console.log('Labels & lists added');
        return Trello.get(`/boards/${app.boardID}/lists`)
      })
      // Add recipe template card.
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
        return self.createTemplateCard();
      })
      // Create Extra Items card.
      .then(() => self.createExtraItemsCard())
      // Create default recipe card.
      .then(() => Trello.post('/cards/', {
        name: DEFAULT_RECIPE_NAME,
        desc: DEFAULT_RECIPE_DESC,
        idList: app.mondayListID,
        idCardSource: app.templateCardID
      }))
      // Add URL to default recipe card.
      .then(response => {
        self.boardProgress(70);
        app.recipeCardID = response.id;
        return Trello.post(`/cards/${response.id}/attachments`, {
          url: DEFAULT_RECIPE_URL
        });
      })
      // Add the red "mains" label to the default recipe card.
      .then(() => Trello.get(`/boards/${app.boardID}/labels`))
      .then(response => {
        let red = $.grep(response, label => label.color === 'red')[0];
        return Trello.post(`/cards/${app.recipeCardID}/idLabels`, { value: red.id });
      })
      // Add ingredients to the default recipe card.
      .then(() => Trello.get(`/boards/${app.boardID}/checklists`))
      .then((response) => {
        self.boardProgress(80);
        // Add checklist ID to ingredients list.
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
      // Complete board creation process.
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
     * Create recipes list.
     */
    createRecipesList() {
      return Trello.post(`/boards/${app.boardID}/lists`, {name: RECIPES_LIST_NAME, pos: 'top'})
    }

    /**
     * Get recipes list.
     */
    getRecipesList() {
      let self = this;
      // Get ID from storage.
      let recipesListID = getItem(LOCALSTORAGE_RECIPES_LIST_ID);
      if (recipesListID === null) {
        return Trello.get(`/lists/${recipesListID}`)
        // .fail() can't return a new promise:
        // https://stackoverflow.com/a/19253671/477949
        .then(undefined, error => {
          // List not found by ID, so attempt to find it by title.
          return self.getRecipesListByTitle();
        });
      }
      else {
        // Get recipes list by title.
        return this.getRecipesListByTitle();
      }
    }

    /**
     * Get recipes list by title.
     */
    getRecipesListByTitle() {
      let self = this;
      return Trello.get(`/boards/${app.boardID}/lists`, {fields: ['name']})
        // Filter by list name.
        .then(response => response.filter(list => list.name === RECIPES_LIST_NAME))
        .then(response => {
          if (response.length) {
            // Store recipes list ID and get the list again.
            app.recipesListID = setItem(LOCALSTORAGE_RECIPES_LIST_ID, response[0].id);
            return Trello.get(`/lists/${app.recipesListID}`);
          }
          else {
            // Create recipes list.
            return self.createRecipesList();
          }
        });
    }

    /**
     * Create recipe template card.
     */
    createTemplateCard() {
      let recipesListID = getItem(LOCALSTORAGE_RECIPES_LIST_ID);
      if (recipesListID !== null) {
        // Create card.
        return Trello.post('/cards/', {
          name: TEMPLATE_CARD_NAME,
          desc: TEMPLATE_CARD_DESC,
          idList: recipesListID,
        })
        .then(response => {
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
        .then(() => Trello.get(`/cards/${app.templateCardID}`));
      }
      else {
        console.error('Recipes list ID not found.');
      }
    }

    /**
     * Get template card.
     */
    getTemplateCard() {
      let self = this;
      // Get template card ID
      let templateCardID = getItem(LOCALSTORAGE_TEMPLATE_CARD_ID);
      if (templateCardID !== null) {
        return Trello.get(`/boards/${app.boardID}/cards/${templateCardID}`, {
          idCard: templateCardID
        })
        // .fail() can't return a new promise:
        // https://stackoverflow.com/a/19253671/477949
        .then(undefined, error => {
          // Card not found by ID, so attempt to find it by title.
          return self.getTemplateCardByTitle();
        });
      }
      else {
        // ID not found in localstorage, so do a search by card title.
        return self.getTemplateCardByTitle();
      }
    }

    /**
     * Get template card by title.
     */
    getTemplateCardByTitle() {
      let self = this;
      return Trello.get(`/boards/${app.boardID}/cards`, {fields: ['name']})
        // Filter by card name.
        .then(response => response.filter(card => card.name === TEMPLATE_CARD_NAME))
        .then(response => {
          if (response.length) {
            // Store template card ID and get the card again.
            app.templateCardID = setItem(LOCALSTORAGE_TEMPLATE_CARD_ID, response[0].id);
            return Trello.get(`/boards/${app.boardID}/cards/${app.templateCardID}`, {
              idCard: app.templateCardID
            });
          }
          else {
            // Create template card.
            return self.createTemplateCard();
          }
        });
    }

    /**
     * Create Extra Items card.
     */
    createExtraItemsCard() {
      let self = this;
      let recipesListID = getItem(LOCALSTORAGE_RECIPES_LIST_ID);
      let templateCardID = getItem(LOCALSTORAGE_TEMPLATE_CARD_ID);
      if (recipesListID && templateCardID) {
        return Trello.post('/cards/', {
          name: DEFAULT_EXTRA_ITEMS_NAME,
          desc: DEFAULT_EXTRA_ITEMS_DESC,
          idList: recipesListID,
          idCardSource: templateCardID
        })
        .then(response => {
          app.extraItemsCardID = setItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID, response.id);
          // Get old extra items from localStorage.
          let extraItems = JSON.parse(getItem(LOCALSTORAGE_EXTRA_ITEMS));
          if (extraItems) {
            // There's old extra items in localStorage, add them to the
            // "Everything else" checklist.
            return Trello.get(`/cards/${response.id}/checklists`)
              .then(response => {
                // Find "Everything else" checklist.
                let otherItemsID = $.grep(response, checklist => checklist.name === CHECKLIST_OTHER)[0].id;
                let deferreds = [];
                // Add items to the checklist.
                $.each(extraItems, (key, item) => {
                  deferreds.push(Trello.post(`/cards/${app.extraItemsCardID}/checklist/${otherItemsID}/checkItem`, {
                    idChecklist: otherItemsID,
                    name: item.value
                  }).then((response) => {
                    let itemID = response.id;
                    return Trello.put(`/cards/${app.extraItemsCardID}/checklist/${otherItemsID}/checkItem/${itemID}`, {
                      idChecklistCurrent: otherItemsID,
                      idCheckItem: itemID,
                      state: item.checked
                    });
                  }));
                });
                return $.when.apply($, deferreds);
              })
              .then(() => {
                // Remove extraItems localStorage.
                removeItem(LOCALSTORAGE_EXTRA_ITEMS);
                return self.getExtraItemsCard();
              });
          }
          else {
            return response;
          }
        });
      }
      else {
        console.error('Recipes list ID and/or template card ID not found.');
      }
    }

    /**
     * Get Extra Items card.
     */
    getExtraItemsCard() {
      let self = this;
      let extraItemsCardID = getItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID);
      if (extraItemsCardID !== null) {
          return Trello.get(`/boards/${app.boardID}/cards/${extraItemsCardID}`, {
            idCard: extraItemsCardID
          })
          // .fail() can't return a new promise:
          // https://stackoverflow.com/a/19253671/477949
          .then(undefined, error => {
            // Card not found by ID, so attempt to find it by title.
            return self.getExtraItemsCardByTitle();
          });
      }
      else {
        // ID not found in localstorage, so do a search by card title.
        return self.getExtraItemsCardByTitle();
      }
    }

    /**
     * Get Extra Items card by title.
     */
    getExtraItemsCardByTitle() {
      let self = this;
      return Trello.get(`/boards/${app.boardID}/cards`, {fields: ['name']})
        // Filter by card name.
        .then(response => response.filter(card => card.name === DEFAULT_EXTRA_ITEMS_NAME))
        .then(response => {
          if (response.length) {
            // Store Extra Items card ID and get the card again.
            app.extraItemsCardID = setItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID, response[0].id);
            return Trello.get(`/boards/${app.boardID}/cards/${app.extraItemsCardID}`, {
              idCard: app.extraItemsCardID
            });
          }
          else {
            // Create Extra Items card.
            return self.createExtraItemsCard();
          }
        });
    }

    /**
     * Build board.
     */
    buildBoard() {
      let self = this;
      // Reset board.
      this.resetBoard();
      // Scroll to top.
      $('html, body').animate({ scrollTop: 0 }, 300);
      // Start off by making sure we include essential lists and cards.
      this.getRecipesList()
        .then(() => self.getTemplateCard())
        .then(() => self.getExtraItemsCard())
        // Get lists.
        .then(() => Trello.get(`/boards/${app.boardID}/lists`))
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
        // Get all cards.
        .then(response => Trello.get(`/boards/${app.boardID}/cards`, {
          fields: ['name', 'idList', 'idChecklist']
        }))
        // Filter the cards to only get ones from allowed "weekday" lists.
        .then(response => response.filter(card => {
          return app.checklist.allowedListIDs.indexOf(card.idList) != -1 || card.id === getItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID);
        }))
        // Populate recipes list.
        .then(response => {
          app.checklist.recipes = response;
          let recipes = [];
          $.each(response, (key, recipe) => {
            recipes.push($('<a>')
              .attr('href', '#')
              .addClass('recipes__item')
              .addClass('collection-item')
              .attr('data-card-id', recipe.id)
              .text(recipe.name)
              .on('click', function(e) {
                e.preventDefault();
                if ($(this).hasClass('active')) {
                  // Disable highlight.
                  $(this).removeClass('active');
                  $('.checklist__item').removeClass('checklist__item--highlighted');
                }
                else {
                  // Enable highlight.
                  $('.recipes__item').removeClass('active');
                  $(this).addClass('active');
                  let id = $(this).attr('data-card-id');
                  $('.checklist__item')
                    .removeClass('checklist__item--highlighted')
                    .each(function() {
                      if ($(this).find('input').attr('data-card-id') == id) {
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
        // Get all checklists from "weekday" and Extra Items cards.
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
        // Prepare, sort and render ingredients.
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
              // Create checklist item.
              let $wrapper = self.createChecklistItem(item, checklist.name);
              $checklistItems.push($wrapper);
            });
            // Add to appropriate section.
            $('.checklist[data-checklist-name="' + checklist.name + '"]')
              .find('.checklist__items')
              .html('')
              .append($checklistItems);
            self.updateCount(checklist.name);
          });
          // Bind extra items.
          self.bindExtraItems();
          // Trigger shopping mode action.
          self.triggerShoppingMode();
          // Bind actions only once.
          if (!app.actionsBound) {
            self.bindActions();
            app.actionsBound = true;
          }
          // Unhide the checklists.
          self.$checklists.removeClass('is-loading');
          // Set the "Open board" button in the actions.
          self.setOpenBoardButton();
          // Enable button again.
          self.$refreshBoard.removeClass('disabled');
        });
    }

    /**
     * Reset board.
     */
    resetBoard() {
      let self = this;
      this.$checklists.addClass('is-loading');
      // Disable shopping mode if enabled.
      if (this.isShoppingModeEnabled()) {
        this.$shoppingMode.find('input').click();
      }
      this.$checklistItems.html('');
      $.each(self.$checklist, function() {
        self.updateCount($(this).attr('data-checklist-name'));
      });
    }

    /**
     * Create checklist item.
     *
     * @param {object} item
     *   Checklist item object. Needs to contain: id, idCard, state, idChecklist
     *   and name properties.
     * @param {string} checklistName
     *   Human readable name of the checklist.
     */
    createChecklistItem(item, checklistName) {
      let self = this;
      let $input = $('<input>')
        .attr('type', 'checkbox')
        .addClass('filled-in')
        .attr('id', item.id)
        .attr('data-card-id', item.idCard)
        .prop('checked', () => item.state == 'complete')
        .on('change', function() {
          Trello.put(`/cards/${item.idCard}/checklist/${item.idChecklist}/checkItem/${item.id}/state`, {
            idChecklist: item.idChecklist,
            idCheckItem: item.id,
            value: $(this).prop('checked')
          });
          self.checkedItemShoppingMode(this);
          self.updateCount(checklistName);
        });
      let $label = $('<label>')
        .attr('for', item.id)
        .text(item.name);
      let $checklistItem = $('<div></div>')
        .addClass('checklist__item')
        .append($input)
        .append($label);
      if (item.idCard === getItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID)) {
        $checklistItem.addClass('checklist__item--extra-items');
        let $delete = $('<a></a>').addClass('checklist__item-delete')
          .attr('href', '#modal-remove-item')
          .append('<i class="material-icons grey-text">delete</i>')
          .on('click', function(e) {
            e.preventDefault();
            $('#modal-remove-item')
              .find('.modal__remove-item')
              .text(item.name)
              .end()
              .find('.modal-remove')
              .attr('data-card-id', item.idCard)
              .attr('data-checklist-item-id', item.id)
              .attr('data-checklist-name', checklistName);
          });
        $checklistItem.prepend($delete);
      }
      return $checklistItem;
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
     * Bind extra items.
     */
    bindExtraItems() {
      let self = this;
      app.extraItemsCardID = getItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID);
      // Extra items add.
      $('.extra-items__add').on('click', function(e) {
        e.preventDefault();
        // First close others.
        $('.extra-items__input:not(.hide)').find('.extra-items__cancel').click();
        // Open extra items form.
        let $extraItemsInput = $(this).addClass('hide')
          .siblings('.extra-items__input')
          .removeClass('hide');
        setTimeout(() => {
          $extraItemsInput.find('textarea').trigger('autoresize').focus();
        }, 100);
      });

      // Extra items cancel.
      $('.extra-items__cancel').on('click', function(e) {
        e.preventDefault();
        $(this).closest('.extra-items__input')
          .addClass('hide')
          .find('textarea')
          .val('')
          .closest('.extra-items')
          .find('.extra-items__add')
          .removeClass('hide');
      });

      // Extra items save.
      $('.extra-items__save').on('click', function(e) {
        e.preventDefault();
        let $save = $(this);
        let $checklist = $(this).closest('.checklist');
        let $checklistItems = $checklist.find('.checklist__items');
        let checklistName = $checklist.attr('data-checklist-name');
        let $textarea = $(this).siblings('.input-field').find('textarea');
        let values = $textarea.val().trim();
        let checklistItems = [];
        if (values) {
          values = values.split(/\r?\n/);
          checklistItems = values.map((item) => {
            let checked = false;
            if (item.match(/^(- \[x])+/)) {
              checked = true;
            }
            let value = item.replace(/^(- \[x])/, '').replace(/^[^A-Za-z0-9]+/, '');
            if (value) {
              return {
                value: value,
                checked: checked
              }
            }
          }).filter(item => typeof item === 'object');
          let total = checklistItems.length;
          let count = 0;
          $checklist.find('.progress')
            .stop()
            .fadeIn(0)
            .removeClass('hide');
          Trello.get(`/cards/${app.extraItemsCardID}/checklists`)
            .then(response => {
              let checklistID = $.grep(response, checklist => checklist.name === checklistName)[0].id;
              let deferreds = [];
              $.each(checklistItems, (key, item) => {
                deferreds.push(Trello.post(`/cards/${app.extraItemsCardID}/checklist/${checklistID}/checkItem`, {
                  idChecklist: checklistID,
                  name: item.value
                })
                .then((response) => {
                  let itemID = response.id;
                  return Trello.put(`/cards/${app.extraItemsCardID}/checklist/${checklistID}/checkItem/${itemID}`, {
                    idChecklistCurrent: checklistID,
                    idCheckItem: itemID,
                    state: item.checked
                  });
                })
                .then(response => {
                  response.idCard = app.extraItemsCardID;
                  let $wrapper = self.createChecklistItem(response, checklistName);
                  $checklistItems.append($wrapper);
                  let progress = Math.round((++count / total) * 100);
                  $checklist.find('.progress')
                    .find('.determinate')
                    .css('width', `${progress}%`);
                  if (count === total) {
                    setTimeout(function() {
                      $checklist.find('.progress').stop().fadeOut(500, function() {
                        $(this).addClass('hide')
                          .find('.determinate')
                          .css('width', '0');
                      });
                    }, 200);
                  }
                }));
              });
              $.when.apply($, deferreds).done(() => {
                // Update count.
                self.updateCount(checklistName);
                // Close textarea.
                $save.closest('.extra-items__input')
                  .addClass('hide')
                  .find('textarea')
                  .val('')
                  .closest('.extra-items')
                  .find('.extra-items__add')
                  .removeClass('hide');
              });
            });
        }
        // Close textarea.
        $(this).closest('.extra-items__input')
          .addClass('hide')
          .find('textarea')
          .val('')
          .closest('.extra-items')
          .find('.extra-items__add')
          .removeClass('hide');
      });
    }

    /**
     * Bind Action elements.
     */
    bindActions() {
      let self = this;
      // Refresh board.
      this.$refreshBoard.on('click', function(e) {
        e.preventDefault();
        $(this).addClass('disabled');
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
          setTimeout(function() {
            $('html, body').animate({ scrollTop: 0 }, 300);
          }, 300);
      });

      // Turn off shopping mode.
      this.$turnOffShoppingMode.on('click', function() {
        if (self.isShoppingModeEnabled()) {
          self.$shoppingMode.find('input').click();
        }
      });

      // Modal init.
      this.$modal.modal({
        inDuration: 200,
        outDuration: 150
      });
      // Reset board & shopping list.
      this.$modalReset.on('click', function(e) {
        e.preventDefault();
        // Disable button and add spinner.
        self.$resetBoard
          .addClass('disabled')
          .find('.reset-board__text')
          .text('Resetting board')
          .end()
          .find('.preloader-wrapper')
          .addClass('active')
          .removeClass('hide');
        // Set board to loading state.
        self.$checklists.addClass('is-loading');
        // Uncheck all checked items.
        $('.checklist__item input:checked').click();
        // Remove extra items from card.
        let extraItemsCardID = getItem(LOCALSTORAGE_EXTRA_ITEMS_CARD_ID);
        let templateCardID = getItem(LOCALSTORAGE_TEMPLATE_CARD_ID);
        let extraItemIDs = $('.checklist__item--extra-items').find('input').map(function() {
          return $(this).attr('id');
        });
        let deferreds = [];
        $.each(extraItemIDs, (key, id) => {
          deferreds.push(Trello.delete(`/cards/${extraItemsCardID}/checkItem/${id}`, { idCheckItem: id }));
        });
        $.when.apply($, deferreds)
          // Move cards back into recipes list.
          .then(() => {
            let deferreds = [];
            // Add template card to be reset.
            app.checklist.recipes.push({
              id: templateCardID
            });
            $.each(app.checklist.recipes, (key, recipe) => {
              deferreds.push(Trello.put(`/cards/${recipe.id}/idList`, { value: app.recipesListID }));
            });
            return $.when.apply($, deferreds);
          })
          // Move Template and Extra Items cards up in the list.
          .then(() => Trello.put(`/cards/${extraItemsCardID}/pos`, { value: 'top' }))
          .then(() => Trello.put(`/cards/${templateCardID}/pos`, { value: 'top' }))
          // Refresh board & scroll to top.
          .done(() => {
            self.$refreshBoard.click();
            // Reset button.
            self.$resetBoard
              .removeClass('disabled')
              .find('.reset-board__text')
              .text('Reset board')
              .end()
              .find('.preloader-wrapper')
              .removeClass('active')
              .addClass('hide');
          });
      });
      // Remove item.
      this.$modalRemove.on('click', function(e) {
        e.preventDefault();
        let cardID = $(this).attr('data-card-id');
        let checklistItemID = $(this).attr('data-checklist-item-id');
        let checklistName = $(this).attr('data-checklist-name');
        if (cardID && checklistItemID && checklistName) {
          Trello.delete(`/cards/${cardID}/checkItem/${checklistItemID}`, { idCheckItem: checklistItemID })
            .done(() => {
              self.$modalRemove.removeAttr('data-card-id')
                .removeAttr('data-checklist-item-id')
                .removeAttr('data-checklist-name');
              $('.modal__remove-item').empty();
              $(`#${checklistItemID}`).closest('.checklist__item').remove();
              self.updateCount(checklistName);
            })
        }
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
      this.$extraItems.stop().fadeIn(0);
      this.shoppingModeShowChecklists();
      $('.checklist__item-delete').stop().fadeIn(0);
      this.hideMessages();
    }

    /**
     * Enable shopping mode.
     */
    enableShoppingMode(duration) {
      duration = duration || 0;
      this.$checklist.find('input:checked').closest('.checklist__item').stop().fadeOut(duration);
      this.$extraItems.stop().fadeOut(duration);
      this.shoppingModeHideChecklists(duration);
      $('.checklist__item-delete').stop().fadeOut(duration);
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
        setTimeout(function() {
          self.shoppingModeHideChecklists(500);
          setTimeout(function() {
            self.checkMessages();
          }, 500);
        }, duration);
      }
      else {
        $(el).closest('.checklist').stop().fadeIn(0);
        $(el).closest('.checklist__item').stop().fadeIn(0);
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
