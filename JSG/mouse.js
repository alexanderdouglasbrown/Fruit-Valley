//USAGE
//  Use JSG.mouse to retrieve mouse coords that play nicely with the scalar.

JSG.mouse = {
    x: 0,
    y: 0,
    click: false,
    release: false,
    internal: { releaseFlag: false }
}

document.addEventListener('touchmove', (e) => {
    e.preventDefault()
    JSG_getCursorPosition(e)
    JSG.mouse.click = false
})

document.addEventListener('touchstart', (e) => {
    e.preventDefault()
    JSG_getCursorPosition(e)
    JSG.mouse.click = true
})

document.addEventListener("mousemove", (e) => { JSG_getCursorPosition(e) })

document.addEventListener("mousedown", () => { JSG.mouse.click = true })

document.addEventListener("mouseup", () => {
    JSG.mouse.click = false
    JSG.mouse.internal.releaseFlag = true
})

document.addEventListener('touchend', (e) => {
    //Only trigger releaseFlag if the user didn't move when touching
    if (JSG.mouse.click) {
        JSG.mouse.click = false
        JSG.mouse.internal.releaseFlag = true
    }
})

document.addEventListener('touchcancel', (e) => { JSG.mouse.click = false })

window.addEventListener('blur', () => { JSG.mouse.click = false })

function JSG_getCursorPosition(e) {
    e = e || window.event

    JSG.mouse.x = event.pageX - JSG.canvas.offsetLeft
    JSG.mouse.y = event.pageY - JSG.canvas.offsetTop

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