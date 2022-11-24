var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth)/2;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 5;
var brickColumnCount = 3;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var score = 0;
var lives = 5;

var brickColor = ["#0095DD", "#EEC11D", "#D89929", "#E9E025", "#F54A1D"];

/* 
    추가 사항 : 라운드
    라운드는 총 5 라운드까지 존재, 라운드 증가 시 공 속도 증가, 벽돌 개수 증가
*/
var round = 1;

var bricks = [];
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let breakBlock = 0;

/*
    추가 사항: 쿠키를 활용해 최대 점수 기록
*/
function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
}
function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
}

let maxScore = getCookie('max-score') || 0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if(e.code  == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.code == 'ArrowLeft') {
        leftPressed = true;
    }
    else if (e.keyCode == 50) {
        if (score >= 10) {
            score -= 10;
            lives++;
        }
    }
}
function keyUpHandler(e) {
    if(e.code == 'ArrowRight') {
        rightPressed = false;
    }
    else if(e.code == 'ArrowLeft') {
        leftPressed = false;
    }
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function roundInit() {
    dx = 2 + round * 0.5
    dy = -2 - round * 0.5
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
    x = canvas.width/2;
    y = canvas.height-30;
}
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    /* 추가 사항: 스코어가 10점대 마다 효과음 재생 */
                    if (score % 10 == 0) {
                        let audio = new Audio("./bgm/score-music.mp3");
                        audio.play();
                    }
                    /*
                        추가 사항: 벽돌 깰 경우 공의 속도 상승
                        라운드가 올라갈 때마다 속조 증가폭 증가
                    */
                    if (dx >= 0) {
                        dx += 0.1;
                    } else {
                        dx -= 0.1;
                    }
                    if (dy >= 0) {
                        dy += 0.1;
                    } else {
                        dy -= 0.1;
                    }

                    breakBlock++;
                    /*
                        추가 사항: 벽돌을 5개 연속을 깰 경우 라이프 1 증가, 효과음 재생
                    */
                    if (breakBlock >= 5) {
                        
                        lives++;
                        let audio = new Audio("./bgm/life-plus-music.mp3");
                        audio.play();
                        breakBlock = 0;
                    }

                    // console.log(brickRowCount*brickColumnCount / score == 1)

                    if(Number.isInteger(score / (brickRowCount*brickColumnCount)) && round <= 5) {
                        /* 라운드 추가 진행 가능 시 */
                        round++;
                        roundInit();
                        drawGame();
                        // alert("YOU WIN, CONGRATS!");
                        // document.location.reload();
                    } else if (Number.isInteger(score / (brickRowCount*brickColumnCount))) {
                        /* 추가 사항: 최대 점수를 쿠키에 저장 */
                        if (maxScore < score) {
                            setCookie("max-score", score, 1);
                        }
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = brickColor[round - 1];
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = brickColor[round - 1];
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColor[round - 1];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = brickColor[round - 1];
    ctx.fillText("Score: "+score, 8, 20);
}
function drawMaxScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = brickColor[round - 1];
    ctx.fillText("Max Score: "+maxScore, 100, 20);
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = brickColor[round - 1];
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}
function drawRound() {
    ctx.font = "16px Arial";
    ctx.fillStyle = brickColor[round - 1];
    ctx.fillText("Round " + round, canvas.width-140, 20);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawMaxScore();
    drawLives();
    drawRound();
    collisionDetection();

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
        breakBlock = 0;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
        breakBlock = 0;
    }
    else if(y + dy > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            /*
                추가 사항: 튕기는 소리 효과음
            */
            let audio = new Audio("./bgm/boing.mp3");
            audio.play();
            dy = -dy;
            breakBlock = 0;
        }
        else {
            breakBlock = 0;
            lives--;
            
            if(!lives) {
                /*
                    추가 사항: 게임 오버 소리 효과음
                */
                let audio = new Audio("./bgm/gameover.mp3");
                audio.play();
                alert("GAME OVER");
                /* 추가 사항: 최대 점수를 쿠키에 저장 */
                if (maxScore < score) {
                    setCookie("max-score", score, 1);
                }
                document.location.reload();
            }
            else {
                /*
                    추가 사항: 라이프 주는 소리 효과음
                */
                let audio = new Audio("./bgm/death.mp3");
                audio.play();
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(drawGame);
}

function drawIntro() {
    // drawGame();
    let context = canvas.getContext('2d');
    let img = new Image();
    img.onload = function() {
        context.drawImage(img, 0, 0);
    }
    img.src = "./images/gameintro.png";    
}
drawIntro();