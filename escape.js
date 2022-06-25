const input = `
############.##
###############
############.##
############.##
############.##
############.##
############.##
############.##
#######.####.##
##....#.####..#
#####.#.####.##
#####S#.####.##
#####.#.####.##
#####........##
###############
`;

class Cell {
  constructor(rowIndex, colIndex, cellType) {
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
    this.isWall = cellType === "#";
  }
  //隣接セル取得
  getAdjacent(debug = false) {
    const ci = this.room[this.rowIndex + 1]?.[this.colIndex] || null;
    const cd = this.room[this.rowIndex - 1]?.[this.colIndex] || null;
    const ri = this.room[this.rowIndex]?.[this.colIndex + 1] || null;
    const rd = this.room[this.rowIndex]?.[this.colIndex - 1] || null;

    debug && console.log({ from: `${this.rowIndex},${this.colIndex}`, ci, cd, ri, rd });
    return [ci, cd, ri, rd].filter((x) => x === null || !x.isWall);
  }
}

function buildRoom(roomInfo, cellInfo) {
  const [height, width] = roomInfo;
  let startPoint = [];
  const room = new Array(height).fill(null).map((col, rowIndex) => {
    const row = new Array(width).fill(null).map((row, colIndex) => {
      const currentCellType = cellInfo[rowIndex][colIndex];
      if (currentCellType === "S") startPoint = [rowIndex, colIndex];
      return new Cell(rowIndex, colIndex, currentCellType);
    });
    return row;
  });
  room.forEach((col) => col.forEach((rol) => (rol.room = room)));
  return [room, ...startPoint];
}

function parseCellInfo(cols) {
  return cols.map((x) => Array.from(x));
}

class Player {
  get historyPos() {
    return this.history.map((x) => `${x.rowIndex},${x.colIndex}`);
  }
  get currentCell() {
    return this.history[this.history.length - 1];
  }
  constructor(room, history) {
    this.room = room;
    this.history = history;
  }

  escape() {
    try {
      const res = this.crawl();
      return res === null;
    } catch (e) {
      if (e === "escaped") {
        console.log("IIII!!!");
        return true;
      } else {
        console.error(e);
      }
    }
  }

  crawl() {
    if (this.currentCell === null) {
      return null;
    }
    const adjacents = this.currentCell.getAdjacent().filter((cell) => !this.history.includes(cell));
    if (adjacents.find((x) => x === null)) {
      throw "escaped";
    } else {
      // console.log(`adjacent of ${rowIndex},${colIndex}`, adjacents);
      const newPlayes = adjacents.map((x) => new Player(this.room, [...this.history, x]).crawl());
      return newPlayes.find((x) => x === null);
    }
  }
}

async function main(cellInfo) {
  const roomInfo = [cellInfo.length, Array.from(cellInfo[0]).length];
  const [room, startRow, startCol] = buildRoom(roomInfo, parseCellInfo(cellInfo));
  const player = new Player(room, [room[startRow][startCol]]);
  const isEscaped = player.escape();
  console.log(isEscaped ? "YES" : "NO");
  //  console.log(room[8][8]);
}

main(input.split("\n").filter(Boolean));
