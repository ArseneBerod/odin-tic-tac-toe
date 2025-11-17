const GameStatus = Object.freeze({
	P1_WIN: "P1_WIN",
	P2_WIN: "P2_WIN",
	DRAW: "DRAW",
	IN_PROGRESS: "IN_PROGRESS",
	NOT_STARTED: "NOT_STARTED"
});

function createPlayer(name, marker) {
	return { name, marker };
}

const Game = (() => {
	let player1;
	let player2;
	let gameStatus = GameStatus.NOT_STARTED;
	let player1Round = true;
	const checkRows = (board) => {
		const { nbRows, nbCols } = board.getSize();
		let result = 0;
		for (let row = 0; row < nbRows; row++) {
			for (let col = 0; col < nbCols; col++) {
				const cell = board.getCell(row, col);
				if (cell !== null) {
					result += cell;
				}
				if (result === 3) {
					gameStatus = GameStatus.P1_WIN;
				}
				if (result === -3) {
					gameStatus = GameStatus.P2_WIN;
				}
			}
			result = 0;
		}
	}
	const checkCols = (board) => {
		const { nbRows, nbCols } = board.getSize();
		let result = 0;
		for (let col = 0; col < nbCols; col++) {
			for (let row = 0; row < nbRows; row++) {
				const cell = board.getCell(row, col);
				if (cell !== null) {
					result += cell;
				}
				if (result === 3) {
					gameStatus = GameStatus.P1_WIN;
				}
				if (result === -3) {
					gameStatus = GameStatus.P2_WIN;
				}
			}
			result = 0;
		}
	}
	const checkDiag = (board) => {
		const { nbRows, nbCols } = board.getSize();
		let result = 0;
		for (let row = 0; row < nbRows; row++) {
			for (let col = 0; col < nbCols; col++) {
				if (row === col) {
					const cell = board.getCell(row, col);
					if (cell !== null) {
						result += cell;
					}
				}
			}
		}
		if (result === 3) {
			gameStatus = GameStatus.P1_WIN;
		}
		if (result === -3) {
			gameStatus = GameStatus.P2_WIN;
		}
	};
	const checkAntiDiag = (board) => {
		const { nbRows, nbCols } = board.getSize();
		let result = 0;
		for (let row = 0; row < nbRows; row++) {
			for (let col = 0; col < nbCols; col++) {
				if (row + col === nbCols - 1) {
					const cell = board.getCell(row, col);
					if (cell !== null) {
						result += cell;
					}
				}
			}
		}
		if (result === 3) {
			gameStatus = GameStatus.P1_WIN;
		}
		if (result === -3) {
			gameStatus = GameStatus.P2_WIN;
		}
	};
	const checkIsFull = (board) => {
		if (board.isFull()) {
			gameStatus = GameStatus.DRAW;
		}

	}
	const getPlayer1 = () => player1;
	const getPlayer2 = () => player2;
	const getStatus = () => gameStatus;
	const setStatus = status => gameStatus = status;


	const start = (p1Name, p2Name) => {
		player1 = createPlayer(p1Name === ""? "Player 1" : p1Name, 1);
		player2 = createPlayer(p2Name === ""? "Player 2" : p2Name, -1);
		gameStatus = GameStatus.IN_PROGRESS;
	}
	const play = (board, row, col) => {
		if (gameStatus !== GameStatus.IN_PROGRESS) return;
		if (!board.isCellEmpty(row, col)) return;

		board.setCell(row, col, player1Round ? player1.marker : player2.marker);
		player1Round = !player1Round;

		checkIsFull(board);
		checkRows(board);
		checkCols(board);
		checkDiag(board);
		checkAntiDiag(board);
	}
	const reset = (board) => {
		player1Round = true;
		gameStatus = GameStatus.NOT_STARTED;
		board.reset();
	}
	return { start, play, reset, getStatus, setStatus, getPlayer1, getPlayer2};
})();

const Board = (() => {
	const nbCols = 3;
	const nbRows = 3;
	let gameBoard = [null, null, null, null, null, null, null, null, null];
	const getSize = () => { return { nbRows, nbCols } };
	const getBoard = () => gameBoard;
	const getCell = (row, col) => {
		const position = nbCols * row + col;
		return gameBoard[position];
	}
	const setCell = (row, col, marker) => {
		const position = nbCols * row + col;
		gameBoard[position] = marker;
	}
	const isCellEmpty = (row, col) => {
		const position = nbCols * row + col;
		return gameBoard[position] === null;
	}
	const isFull = () => {
		return gameBoard.every(cell => cell !== null);

	}
	const reset = () => {
		gameBoard = [null, null, null, null, null, null, null, null, null];
	}
	return { getSize, getBoard, getCell, setCell, isCellEmpty, isFull, reset };
})();

const container = document.createElement("div");
container.className = "board";
document.body.appendChild(container);
const Renderer = ((container) => {
	let onClick = null;
	// Setup event delegation
	container.addEventListener("click", (event) => {
		if (!onClick) return;
		const cell = event.target.closest(".cell");
		if (!cell) return;
		const row = Number(cell.getAttribute("row"));
		const col = Number(cell.getAttribute("col"));
		onClick(row, col);
	})
	const update = (board) => {
		container.innerHTML = "";
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const cell = document.createElement("div");
				cell.className = "cell";
				cell.setAttribute("row", row);
				cell.setAttribute("col", col);
				if (board.getCell(row, col) === 1) {
					cell.style = `background: no-repeat center/cover url("./assets/images/cross.svg")`
				}
				if (board.getCell(row, col) === -1) {
					cell.style = `background: no-repeat center/cover url("./assets/images/circle.svg")`
				}
				container.appendChild(cell)
			}
		}
	}
	const showResult = (game) => {
		const resultDiv = document.querySelector(".result");
		const gameStatus = game.getStatus()
		if (gameStatus === GameStatus.P1_WIN) resultDiv.textContent = `${game.getPlayer1().name} wins!`;
		else if (gameStatus === GameStatus.P2_WIN) resultDiv.textContent = `${game.getPlayer2().name} wins!`;
		else if (gameStatus === GameStatus.DRAW) resultDiv.textContent = "It's a draw!";
	}
	const clearResult = () => {
		const resultDiv = document.querySelector(".result");
		resultDiv.textContent = "";
	}
	const setOnClick = (callback) => {
		onClick = callback;
	}
	return { update, showResult, clearResult, setOnClick }
})(container);

const player1 = document.querySelector("input[name=player1]");
const player2 = document.querySelector("input[name=player2]");
const BoardController = ((board, renderer, game) => {
	renderer.update(board);
	renderer.setOnClick((row, col) => {
		if (game.getStatus() === GameStatus.NOT_STARTED) game.start(player1.value, player2.value);
		game.play(board, row, col);
		renderer.update(board);
		renderer.showResult(game);
	})

})(Board, Renderer, Game);

const newGameBtn = document.querySelector(".new-game");
newGameBtn.addEventListener("click", () => {
	Game.reset(Board);
	Renderer.update(Board);
	Renderer.clearResult()
})
