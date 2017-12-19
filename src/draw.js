function draw() {
    drawClear()

    switch (gameState) {
        case "load":
            drawLoad()
            break
        case "menu":
            drawMenu()
            break
        case "game":
            drawGame()
            break
        default:
            break
    }
}

function drawClear() {
    //Clear
    JSG.context.fillStyle = "black"
    JSG.context.fillRect(0, 0, JSG.resolutionWidth, JSG.resolutionHeight)
}

function drawLoad() {
    JSG.context.fillStyle = "lightgray";
    JSG.context.font = "34px Arial";
    JSG.context.fillText("Loading... (" + Math.floor(((numGraphics - loadArray.length) / numGraphics) * 100) + "%)", 50, 50);
}

function drawMenu() {
    JSG.context.drawImage(graphics.backgroundImage, 0, 0)
    JSG.context.drawImage(graphics.logo, 320, 50)
    JSG.context.drawImage(graphics.start.image, graphics.start.x, graphics.start.y)
    JSG.context.fillStyle = "lightgray"
    JSG.context.font = "30px Verdana"
    JSG.context.fillText("By Alex Brown", 1200, 1050)
}

function drawGame() {
    JSG.context.drawImage(graphics.backgroundImage, 0, 0)

    drawPuzzleGrid()

    drawFruits()

    drawUI()
}

function drawPuzzleGrid() {
    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridY; j++) {
            if ((i + j) % 2 == 0)
                JSG.context.drawImage(graphics.backgroundTile, tileOffset + (tileSize * i), tileSize * j)
            else
                JSG.context.drawImage(graphics.backgroundTile2, tileOffset + (tileSize * i), tileSize * j)


        }
    }
}

function drawFruits() {
    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridY; j++) {
            JSG.context.globalAlpha = puzzleArray[i][j].alpha
            JSG.context.drawImage(graphics.fruits, puzzleArray[i][j].fruit * tileSize, 0, tileSize, tileSize,
                puzzleArray[i][j].offsetX + tileOffset + (tileSize * i) - (puzzleArray[i][j].offsetZoom / 2), puzzleArray[i][j].offsetY - tileSize + tileSize * j - (puzzleArray[i][j].offsetZoom / 2),
                tileSize + puzzleArray[i][j].offsetZoom, tileSize + puzzleArray[i][j].offsetZoom)
            JSG.context.globalAlpha = 1
        }
    }
}

function drawUI(){
    JSG.context.drawImage(graphics.logoSmall, 50, 20)

    JSG.context.drawImage(graphics.retry.image, graphics.retry.x, graphics.retry.y)

    JSG.context.fillStyle = "white"
    JSG.context.font = "70px Verdana"
    JSG.context.drawImage(graphics.score, 20, 650)
    JSG.context.fillText(score, 20, 800)

    if (scorePop > 0 && scorePop <= 700) {
        let scoreSize = 40 + scorePop / 10
        if (scoreSize > 55)
            scoreSize = 55

        JSG.context.fillStyle = "lightblue"
        JSG.context.font = scoreSize + "px Verdana"
        if (lastMultiplier > 1)
            JSG.context.fillText(lastScore + " x" + lastMultiplier + "!", 100, 870)
        else
            JSG.context.fillText(lastScore, 100, 870)
    }

    JSG.context.drawImage(graphics.time, 20, 900)
    JSG.context.fillStyle = "rosybrown"
    JSG.context.fillRect(20, 980, 320, 60)
    JSG.context.fillStyle = "wheat"
    JSG.context.fillRect(20, 980, (320 * time / maxTime), 60)

    if (animation == "timesup")
        JSG.context.drawImage(graphics.timesup.image, 0, 0, graphics.timesup.resolution, graphics.timesup.resolution,
            graphics.timesup.x - (graphics.timesup.zoom / 2), graphics.timesup.y - (graphics.timesup.zoom / 2),
            graphics.timesup.resolution + graphics.timesup.zoom, graphics.timesup.resolution + graphics.timesup.zoom)

    if (animation == "ready") {
        JSG.context.globalAlpha = graphics.ready.alpha
        JSG.context.drawImage(graphics.ready.image, 0, 0, graphics.ready.resolution, graphics.ready.resolution,
            graphics.ready.x - (graphics.ready.zoom / 2), graphics.ready.y - (graphics.ready.zoom / 2),
            graphics.ready.resolution + graphics.ready.zoom, graphics.ready.resolution + graphics.ready.zoom)
        JSG.context.globalAlpha = 1
    }
    if (animation == "go" && graphics.go.pause >= 200) {
        JSG.context.drawImage(graphics.go.image, graphics.go.x + graphics.go.offsetX, graphics.go.y)
    }
}