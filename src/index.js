var http = require("http");

const CONST_COLUMN_SIZE = 5;
const CONST_ROW_SIZE = 7;


class Cell
{
  constructor(mine_here, discovered)
  {
      this.mine_here = mine_here;
      this.rendered_value = discovered;
  }
};

class Grid
{
  constructor()
  {
    this.gridCells = new Array(CONST_ROW_SIZE * CONST_COLUMN_SIZE);
  }
};


let gGameGrid = new Grid();


function initGrid() {
  for (let i = 0; i < CONST_ROW_SIZE * CONST_COLUMN_SIZE; i++) 
  {
    gGameGrid.gridCells[i] = new Cell(((Math.random() * 1000) > 500) ? 1: 0, "-");    
  }
}

function drawGrid() {
  let outputHTML = "<div class='gridContainer'>";
  let offset = 0;

  for (let i = 0; i < CONST_ROW_SIZE; i++) {
    for (let j = 0; j < CONST_COLUMN_SIZE; j++) {
      let rendered_value = gGameGrid.gridCells[offset++].rendered_value;
      
      outputHTML += "<span>[" + rendered_value + "]</span>";
    }
    outputHTML += "<br/>";
  }
  outputHTML += "</div>";
  return outputHTML;
}

function calculateCell(offsetX, offsetY) 
{
  
  if (offsetX == 0) // first Column
  {
    
  }
  else if (offsetX == CONST_COLUMN_SIZE-1) // last column
  {

  }
  else
  {
    

  }





  // calculate -1,-1 (X,Y)
  gGameGrid.gridCells[(offsetY-1 * CONST_ROW_SIZE) + offsetX-1];

  // calculate -1,0
  // calcilate -1,1
  // calculate 0,-1 (X,Y)
  // calcilate 0,1
  // calculate 1,-1 (X,Y)
  // calculate 1,0
  // calcilate 1,1
}

//create a server object:
http
  .createServer(function (req, res) {
    initGrid();

    let outputHTML = drawGrid();

    res.write(outputHTML);

    //res.write("Hello World!"); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
