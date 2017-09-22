const tileSize = 120
const tileOffset = 360
const gridX = 9
const gridY = gridX + 1
const maxTime = 120000 //ms
let numGraphics

const graphics = {
    backgroundImage: new Image(),
    backgroundTile: new Image(),
    backgroundTile2: new Image(),
    score: new Image(),
    time: new Image(),
    fruits: new Image(),
    logo: new Image(),
    logoSmall: new Image(),

    ready: {
        image: new Image(),
        x: 482,
        y: 122,
        resolution: 836,
        zoom: 0,
        alpha: 1
    },

    go: {
        image: new Image(),
        x: 596,
        y: 442,
        pause: 0,
        offsetX: 0
    },

    timesup: {
        image: new Image(),
        x: 360,
        y: 0,
        resolution: 1080,
        zoom: 0,
    },

    retry: {
        image: new Image(),
        x: 20,
        y: 300,
        width: 314,
        height: 105
    },

    start: {
        image: new Image(),
        x: 403,
        y: 800,
        width: 634,
        height: 204
    }
}

const initialClickPos = {
    x: null,
    y: null
}

let gameState = "load"
let loadArray = []

let score = 0
let multiplier = 1
let lastScore = 0
let lastMultiplier = 1
let scorePop = 0

let time = maxTime
let gameStarted = false

let puzzleArray = null
let tileSelected = null
let tileSelected2 = null
let isHolding = false
let isLocked = false

let animation = null
let isFirstSwap = true

let fallState = 0
let acceleration = 1

function initialize() {
    graphics.backgroundImage.src = "graphics/background.png"
    loadArray.push(graphics.backgroundImage)

    graphics.backgroundTile.src = "graphics/tile.png"
    loadArray.push(graphics.backgroundTile)

    graphics.backgroundTile2.src = "graphics/tile2.png"
    loadArray.push(graphics.backgroundTile2)

    graphics.fruits.src = "graphics/fruits.png"
    loadArray.push(graphics.fruits)

    graphics.score.src = "graphics/score.png"
    loadArray.push(graphics.score)

    graphics.time.src = "graphics/time.png"
    loadArray.push(graphics.time)

    graphics.logo.src = "graphics/logo.png"
    loadArray.push(graphics.logo)

    graphics.logoSmall.src = "graphics/logosmall.png"
    loadArray.push(graphics.logoSmall)

    graphics.retry.image.src = "graphics/retry.png"
    loadArray.push(graphics.retry.image)

    graphics.timesup.image.src = "graphics/timesup.png"
    loadArray.push(graphics.timesup.image)

    graphics.start.image.src = "graphics/start.png"
    loadArray.push(graphics.start.image)

    graphics.ready.image.src = "graphics/ready.png"
    loadArray.push(graphics.ready.image)

    graphics.go.image.src = "graphics/go.png"
    loadArray.push(graphics.go.image)

    numGraphics = loadArray.length
}

function update(dt) {
    switch (gameState) {
        case "load":
            if (checkIfLoaded())
                gameState = "menu"
            break
        case "menu":
            if (checkButtonClicked(graphics.start.x, graphics.start.y, graphics.start.width, graphics.start.height))
                gameState = "init"
            break
        case "init":
            puzzleArray = populateArray()

            //Reshuffle any pieces that match
            while (scanForMatch()) {
                for (let i = 0; i < gridX; i++) {
                    for (let j = 0; j < gridY; j++) {
                        if (puzzleArray[i][j].isExploding) {
                            puzzleArray[i][j] = getNewFruit()
                        }
                    }
                }
            }

            animation = "ready"
            time = maxTime
            score = 0
            lastScore = 0
            multiplier = 1
            lastMultiplier = 1
            scorePop = 1000
            isFirstSwap = true
            fallState = 0
            acceleration = 1
            tileSelected = null
            tileSelected2 = null
            isHolding = false
            isLocked = false
            gameStarted = false

            graphics.timesup.zoom = -graphics.timesup.resolution
            graphics.ready.zoom = 1500
            graphics.ready.alpha = 1
            graphics.go.offsetX = 0
            graphics.go.pause = 0

            gameState = "game"
            break
        case "game":
            if (gameStarted)
                handleTimer(dt)

            readClick()
            lockingAnimation(dt * 0.8)

            if (animation == null)
                handleBrokenTiles(dt * acceleration)

            if (scorePop <= 1000)
                scorePop += dt
            break
        default:
            break
    }
}

