const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const appServer = express();

appServer.use(cors());
appServer.use(express.json());
appServer.use(express.urlencoded({ extended: true }));

const httpServer = http.createServer(appServer);
const webSocketServer = new WebSocket.Server({ server: httpServer });
const PORT = 3001;


const date = require('date-and-time');
const Grid = require('./grid-backend');

// default settings for the game
const gameSettings =
{
    gridWidth: 10,
    gridHeight: 12,
    difficulty: 4,
    maxPlayers: 2
}

let gameGrid = new Grid(gameSettings.gridWidth, gameSettings.gridHeight, gameSettings.difficulty);


// helper function for logging current date and time
const currentDateTime = () => {
    const now = new Date();
    return (date.format(now, 'YYYY/MM/DD HH:mm:ss'));
}


// GRID ENDPOINTS

appServer.get('/register', (req, res) => {
    console.log(`Register GET request received at ${currentDateTime()}`);
    let playerInfo = gameGrid.RegisterPlayer();
    res.status(200).json(playerInfo);
})


appServer.get('/config', (req, res) => {
    console.log(`Configuration GET request received at ${currentDateTime()}`);
    let config = gameGrid.GetGridConfig();
    res.status(200).json(config);
})


appServer.get('/newgame', (req, res) => {
    console.log(`newgame GET request received at ${currentDateTime()}`);
    let grid = gameGrid.CreateNewGrid();
    res.status(200).json({ grid: grid });
});

appServer.get('/grid', (req, res) => {
    console.log(`grid GET request received at ${currentDateTime()}`);
    let grid = gameGrid.GetGrid();
    res.status(200).json({ grid: grid });
});

appServer.put('/select', (req, res) => {
    console.log(`select (${req.body.row},${req.body.column},${req.body.player}) - [ROW,COLUMM,PLAYER] PUT request received at ${currentDateTime()}`);

    let row = parseInt(req.body.row, 10);
    let column = parseInt(req.body.column, 10);
    let player = parseInt(req.body.player);

    res.status(200).json({ grid: gameGrid.SelectCell(row, column, player) });
});

appServer.put('/mark', (req, res) => {
    console.log(`mark (${req.body.row},${req.body.column},${req.body.player}) - [ROW,COLUMM,PLAYER] PUT request received at ${currentDateTime()}`);

    let row = parseInt(req.body.row, 10);
    let column = parseInt(req.body.column, 10);
    let player = parseInt(req.body.player);

    res.status(200).json({ grid: gameGrid.MarkCell(row, column, player) });
});


webSocketServer.on('connection', (webSocket) => {

    webSocket.isAlive = true;

    webSocket.on('pong', () => {
        webSocket.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    webSocket.on('message', (message) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);       

        let command = message.command;
        let row = parseInt(message.row, 10);
        let column = parseInt(message.column, 10);
        let player = parseInt(message.player);

        if (command === "select")
        {
            message["grid"] = gameGrid.GetGrid();;
        }
        if (command === "mark")
        {
            message["grid"] = gameGrid.GetGrid();;
        }
    
        //send back the message to the other clients
        webSocketServer.clients
        .forEach(client => {
           // if (client != webSocket) {
                client.send(JSON.stringify(message));
            //}
        });


    });

    //send immedietly a feedback to the incoming connection    
    //webSocket.send(JSON.stringify({ command: 'refresh' }));
});

setInterval(() => {
    webSocketServer.clients.forEach((webSocket) => {

        if (!webSocket.isAlive) return webSocket.terminate();

        webSocket.isAlive = false;
        webSocket.ping(null, false, true);
    });
}, 10000);


//start our HTTP server (this is listening for websocket and http connections)
httpServer.listen(PORT, () => {
    const now = new Date();

    console.clear();
    console.log('#############################################################################');
    console.log('Andy Mitchell (c) 2021 - IMG Arena Coding Test');
    console.log('#############################################################################');
    console.log('');
    console.log(`Minesweeper back-end server listening on http://localhost:${PORT}`);
    console.log(`Server started at ${currentDateTime()}`);
    console.log('Current config', gameSettings);
    console.log('Waiting for players...');

});