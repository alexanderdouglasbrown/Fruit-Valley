//USAGE
// This handles creating the canvas/context and scaling the image

JSG.display = {
    widthScale: 1,
    heightScale: 1,
}

function JSG_createCanvas(width, height) {
    JSG.resolutionWidth = width
    JSG.resolutionHeight = height

    JSG.canvas = document.createElement("canvas")
    document.body.insertBefore(JSG.canvas, document.body.childNodes[0])
    JSG.context = JSG.canvas.getContext("2d")
    JSG_resizeCanvas()
}

function JSG_resizeCanvas() {
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
}

window.addEventListener("resize", JSG_resizeCanvas)
window.addEventListener("orientationchange", JSG_resizeCanvas)