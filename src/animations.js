function lockingAnimation(animationSpeed) {
    if (animation != null) {
        switch (animation) {
            case "up":
                puzzleArray[tileSelected.x][tileSelected.y].offsetY -= animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetY += animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetY <= -tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "up"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "down":
                puzzleArray[tileSelected.x][tileSelected.y].offsetY += animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetY -= animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetY >= tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetY = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetY = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "down"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "right":
                puzzleArray[tileSelected.x][tileSelected.y].offsetX += animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetX -= animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetX >= tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "right"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break
            case "left":
                puzzleArray[tileSelected.x][tileSelected.y].offsetX -= animationSpeed
                puzzleArray[tileSelected2.x][tileSelected2.y].offsetX += animationSpeed
                if (puzzleArray[tileSelected.x][tileSelected.y].offsetX <= -tileSize) {
                    puzzleArray[tileSelected.x][tileSelected.y].offsetX = 0
                    puzzleArray[tileSelected2.x][tileSelected2.y].offsetX = 0
                    swapTiles()
                    if (isFirstSwap && !scanForMatch()) {
                        animation = "left"
                        isFirstSwap = false
                    } else {
                        isFirstSwap = true
                        animation = null
                    }
                }
                break

            case "explode":
                for (let i = 0; i < gridX; i++) {
                    for (let j = 0; j < gridY; j++) {
                        if (puzzleArray[i][j].isExploding) {
                            puzzleArray[i][j].offsetZoom += animationSpeed / 1.2
                            puzzleArray[i][j].alpha -= animationSpeed / 170
                            if (puzzleArray[i][j].alpha < 0) {
                                puzzleArray[i][j].alpha = 1
                                puzzleArray[i][j].offsetZoom = 0
                                puzzleArray[i][j].isExploding = false
                                puzzleArray[i][j].fruit = 0
                                animation = null
                            }
                        }
                    }
                }
                break
            case "timesup":
                if (graphics.timesup.zoom < 0)
                    graphics.timesup.zoom += animationSpeed * 4.5
                else
                    graphics.timesup.zoom = 0
                break
            case "ready":
                if (graphics.ready.zoom > 0) {
                    graphics.ready.zoom -= animationSpeed * 4.5
                } else {
                    graphics.ready.zoom = 0
                    graphics.ready.alpha -= animationSpeed * 0.002
                }
                if (graphics.ready.alpha < 0) {
                    graphics.ready.alpha = 0
                    animation = "go"
                }
                break
            case "go":
                if (graphics.go.pause < 500)
                    graphics.go.pause += animationSpeed
                else
                    graphics.go.offsetX += animationSpeed * 3

                if ((graphics.go.x + graphics.go.offsetX) >= 1440) {
                    animation = null
                    gameStarted = true
                }
                break
            default:
                break
        }
    }
}