function draw(rm) {
    //Clear
    JSG.context.fillStyle = "black"
    JSG.context.fillRect(0, 0, JSG.resolutionWidth, JSG.resolutionHeight)

    switch (gameState) {
        case "load":
            JSG.context.fillStyle = "lightgray";
            JSG.context.font = "34px Arial";
            JSG.context.fillText("Loading... (" + Math.floor(((numGraphics - loadArray.length) / numGraphics) * 100) + "%)", 50, 50);
            break

        case "menu":
            JSG.context.drawImage(graphics.backgroundImage, 0, 0)
            JSG.context.drawImage(graphics.logo, 320, 50)
            JSG.context.drawImage(graphics.start.image, graphics.start.x, graphics.start.y)
            JSG.context.fillStyle = "lightgray"
            JSG.context.font = "30px Verdana"
            JSG.context.fillText("By Alex Brown", 1200, 1050)
            break
        case "game":
            JSG.context.drawImage(graphics.backgroundImage, 0, 0)
            //Puzzle grid
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    if ((i + j) % 2 == 0)
                        JSG.context.drawImage(graphics.backgroundTile, tileOffset + (tileSize * i), tileSize * j)
                    else
                        JSG.context.drawImage(graphics.backgroundTile2, tileOffset + (tileSize * i), tileSize * j)


                }
            }

            //Draw fruits
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    JSG.context.globalAlpha = puzzleArray[i][j].alpha
                    JSG.context.drawImage(graphics.fruits, puzzleArray[i][j].fruit * tileSize, 0, tileSize, tileSize,
                        puzzleArray[i][j].offsetX + tileOffset + (tileSize * i) - (puzzleArray[i][j].offsetZoom / 2), puzzleArray[i][j].offsetY - tileSize + tileSize * j - (puzzleArray[i][j].offsetZoom / 2),
                        tileSize + puzzleArray[i][j].offsetZoom, tileSize + puzzleArray[i][j].offsetZoom)
                    JSG.context.globalAlpha = 1
                }
            }

            //UI
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

        default:
            break
    }
}

function checkIfLoaded() {
    for (let i = 0; i < loadArray.length; i++) {
        if (loadArray[i].complete == true) {
            loadArray.splice(i, 1)
            i--
        }
    }

    return loadArray.length > 0 ? false : true
}

function handleTimer(dt) {
    time -= dt
    if (time <= 0) {
        isLocked = true
        time = 0
        if (fallState == 0 && animation == null) {
            animation = "timesup"
        }
    }
}

function addScore(explodeCount) {
    lastScore = Math.floor(Math.pow(5, 1 + (explodeCount / 5)))
    lastMultiplier = multiplier
    score += lastScore * lastMultiplier
}

function handleBrokenTiles(fallSpeed) {
    //See which tiles should fall
    if (fallState == 1) {
        fallState = 0
        isHolding = false

        for (let i = 0; i < gridX; i++) {
            //Generate new fruit
            if (puzzleArray[i][0].fruit == 0)
                puzzleArray[i][0] = getNewFruit()

            //If there's no fruit below the current fruit, put it into a fall state
            for (let j = 0; j < gridY - 1; j++) {
                if (puzzleArray[i][j].fruit != 0 && puzzleArray[i][j + 1].fruit == 0) {
                    puzzleArray[i][j].isFalling = true
                    fallState = 2
                    for (let k = j; k >= 0; k--)
                        puzzleArray[i][k].isFalling = true
                }
            }
        }

        //If a fruit is put into a fall state, prevent player input while it animates
        //If not, check for a match
        if (fallState == 2) {
            isLocked = true
        } else {
            acceleration = 1
            if (scanForMatch()) {
                multiplier += 1
                scorePop = 0
            } else {
                multiplier = 1
                fallState = 0
                isLocked = false
            }
        }
    }

    //Animate the fruit falling
    if (fallState == 2) {
        acceleration += fallSpeed / 400
        for (let i = 0; i < gridX; i++) {
            for (let j = gridY - 1; j >= 0; j--) {
                //Animate until it's at the bottom
                if (puzzleArray[i][j].isFalling) {
                    puzzleArray[i][j].offsetY += fallSpeed
                    if (puzzleArray[i][j].offsetY >= tileSize) {
                        puzzleArray[i][j].offsetY = 0

                        //Swap
                        let temp = puzzleArray[i][j]
                        puzzleArray[i][j + 1].isFalling = true

                        puzzleArray[i][j] = puzzleArray[i][j + 1]
                        puzzleArray[i][j + 1] = temp
                        fallState = 3
                    }
                }
            }
        }
    }

    //Release animation when fruit hits bottom
    if (fallState == 3) {
        fallState = 1

        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                puzzleArray[i][j].isFalling = false
            }
        }
    }
}

