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

    let animationQueue = []

    JSG.internal.initialize = function initialize() {
        puzzleArray = populateArray()
        while (scanForMatch()) {
            for (let i = 0; i < gridX; i++) {
                for (let j = 0; j < gridY; j++) {
                    if (puzzleArray[i][j] == 0)
                        puzzleArray[i][j] = getRandomIntInclusive(1, 5)
                }
            }
        }
    }

    JSG.internal.load = function load() {
        backgroundImage.src = "graphics/moonbackground.png"
        backgroundTile.src = "graphics/tile.png"
        backgroundTile2.src = "graphics/tile2.png"
        fruits.src = "graphics/fruits.png"
    }

    JSG.internal.update = function update(dt) {
        readClick()
        playAnimations(dt)
    }

    function playAnimations(dt) {
        if (animationQueue.length > 0) {
            isLocked = true
            for (let i = 0; i < animationQueue.length; i++) {
                switch (animationQueue[i].type) {
                    case "up":
                        animationQueue[i].offsetY -= dt
                        if (animationQueue[i].offsetY <= -tileSize) {
                            animationQueue.splice(i, 1)
                            i--
                        }
                        break
                    default:
                        animationQueue.splice(i, 1)
                        i--
                        break
                }
            }
        } else
            isLocked = false
    }

    function readClick() {
        //Track tile of the initial click
        if (JSG.mouse.click && !isHolding && !isLocked) {
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
                    swapTiles("up")
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
                    swapTiles("down")
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
                    swapTiles("right")
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
                    swapTiles("left")
                    return
                }
        }

        if (JSG.mouse.release) {
            isHolding = false
        }
    }

    function swapTiles(direction) {
        let tempFruit = puzzleArray[tileSelected.x][tileSelected.y]
        puzzleArray[tileSelected.x][tileSelected.y] = puzzleArray[tileSelected2.x][tileSelected2.y]
        puzzleArray[tileSelected2.x][tileSelected2.y] = tempFruit
        if (!scanForMatch()) {
            tempFruit = puzzleArray[tileSelected.x][tileSelected.y]
            puzzleArray[tileSelected.x][tileSelected.y] = puzzleArray[tileSelected2.x][tileSelected2.y]
            puzzleArray[tileSelected2.x][tileSelected2.y] = tempFruit
            //Send animations
            let animationObject = {
                type: direction + "andmiss",
                fruit: 1,
                x: tileSelected.x,
                y: tileSelected.y,
                offsetX: 0,
                offsetY: 0
            }
            animationQueue.push(animationObject)
            // animationObject = {
            //     type: direction + "andmiss",
            //     fruit: 1,
            //     offsetX: 0,
            //     offsetY: 0
            // }
            // animationQueue.push(animationObject)
        } else {
            let animationObject = {
                type: direction,
                fruit: 1,
                x: tileSelected.x,
                y: tileSelected.y,
                offsetX: 0,
                offsetY: 0
            }
            animationQueue.push(animationObject)
            // animationObject = {
            //     type: direction,
            //     fruit: 1,
            //     offsetX: 0,
            //     offsetY: 0
            // }
            // animationQueue.push(animationObject)
        }
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
                    fruit: puzzleArray[i][j]
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
                    fruit: puzzleArray[j][i]
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
            for (let i = 0; i < markedForDeath.length; i++)
                puzzleArray[markedForDeath[i].x][markedForDeath[i].y] = 0
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
                //Background tile

                if ((i + j) % 2 == 0)
                    ctx.drawImage(backgroundTile, tileOffset + (tileSize * i), tileSize * j)
                else
                    ctx.drawImage(backgroundTile2, tileOffset + (tileSize * i), tileSize * j)
                //Fruits

                ctx.drawImage(fruits, puzzleArray[i][j] * tileSize, 0, tileSize, tileSize, tileOffset + (tileSize * i), tileSize * j, tileSize, tileSize)

                //Draw from the animation queue
                for (let k = 0; k < animationQueue.length; k++) {
                    ctx.drawImage(fruits, animationQueue[k].fruit * tileSize, 0, tileSize, tileSize, animationQueue[k].offsetX + tileOffset + (tileSize * animationQueue[k].x), animationQueue[k].offsetY + tileSize * animationQueue[k].y, tileSize, tileSize)
                }
            }
        }
    }



    function populateArray() {

        let tempGrid = new Array(gridX)

        for (let i = 0; i < gridX; i++) {
            tempGrid[i] = new Array(gridY)
            for (let j = 0; j < gridY; j++) {
                tempGrid[i][j] = getRandomIntInclusive(1, 5)
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
