var gamescreen = document.createElement("canvas");
    gamescreen.id = "myCanvas";
    document.body.id = "body";
    document.body.appendChild(gamescreen);
var canvas = document.getElementById("myCanvas"),
    c = canvas.getContext("2d");
    
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'absolute';
canvas.style.top = 0;

var width,
  height;

var mouseDown = false;

var upPressed = false,
  leftPressed = false,
  downPressed = false,
  rightPressed = false;

var player,
    cursor;

var bullets = [],
    particles = [],
    enemies = [];

var spawn_time,
    spawn_timer;

(function setup() {
  width = canvas.width;
  height = canvas.height;
  spawn_time = 40;
  spawn_timer = spawn_time;
  player = new Player(50, 50, 24, 24);
  cursor = new Cursor();
})();

function gameLoop() {
  update();
  render();
}
setInterval(gameLoop, 1000 / 60);

function render() {
  c.clearRect(0, 0, width, height);
  for (var i = 0; i < bullets.length; i++) {
    var b = bullets[i];
    b.update();
    b.display();
    if (!b.alive) {
      particles.push(new Particle(b.pos.x, b.pos.y, 2, 2, 'hsl('+random(0, 360)+', 100%, 50%)'));
      bullets.splice(i, 1);
    }
  }
  for (var i = 0; i < enemies.length; i++) {
    var en = enemies[i];
    en.update();
    en.display();
    if (!en.alive) enemies.splice(i, 1);
    collisionBetween(enemies[i], player);
  }
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.update();
    p.display();
    if (!p.alive) particles.splice(i, 1);
  }
  player.display();
}

function update() {
  arrayCollision(bullets, enemies);
  cursor.update();
  player.update();
  spawn_timer--;
  if (spawn_timer < 1) {
    var size = random(16, 64);
    enemies.push(new Enemy(random(100, width - 100), random(100, height - 100), size, size, size / 2));
    spawn_timer = spawn_time;
  }
}

/*function animateBg(i) {
  body.style.backgroundColor = 'hsl(' + i + ', 78%, 18%)';
  setTimeout(function() {
    animateBg(++i);
  }, i);
}
animateBg(291);*/

function Player(x, y, w, h) {
  this.pos = new Vector(x, y);
  this.velocity = new Vector();
  this.width = w;
  this.height = h;
  this.angle = 0;
  this.speed = 6;
  this.behaviour = 'player';
  this.update = function() {
    this.pos.add(this.velocity);
    this.velocity.dampen(0.875);

    if (leftPressed && this.velocity.x > -this.speed) this.velocity.x--;
    if (rightPressed && this.velocity.x < this.speed) this.velocity.x++;
    if (upPressed && this.velocity.y > -this.speed) this.velocity.y--;
    if (downPressed && this.velocity.y < this.speed) this.velocity.y++;

    var dx = canvas.mouseX - this.pos.x,
      dy = canvas.mouseY - this.pos.y;
    this.angle = Math.atan2(dy, dx);

    if (mouseDown) bullets.push(new Bullet(this, 5, 5, 7, 0.25, 'hsl('+random(0, 360)+', 100%, 50%)'));
  }
  this.display = function() {
    c.fillStyle = 'grey';
    c.save();
    c.translate(this.pos.x, this.pos.y);
    c.rotate(this.angle);
    c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    c.restore();
  }
}

function Bullet(parent, w, h, speed, spread, fill) {
  this.pos = new Vector(parent.pos.x, parent.pos.y);
  this.velocity = new Vector();
  this.velocity.x = (Math.cos(parent.angle) * speed) + random(-spread, spread);
  this.velocity.y = (Math.sin(parent.angle) * speed) + random(-spread, spread);
  this.width = w;
  this.height = h;
  this.angle = parent.angle;
  this.alive = true;
  this.fill = fill;
  this.behaviour = 'bullet';
  this.update = function() {
    this.pos.add(this.velocity);
    if (this.pos.x > width || this.pos.y > height || this.pos.x <= 0 || this.pos.y <= 0) this.alive = false;
  }
  this.display = function() {
    c.fillStyle = this.fill;
    c.save();
    c.translate(this.pos.x, this.pos.y);
    c.rotate(this.angle);
    c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    c.restore();
  }
}

