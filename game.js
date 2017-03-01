function game() {
    const ctx = JSG.context

    const tileSize = 120
    const tileOffset = 420

    const backgroundImage = new Image()
    const backgroundTile = new Image()
    const backgroundTile2 = new Image()
    const fruits = new Image()

    let puzzleArray = null
    let tileSelected = null
    let tileSelected2 = null
    let selectionCount = 1

    JSG.internal.initialize = function initialize() {
        puzzleArray = populateArray()
    }

    JSG.internal.load = function load() {
        backgroundImage.src = "graphics/moonbackground.png"
        backgroundTile.src = "graphics/tile.png"
        backgroundTile2.src = "graphics/tile2.png"
        fruits.src = "graphics/fruits.png"
    }

    JSG.internal.update = function update(dt) {
        readClick()
        swapTiles()

    }

    function readClick() {
        if (JSG.mouse.release) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (boxCollision(JSG.mouse.x, JSG.mouse.y, 0, 0, tileOffset + (tileSize * i), tileSize * j, tileSize, tileSize)) {
                        if (selectionCount === 1) {
                            tileSelected = {
                                x: i,
                                y: j
                            }
                            selectionCount = 2
                            return
                        } else {
                            tileSelected2 = {
                                x: i,
                                y: j
                            }
                            selectionCount = 1
                            return
                        }
                    }
                }
            }
        }
    }

    function swapTiles() {
        if (tileSelected != null && tileSelected2 != null) {
            let tempFruit = puzzleArray[tileSelected.x][tileSelected.y]
            puzzleArray[tileSelected.x][tileSelected.y] = puzzleArray[tileSelected2.x][tileSelected2.y]
            puzzleArray[tileSelected2.x][tileSelected2.y] = tempFruit

            tileSelected = null
            tileSelected2 = null
        }
    }

    JSG.internal.draw = function draw() {
        //Clear
        JSG.context.fillStyle = "white"
        JSG.context.fillRect(0, 0, JSG.resolutionWidth, JSG.resolutionHeight)

        ctx.drawImage(backgroundImage, 0, 0)

        //Puzzle grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                //Background tile

                if ((i + j) % 2 == 0)
                    ctx.drawImage(backgroundTile, tileOffset + (tileSize * i), tileSize * j)
                else
                    ctx.drawImage(backgroundTile2, tileOffset + (tileSize * i), tileSize * j)
                //Fruits

                ctx.drawImage(fruits, puzzleArray[i][j] * tileSize, 0, tileSize, tileSize, tileOffset + (tileSize * i), tileSize * j, tileSize, tileSize)

            }
        }
    }



    function populateArray() {

        let tempGrid = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]

        for (let i = 0; i < tempGrid.length; i++)
            for (let j = 0; j < tempGrid[i].length; j++)
                tempGrid[j][i] = getRandomIntInclusive(1, 5)


        return tempGrid
    }


    //From Mozilla Docs
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max);
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
