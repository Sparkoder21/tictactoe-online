const {Server} = require("socket.io");

const io = new Server({
	cors: {
		origin: "*"
	}
});

const games = {};

function random(min, max){
	return (Math.floor(Math.random()*(max - min)) + min);
}

function getID(length) {
	const letters = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";

    const lettersLength = letters.length;
    const numbersLength = numbers.length;

    let result = "";
    let i;

    for (i = 0; i < length; i++){
        result += letters.charAt(Math.floor(Math.random()*lettersLength));
    }
    for (i = 0; i < length; i++){
        result += numbers.charAt(Math.floor(Math.random()*numbersLength));
    }
    return result;
}

io.on("connection", (socket) => {
	socket.gameID = getID(5);

	games[socket.gameID] = {
		gameID: socket.gameID,
		sockets: [socket.id],
		board: [
			[0, 0, 0], 
			[0, 0, 0], 
			[0, 0, 0]
		],
		started: false,
		playing: true,
		length: 9,
		symbols: 0,
		turn: 0,

		update(){
			++this.symbols;

			if (
				((this.board[0][0] !== 0) && (this.board[0][0] === this.board[0][1]) && (this.board[0][0] === this.board[0][2])) ||
				((this.board[1][0] !== 0) && (this.board[1][0] === this.board[1][1]) && (this.board[1][0] === this.board[1][2])) ||
				((this.board[2][0] !== 0) && (this.board[2][0] === this.board[2][1]) && (this.board[2][0] === this.board[2][2])) ||
				((this.board[0][0] !== 0) && (this.board[0][0] === this.board[1][0]) && (this.board[0][0] === this.board[2][0])) ||
				((this.board[0][1] !== 0) && (this.board[0][1] === this.board[1][1]) && (this.board[0][1] === this.board[2][1])) ||
				((this.board[0][2] !== 0) && (this.board[0][2] === this.board[1][2]) && (this.board[0][2] === this.board[2][2])) ||
				((this.board[0][0] !== 0) && (this.board[0][0] === this.board[1][1]) && (this.board[0][0] === this.board[2][2])) ||
				((this.board[0][2] !== 0) && (this.board[0][2] === this.board[1][1]) && (this.board[0][2] === this.board[2][0]))
			){
				const symbols = {
					x: 0,
					o: 0
				};

				this.board.forEach((row) => {
					row.forEach((value) => {
						if (value === 1){
							++symbols.x;
						}
						else if (value === 2){
							++symbols.o;
						}
					});
				});

				if (symbols.o > symbols.x){
					this.sockets.forEach((socketID, index) => {
						if (index){
							io.to(socketID).emit("gameOver", "Player 1");
						}
						else{

							io.to(socketID).emit("gameOver", "You");
						}
					});
					this.reset();
				}
				else{
					this.sockets.forEach((socketID, index) => {
						if (index){
							io.to(socketID).emit("gameOver", "You");
						}
						else{

							io.to(socketID).emit("gameOver", "Player 2");
						}
					});
					this.reset();
				}
			}
			if (this.symbols === this.length){
				this.sockets.forEach((socketID) => {
					io.to(socketID).emit("gameOver", "draw");

					this.reset();
				});
			}
		},
		reset(){
			this.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
			this.symbols = 0;
			this.turn = 0;
			this.playing = false;

			setTimeout(() => {
				this.playing = true;

				this.sockets.forEach((socketID) => {
					io.to(socketID).emit("gameResume");
				});
			}, 2000);
		}
	};
	socket.emit("connected", socket.gameID);

	socket.on("sendClick", (data) => {
		if (games[data.id]){
			if (games[data.id].started){
				if (games[data.id].playing){
					const game = games[data.id];
					const player = game.sockets[0];
					const x = data.pointerX;
					const y = data.pointerY;

					if (socket.id === player){
						if (game.turn){
							socket.emit("playerTurn");
						}
						else{						
							if (x > 30 && y > 130 && x < 110 && y < 210 && game.board[0][0] === 0){
								game.board[0][0] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 153 && y > 130 && x < 243 && y < 210 && game.board[0][1] === 0){
								game.board[0][1] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 275 && y > 130 && x < 365 && y < 210 && game.board[0][2] === 0){
								game.board[0][2] = 2;
								game.turn = 1;
								
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 30 && y > 250 && x < 110 && y < 330 && game.board[1][0] === 0){
								game.board[1][0] = 2;
								game.turn = 1;
								
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 153 && y > 250 && x < 243 && y < 330 && game.board[1][1] === 0){
								game.board[1][1] = 2;
								game.turn = 1;
								
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 275 && y > 250 && x < 365 && y < 330 && game.board[1][2] === 0){
								game.board[1][2] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 30 && y > 370 && x < 110 && y < 450 && game.board[2][0] === 0){
								game.board[2][0] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 153 && y > 370 && x < 243 && y < 450 && game.board[2][1] === 0){
								game.board[2][1] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 275 && y > 370 && x < 365 && y < 450 && game.board[2][2] === 0){
								game.board[2][2] = 2;
								game.turn = 1;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});		
								game.update();
							}
						}
					}
					else{
						if (game.turn){
							if (x > 30 && y > 130 && x < 110 && y < 210 && game.board[0][0] === 0){
								game.board[0][0] = 1;
								game.turn = 0;
								
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 153 && y > 130 && x < 243 && y < 210 && game.board[0][1] === 0){
								game.board[0][1] = 1;
								game.turn = 0;
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 275 && y > 130 && x < 365 && y < 210 && game.board[0][2] === 0){
								game.board[0][2] = 1;
								game.turn = 0;
								
								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});
								game.update();
							}
							else if (x > 30 && y > 250 && x < 110 && y < 330 && game.board[1][0] === 0){
								game.board[1][0] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 153 && y > 250 && x < 243 && y < 330 && game.board[1][1] === 0){
								game.board[1][1] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 275 && y > 250 && x < 365 && y < 330 && game.board[1][2] === 0){
								game.board[1][2] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 30 && y > 370 && x < 110 && y < 450 && game.board[2][0] === 0){
								game.board[2][0] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 153 && y > 370 && x < 243 && y < 450 && game.board[2][1] === 0){
								game.board[2][1] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
							else if (x > 275 && y > 370 && x < 365 && y < 450 && game.board[2][2] === 0){
								game.board[2][2] = 1;
								game.turn = 0;

								game.sockets.forEach((socketID) => {
									io.to(socketID).emit("gameUpdate", {
										board: game.board,
										turn: game.turn
									});
								});							
								game.update();
							}
						}
						else{						
							socket.emit("playerTurn");					
						}
					}
				}
			}
			else{
				socket.emit("toStart");
			}
		}
		else{
			socket.emit("noGame");
		}
	});
	socket.on("joinGame", (data) => {
		if (games[data]){
			if (games[data].sockets.length === 1){
				socket.emit("gameJoined", data);

				io.to(games[data].sockets[0]).emit("newJoined");

				games[data].sockets.push(socket.id);

				games[data].started = true;
			}
			else{
				socket.emit("noGame");
			}
		}
		else{
			socket.emit("noGame");
		}
	});
	socket.on("cutConnection", (gameID) => {
		socket.disconnect();

		if (games[gameID]){
			games[gameID].sockets.forEach((socketID) => {
				io.to(socketID).emit("playerDisconnected");
			});
		}
		delete games[gameID];
	});
});

io.listen(3000);