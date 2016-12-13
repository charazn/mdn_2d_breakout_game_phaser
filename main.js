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
var playing = false;
var startButton;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // SHOW_ALL — scales the canvas, but keeps the aspect ratio untouched, so images won't be skewed like in the previous mode. There might be black stripes visible on the edges of the screen, but we can live with that.
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  // These two lines of code in the preload() function are responsible for aligning the canvas element horizontally and vertically, so it is always centered on screen regardless of size.
  game.stage.backgroundColor = '#eee';
  // game.load.image('ball', 'ball.png');
  game.load.spritesheet('ball', 'wobble.png', 20, 20);
  game.load.image('paddle', 'paddle.png');
  game.load.image('brick', 'brick.png');
  game.load.spritesheet('button', 'button.png', 120, 40); // A single button frame is 120 pixels wide and 40 pixels high.
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  // ball = game.add.sprite(50, 250, 'ball');
  ball = game.add.sprite(game.world.width * 0.5, game.world.height - 50, 'ball'); // From ball = game.add.sprite(50, 50, 'ball'); and from -25
  ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
  // The animations.add() method contains the following parameters:
  // The name we chose for the animation
  // An array defining the order in which to display the frames during the animation. If you look again at the wobble.png image, you'll see there are three frames. Phaser extracts these and stores references them in an array — positions 0, 1, and 2. The above array says that we are displaying frame 0, then 1, then 0, etc.
  // The framerate, in fps. Since we are running the animation at 24fps and there are 9 frames, the animation will display just under three times per second.
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);

  // For some reason, code below must be set AFTER game.physics.enable! 
  // ball.body.velocity.set(150, -150); // From (150, 150) and control given to startGame() function
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

  startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);
  // The button() method's parameters are as follows:
  // The button's x and y coordinates
  // The name of the graphic asset to be displayed for the button
  // A callback function that will be executed when the button is pressed
  // A reference to this to specify the execution context
  // The frames that will be used for the over, out and down events. Note: The over event is the same as hover, out is when the pointer moves out of the button and down is when the button is pressed.
}

function update() {
  // ball.x += 1;
  // ball.y += 1;
  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
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
  ball.animations.play('wobble');
  var killTween = game.add.tween(brick.scale); // We use the add.tween() method instead of hiding the bricks instantly when hit by the ball, we will make their width and height scale to zero, so they will nicely disapear. 
  killTween.to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None); // The to() method defines the state of the object at the end of the tween. It takes an object  containing the chosen parameter's desired ending values (scale takes a scale value, 1 being 100% of size, 0 being 0% of size, etc.), the time of the tween in milliseconds and the type of easing to use for the tween.
  killTween.onComplete.addOnce(function () {
    brick.kill();
  }, this);
  killTween.start();
  // game.add.tween(brick.scale).to({x:2,y:2}, 500, Phaser.Easing.Elastic.Out, true, 100); // Shorthand for above, this tween will double the brick's scale in half a second using Elastic easing, will start automatically, and have a delay of 100 miliseconds.


  score += 10;
  scoreText.setText('Points: ' + score);
  // var count_alive = 0;
  // for (i = 0; i < bricks.children.length; i++) {
  //   if (bricks.children[i].alive === true) {
  //     count_alive++; // Not efficient code. Resets counter to zero and count the total number of bricks left, each time ball hits a brick. 
  //   } 
  // } // Bug here. Because last brick to hit leaves a count_alive of 1, it will remain 1 because there is no more bricks to hit, as the count_alive = 0 is set only when the ball hits the bricks.
  // if (count_alive === 0) { 
  //   alert('You won the game, congratulations!');
  //   location.reload();
  // }
  if (score === brickInfo.count.row * brickInfo.count.col * 10) { // Replace above for winning condition, else player cannot win even after hitting all bricks
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

function ballHitPaddle(ball, paddle) {
  ball.animations.play('wobble');
}

function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  playing = true;
}