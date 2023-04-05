const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
//radek 208 enemy spawns
//canvas stats
canvas.width = 900;
canvas.height = 600;
//cell infos
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
//hra stats
const defenders = [];
const enemies = [];
const enemyPositions = [];
let enemiesInterval = 800;
let numbersOfResources = 300;
let frame = 0;
let gameOver = false;
const projectiles = [];

//mys info
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,//velikost potreba kvuli detekci kolize
  height: 0.1,
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

//herni pole//pozdeji mozna dalsi veze k liste
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};
// celka staty
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  //celka
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      // kolize myse a celky
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
//projectiles
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.dmg = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();
    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].dmg;
        projectiles.splice(i, 1); //specifickej projketil ktery provedl danou kolizi
        i--;
      }
    }
    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      //odstraneni projktile kdyt mimo mapu
      projectiles.splice(i, 1);
      i--;
    }
  }
}

//susy
class Enemy {
  constructor(verticalPosition) {
    // y souradky
    this.y = verticalPosition;
    this.x = canvas.width;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  update() {
    this.x -= this.movement;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}
//towerky
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30); //defender souradky na projektile
  }
  update() {
    //funkce strelby
    this.timer++;
    if (this.timer % 100 === 0) {
      projectiles.push(new Projectile(this.x + 50, this.y + 50));
    }
  }
}

//urobeni gridu
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}
createGrid();
function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}
//vykresluje defendry
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();

    //kolize pro def
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        //kolize z napsaneho kodu
        enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1); //szmazabni 1 indexu
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}
//enemies
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
    if (enemies[i].health <= 0) {
      let gainedResources = (enemies[i].maxHealth / 10) * 2;
      numbersOfResources += gainedResources;
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0) {
    let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(verticalPosition));
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 0) enemiesInterval -= 50;
  }
}
//UI
function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Arial";
  ctx.fillText("Resources: " + numbersOfResources, 20, 60);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "90px Arial";
    ctx.fillText("GAME OVER", 135, 330);
  }
}

//hlavni animace
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleEnemies();
  handleGameStatus();
  handleProjectiles();
  frame++;
  // ! je opak
  if (!gameOver) requestAnimationFrame(animate);
}
animate();
//kolize
function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize); //towerka bude vzdy uprostred, grid lock placement
  const gridPositionY = mouse.y - (mouse.y % cellSize);

  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  if (gridPositionY < cellSize) return;

  let defenderCost = 100;
  if (numbersOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numbersOfResources -= defenderCost;
  }
});
