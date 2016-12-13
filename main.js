var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload: preload,
  create: create,
  update: update
});

var ball;
var paddle;
var bricks; // The bricks variable will be used to create a group
var newBrick; // newBrick will be a new object added to the group on every iteration of the loop
var brickInfo; // brickInfo will store all the data we need
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // SHOW_ALL — scales the canvas, but keeps the aspect ratio untouched, so images won't be skewed like in the previous mode. There might be black stripes visible on the edges of the screen, but we can live with that.
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  // These two lines of code in the preload() function are responsible for aligning the canvas element horizontally and vertically, so it is always centered on screen regardless of size.
  game.stage.backgroundColor = '#eee';
  game.load.image('ball', 'ball.png');
  game.load.image('paddle', 'paddle.png');
  game.load.image('brick', 'brick.png');
  game.load.spritesheet('ball', 'wobble.png', 20, 20);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  ball = game.add.sprite(game.world.width * 0.5, game.world.height - 50, 'ball'); // From ball = game.add.sprite(50, 50, 'ball'); and from -25
  ball = game.add.sprite(50, 250, 'ball');
  ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
  // The animations.add() method contains the following parameters:
  // The name we chose for the animation
  // An array defining the order in which to display the frames during the animation. If you look again at the wobble.png image, you'll see there are three frames. Phaser extracts these and stores references them in an array — positions 0, 1, and 2. The above array says that we are displaying frame 0, then 1, then 0, etc.
  // The framerate, in fps. Since we are running the animation at 24fps and there are 9 frames, the animation will display just under three times per second.
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);

  // For some reason, code below must be set AFTER game.physics.enable! 
  ball.body.velocity.set(150, -150); // From (150, 150)
  ball.body.collideWorldBounds = true; // Tell the framework that we want to treat the boundaries of the <canvas> element as walls and not let the ball move past them.
  ball.body.bounce.set(1); // To make ball baounce off wall, we have to set its bounciness.
  ball.checkWorldBounds = true; // This will make the ball check the world bounds 
  // ball.events.onOutOfBounds.add(function () { alert('Game over!'); location.reload(); }, this); // and execute the function bound to the onOutOfBounds event
  ball.events.onOutOfBounds.add(ballLeaveScreen, this); // The add() method binds the given function and causes it to be executed every time the event occurs

  paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
  paddle.anchor.set(0.5, 1); // Mid-width of paddle, bottom of paddle
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;

  initBricks();

  textStyle = { font: '18px Arial', fill: '#0095DD' };
  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);

  livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle); // Set at 5px from top right corner 
  livesText.anchor.set(1, 0); // Refers to Right 1, Top 0 
  lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle); // Insert text in the middle of the canvas
  lifeLostText.anchor.set(0.5); // Center the text
  lifeLostText.visible = false;
}

function update() {
  // ball.x += 1;
  // ball.y += 1;
  game.physics.arcade.collide(ball, paddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick); // See function and question below 
  paddle.x = game.input.x || game.world.width * 0.5;
}

function initBricks() {
  brickInfo = {
    width: 50,
    height: 20,
    count: {
      row: 3,
      col: 7
    },
    offset: {
      top: 50,
      left: 60
    },
    padding: 10
  }

  bricks = game.add.group();

  for (c = 0; c < brickInfo.count.col; c++) {
    for (r = 0; r < brickInfo.count.row; r++) {
      var brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
      var brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
      newBrick = game.add.sprite(brickX, brickY, 'brick');
      game.physics.enable(newBrick, Phaser.Physics.ARCADE);
      newBrick.body.immovable = true;
      newBrick.anchor.set(0.5);
      bricks.add(newBrick);
    }
  }
}

function ballHitBrick(ball, brick) { // How does the engine know which brick the ball is colliding with?
  brick.kill();
  score += 10;
  scoreText.setText('Points: ' + score);

  var count_alive = 0;
  for (i = 0; i < bricks.children.length; i++) {
    if (bricks.children[i].alive === true) {
      count_alive++; // Not efficient code. Resets counter to zero and count the total number of bricks left, each time ball hits a brick. 
    }
  }
  if (count_alive === 0) {
    alert('You won the game, congratulations!');
    location.reload();
  }
}

function ballLeaveScreen() {
  lives--;
  if (lives) {
    livesText.setText('Lives: ' + lives);
    lifeLostText.visible = true;
    ball.reset(game.world.width * 0.5, game.world.height - 50); // From 25
    paddle.reset(game.world.width * 0.5, game.world.height - 5);
    game.input.onDown.addOnce(function () { // addOnce() is useful when you want to have the bound function executed only once and then unbound so it is not executed again
      lifeLostText.visible = false;
      ball.body.velocity.set(150, -150);
    }, this);
  } else {
    alert('You lost, game over!');
    location.reload();
  }
}
