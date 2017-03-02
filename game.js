function game() {
    const ctx = JSG.context

    const tileSize = 120
    const tileOffset = 480
    const gridX = 9
    const gridY = 9

    const backgroundImage = new Image()
    const backgroundTile = new Image()
    const backgroundTile2 = new Image()
    const fruits = new Image()

    let puzzleArray = null
    let tileSelected = null
    let tileSelected2 = null
    let isHolding = false
    let isLocked = false

    let animation = null
    let firstSwap = true

    let brokenTiles = false
    let fallingTiles = []

    JSG.internal.initialize = function initialize() {
        puzzleArray = populateArray()

        //Reshuffle any pieces that match
        while (scanForMatch()) {
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    if (puzzleArray[i][j].fruit == 0) {
                        let tempObject = {
                            fruit: getRandomIntInclusive(1, 5),
                            offsetX: 0,
                            offsetY: 0
                        }
                        puzzleArray[i][j] = tempObject
                    }
                }
            }
        }

        brokenTiles = false
    }

    JSG.internal.load = function load() {
        backgroundImage.src = "graphics/moonbackground.png"
        backgroundTile.src = "graphics/tile.png"
        backgroundTile2.src = "graphics/tile2.png"
        fruits.src = "graphics/fruits.png"
    }

    JSG.internal.update = function update(dt) {

        readClick()
        swapAnimation(dt * 0.8)
        handleBrokenTiles(dt * 1.4)
    }

    function handleBrokenTiles(dt) {
        //TODO: Properly lock during this sequence


        //Generate a list of tiles that should fall.
        if (brokenTiles && fallingTiles.length == 0) {
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY - 1; j++) {
                    if (puzzleArray[i][j].fruit != 0 && puzzleArray[i][j + 1].fruit == 0) {
                        let coords = {
                            x: i,
                            y: j
                        }
                        fallingTiles.push(coords)
                    }
                }
            }
        }

        if (fallingTiles.length > 0) {
            for (let i = 0; i < fallingTiles.length; i++) {
                puzzleArray[fallingTiles[i].x][fallingTiles[i].y].offsetY += dt
                if (puzzleArray[fallingTiles[i].x][fallingTiles[i].y].offsetY >= 120) {
                    puzzleArray[fallingTiles[i].x][fallingTiles[i].y].offsetY = 0

                    //Swap
                    let temp = puzzleArray[fallingTiles[i].x][fallingTiles[i].y + 1].fruit
                    puzzleArray[fallingTiles[i].x][fallingTiles[i].y + 1].fruit = puzzleArray[fallingTiles[i].x][fallingTiles[i].y].fruit
                    puzzleArray[fallingTiles[i].x][fallingTiles[i].y].fruit = temp

                    fallingTiles[i].y++
                    if (fallingTiles[i].y < gridY - 1) {
                        if (puzzleArray[fallingTiles[i].x][fallingTiles[i].y + 1].fruit != 0) {
                            fallingTiles.splice(i, 1)
                            i--
                            scanForMatch()
                        }
                    }
                }
            }
        }
    }

    function swapAnimation(dt) {
        if (animation != null) {
            switch (animation) {
                case "up":
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY -= dt
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY += dt
                    if (puzzleArray[tileSelected.x][tileSelected.y].offsetY <= -tileSize) {
                        puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                        puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                        swapTiles()
                        if (!scanForMatch() && firstSwap) {
                            animation = "up"
                            firstSwap = false
                        } else {
                            firstSwap = true
                            animation = null
                        }
                    }
                    break
                case "down":
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY += dt
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY -= dt
                    if (puzzleArray[tileSelected.x][tileSelected.y].offsetY >= tileSize) {
                        puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                        puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                        swapTiles()
                        if (!scanForMatch() && firstSwap) {
                            animation = "down"
                            firstSwap = false
                        } else {
                            firstSwap = true
                            animation = null
                        }
                    }
                    break
                case "right":
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX += dt
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX -= dt
                    if (puzzleArray[tileSelected.x][tileSelected.y].offsetX >= tileSize) {
                        puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                        puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                        swapTiles()
                        if (!scanForMatch() && firstSwap) {
                            animation = "right"
                            firstSwap = false
                        } else {
                            firstSwap = true
                            animation = null
                        }
                    }
                    break
                case "left":
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX -= dt
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX += dt
                    if (puzzleArray[tileSelected.x][tileSelected.y].offsetX <= -tileSize) {
                        puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                        puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                        swapTiles()
                        if (!scanForMatch() && firstSwap) {
                            animation = "left"
                            firstSwap = false
                        } else {
                            firstSwap = true
                            animation = null
                        }
                    }
                    break
                default:
                    break
            }
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
            brokenTiles = true
            for (let i = 0; i < markedForDeath.length; i++)
                puzzleArray[markedForDeath[i].x][markedForDeath[i].y].fruit = 0
        }

        return isMatchFound
    }

    JSG.internal.draw = function draw() {
        //Clear
        JSG.context.fillStyle = "white"
        JSG.context.fillRect(0, 0, JSG.resolutionWidth, JSG.resolutionHeight)

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

        //Draw fruits (two passes is necessary)
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                ctx.drawImage(fruits, puzzleArray[i][j].fruit * tileSize, 0, tileSize, tileSize, puzzleArray[i][j].offsetX + tileOffset + (tileSize * i), puzzleArray[i][j].offsetY + tileSize * j, tileSize, tileSize)

            }
        }
    }



    function populateArray() {

        let tempGrid = new Array(gridX)

        for (let i = 0; i < gridX; i++) {
            tempGrid[i] = new Array(gridY)
            for (let j = 0; j < gridY; j++) {
                let tempObject = {
                    fruit: getRandomIntInclusive(1, 5),
                    offsetX: 0,
                    offsetY: 0
                }
                tempGrid[i][j] = tempObject
            }
        }
        return tempGrid
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
