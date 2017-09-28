const JSG = {
    canvas: null,
    context: null,
    resolutionWidth: null,
    resolutionHeight: null,

    display: {
        widthScale: 1,
        heightScale: 1,
    },

    keyboard: {
        keyList: []
    },

    mouse: {
        x: 0,
        y: 0,
        click: false,
        release: false,
        internal: { releaseFlag: false }
    },

    start: function (width, height, fps) {
        JSG.internal.targetFrameTime = 1000 / fps

        JSG.internal.createCanvas(width, height)

        initialize()

        if (fps != 0)
            JSG.internal.mainLoop(0)
        else
            JSG.internal.mainLoopUnlocked(0)
    },

    internal: {
        dt: 0,
        targetFrameTime: 0,
        lastTimeStamp: 0,

        mainLoop: function (timeStamp) {
            requestAnimationFrame(JSG.internal.mainLoop)

            JSG.internal.dt += timeStamp - JSG.internal.lastTimeStamp
            JSG.internal.lastTimeStamp = timeStamp

            if (JSG.internal.dt > 1000) // Prevent dt runaway
                JSG.internal.dt = 1000

            while (JSG.internal.dt >= JSG.internal.targetFrameTime) {
                //Fire mouse release for one frame only
                if (JSG.mouse.internal.releaseFlag) {
                    JSG.mouse.internal.releaseFlag = false
                    JSG.mouse.release = true
                }

                //Call update at a consistent rate
                update(JSG.internal.targetFrameTime)
                
                JSG.internal.dt -= JSG.internal.targetFrameTime
                JSG.mouse.release = false
            }
            draw()
        },

        mainLoopUnlocked: function (timeStamp) {
            JSG.internal.dt = timeStamp - JSG.internal.lastTimeStamp
            JSG.internal.lastTimeStamp = timeStamp

            requestAnimationFrame(JSG.internal.mainLoopUnlocked)

            //Fire mouse release for one frame only
            if (JSG.mouse.internal.releaseFlag) {
                JSG.mouse.internal.releaseFlag = false
                JSG.mouse.release = true
            }

            update(JSG.internal.dt)

            JSG.mouse.release = false

            draw()
        },

        createCanvas: function (width, height) {
            JSG.resolutionWidth = width
            JSG.resolutionHeight = height

            JSG.canvas = document.createElement("canvas")
            document.body.insertBefore(JSG.canvas, document.body.childNodes[0])
            JSG.context = JSG.canvas.getContext("2d")
            JSG.internal.resizeCanvas()
        },

        resizeCanvas: function () {
            if (window.innerHeight * (JSG.resolutionWidth / JSG.resolutionHeight) >= window.innerWidth) {
                JSG.canvas.width = window.innerWidth
                JSG.canvas.height = window.innerWidth * (JSG.resolutionHeight / JSG.resolutionWidth)

                JSG.display.widthScale = window.innerWidth / JSG.resolutionWidth
                JSG.display.heightScale = window.innerWidth / JSG.resolutionWidth
            } else {
                JSG.canvas.width = window.innerHeight * (JSG.resolutionWidth / JSG.resolutionHeight)
                JSG.canvas.height = window.innerHeight

                JSG.display.widthScale = window.innerHeight / JSG.resolutionHeight
                JSG.display.heightScale = window.innerHeight / JSG.resolutionHeight
            }
            JSG.context.scale(JSG.display.widthScale, JSG.display.heightScale)

            //Ignore inputs when resizing
            JSG.keyboard.keyList = []
        },

        getCursorPosition: function (e) {
            e = e || window.event

            JSG.mouse.x = e.pageX - JSG.canvas.offsetLeft
            JSG.mouse.y = e.pageY - JSG.canvas.offsetTop

            if (JSG.mouse.x < 0)
                JSG.mouse.x = 0
            if (JSG.mouse.x > (JSG.canvas.width))
                JSG.mouse.x = (JSG.canvas.width)

            if (JSG.mouse.y < 0)
                JSG.mouse.y = 0
            if (JSG.mouse.y > (JSG.canvas.height))
                JSG.mouse.y = (JSG.canvas.height)

            JSG.mouse.x /= JSG.display.widthScale
            JSG.mouse.y /= JSG.display.heightScale
        }
    }
}

window.addEventListener("resize", function () { JSG.internal.resizeCanvas() })
window.addEventListener("orientationchange", function () { JSG.internal.resizeCanvas() })

window.addEventListener('keydown', (e) => {
    const keyCode = e.which || e.keyCode
    if (!JSG.keyboard.keyList.includes(keyCode)) {
        JSG.keyboard.keyList.push(keyCode)
    }
})

window.addEventListener('keyup', (e) => {
    const keyCode = e.which || e.keyCode
    const index = JSG.keyboard.keyList.indexOf(keyCode)
    if (index != -1)
        JSG.keyboard.keyList.splice(index, 1)
})

window.addEventListener('blur', () => { JSG.keyboard.keyList = [] })

window.addEventListener('touchmove', (e) => {
    e.preventDefault()
    JSG.internal.getCursorPosition(e)
})

window.addEventListener('touchstart', (e) => {
    e.preventDefault()
    JSG.internal.getCursorPosition(e)
    JSG.mouse.click = true
})

window.addEventListener("mousemove", (e) => { JSG.internal.getCursorPosition(e) })

window.addEventListener("mousedown", () => { JSG.mouse.click = true })

window.addEventListener("mouseup", () => {
    JSG.mouse.click = false
    JSG.mouse.internal.releaseFlag = true
})

window.addEventListener('touchend', (e) => {
    JSG.mouse.click = false
    JSG.mouse.internal.releaseFlag = true
})

window.addEventListener('touchcancel', (e) => { JSG.mouse.click = false })

window.addEventListener('blur', () => { JSG.mouse.click = false })