//USAGE
//  if (JSG.keyboard.keyList.includes(65)) //where 65 is the ASCII keyCode for A

JSG.keyboard = {
    keyList: []
}

document.addEventListener('keydown', (e) => {
    const keyCode = event.which || event.keyCode
    if (!JSG.keyboard.keyList.includes(keyCode)) {
        JSG.keyboard.keyList.push(keyCode)
    }
})

document.addEventListener('keyup', (e) => {
    const keyCode = event.which || event.keyCode
    const index = JSG.keyboard.keyList.indexOf(keyCode)
    if (index != -1)
        JSG.keyboard.keyList.splice(index, 1)
})

window.addEventListener('blur', () => { JSG.keyboard.keyList = [] })