import { KEYS, LAYOUT } from "./constants";

export class Game {
  constructor(grid, scoreDisplay, layout, playerIndex, enemys) {
    this.grid = grid;
    this.scoreDisplay = scoreDisplay;
    this.layout = layout;
    this.width = 28; // width of the grid, should be calculated
    this.score = 0;
    this.playerIndex = playerIndex;
    this.squares = [];
    this.enemys = enemys;
    this.playerListener = undefined;
    this.playerId = undefined;
  }

  // add each square with correct class to the board
  createBoard() {
    this.squares = new Array(this.layout.length).fill(0).map((_, index) => {
      const square = document.createElement("div");

      const squareWithLayout = this.addLayout({ square, index });
      this.grid.appendChild(squareWithLayout);

      return squareWithLayout;
    });
  }

  addLayout({ square, index }) {
    switch (this.layout[index]) {
      case LAYOUT.dot:
        square.classList.add("dot");
        break;
      case LAYOUT.wall:
        square.classList.add("wall");
        break;
      case LAYOUT.lair:
        square.classList.add("enemy-lair");
        break;
      case LAYOUT.powerUp:
        square.classList.add("power-up");
        break;
    }

    // default return
    return square;
  }

  updateScore(score = 1) {
    const newScore = this.score + score;
    this.scoreDisplay.innerHTML = newScore;
    this.score = newScore;
  }

  start() {
    this.playerListener = (event) => {
      this.movePlayer(event);
    };

    document.addEventListener("keyup", this.playerListener);
  }

  playerOnDot() {
    const isOnDot = this.squares[this.playerIndex].classList.contains("dot");

    if (isOnDot) {
      this.squares[this.playerIndex].classList.remove("dot");
      this.updateScore();
    }
  }

  playerOnPowerUp() {
    const isOnPowerUp = this.squares[this.playerIndex].classList.contains(
      "power-up"
    );

    if (isOnPowerUp) {
      this.squares[this.playerIndex].classList.remove("power-up");
      this.updateScore(10);

      this.scareEnemys();
    }
  }

  endGame() {
    // stop enemys from moving
    this.enemys.map((enemy) => {
      clearInterval(enemy.timerId);
    });

    clearInterval(this.playerId);

    // Stop player from moving
    document.removeEventListener("keyup", this.playerListener);
  }

  gameOver() {
    this.endGame();

    document.querySelector("body").classList.add("loose");
  }

  gameWin() {
    // This is not an performance-efficient way of doing things
    const dotsLeft = document.querySelectorAll(".dot");
    const powerUpsLeft = document.querySelectorAll(".power-up");

    if (dotsLeft.length <= 0 && powerUpsLeft.length <= 0) {
      this.endGame();

      document.querySelector("body").classList.add("win");
    }
  }
  /*
   * ======================================================
   * ======================================================
   *
   * Player section
   *
   * ======================================================
   * ======================================================
   */

  addPlayer(index = this.playerIndex) {
    this.squares[index].classList.add("player");
  }

  removePlayer(index = this.playerIndex) {
    this.squares[index].classList.remove("player");
  }

  movePlayer(event) {
    clearInterval(this.playerId);

    // makes player move in the desired direction automatically
    this.playerId = setInterval(() => {
      const newPlayerIndex = this.updatePlayerPosition(event.keyCode);

      const nextStepIsWall = this.squares[newPlayerIndex].classList.contains(
        "wall"
      );
      const nextStepIsEnemyLair = this.squares[
        newPlayerIndex
      ].classList.contains("enemy-lair");

      // move packman if there is no wall
      if (!nextStepIsWall && !nextStepIsEnemyLair) {
        this.removePlayer();
        this.addPlayer(newPlayerIndex);

        // update new position
        this.playerIndex = newPlayerIndex;

        // check if player is on a dot
        this.playerOnDot();

        // check if player is on powerUp
        this.playerOnPowerUp();

        // // encounter enemy
        if (this.squares[newPlayerIndex].classList.contains("enemy")) {
          this.encounterEnemy(
            this.enemys.find((enemy) =>
              this.squares[newPlayerIndex].classList.contains(
                `enemy-${enemy.className}`
              )
            )
          );
        }

        // check if game is won
        this.gameWin();
      }
    }, 200);
  }

  updatePlayerPosition(keyCode) {
    const { playerIndex, width } = this;

    switch (keyCode) {
      case KEYS.LEFT:
        // Allows player to move between walls
        if (playerIndex % width === 0) return playerIndex + width - 1;

        // Move around
        return playerIndex - 1;

      case KEYS.UP:
        if (playerIndex - width >= 0) return playerIndex - width;

      case KEYS.RIGHT:
        // Allows player to move between walls
        if (playerIndex % width === width - 1) return playerIndex - width + 1;

        if (playerIndex % width < width) return playerIndex + 1;

      case KEYS.DOWN:
        if (playerIndex + width < width * width) return playerIndex + width;
    }

    return playerIndex;
  }

  /*
   * ======================================================
   * ======================================================
   *
   * Enemy section
   *
   * ======================================================
   * ======================================================
   */
  addEnemys() {
    this.enemys.map((enemy) => {
      this.addEnemy({ index: enemy.currentIndex, name: enemy.className });
      this.moveEnemy(enemy);
    });
  }

  // TODO: Build logic for moving enemys
  addEnemy({ index, name }) {
    this.squares[index].classList.add(`enemy-${name}`, "enemy");
  }

  moveEnemy(enemy) {
    const { squares } = this;
    const directions = [-1, +1, this.width, -this.width];
    let direction = directions[Math.floor(Math.random() * directions.length)];

    enemy.timerId = setInterval(() => {
      // check if next step is not wall or enemy
      let nextStepIsWall = squares[
        enemy.currentIndex + direction
      ].classList.contains("wall");

      let nextStepIsEnemy = squares[
        enemy.currentIndex + direction
      ].classList.contains("enemy");

      if (!nextStepIsWall && !nextStepIsEnemy) {
        // you can go here if you
        squares[enemy.currentIndex].classList.remove(
          `enemy-${enemy.className}`,
          "enemy",
          "enemy-scared"
        );

        enemy.currentIndex += direction;

        this.addEnemy({ index: enemy.currentIndex, name: enemy.className });
      } else {
        direction = directions[Math.floor(Math.random() * directions.length)];
      }

      if (enemy.isScared) {
        squares[enemy.currentIndex].classList.add("enemy-scared");
      }

      // Check battle outcome
      if (squares[enemy.currentIndex].classList.contains("player")) {
        this.encounterEnemy(enemy);
      }
    }, enemy.speed);
  }

  encounterEnemy(enemy) {
    if (enemy.isScared) {
      this.squares[enemy.currentIndex].classList.remove(
        `enemy-${enemy.className}`,
        "enemy",
        "enemy-scared"
      );

      this.updateScore(100);

      enemy.currentIndex = enemy.startIndex;
      enemy.isScared = false;
      this.addEnemy({ index: enemy.currentIndex, name: enemy.className });
    } else {
      this.gameOver();
    }
  }

  scareEnemys() {
    this.enemys.map((enemy) => {
      enemy.isScared = true;

      // reset scare-state
      setTimeout(() => {
        enemy.isScared = false;
      }, 12000); // 12 seconds
    });
  }
}