function lockingAnimation(animationSpeed) {
    if (animation != null) {
        switch (animation) {
            case "up":
                puzzleArray[tileSelected.x][tileSelected.y].offsetY -= animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetY += animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetY <= -tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "up"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "down":
                puzzleArray[tileSelected.x][tileSelected.y].offsetY += animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetY -= animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetY >= tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "down"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "right":
                puzzleArray[tileSelected.x][tileSelected.y].offsetX += animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetX -= animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetX >= tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "right"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "left":
                puzzleArray[tileSelected.x][tileSelected.y].offsetX -= animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetX += animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetX <= -tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "left"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break

            case "explode":
                for (let i = 0; i < gridX; i++) {
                    for (let j = 0; j < gridY; j++) {
                        if (puzzleArray[i][j].isExploding) {
                            puzzleArray[i][j].offsetZoom += animationSpeed / 1.2
                            puzzleArray[i][j].alpha -= animationSpeed / 170
                            if (puzzleArray[i][j].alpha < 0) {
                                puzzleArray[i][j].alpha = 1
                                puzzleArray[i][j].offsetZoom = 0
                                puzzleArray[i][j].isExploding = false
                                puzzleArray[i][j].fruit = 0
                                animation = null
                            }
                        }
                    }
                }
                break
            case "timesup":
                if (graphics.timesup.zoom < 0)
                    graphics.timesup.zoom += animationSpeed * 4.5
                else
                    graphics.timesup.zoom = 0
                break
            case "ready":
                if (graphics.ready.zoom > 0) {
                    graphics.ready.zoom -= animationSpeed * 4.5
                } else {
                    graphics.ready.zoom = 0
                    graphics.ready.alpha -= animationSpeed * 0.002
                }
                if (graphics.ready.alpha < 0) {
                    graphics.ready.alpha = 0
                    animation = "go"
                }
                break
            case "go":
                if (graphics.go.pause < 500)
                    graphics.go.pause += animationSpeed
                else
                    graphics.go.offsetX += animationSpeed * 3

                if ((graphics.go.x + graphics.go.offsetX) >= 1440) {
                    animation = null
                    gameStarted = true
                }
                break
            default:
                break
        }
    }
}

function checkButtonClicked(x, y, width, height) {
    //x or y == null. Doesn't matter
    if (initialClickPos.x == null && JSG.mouse.click) {
        initialClickPos.x = JSG.mouse.x
        initialClickPos.y = JSG.mouse.y
    }

    if (JSG.mouse.release) {
        if (boxCollision(initialClickPos.x, initialClickPos.y, 0, 0, x, y, width, height) &&
            boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, x, y, width, height)) {
            initialClickPos.x = null
            initialClickPos.y = null
            return true
        }
        initialClickPos.x = null
        initialClickPos.y = null
        return false
    }
}

function readClick() {
    if (checkButtonClicked(graphics.retry.x, graphics.retry.y, graphics.retry.width, graphics.retry.height)) { //Retry button
        gameState = "init"
        return
    }

    //Track tile of the initial click
    if (JSG.mouse.click && !isHolding && !isLocked && fallState == 0 && animation == null) {
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * i), -tileSize + (tileSize * j), tileSize, tileSize)) {
                    tileSelected = {
                        x: i,
                        y: j
                    }
                    isHolding = true
                    return
                }
            }
        }
    }

    //Check adjecent tiles
    if (isHolding && !isLocked) {
        //Up
        if (tileSelected.y != 0)
            if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * tileSelected.x), -tileSize + tileSize * (tileSelected.y - 1), tileSize, tileSize)) {
                tileSelected2 = {
                    x: tileSelected.x,
                    y: tileSelected.y - 1
                }
                isLocked = true
                animation = "up"
                return
            }
        //Down
        if (tileSelected.y != (gridY - 1))
            if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * tileSelected.x), -tileSize + tileSize * (tileSelected.y + 1), tileSize, tileSize)) {
                tileSelected2 = {
                    x: tileSelected.x,
                    y: tileSelected.y + 1
                }
                isLocked = true
                animation = "down"
                return
            }
        //Right
        if (tileSelected.x != (gridX - 1))
            if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * (tileSelected.x + 1)), -tileSize + tileSize * tileSelected.y, tileSize, tileSize)) {
                tileSelected2 = {
                    x: tileSelected.x + 1,
                    y: tileSelected.y
                }
                isLocked = true
                animation = "right"
                return
            }
        //Left
        if (tileSelected.x != 0)
            if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * (tileSelected.x - 1)), -tileSize + tileSize * tileSelected.y, tileSize, tileSize)) {
                tileSelected2 = {
                    x: tileSelected.x - 1,
                    y: tileSelected.y
                }
                isLocked = true
                animation = "left"
                return
            }
    }

    if (JSG.mouse.release && time > 0) {
        isHolding = false
        isLocked = false
    }
}

