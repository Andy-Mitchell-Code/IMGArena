# React front-end for Minesweeper code challenge

Andy Mitchell (c) 2021

## Installation

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.


## Instructions

After starting the minesweeper-back-end process (npm start in that sub directory), run the front end using the npm start command mentioned above.

You need two instances of the front end open in a browser, preferably side to side. On one of the browsers ensure Player 1 is selected, whilst Player 2 is selected in the other.

Clicking with the left mouse button will attempt to reveal a square.
If there is a mine there then sorry but you have lost already!!
Click New Game to start a new game. The other player will be notified and you can both start again.

If there isn't a mine on that square it will attempt to reveal as many squares as it can until it hits a square that is next to one or more mines.

Each player should take turns revealing squares, and when ready, use the right mouse button to put your marker on where you think the mine is.

Try and mark more mines than your opponent.

### What's missing?

I wanted to implement a proper user management process, using OAuth and having more than 2 players for each game. I ran into issue with the WebSocket implementation in regards to identifying unique users. 
I did a similar communication process using SignalR in C# and didn't have this problem but I suspect there is a simple solution to this issue.

I have provided some tests for the front end part of the exercise but these are by no means comprehensive - of course I would implement more given the time.

I also didn't code the end game! If you reveal and/or mark all the squares nothing happens - Of course at this point I wanted to scan the grid and count how many mines were revealed by Player 1, Player 2, Player N and produce a popup
leaderboard to show who did the best. 

### Footnote

I quite enjoyed the challenge and looking at improvements I would implement very large boards, 100x100 for example, that could be played with say 20 players. The number of mines would need to be high enough to provide a challenge, and 
I would in that scenario perhaps restrict the distance that the reveal recursive algorithm could travel, to make it harder.




