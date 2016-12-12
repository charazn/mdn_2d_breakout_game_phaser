var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload: preload,
  create: create,
  update: update
});

var ball;
var paddle;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // SHOW_ALL — scales the canvas, but keeps the aspect ratio untouched, so images won't be skewed like in the previous mode. There might be black stripes visible on the edges of the screen, but we can live with that.
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  // These two lines of code in the preload() function are responsible for aligning the canvas element horizontally and vertically, so it is always centered on screen regardless of size.
  game.stage.backgroundColor = '#eee';
  game.load.image('ball', 'ball.png');
  game.load.image('paddle', 'paddle.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  ball = game.add.sprite(game.world.width * 0.5, game.world.height - 50, 'ball'); // From ball = game.add.sprite(50, 50, 'ball');
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  
  // For some reason, code below must be set AFTER game.physics.enable! 
  ball.body.velocity.set(150, -150); // From (150, 150)
  ball.body.collideWorldBounds = true; // Tell the framework that we want to treat the boundaries of the <canvas> element as walls and not let the ball move past them.
  ball.body.bounce.set(1); // To make ball baounce off wall, we have to set its bounciness.
  ball.checkWorldBounds = true; // This will make the ball check the world bounds 
  ball.events.onOutOfBounds.add(function(){ // and execute the function bound to the onOutOfBounds event
    alert('Game over!');
    location.reload();
  }, this);

  paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
  paddle.anchor.set(0.5, 1); // Mid-width of paddle, bottom of paddle
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;
}

function update() {
  // ball.x += 1;
  // ball.y += 1;
  game.physics.arcade.collide(ball, paddle);
  paddle.x = game.input.x || game.world.width * 0.5;
}
