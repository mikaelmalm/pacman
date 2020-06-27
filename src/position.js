import { KEYS } from "./keys";
export const addPacMan = ({ squares, index }) =>
  squares[index].classList.add("pac-man");

export const removePacMan = ({ squares, pacmanCurrentIndex }) =>
  squares[pacmanCurrentIndex].classList.remove("pac-man");

export const movePacMan = ({
  event,
  pacmanCurrentIndex,
  squares,
  width = 28,
}) => {
  const newPacmanIndex = updatePacManPosition({
    keyCode: event.keyCode,
    pacmanCurrentIndex,
    width,
  });

  const nextStepIsWall = squares[newPacmanIndex].classList.contains("wall");
  const nextStepIsGhostLair = squares[newPacmanIndex].classList.contains(
    "ghost-lair"
  );

  // move packman if there is no wall
  if (!nextStepIsWall && !nextStepIsGhostLair) {
    removePacMan({ squares, pacmanCurrentIndex });
    addPacMan({ squares, index: newPacmanIndex });
    return newPacmanIndex;
  }

  return pacmanCurrentIndex;
};

export const updatePacManPosition = ({
  keyCode,
  pacmanCurrentIndex,
  width,
}) => {
  switch (keyCode) {
    case KEYS.LEFT:
      // Allows pacman to move between walls
      if (pacmanCurrentIndex % width === 0)
        return pacmanCurrentIndex + width - 1;

      // Move around
      return pacmanCurrentIndex - 1;

    case KEYS.UP:
      if (pacmanCurrentIndex - width >= 0) return pacmanCurrentIndex - width;

    case KEYS.RIGHT:
      // Allows pacman to move between walls
      if (pacmanCurrentIndex % width === width - 1)
        return pacmanCurrentIndex - width + 1;

      if (pacmanCurrentIndex % width < width) return pacmanCurrentIndex + 1;

    case KEYS.DOWN:
      if (pacmanCurrentIndex + width < width * width)
        return pacmanCurrentIndex + width;
  }

  return pacmanCurrentIndex;
};
