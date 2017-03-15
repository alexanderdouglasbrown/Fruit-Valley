const JSG = {
    canvas: null,
    context: null,
    resolutionWidth: null,
    resolutionHeight: null,
    frameRate: 0,
    internal: {
        lastFrameTime: 0,
        initialize: null,
        load: null,
        update: null,
        draw: null
    }
}

function start(width, height) {
    JSG_createCanvas(width, height)
    game()
    JSG.internal.initialize()
    JSG.internal.load()
    mainLoop(0)
}

function mainLoop(frameTime) {
    dt = frameTime - JSG.internal.lastFrameTime
    JSG.internal.lastFrameTime = frameTime

    //Don't slow down further than 20fps (1000ms / 20fps = 50)
    if (dt > 50)
        dt = 50

    //Fire mouse release for one frame only
    if (JSG.mouse.internal.releaseFlag) {
        JSG.mouse.internal.releaseFlag = false
        JSG.mouse.release = true
    }

    JSG.internal.update(dt)
    JSG.internal.draw()

    JSG.mouse.release = false

    requestAnimationFrame(mainLoop)
}