const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");

//GAME VARS
let frames = 0;
const DEGREE = Math.PI / 180;

//GAME STATE OBj
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}
//START BUTTON COORDITAES
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}
//LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src ="audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src ="audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src ="audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src ="audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src ="audio/sfx_die.wav";



//CONTROL THE GAME
cvs.addEventListener("click", function (e) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            bird.flap();
            FLAP.play()
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;
            //Check if user clicked on start btn
            if( clickX >= startBtn.x &&
                clickX<= startBtn.x + startBtn.w &&
                clickY >= startBtn.y &&
                clickY <= startBtn.y + startBtn.h){
                    pipes.reset();
                    bird.speedReset();
                    score.reset()
                    state.current = state.getReady;

                    state.current = state.getReady;
            }
            break;
    }
})

//LOAD STRITE IMG
const sprite = new Image();
sprite.src = 'img/sprite.png';

//BACKGROUND OBJ from sptire img
const bg = {
    //from sprite img
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    //on canvas
    x: 0,
    y: cvs.height - 226,

    //draw bg on cavans
    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

//FOREGROUND obj 
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    //fb movement <-
    update: function () {
        if (state.current === state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }

}

// BIRD
const bird = {
    animation: [{
            sX: 276,
            sY: 112,
        },
        {
            sX: 276,
            sY: 139,
        },
        {
            sX: 276,
            sY: 164,
        },
        {
            sX: 276,
            sY: 139,
        },
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,
    frame: 0,
    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,


    draw: function () {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);

        ctx.restore();
    },

    flap: function () {
        //on click bird up movement
        this.speed = -this.jump;
    },
    update: function () {
        //bird flap speed 
        this.period = state.current == state.getReady ? 10 : 5;
        // 1 frame + / period
        this.frame += frames % this.period === 0 ? 1 : 0;
        //reset frames after 4>numb of img in animation arr
        this.frame = this.frame % this.animation.length;

        if (state.current === state.getReady) {
            this.y = 150; //reset bird to starting position
            this.rotation = 0 * DEGREE;
        } else {
            //bird down movement
            this.speed += this.gravity;
            this.y += this.speed;

            //colision detection ground
            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current === state.game) {
                    state.current = state.over
                    DIE.play();
                }
            }
            //Bird down movement rotation speed>jump
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1; //stop flaping
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },
    speedReset: function(){
        this.speed = 0
    }
}
//PIPES
const pipes = {
    position: [],

    //top pipe
    top: {
        sX: 553,
        sY: 0,
    },
    //bottom pipe
    bottom: {
        sX: 502,
        sY: 0
    },
    w: 53,
    h: 400,
    gap: 85,
    maxY: -150,
    dx: 2,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);

        }
    },

    update: function () {
        if (state.current !== state.game) {
            return
        }
        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxY * (Math.random() + 1)
            })
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            // p.x -= this.dx;

            let bottomPipeYPos = p.y + this.h + this.gap;

            //COLLISION DETECTION
            //TOP PIPE
            if (bird.x + bird.radius > p.x && //front of bird
                bird.x - bird.radius < p.x + this.w && //back of bird
                bird.y + bird.radius > p.y &&
                bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                HIT.play();
            }
            //BOTTOM PIPE
            if (bird.x + bird.radius > p.x && //front of bird
                bird.x - bird.radius < p.x + this.w && //back of bird
                bird.y + bird.radius > bottomPipeYPos &&
                bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                HIT.play();
            }

            //MOVE PIPES TO LEFT
            p.x -= this.dx;

            //pipe beyond canvas = remove from arr
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                SCORE_S.play();

                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    reset:function(){
        this.position = [];
    }
}
//MESSAGES get ready
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,

    draw: function () {
        if (state.current === state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}
//MESSAGES game over
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,

    draw: function () {
        if (state.current === state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}
//SCORE
const score = {
    best: parseInt(localStorage.getItem('best')) || 0,
    value: 0,

    draw: function () {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000"
        if (state.current === state.game) {
            ctx.leneWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50)

        } else if (state.current === state.over) {
            //SCORE VALUE
            ctx.font = "35px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            //BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228)
        }
    },
    reset: function(){
        this.value = 0;
    }
}

//FUNCTIONS
function draw() {
    //draw sky
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, cvs.width, cvs.height)

    bg.draw();
    fg.draw();
    bird.draw();
    pipes.draw()
    getReady.draw();
    gameOver.draw();
    score.draw()

}

function update() {
    bird.update();
    fg.update();
    pipes.update()
}

function loop() {
    update();
    draw();
    frames++;


    requestAnimationFrame(loop)
}


loop()