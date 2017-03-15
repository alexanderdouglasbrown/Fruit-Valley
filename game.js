function game() {
    const ctx = JSG.context

    const tileSize = 120
    const tileOffset = 360
    const gridX = 9
    const gridY = 9
    const maxTime = 120000 //ms

    const backgroundImage = new Image()
    const backgroundTile = new Image()
    const backgroundTile2 = new Image()
    const fruits = new Image()

    let score = 0
    let multiplier = 1
    let lastScore = 0
    let lastMultiplier = 1
    let time = maxTime
    let scorePop = 0

    let puzzleArray = null
    let tileSelected = null
    let tileSelected2 = null
    let isHolding = false
    let isLocked = false

    let animation = null
    let firstSwap = true

    let fallstate = 0
    let acceleration = 1

    JSG.internal.initialize = function initialize() {
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
        animation = null
        score = 0
        lastScore = 0
        multiplier = 1
        lastMultiplier = 1
        scorePop = 1000
    }

    JSG.internal.load = function load() {
        backgroundImage.src = "graphics/background.png"
        backgroundTile.src = "graphics/tile.png"
        backgroundTile2.src = "graphics/tile2.png"
        fruits.src = "graphics/fruits.png"
    }

    JSG.internal.update = function update(dt) {
        readClick()
        lockingAnimation(dt * 0.8)
        if (animation == null)
            handleBrokenTiles(dt * acceleration)

        if (scorePop <= 1000)
            scorePop += dt

        time -= dt
        if (time <= 0) {
            //Handle end of game
            isLocked = true
            time = 0
        }
    }

    function addScore(explodeCount) {
        lastScore = Math.floor(Math.pow(5, 1 + (explodeCount / 5)))
        lastMultiplier = multiplier
        score += lastScore * lastMultiplier
    }

    function handleBrokenTiles(fallSpeed) {
        //See which tiles should fall
        if (fallstate == 1) {
            fallstate = 0
            isHolding = false

            for (let i = 0; i < gridX; i++) {
                if (puzzleArray[i][0].fruit == 0)
                    puzzleArray[i][0] = getNewFruit()

                for (let j = 0; j < gridY - 1; j++) {
                    if (puzzleArray[i][j].fruit != 0 && puzzleArray[i][j + 1].fruit == 0) {
                        puzzleArray[i][j].isFalling = true
                        fallstate = 2
                        for (let k = j; k >= 0; k--)
                            puzzleArray[i][k].isFalling = true
                    }
                }
            }
            if (fallstate == 2) {
                isLocked = true
            } else {
                acceleration = 1
                if (scanForMatch()) {
                    multiplier += 1
                    scorePop = 0
                } else {
                    multiplier = 1
                    fallstate = 0
                    isLocked = false
                }
            }
        }

        if (fallstate == 2) {
            acceleration += fallSpeed / 400
            for (let i = 0; i < gridX; i++) {
                for (let j = gridY - 1; j >= 0; j--) {
                    //Animate until it its the bottom
                    if (puzzleArray[i][j].isFalling) {
                        puzzleArray[i][j].offsetY += fallSpeed
                        if (puzzleArray[i][j].offsetY >= 120) {
                            puzzleArray[i][j].offsetY = 0

                            //Swap
                            let temp = puzzleArray[i][j]
                            puzzleArray[i][j + 1].isFalling = true

                            puzzleArray[i][j] = puzzleArray[i][j + 1]
                            puzzleArray[i][j + 1] = temp
                            fallstate = 3
                        }
                    }
                }
            }
        }

        if (fallstate == 3) {
            fallstate = 1

            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    puzzleArray[i][j].isFalling = false
                }
            }
        }

    }

    function lockingAnimation(animationSpeed) {
        if (animation != null)
            switch (animation) {
                case "up":
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY -= animationSpeed
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY += animationSpeed
                    if (puzzleArray[tileSelected.x][tileSelected.y].offsetY <= -tileSize) {
                        puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                        puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                        swapTiles()
                        if (firstSwap && !scanForMatch()) {
                            animation = "up"
                            firstSwap = false
                        } else {
                            firstSwap = true
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
                        if (firstSwap && !scanForMatch()) {
                            animation = "down"
                            firstSwap = false
                        } else {
                            firstSwap = true
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
                        if (firstSwap && !scanForMatch()) {
                            animation = "right"
                            firstSwap = false
                        } else {
                            firstSwap = true
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
                        if (firstSwap && !scanForMatch()) {
                            animation = "left"
                            firstSwap = false
                        } else {
                            firstSwap = true
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
                default:
                    break
            }
    }

    function readClick() {
        //Track tile of the initial click
        if (JSG.mouse.click && !isHolding && !isLocked && animation == null) {
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * i), tileSize * j, tileSize, tileSize)) {
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
                if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * tileSelected.x), tileSize * (tileSelected.y - 1), tileSize, tileSize)) {
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
                if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * tileSelected.x), tileSize * (tileSelected.y + 1), tileSize, tileSize)) {
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
                if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * (tileSelected.x + 1)), tileSize * tileSelected.y, tileSize, tileSize)) {
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
                if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * (tileSelected.x - 1)), tileSize * tileSelected.y, tileSize, tileSize)) {
                    tileSelected2 = {
                        x: tileSelected.x - 1,
                        y: tileSelected.y
                    }
                    isLocked = true
                    animation = "left"
                    return
                }
        }

        if (JSG.mouse.release) {
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

            for (let j = 0; j < gridY; j++) {
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
        for (let i = 0; i < gridY; i++) {
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
            fallstate = 1
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

    JSG.internal.draw = function draw() {
        //Clear
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, JSG.resolutionWidth, JSG.resolutionHeight)

        ctx.drawImage(backgroundImage, 0, 0)

        //Puzzle grid
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                if ((i + j) % 2 == 0)
                    ctx.drawImage(backgroundTile, tileOffset + (tileSize * i), tileSize * j)
                else
                    ctx.drawImage(backgroundTile2, tileOffset + (tileSize * i), tileSize * j)


            }
        }

        //Draw fruits
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                ctx.globalAlpha = puzzleArray[i][j].alpha
                ctx.drawImage(fruits, puzzleArray[i][j].fruit * tileSize, 0, tileSize, tileSize,
                    puzzleArray[i][j].offsetX + tileOffset + (tileSize * i) - (puzzleArray[i][j].offsetZoom / 2), puzzleArray[i][j].offsetY + tileSize * j - (puzzleArray[i][j].offsetZoom / 2),
                    tileSize + puzzleArray[i][j].offsetZoom, tileSize + puzzleArray[i][j].offsetZoom)
                ctx.globalAlpha = 1
            }
        }

        //UI
        ctx.font = "50px Verdana"
        ctx.fillText("Score", 50, 680)
        ctx.fillText(score, 50, 750)

        ctx.fillText("Time", 50, 900)
        ctx.fillStyle = "darkred"
        ctx.fillRect(50, 920, 270, 40)
        ctx.fillStyle = "red"
        ctx.fillRect(50, 920, (270 * time / maxTime), 40)

        if (scorePop > 0 && scorePop <= 700) {
            let scoreSize = 40 + scorePop / 10
            if (scoreSize > 55)
                scoreSize = 55

            ctx.fillStyle = "lightblue"
            ctx.font = scoreSize + "px Verdana"
            ctx.fillText(lastScore + " x" + lastMultiplier + "!", 100, 825)
        }
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
}
