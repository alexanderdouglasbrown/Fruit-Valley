const JSG = {
    canvas: null,
    context: null,
    resolutionWidth: null,
    resolutionHeight: null,
    start: function (width, height) {
        JSG_createCanvas(width, height)
        game()
        JSG.internal.initialize()
        JSG.internal.mainLoop(0)
    },
    internal: {
        dt: 0,
        frameRate: 1000 / 60,
        lastFrameTime: 0,
        initialize: null,
        update: null,
        draw: null,

        mainLoop: function (frameTime) {
            JSG.internal.dt = frameTime - JSG.internal.lastFrameTime
            JSG.internal.lastFrameTime = frameTime

            if (JSG.internal.dt > 50)
                JSG.internal.dt = 50

            //Fire mouse release for one frame only
            if (JSG.mouse.internal.releaseFlag) {
                JSG.mouse.internal.releaseFlag = false
                JSG.mouse.release = true
            }

            JSG.internal.update(JSG.internal.dt)

            JSG.internal.draw()

            JSG.mouse.release = false

            requestAnimationFrame(JSG.internal.mainLoop)
        }
    }
}
