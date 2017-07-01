# Trello Meal Planner

## Introduction

The Trello Meal Planner is a mobile web app which creates a Trello board to plan your meals, and aggregates recipes into a handy shopping list.

## Requirements
- A (free) [Trello](https://trello.com/) account.
 
## Setting up

- Navigate to the web app and authenticate with your Trello account. It will then allow you to either create a new Meal Planner Trello board or select one if you have created one already.
- Selecting "Create new board" will create a board with a "recipes" column and one column for each day of the week. Additionally, 3 cards will be created: first, a "template" card, which is used as a starter to new create recipe cards. Then, an "Extra items" card, which is used to list items that don't belong to any recipe. And lastly one example recipe placed in the Monday column to get started.

## Using the web app

### Creating new recipe cards

- In Trello, create new recipe cards by copying the "Recipe template" card. The template card comes with checklists for different The ingredient lists are split out by category. You can also add a description, links, and/or tag the card with one of the 10 labels. Make sure not to edit the template card after you copied it.

### The shopping list

- The basic idea is that you keep a list of recipes in the "Recipes" column and plan your days or week by moving recipe cards into the day columns.
- All ingredients from recipe cards in the day columns + the "Extra items" card (regardless of column) will be aggregated into the shopping list.
- Click "Add extra items" in any of the categories to add one or more items to the shopping list.
- Only "Extra items" will be rendered with an icon to remove it.


### Recipes in this shopping list

- Lists all recipes + "Extra items" currently in the shopping list. Click the recipe names to highlight it's ingredients in the list.

### Refresh board.

- When you make changes in your Trello board, use this to refresh the shopping list.

### Shopping mode

- Toggling "Shopping mode" hides checked items, empty and completed categories, and other elements such as "Add extra items" and the "remove icons".

### Open board

- Links back to the Trello board. On mobile this will open the Trello app if you have it installed.

### Reset board

- Unchecks all checked items, moves recipe cards back into the "Recipes" column, removes all "Extra items", and refreshes the board.

### Log out

- Deauthenticates your Trello account from the web app and brings you back to the original screen.

## Notes

- This application is built on the cheap. The "back-end" is the free Trello service, and the front-end is hosted on Github pages. For this reason, for the app to work smoothly please don't remove or rename any of the lists or "Recipe template" and "Extra items" cards. Though some fallbacks are in place (these 2 cards get recreated if not found), issues may arise if you do.
