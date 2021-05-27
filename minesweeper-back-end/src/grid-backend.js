const e = require("express");

const MS_CELL_STATE =
{
    HIDDEN: "HIDDEN",
    VISIBLE: "VISIBLE",
    TOCALC: "TOCALC",
    MARKED: "MARKED"
};

const MS_CELL_HIDDEN_CHAR = "?";
const MS_CELL_MINE_CHAR = "X";
const MS_CELL_MARKED_CHAR_P1 = "P1";
const MS_CELL_MARKED_CHAR_P2 = "P2";

const generate_uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class GridCell {
    constructor() {
        this.state = MS_CELL_STATE.HIDDEN;
        this.value = MS_CELL_HIDDEN_CHAR;
        this.player = 0;
        this.mineHere = 0;
        this.mineCount = -1;
    }
}


module.exports = class Grid {
    constructor(gridWidth, gridHeight, difficulty) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.difficulty = difficulty;
        this.uniqueId = generate_uuidv4();
        this.players = [];
        this.currentPlayer = 0;
        this.InitGridVars();
    }

    InitGridVars() {
        var [rows, cols] = [this.gridHeight, this.gridWidth];
        // Make it harder for the next game
                

        this.players = [];
        this.currentPlayer = 0;
        this.grid = new Array(rows);

        for (let r = 0; r < rows; r++) {

            this.grid[r] = new Array(cols);

            for (let c = 0; c < cols; c++) {

                this.grid[r][c] = new GridCell();

            }
        }

        for (let mineCount = 0; mineCount < this.difficulty; mineCount++) {
                      
            let randomRow = Math.floor(Math.random() * rows);
            let randomCol = Math.floor(Math.random() * cols);

            if (this.grid[randomRow][randomCol].mineHere === 0)
            {
                this.grid[randomRow][randomCol].mineHere = 1;
            }
            
        }

        if (this.difficulty < ((this.gridWidth * this.gridHeight) - 11))
        {
            this.difficulty = this.difficulty + 2;
        }

    }

    // PLAYER RELATED

    RegisterPlayer() {
        let numberOfPlayers = this.players.length;

        if (numberOfPlayers < 2) {
            this.players.push(1 + numberOfPlayers);
            return { currentPlayer : 1 + numberOfPlayers, players : this.players.length };
        }
        else
        {
            return { currentPlayer : numberOfPlayers, players : this.players.length };
        }
    }

    GetCurrentPlayer() {
        return this.players[this.currentPlayer];
    }

    // HELPER FUNCTIONS

    IsSafeGridCell(row, column) {
        if (row < 0 || row >= this.gridHeight) {
            return false;
        }
        if (column < 0 || column >= this.gridWidth) {
            return false;
        }
        return true;
    }

    GetSafeGridCell(row, column) {
        if (row < 0 || row >= this.gridHeight) {
            return -1;
        }
        if (column < 0 || column >= this.gridWidth) {
            return -1;
        }
        return this.grid[row][column];
    }

    GetSafeGridCellProp(row, column, prop) {
        if (row < 0 || row >= this.gridHeight) {
            return -1;
        }
        if (column < 0 || column >= this.gridWidth) {
            return -1;
        }
        //  console.log(`GetSafeGridCellProp::(${row},${column},${prop}) => ${this.grid[row][column][prop]}`);
        return this.grid[row][column][prop];
    }

    SetSafeGridCell(row, column, prop, value) {
        if (row < 0 || row >= this.gridHeight) {
            return false;
        }
        if (column < 0 || column >= this.gridWidth) {
            return false;
        }
        //   console.log(`SetSafeGridCell::attempting to access Property ${prop} in grid at location ${row},${column}`);
        if (this.grid[row][column][prop] === undefined) {
            //  console.log(`SetSafeGridCell::COULD NOT ACCESS Property ${prop} in grid at location ${row},${column}`);
            //  console.log(`SetSafeGridCell::${this.grid[row][column]}`);
        }
        this.grid[row][column][prop] = value;

        return true;
    }

    FilterGridByProperty(prop) {
        let outputValueGrid = new Array(this.gridHeight);

        for (let row = 0; row < this.gridHeight; row++) {
            outputValueGrid[row] = new Array(this.gridWidth);

            for (let col = 0; col < this.gridWidth; col++) {
                outputValueGrid[row][col] = this.grid[row][col][prop];
            }
        }

        return outputValueGrid;
    }


    // CALCULATION FUNCTIONS

    GetTotalMinesFound(tl, tc, tr, cl, cc, cr, bl, bc, br) {
        let total = 0;
        total += (tl == 1) ? 1 : 0;
        total += (tc == 1) ? 1 : 0;
        total += (tr == 1) ? 1 : 0;

        total += (cl == 1) ? 1 : 0;
        // not this one!
        total += (cr == 1) ? 1 : 0;

        total += (bl == 1) ? 1 : 0;
        total += (bc == 1) ? 1 : 0;
        total += (br == 1) ? 1 : 0;

        return total;
    }

    CalculateGridCell(row, column) {
        let { tl, tc, tr, cl, cc, cr, bl, bc, br } = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

        tl = this.GetSafeGridCellProp(row - 1, column - 1, "mineHere");
        tc = this.GetSafeGridCellProp(row - 1, column, "mineHere");
        tr = this.GetSafeGridCellProp(row - 1, column + 1, "mineHere");

        cl = this.GetSafeGridCellProp(row, column - 1, "mineHere");
        cc = this.GetSafeGridCellProp(row, column, "mineHere");
        cr = this.GetSafeGridCellProp(row, column + 1, "mineHere");

        bl = this.GetSafeGridCellProp(row + 1, column - 1, "mineHere");
        bc = this.GetSafeGridCellProp(row + 1, column, "mineHere");
        br = this.GetSafeGridCellProp(row + 1, column + 1, "mineHere");

        return { tl, tc, tr, cl, cc, cr, bl, bc, br };
    }

    CalculateMineCountAndSetVisible(row, column) {
        this.SetSafeGridCell(row, column, "state", MS_CELL_STATE.TOCALC);

        let { tl, tc, tr, cl, cc, cr, bl, bc, br } = this.CalculateGridCell(row, column);

        let totalMinesFound = this.GetTotalMinesFound(tl, tc, tr, cl, cc, cr, bl, bc, br);

        this.SetSafeGridCell(row, column, "mineCount", totalMinesFound);
        this.SetSafeGridCell(row, column, "state", MS_CELL_STATE.VISIBLE);

        return totalMinesFound;
    }


    // ENDPOINTS

    CreateNewGrid() {
        this.InitGridVars();

        return this.FilterGridByProperty("value");
    }

    GetGrid() {
        return this.FilterGridByProperty("value");
    }

    GetGridConfig() {
        return { gridWidth: this.gridWidth, gridHeight: this.gridHeight, difficulty: this.difficulty, uniqueId: this.uniqueId, currentPlayer:this.currentPlayer, players:this.players.length };
    }

    MarkCell(row, column, playerNo) {

        if (this.GetSafeGridCellProp(row, column, "state") === MS_CELL_STATE.HIDDEN) {
            this.SetSafeGridCell(row, column, "state", MS_CELL_STATE.MARKED);
            this.SetSafeGridCell(row, column, "player", playerNo);

            if (playerNo === 1) {
                this.SetSafeGridCell(row, column, "value", MS_CELL_MARKED_CHAR_P1);
            }
            else {
                this.SetSafeGridCell(row, column, "value", MS_CELL_MARKED_CHAR_P2);
            }
        }
        return this.FilterGridByProperty("value");
    }

    SelectCell(row, column) {

        if (this.GetSafeGridCellProp(row, column, "state") === MS_CELL_STATE.HIDDEN) {

            console.log(`SelectCell::(${row},${column})`);

            if (this.GetSafeGridCellProp(row, column, "mineHere") === 1) {
                // Uh Oh player clicked on a mine
                this.SetSafeGridCell(row, column, "value", MS_CELL_MINE_CHAR);
                return { gameResult: "Lost!" };
            }

            let totalMinesFound = this.CalculateMineCountAndSetVisible(row, column);

            

            console.log(`SelectCell::totalMinesFound : ${totalMinesFound}`);

            if (totalMinesFound === 0) // No mines here - so we can show all 8 surrounding cells 
            {
                this.SetSafeGridCell(row, column, "value", "");

                console.log(`FOUND 0 MINES AT ${row},${column}`);

                this.SelectCell(row - 1, column - 1);
                this.SelectCell(row - 1, column);
                this.SelectCell(row - 1, column + 1);

                this.SelectCell(row, column - 1);
                this.SelectCell(row, column + 1);

                this.SelectCell(row + 1, column - 1);
                this.SelectCell(row + 1, column);
                this.SelectCell(row + 1, column + 1);
            }
            else
            {
                this.SetSafeGridCell(row, column, "value", totalMinesFound);
            }

        }
        let result = this.FilterGridByProperty("value");


        return result;
    }



};