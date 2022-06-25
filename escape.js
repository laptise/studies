class Cell {
  constructor(colIndex, rowIndex) {
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
  }
  //隣接セル取得
  getAdjacent(debug = false) {
    const ci = this.room[this.colIndex + 1][this.rowIndex] || null;
    const cd = this.room[this.colIndex - 1][this.rowIndex] || null;
    const ri = this.room[this.colIndex][this.rowIndex + 1] || null;
    const rd = this.room[this.colIndex][this.rowIndex - 1] || null;

    debug && console.log({ from: `${this.colIndex},${this.rowIndex}`, ci, cd, ri, rd });
    return [ci, cd, ri, rd].filter((x) => x === null || !x.isWall);
  }
}

function buildRoom(roomInfo, cellInfo) {
  const [height, width] = roomInfo.split(" ").map(Number);
  let startPoint = [];
  const room = new Array(height).fill(null).map((col, colIndex) => {
    const row = new Array(width).fill(null).map((row, rowIndex) => {
      const currentCellType = cellInfo[colIndex][rowIndex];
      if (currentCellType === "S") startPoint = [colIndex, rowIndex];
      return new Cell(colIndex, rowIndex);
    });
    return row;
  });
  console.log(room);
  room.forEach((col) => col.forEach((rol) => (rol.room = room)));
  return [room, ...startPoint];
}

function parseCellInfo(cols) {
  return cols.map((x) => Array.from(x));
}

class Player {
  get historyPos() {
    return this.history.map((x) => `${x.colIndex},${x.rowIndex}`);
  }
  get currentCell() {
    return this.history[this.history.length - 1];
  }
  constructor(room, history) {
    this.room = room;
    this.history = history;
  }

  async tryEscape() {
    // console.log(
    //   "trying, now is " +
    //     `${this.currentCell.colIndex},${this.currentCell.rowIndex}\n from ${this.history.map((x) => `(${x.colIndex},${x.rowIndex})`)}`
    // );
    const isEscaped = await new Promise(async (res, rej) => {
      const adjacentList = this.currentCell.getAdjacent();
      const candidates =
        adjacentList?.filter((cell) => {
          const isNewCell = !this.history.includes(cell);
          if (isNewCell) {
            return true;
          } else {
            return false;
          }
        }) || [];
      if (candidates.length === 0) {
        return res(false);
      } else {
        const nextTries = await Promise.all(
          candidates.map(async (cell, index) => {
            if (cell === null) {
              //   console.log(`${this.currentCell.colIndex},${this.currentCell.rowIndex}`);
              this.currentCell.getAdjacent(true);
              return true;
            } else if (index === 0) {
              this.history.push(cell);
              return await this.tryEscape();
            } else {
              return await new Player(this.room, [...this.history, cell]).tryEscape();
            }
          })
        );
        const nextTryRes = nextTries?.find?.((x) => x === true);
        if (nextTryRes) {
          //   console.log(nextTries);
          //   console.log(this.historyPos);
          //   console.log(`escaped from ${this.currentCell.colIndex},${this.currentCell.rowIndex}`);
          res(nextTryRes);
        } else {
          res(false);
        }
      }
    });
    return isEscaped;
  }
}

async function main(lines) {
  console.clear();
  const [roomInfo, ...cellInfo] = lines;
  const [room, startCol, startRow] = buildRoom(roomInfo, parseCellInfo(cellInfo));
  const player = new Player(room, [room[startCol][startRow]]);
  const isEscaped = await player.tryEscape();
  console.log(isEscaped ? "YES" : "NO");
  //  console.log(room[8][8]);
}
const input = `
##########
.....#####
##########
#.S#.#####
#.##.#####
#....#####
#....#####
#........#
##########
##########`;
main(input.split("\n"));