function swapTiles() {
    let tempFruit = puzzleArray[tileSelected.x][tileSelected.y].fruit
    puzzleArray[tileSelected.x][tileSelected.y].fruit = puzzleArray[tileSelected2.x][tileSelected2.y].fruit
    puzzleArray[tileSelected2.x][tileSelected2.y].fruit = tempFruit
}

function scanForMatch() {
    let isMatchFound = false
    let markedForDeath = []
    let explodeCount = 0

    //Scan up and down
    for (let i = 0; i < gridX; i++) {
        let repeatedFruits = []

        for (let j = 1; j < gridY; j++) {
            let lastFruit = {
                x: i,
                y: j,
                fruit: puzzleArray[i][j].fruit
            }

            if (repeatedFruits.length > 0)
                if (lastFruit.fruit != repeatedFruits[repeatedFruits.length - 1].fruit) {
                    repeatedFruits = []
                }

            repeatedFruits.push(lastFruit)

            if (repeatedFruits.length >= 3) {
                if (repeatedFruits[0].fruit != 0) { // 0 means no fruit. Don't count it
                    for (let k = 0; k < repeatedFruits.length; k++) {
                        markedForDeath.push(repeatedFruits[k])
                    }
                }
            }

        }
        repeatedFruits = []
    }

    //Then read the other way
    for (let i = 1; i < gridY; i++) {
        let repeatedFruits = []

        for (let j = 0; j < gridX; j++) {
            let lastFruit = {
                y: i,
                x: j,
                fruit: puzzleArray[j][i].fruit
            }

            if (repeatedFruits.length > 0)
                if (lastFruit.fruit != repeatedFruits[repeatedFruits.length - 1].fruit) {
                    repeatedFruits = []
                }

            repeatedFruits.push(lastFruit)

            if (repeatedFruits.length >= 3) {
                if (repeatedFruits[0].fruit != 0) { // 0 means no fruit. Don't count it
                    for (let k = 0; k < repeatedFruits.length; k++) {
                        markedForDeath.push(repeatedFruits[k])
                    }
                }
            }

        }
        repeatedFruits = []
    }

    if (markedForDeath.length > 0) {
        isMatchFound = true
        fallState = 1
        animation = "explode"

        for (let i = 0; i < markedForDeath.length; i++) {
            if (puzzleArray[markedForDeath[i].x][markedForDeath[i].y].isExploding == false) { //Avoid duplicates
                puzzleArray[markedForDeath[i].x][markedForDeath[i].y].isExploding = true
                explodeCount += 1
            }
        }

    }

    if (explodeCount >= 1)
        addScore(explodeCount)

    return isMatchFound
}

function populateArray() {
    let tempGrid = new Array(gridX)

    for (let i = 0; i < gridX; i++) {
        tempGrid[i] = new Array(gridY)
        for (let j = 0; j < gridY; j++) {
            tempGrid[i][j] = getNewFruit()
        }
    }
    return tempGrid
}

function getNewFruit() {
    let newFruit = {
        fruit: getRandomIntInclusive(1, 5),
        offsetX: 0,
        offsetY: 0,
        offsetZoom: 0,
        alpha: 1,
        isExploding: false,
        isFalling: false
    }
    return newFruit
}

//From Mozilla Docs
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

//Ditto
function boxCollision(obj1_x, obj1_y, obj1_width, obj1_height, obj2_x, obj2_y, obj2_width, obj2_height) {
    if (obj1_x < obj2_x + obj2_width &&
        obj1_x + obj1_width > obj2_x &&
        obj1_y < obj2_y + obj2_height &&
        obj1_height + obj1_y > obj2_y)
        return true
    else
        return false
}