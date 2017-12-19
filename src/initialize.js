function initialize() {
    setDefaults()
    
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