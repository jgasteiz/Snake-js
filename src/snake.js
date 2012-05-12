/** 
 * Snake.js
 *
 * @author Javi Manzano | @jgasteiz | https://github.com/jgasteiz
 */

var GAME = (function(){

	var game = {},
		snake = {},
		// This object will only have mouse's coordinates
		mouse = new Array(),
		// You can change here the dimensions of the main board
		rows = 20,
		cols = 30,
		// The keycodes for arrows
		codes = {
			37 : 'left',
			38 : 'up',
			39 : 'right',
			40 : 'down'
		},
		// You can adjust this parameter to get more/less speed in the game
		delay = 100,
		// Boolean that determines if game has started or not
		gameStarted = false,
		// A lock for not listening multiple keys at the same time
		blocked = false,
		gameOver = false,
		deadMessage = "Has muerto! / You're dead!";

	/*
	 *	Draws the main board
	 */
	function initBoard() {
		var table = '<table>';
		for (var y = 0; y < rows; y++) {
			table += '<tr>';
			for (var x = 0; x < cols; x++) {
				table += '<td id="' + x + '_' + y + '"></td>';
			}
			table += '</tr>';
		}
		$("#board").html(table);
	}

	/*
	 *	Initializes the snake
	 */
	function initSnake() {
		snake.head = new Array();
		snake.head[0] = 15;
		snake.head[1] = 10;
		snake.length = 4;
		snake.direction = 'up';
		snake.body = new Array();
		for (var i = 0; i < snake.length; i++) {
			snake.body[i] = new Array();
			snake.body[i][0] = snake.head[0];
			snake.body[i][1] = snake.head[1] + i + 1;
		}
		renderSnake();
	}

	/*
	 *	Initializes the main key listener
	 */
	function initControls() {
		$(document).bind('keydown', function(e) {
			changeDirection(e.keyCode);
		});
	}

	/*
	 *	Creates a mouse on a random position (not in snake's head)
	 */
	function createMouse() {
		mouse[0] = Math.floor(Math.random() * cols);
		mouse[1] = Math.floor(Math.random() * rows);
		if (mouse[0] == snake.head[0] && mouse[1] == snake.head[1]) {
			createMouse();
		}
		else {
			draw(mouse[0], mouse[1], "mouse");
		}
	}

	/*
	 *	Changes snake's position based on its direction
	 */
	function moveSnake() {
		if (!gameOver) {
			// First, changes body's parts position
			for (var i = snake.length - 1; i > 0; i--) {
				snake.body[i][0] = snake.body[i-1][0];
				snake.body[i][1] = snake.body[i-1][1];
			}
			snake.body[0][0] = snake.head[0];
			snake.body[0][1] = snake.head[1];

			// After that, based on the current direction, the head's position
			switch (snake.direction) {
				case 'up':
					snake.head[1] -= 1;
					break;
				case 'right':
					snake.head[0] += 1;
					break;
				case 'left':
					snake.head[0] -= 1;
					break;
				case 'down':
					snake.head[1] += 1;
					break;
			}

			// Removes event-listener lock
			blocked = false;

			// Check for collisions

			// 1 - With walls
			if (snake.head[0] < 0 || snake.head[0] > cols - 1 ||
				snake.head[1] < 0 || snake.head[1] > rows - 1) {
				alert(deadMessage);
				gameOver = true;
				window.location.reload();
			}
			
			// 2 - With mouses
			if (snake.head[0] == mouse[0] && snake.head[1] == mouse[1]) {
				// Removes the mouse
				$("#" + mouse[0] + "_" + mouse[1]).removeClass("mouse");
				// Our snake goes bigger!
				snake.body[snake.length] = new Array();
				snake.body[snake.length][0] = snake.body[snake.length - 1][0];
				snake.body[snake.length][0] = snake.body[snake.length - 1][1];
				snake.length += 1;
				// And we draw a new mouse
				createMouse();
			}
			
			// With itself
			for (var i = 0; i < snake.length; i++) {
				if (snake.head[0] == snake.body[i][0] && 
					snake.head[1] == snake.body[i][1]) {
					alert(deadMessage);
					window.location.reload();
				}
			}
			renderSnake();
		}
	}

	/*
	 *	Draws the snake on the board
	 */
	function renderSnake() {
		$("td").removeClass("head");
		$("td").removeClass("body");
		draw(snake.head[0], snake.head[1], "head");
		for (var i = 0; i < snake.length; i++) {
			draw(snake.body[i][0], snake.body[i][1], "body");
		}
	}

	/*
	 *	The snake changes its direction based on the arrow key the player
	 * 	has pressed.
	 */
	function changeDirection(code) {
		if (codes[code] != undefined && blocked == false) {
			startGame();

			// Lock the listener until snake moves
			blocked = true;

			// These lines prevents players die too soon
			if (snake.direction == 'up' && codes[code] == 'down') {
				snake.direction = 'up';
			}
			else if (snake.direction == 'down' && codes[code] == 'up') {
				snake.direction = 'down';
			}
			else if (snake.direction == 'left' && codes[code] == 'right') {
				snake.direction = 'left';
			}
			else if (snake.direction == 'right' && codes[code] == 'left') {
				snake.direction = 'right';
			}
			else {
				// If the player didn't try to kill himself, it goes
				// in the direction he wants
				snake.direction = codes[code];
			}
		}
	}

	/*
	 *	Draws "something" in a coordinate
	 *  (take a look to the snake.css file for more information ;)
	 */
	function draw(x, y, something) {
		$("#" + x + "_" + y).addClass(something);
	}

	/*
	 *	Based on the difficulty selected on the main screen,
	 * 	this sets the delay between "moveSnake" calls (speed)
	 */
	function handleSpeed() {
		var difficulty = $("input[name='radio']:checked").val();
		switch (difficulty) {
			case "1":
				delay = 100;
				break;
			case "2":
				delay = 80;
				break;
			case "3":
				delay = 50;
				break;
		}
		$("div.controls").remove();
	}

	/*
	 *	Starts the main game, moving the snake and creating the first mouse
	 */
	function startGame() {
		if (!gameStarted) {
			handleSpeed();
			$("h2").css("visibility", "hidden");
			console.log("Start Game!");
			gameStarted = true;
			setInterval(moveSnake, delay);
			createMouse();
		}
	}

	/*
	 *	Initializes the two main elements of the game: board and snake
	 */
	game.init = function() {
		initBoard();
		initSnake();
		initControls();
	};

	return game;

})();