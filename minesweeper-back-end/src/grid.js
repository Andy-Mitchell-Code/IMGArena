const MS_CELL_STATE =
{
    HIDDEN: "HIDDEN",
    VISIBLE: "VISIBLE"
};

module.exports = class Grid {
    constructor(gridWidth, gridHeight, difficulty) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.difficulty = difficulty;

        var [rows, cols] = [this.gridHeight, this.gridWidth];

        // assign random values to a percentage of the cells (approx) - percentage is the difficulty value
        this.minePlacement = new Array(rows);
        this.visibilityState = new Array(rows);
        this.grid = new Array(rows);
        
        for (let r = 0; r < rows; r++) {
            this.minePlacement[r] = new Array(cols);
            for (let c=0;c<cols;c++)
            {
                this.minePlacement[r][c] = Math.floor(Math.random() * 100) < this.difficulty ? Math.floor(Math.random() * 2) : 0;
            }

            // set all cells to hidden
            this.visibilityState[r] = new Array(cols).fill(MS_CELL_STATE.HIDDEN);

            // set all grid cell values to "-"
            this.grid[r] = new Array(cols).fill("-");

        }
    }

    GetMinePlacement() {
        return this.minePlacement;
    }

    GetVisibilityState() {
        return this.visibilityState;
    }

    GetGrid() {
        return this.grid;
    }

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

    GetSafeGridCell(h, w, searchArray) {
        if (h < 0 || h >= this.gridHeight) {
            return -1;
        }
        if (w < 0 || w >= this.gridWidth) {
            return -1;
        }
        return searchArray[h][w];
    }

    SetSafeGridCell(h, w, value, searchArray) {
        if (h < 0 || h >= this.gridHeight) {
            return false;
        }
        if (w < 0 || w >= this.gridWidth) {
            return false;
        }
        searchArray[h][w] = value;
        return true;
    }

    SetCellVisible(h,w)
    {
        SetSafeGridCell(h, w, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
    }

    CalculateGridCell(h, w) {
        let { tl, tc, tr, cl, cc, cr, bl, bc, br } = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

        tl = GetSafeGridCell(h - 1, w - 1, this.minePlacement);
        tc = GetSafeGridCell(h - 1, w, this.minePlacement);
        tr = GetSafeGridCell(h - 1, w + 1, this.minePlacement);

        cl = GetSafeGridCell(h, w - 1, this.minePlacement);
        cc = GetSafeGridCell(h, w, this.minePlacement);
        cr = GetSafeGridCell(h, w + 1, this.minePlacement);

        bl = GetSafeGridCell(h + 1, w - 1, this.minePlacement);
        bc = GetSafeGridCell(h + 1, w, this.minePlacement);
        br = GetSafeGridCell(h + 1, w + 1, this.minePlacement);

        return { tl, tc, tr, cl, cc, cr, bl, bc, br };
    }

    CalculateGrid() {
        // After clicking on a cell, the API will change the visibility state of the cell to VISIBLE
        // This method is then called to recalculate the grid

        // loop through the rows
        for (let h = 0; h < this.gridHeight; h++) {
            // loop through the columns
            for (let w = 0; w < this.gridWidth; w++) {
                // Is this cell visible now ?
                if (this.visibilityStateGrid[h][w] != MS_CELL_STATE.HIDDEN) {
                    // Is it waiting to be calculated?
                    if (this.grid[h][w] == "-") {
                        // get all 9 values for the current cell (including the cell itself)
                        let { tl, tc, tr, cl, cc, cr, bl, bc, br } = CalculateGridCell(h, w);
                        let totalMinesFound = GetTotalMinesFound(tl, tc, tr, cl, cc, cr, bl, bc, br);

                        // set the grid we see to the number of mines found
                        SetSafeGridCell(h, w, totalMinesFound.toString(), this.grid);

                        // if no mines were found at the top-left investigate further
                        if (tl == 0) {
                            SetSafeGridCell(h - 1, w - 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                        // if no mines were found at the top-center investigate further
                        if (tc == 0) {
                            SetSafeGridCell(h - 1, w, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                        // if no mines were found at the top-right investigate further
                        if (tr == 0) {
                            SetSafeGridCell(h - 1, w + 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }


                        // if no mines were found at the top-left investigate further
                        if (cl == 0) {
                            SetSafeGridCell(h, w - 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                        // don't recalculate this one
                        // if no mines were found at the top-center investigate further
                        //if (cc == 0) 
                        //{
                        //    SetSafeGridCell(h, w, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        //}

                        // if no mines were found at the top-right investigate further
                        if (cr == 0) {
                            SetSafeGridCell(h, w + 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }


                        // if no mines were found at the top-left investigate further
                        if (bl == 0) {
                            SetSafeGridCell(h + 1, w - 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                        // if no mines were found at the top-center investigate further
                        if (bc == 0) {
                            SetSafeGridCell(h + 1, w, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                        // if no mines were found at the top-right investigate further
                        if (br == 0) {
                            SetSafeGridCell(h + 1, w + 1, MS_CELL_STATE.VISIBLE, this.visibilityStateGrid);
                        }

                    }
                    else {
                        // do nothing grid at this location is already set
                    }
                }
            }
        }

        let recalc = false;
        // Recheck
        for (let h = 0; h < this.gridHeight; h++) {
            // loop through the columns
            for (let w = 0; w < this.gridWidth; w++) {
                // Is this cell visible now ?
                if (this.visibilityStateGrid[h][w] != MS_CELL_STATE.HIDDEN) {
                    // Is it waiting to be calculated?
                    if (this.grid[h][w] == "-") {
                        recalc = true;
                        break;
                    }
                }
            }
            if (recalc) break;
        }

        if (recalc) {
            CalculateGrid();
        }

        return this.grid;
    }


};