function update(dt) {
    switch (gameState) {
        case "load":
            updateLoadState()
            break
        case "menu":
            updateMenuState()
            break
        case "init":
            updateInitialState()
            break
        case "game":
            updateGameState(dt)
            break
        default:
            break
    }
}

function updateLoadState() {
    if (checkIfLoaded())
        gameState = "menu"
}

function updateMenuState() {
    if (checkButtonClicked(graphics.start.x, graphics.start.y, graphics.start.width, graphics.start.height))
        gameState = "init"
}

function updateInitialState() {
    puzzleArray = populateArray()

    //Reshuffle any pieces that match
    while (scanForMatch()) {
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                if (puzzleArray[i][j].isExploding) {
                    puzzleArray[i][j] = new Fruit()
                }
            }
        }
    }

    setDefaults()
    animation = "ready"
    scorePop = 1000

    graphics.timesup.zoom = -graphics.timesup.resolution
    graphics.ready.zoom = 1500
    graphics.ready.alpha = 1
    graphics.go.offsetX = 0
    graphics.go.pause = 0

    gameState = "game"
}

function updateGameState(dt) {
    if (gameStarted)
        handleTimer(dt)

    readClick()
    lockingAnimation(dt * 0.8)

    if (animation == null)
        handleBrokenTiles(dt * acceleration * 0.85)

    if (scorePop <= 1000)
        scorePop += dt
}


//////////////


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
    if (fallState == 1)
        markTilesForFalling()

    if (fallState == 2)
        dropTiles(fallSpeed)

    if (fallState == 3)
        stopDroppingTiles()
}

function markTilesForFalling() {
    fallState = 0
    isHolding = false

    for (let i = 0; i < gridX; i++) {
        //Generate new fruit
        if (puzzleArray[i][0].fruit == 0)
            puzzleArray[i][0] = new Fruit()

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

function dropTiles(fallSpeed) {
    acceleration += fallSpeed / 400
    for (let i = 0; i < gridX; i++) {
        for (let j = gridY - 1; j >= 0; j--) {
            //Animate until it's at the bottom
            if (puzzleArray[i][j].isFalling) {
                puzzleArray[i][j].offsetY += fallSpeed
                if (puzzleArray[i][j].offsetY >= tileSize) {
                    puzzleArray[i][j].offsetY -= tileSize

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

function stopDroppingTiles() {
    fallState = 1

    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridY; j++) {
            puzzleArray[i][j].isFalling = false
            puzzleArray[i][j].offsetY = 0
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
            tempGrid[i][j] = new Fruit();
        }
    }
    return tempGrid
}

//From Mozilla Docs
function boxCollision(obj1_x, obj1_y, obj1_width, obj1_height, obj2_x, obj2_y, obj2_width, obj2_height) {
    if (obj1_x < obj2_x + obj2_width &&
        obj1_x + obj1_width > obj2_x &&
        obj1_y < obj2_y + obj2_height &&
        obj1_height + obj1_y > obj2_y)
        return true
    else
        return false
}