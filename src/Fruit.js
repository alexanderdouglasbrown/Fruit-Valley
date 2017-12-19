class Fruit {
    constructor() {
        this.fruit = this.getRandomIntInclusive(1, 5)
        this.offsetX = 0
        this.offsetY = 0
        this.offsetZoom = 0
        this.alpha = 1
        this.isExploding = false
        this.isFalling = false
    }

    //From Mozilla Docs
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}