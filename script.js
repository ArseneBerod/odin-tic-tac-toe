const GameStatus = Object.freeze({
	P1_WIN: "P1_WIN",
	P2_WIN: "P2_WIN",
	DRAW: "DRAW",
	IN_PROGRESS: "IN_PROGRESS",
});

function createPlayer(name, marker) {
	return { name, marker };
}

const Game = ((name1, name2) => {
	const player1 = createPlayer(name1, 1);
	const player2 = createPlayer(name2, -1);
	let player1Round = true;
	let gameStatus = GameStatus.IN_PROGRESS;
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
	const getStatus = () => {
		return gameStatus;
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
		gameStatus = GameStatus.IN_PROGRESS;
		board.reset();
	}
	return { play, reset, getStatus };
})("p1", "p2");

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
					cell.textContent = "X";
				}
				if (board.getCell(row, col) === -1) {
					cell.textContent = "O";
				}
				container.appendChild(cell)
			}
		}
	}
	const showResult = (status) => {
		const resultDiv = document.querySelector(".result");
		if (status === GameStatus.P1_WIN) resultDiv.textContent = "Player 1 Wins!";
		else if (status === GameStatus.P2_WIN) resultDiv.textContent = "Player 2 Wins!";
		else resultDiv.textContent = "It's a draw!";
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

const BoardController = ((board, renderer, game) => {
	renderer.update(board);
	renderer.setOnClick((row, col) => {
		game.play(board, row, col);
		renderer.update(board);
		const gameStatus = game.getStatus();
		if (gameStatus !== GameStatus.IN_PROGRESS) {
			renderer.showResult(gameStatus)
		}
	})

})(Board, Renderer, Game);

const newGameBtn = document.querySelector(".new-game");
newGameBtn.addEventListener("click", () => {
	Game.reset(Board);
	Renderer.update(Board);
	Renderer.clearResult()
})
