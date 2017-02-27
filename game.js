function game() {
    const ctx = JSG.context

    const backgroundImage = new Image()
    const backgroundTile = new Image()
    const backgroundTile2 = new Image()
    const fruitGrape = new Image()
    const fruitApple = new Image()
    const fruitOrange = new Image()

    let puzzleArray = null

    JSG.internal.initialize = function initialize() {
        puzzleArray = populateArray()
    }

    JSG.internal.load = function load() {
        backgroundImage.src = "graphics/forestbackground.png"
        backgroundTile.src = "graphics/tile.png"
        backgroundTile2.src = "graphics/tile2.png"
        fruitGrape.src = "graphics/grape.png"
        fruitApple.src = "graphics/apple.png"
        fruitOrange.src = "graphics/orange.png"
    }

    JSG.internal.update = function update(dt) {

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
                    ctx.drawImage(backgroundTile, 360 + (120 * i), 120 * j)
                else
                    ctx.drawImage(backgroundTile2, 360 + (120 * i), 120 * j)
                //Fruits
                switch (puzzleArray[j][i]) {
                    case 1:
                        ctx.drawImage(fruitGrape, 360 + (120 * i), 120 * j)
                        break
                    case 2:
                        ctx.drawImage(fruitApple, 360 + (120 * i), 120 * j)
                        break
                    case 3:
                        ctx.drawImage(fruitOrange, 360 + (120 * i), 120 * j)
                        break
                }
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
                tempGrid[j][i] = getRandomIntInclusive(1, 3)


        return tempGrid
    }

    //From Mozilla Docs
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}
