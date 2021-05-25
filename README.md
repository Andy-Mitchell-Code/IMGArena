# Minesweeper

## Background

Minesweeper is a game where the objective is correctly identify the location of all mines in a given grid. You are given a uniform grid of gray squares in the beginning of the game. Each square contains either a mine (indicated by a value of 9), or an empty square. Empty squares have a number indicating the count of mines in the adjacent squares. Empty squares can have counts from zero (no adjacent mines) up to 8 (all adjacent squares are mines).
If you were to take a complete grid, for example, you can see which squares have mines and which squares are empty:
0 0 0 0 0
0 0 0 0 0
1 1 1 0 0
1 9 1 0 0
1 2 2 1 0
0 1 9 1 0
0 1 1 1 0
The squares with "2" indicate that there 2 mines adjacent to that particular square.
Gameplay starts with a user un-hiding a square at random. If the square contains a mine, the game ends. If it is a blank, the number of adjacent mines is revealed.
Exposing a zero means that there are no adjacent mines, so exposing all adjacent squares is guaranteed safe. As a convenience to the player, the game continues to expose adjacent squares until a non-zero square is reached.
For example, if you click on the top right corner you get this ('-' means hidden):
0 0 0 0 0
0 0 0 0 0
1 1 1 0 0

- - 1 0 0
- - 2 1 0
- - - 1 0
- - - 1 0

## Challenge

The challenge is divided into two parts:

### On Call: Generate a grid based on width, height and number of mines. (~45 minutes)

In the first half of the exercise, you will be looking at the logical part of the minesweeper. Your goal is to be able to generate a data representation of a minesweeper grid, with mines randomly positioned. This grid should already have the number on each cell pre-calculated. This should only be consoled.log at this point.

Feel free to ask us or google anything you need, except maybe how to code a minesweeper :upside_down_face:.
Given the time constraints, we don't expect TDD or unit tests, however try to imagine how you could implement such things. If you can, explain as you code why you programmed it in such a way, what other alternative you could have used instead.

### Take Home Test: Create a headless node API for two players to play the game togheter (2-3 hours)

Now that you have the capacity to generate a grid with mines, create an API in node, using whatever framework or lack thereof and transport protocol as you wish, that allows two players to play a game of minesweeper together. This can be headless or you can make a simple UI for it, but the API needs to cover whatever is necessary for both the players to play together.
There is no particular expectations in terms of feature support, architecture, tools used, testing etc. However putting effort in any of those things will definitely improve your proposition.