function Enemy(x, y, w, h, health, speed) {
  this.pos = new Vector(x, y);
  this.width = w;
  this.height = h;
  this.velocity = new Vector();
  this.alive = true;
  this.health = w;
  this.speed = speed || random(1, 4);
  this.angle = 0;
  this.behaviour = 'enemy';
  this.update = function() {
    this.pos.add(this.velocity);
    this.velocity.dampen(0.875);

    var dx = player.pos.x - this.pos.x,
      dy = player.pos.y - this.pos.y;
    this.angle = Math.atan2(dy, dx);

    this.velocity.x += Math.cos(this.angle) / this.speed;
    this.velocity.y += Math.sin(this.angle) / this.speed;

    this.width = this.health;
    this.height = this.health;

    if (this.health < 5) this.alive = false;
  }
  this.display = function() {
    c.fillStyle = 'black';
    c.save();
    c.translate(this.pos.x, this.pos.y);
    c.rotate(this.angle);
    c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    c.restore();
  }
}

function Particle(x, y, w, h, fill) {
  this.pos = new Vector(x, y);
  this.velocity = new Vector(random(-2, 2), random(-2, 2));
  this.width = w;
  this.height = h;
  this.health = 15;
  this.alive = true;
  this.fill = fill;
  this.update = function() {
    this.pos.add(this.velocity);
    this.velocity.x *= 0.875;
    this.velocity.y += 0.3;
    this.health--;
    if (this.health < 1) this.alive = false;
  }
  this.display = function() {
    c.fillStyle = this.fill;
    c.save();
    c.translate(this.pos.x, this.pos.y);
    c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    c.restore();
  }
}

function Cursor(visible) {
  this.pos = new Vector();
  this.visible = visible;
  this.update = function() {
    this.pos.x = canvas.mouseX;
    this.pos.y = canvas.mouseY;
  }
}

function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
  this.add = function(vec) {
    this.x += vec.x;
    this.y += vec.y;
  }
  this.dampen = function(value) {
    this.x *= value;
    this.y *= value;
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function arrayCollision(arrayA, arrayB) {
  for (var i = 1; i < arrayA.length; i++) {
    var this1 = arrayA[i];
    for (var j = 0; j < arrayB.length; j++) {
      var this2 = arrayB[j];
      var disX = this2.pos.x - this1.pos.x;
      var disY = this2.pos.y - this1.pos.y;
      if (Math.sqrt((disX * disX) + (disY * disY)) < this1.width * 5) {
        collisionBetween(this1, this2);
      }
    }
  }
}

function collisionBetween(shapeA, shapeB) {
  var vX = (shapeA.pos.x) - (shapeB.pos.x),
    vY = (shapeA.pos.y) - (shapeB.pos.y),
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2);

  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    if (shapeB.behaviour == 'player') player.health -= 0.05;
    if (shapeA.behaviour == 'bullet') {
      shapeA.alive = false;
      shapeB.health -= 2;
      if (shapeB.speed > 1) shapeB.speed -= 0.05;
    }
    shapeA.velocity.dampen(0.5);
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) shapeA.pos.y += oY - shapeA.velocity.y;
      else shapeA.pos.y -= oY + shapeA.velocity.y;
    } else {
      if (vX > 0) shapeA.pos.x += oX - shapeA.velocity.x;
      else shapeA.pos.x -= oX + shapeA.velocity.x;
    }
  }
}

document.onmousedown = function(e) {
  mouseDown = true;
}
document.onmouseup = function(e) {
  mouseDown = false;
}
document.ontouchstart = function(e) {
  e.preventDefault();
  mouseDown = true;
}
document.ontouchmove = function(e) {
  e.preventDefault();
  mouseDown = true;
}
document.ontouchend = function(e) {
  e.preventDefault();
  mouseDown = false;
}

document.onkeydown = function(e) {
  if (e.keyCode == 87) upPressed = true;
  if (e.keyCode == 65) leftPressed = true;
  if (e.keyCode == 83) downPressed = true;
  if (e.keyCode == 68) rightPressed = true;
}
document.onkeyup = function(e) {
  if (e.keyCode == 87) upPressed = false;
  if (e.keyCode == 65) leftPressed = false;
  if (e.keyCode == 83) downPressed = false;
  if (e.keyCode == 68) rightPressed = false;
}

window.onresize = function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.pageX - rect.left,
    y: evt.pageY - rect.top
  };
}
canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  this.mouseX = mousePos.x;
  this.mouseY = mousePos.y;
}, true);
canvas.addEventListener('touchmove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  this.mouseX = mousePos.x;
  this.mouseY = mousePos.y;
}, true);
