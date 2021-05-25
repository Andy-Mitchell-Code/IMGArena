const express = require("express");
const date = require('date-and-time');
const Grid = require('./grid');

const apiServer = express()
const PORT = process.env.PORT || 3001;

// settings for the game
const gameSettings = 
{
    gridWidth : 5,
    gridHeight: 7,
    difficulty:40,
    maxPlayers:2
}

let gameGrid = new Grid(gameSettings.gridWidth, gameSettings.gridHeight,gameSettings.difficulty);

// helper function for logging current date and time
const currentDateTime = () => {
    const now = new Date();
    return (date.format(now, 'YYYY/MM/DD HH:mm:ss'));
}


// setup a simple end point to get the game configuration
apiServer.get('/config', (req, res) => { 
  console.log(`Configuration GET request received at ${currentDateTime()}`);  
  res.status(200).json(gameSettings);
})

apiServer.get('/grid', (req, res) => {   
    console.log(`grid GET request received at ${currentDateTime()}`);      
    let grid = gameGrid.CalculateGrid();
    res.status(200).json(grid);
});

apiServer.put('/cell', (req,res) => {
    let row = req.params.row;
    let column = req.params.column;
    
    gameGrid.SetCellVisible(row,column)

    res.status(200);
    console.log(`cell (${row},${column}) - [ROW,COLUMM] PUT request received at ${currentDateTime()}`);
});


// DEBUG
apiServer.get('/debug-grid', (req, res) => {   
    console.log(`debug-grid GET request received at ${currentDateTime()}`);          
    let grid = gameGrid.GetGrid();        
    res.status(200).json(grid);
});

apiServer.get('/debug-visibility', (req, res) => {     
    console.log(`debug-visibility GET request received at ${currentDateTime()}`);  
    let grid = gameGrid.GetVisibilityState();    
    res.status(200).json(grid);
});

apiServer.get('/debug-mines', (req, res) => {     
    console.log(`debug-mines GET request received at ${currentDateTime()}`);  
    let grid = gameGrid.GetMinePlacement();    
    res.status(200).json(grid);
})

apiServer.put('/debug-force-grid-recalc', (req, res) => {     
    console.log(`debug-force-grid-recalc PUT request received at ${currentDateTime()}`);  
    let grid = gameGrid.CalculateGrid();    
    res.status(200).json(grid);
})


// startup
apiServer.listen(PORT, () => {
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
  
})