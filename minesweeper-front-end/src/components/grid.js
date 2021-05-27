import React from 'react';


import axios from 'axios';

const SERVER_PORT = 3001;
const GET_GRID_URL = `http://localhost:${SERVER_PORT}/grid`;
const GET_CONFIG_URL = `http://localhost:${SERVER_PORT}/config`;
const GET_GRID_RESET_URL = `http://localhost:${SERVER_PORT}/newgame`;
const PUT_SELECT_CELL_URL = `http://localhost:${SERVER_PORT}/select`;
const PUT_MARK_CELL_URL = `http://localhost:${SERVER_PORT}/mark`;
const WEBSOCKET_URL = `ws://localhost:${SERVER_PORT}`;

export default class GridComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            grid: [],
            messages: [],
            difficulty: 0
        };
    }

    ws = new WebSocket(WEBSOCKET_URL);

    addMessage = message => {
        this.setState(state => ({ messages: [message, ...state.messages] }))
    }

    submitMessage = messageString => {
        // on submitting the ChatInput form, send the message, add it to the list and reset the input

        this.ws.send(JSON.stringify(messageString))
        this.addMessage(messageString)
    }

    componentDidMount() {
        this.fetchGrid();
        this.getConfig();

        this.ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
        }

        this.ws.onmessage = evt => {
            // on receiving a message, add it to the list of messages                        
            const message = JSON.parse(JSON.parse(evt.data));
            this.addMessage(message);
            this.processCommand(message);
        }

        this.ws.onclose = () => {
            console.log('disconnected')
            // automatically try to reconnect on connection loss
            this.setState({
                ws: new WebSocket(WEBSOCKET_URL),
            })
        }
    }

    componentWillUnmount() {
        if (this.ws) {
            this.ws.close();
        }
    }

    resetGrid = async () => {
        try {
            this.setState({ ...this.state, isFetching: true });
            const response = await axios.get(GET_GRID_RESET_URL);
            //console.log(response.data);
            this.submitMessage({ command: 'newgame', row: 0, column: 0, player: this.currentPlayer(), value: `Player ${this.currentPlayer()} has started a new game` });
            this.setState({ grid: response.data.grid, isFetching: false });
        } catch (e) {
            console.log(e);
            this.setState({ ...this.state, isFetching: false });
        }
    };

    getConfig = async () => {
        try {
            this.setState({ ...this.state, isFetching: true });
            const response = await axios.get(GET_CONFIG_URL);
            //console.log("CONFIG:", response.data);
            this.setState({ difficulty: response.data.difficulty, isFetching: false });
        } catch (e) {
            console.log(e);
            this.setState({ ...this.state, isFetching: false });
        }

    }

    fetchGrid = async () => {
        try {
            this.setState({ ...this.state, isFetching: true });
            const response = await axios.get(GET_GRID_URL);
            //console.log(response.data);
            this.setState({ grid: response.data.grid, isFetching: false });
        } catch (e) {
            console.log(e);
            this.setState({ ...this.state, isFetching: false });
        }
    };

    currentPlayer = () => {
        let currentPlayer = document.getElementById("radPlayerId");
        if (currentPlayer.checked) {
            return 2;
        }
        return 1;
    };

    flipPlayer = () => {
        let currentPlayer = document.getElementById("radPlayerId");
        currentPlayer.checked = !currentPlayer.checked;
    }

    setPlayer = (player) => {
        let currentPlayer = document.getElementById("radPlayerId");
        currentPlayer.checked = player === 1 ? false : true;
    }

    processCommand = jsonCommand => {

        let currentPlayerNo = this.currentPlayer();
        let command = jsonCommand.command;
        let row = jsonCommand.row;
        let column = jsonCommand.column;
        let player = jsonCommand.player;
        let value = jsonCommand.value;

        switch (command) {
            case "select":
                this.setPlayer(player);
                this.selectGridCell(null, row, column, false);
                this.setGridValue(row, column, value);
                this.setPlayer(currentPlayerNo);
                break;

            case "mark":
                this.setPlayer(player);
                this.markGridCell(null, row, column, false);
                this.setPlayer(currentPlayerNo);
                break;

            case "lost":
                if (currentPlayerNo === player) {
                    // YOU lost
                    alert(value + "\n\nYOU LOST!");
                }
                else {
                    // The other player lost
                    alert(value + "\n\nYOU WON!!");
                }
                break;

            case "newgame":
                if (currentPlayerNo !== player) {
                    // Other player started a new game
                    alert(value);
                }

                let elements = document.getElementsByClassName("cube");
                for (let i = 0; i < elements.length; i++) {
                    var cellElement = elements[i];

                    cellElement.className = "cube show-front";

                    var front = cellElement.querySelector('.cube__face--front');
                    var top = cellElement.querySelector('.cube__face--top');
                    var bottom = cellElement.querySelector('.cube__face--bottom');

                    front.innerHTML = "?";
                    top.innerHTML = "?";
                    bottom.innerHTML = "?";
                }
            
                this.getConfig();
                break;

            default: break;



        }
    }


    setGridValue = (row, col, value) => {
        var cellElement = document.querySelector("#gridCell" + row + "_" + col);

        var front = cellElement.querySelector('.cube__face--front');
        var top = cellElement.querySelector('.cube__face--top');
        var bottom = cellElement.querySelector('.cube__face--bottom');

        front.innerHTML = value;
        top.innerHTML = value;
        bottom.innerHTML = value;
    }

    showGameOverMessage = playerWhoLost => {
        this.submitMessage({ command: 'lost', row: 0, column: 0, player: playerWhoLost, value: `GAME OVER - Player ${playerWhoLost} clicked on a mine!` });
    }

    selectGridCell = async (e, row, col, callSubmit) => {
        if (e) {
            e.preventDefault();
        }
        try {

            if (callSubmit) {
                this.setState({ ...this.state, isFetching: true });
                let putResponse = await axios.put(`${PUT_SELECT_CELL_URL}`, { row: row, column: col, player: this.currentPlayer() });

                let resultGrid = await putResponse.data.grid;

                if (resultGrid.gameResult) {
                    if (resultGrid.gameResult === "Lost!") {
                        this.showGameOverMessage(this.currentPlayer());
                    }
                }
                else {
                    // Look for changes
                    for (let r = 0; r < this.state.grid.length; r++) {
                        for (let c = 0; c < this.state.grid[r].length; c++) {
                            if (this.state.grid[r][c] !== resultGrid[r][c]) {
                                this.state.grid[r][c] = resultGrid[r][c];

                                this.setGridValue(r, c, resultGrid[r][c]);
                                this.submitMessage({ command: 'select', row: r, column: c, player: this.currentPlayer(), value: resultGrid[r][c] });
                            }
                        }
                    }
                    this.setState({ ...this.state, isFetching: false });
                }
            }

        } catch (e) {
            console.log(e);
            this.setState({ ...this.state, isFetching: false });
        }
    };

    markGridCell = async (e, row, col, callSubmit) => {
        if (e) {
            e.preventDefault();
        }
        try {


            let cellElement = document.getElementById("gridCell" + row + "_" + col);
            if (cellElement) {
                let cube = cellElement.childNodes[0];
                cube.className = this.currentPlayer() === 1 ? "cube show-left" : "cube show-right";

            }
            if (callSubmit) {
                this.setState({ ...this.state, isFetching: true });
                let putResponse = await axios.put(`${PUT_MARK_CELL_URL}`, { row: row, column: col, player: this.currentPlayer() });
                let resultGrid = await putResponse.data.grid;

                this.submitMessage({ command: 'mark', row: row, column: col, player: this.currentPlayer(), value: resultGrid[row][col] });
                //console.log(putResponse.data);
                this.setState({ ...this.state, isFetching: false });
            }
            //    this.flipPlayer();


        } catch (e) {
            console.log(e);
            this.setState({ ...this.state, isFetching: false });
        }
    };

    render() {

        return (
            <>
                <div className='playerSelection'>
                    <span className='player'>Player 1</span>
                    <label className="switch">
                        <input type="checkbox" id="radPlayerId" />
                        <span className="slider round"></span>
                    </label>
                    <span className='player'>Player 2</span>
                </div>                
                <div className='gridOuterContainer'>
                    <div className='gridContainer'>
                        {this.state.grid === undefined ? "" :
                            Object.keys(this.state.grid).map((row, rowKey) => {
                                return (<div className='rowContainer' key={rowKey}>
                                    {
                                        Object.keys(this.state.grid[row]).map((column, colKey) => {
                                            return (<div className='gridCell' key={colKey} id={"gridCell" + rowKey + "_" + colKey} onClick={e => this.selectGridCell(e, rowKey, colKey, true)} onContextMenu={e => this.markGridCell(e, rowKey, colKey, true)}>
                                                <div className="cube show-front">
                                                    <div className="cube__face cube__face--left">P1</div>
                                                    <div className="cube__face cube__face--front">{this.state.grid[row][column]}</div>
                                                    <div className="cube__face cube__face--right">P2</div>
                                                    <div className="cube__face cube__face--top">{this.state.grid[row][column]}</div>
                                                    <div className="cube__face cube__face--bottom">{this.state.grid[row][column]}</div>
                                                </div>
                                            </div>)
                                        })
                                    }</div>)
                            })}
                    </div>
                </div>
                <div className='resetButton' onClick={e => this.resetGrid(e)}>
                    Start a new game
                </div>
            </>
        )
    }


}