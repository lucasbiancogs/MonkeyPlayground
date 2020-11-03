export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            height: 25,
            width: 25
        }
    }

    const observers = []

    function start() {
        const frequency = 1000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyListeners(command) {
        console.log(`Notifying ${observers.length} observers`)

        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

        state.players[playerId] = {
            x: playerX,
            y: playerY
        }

        notifyListeners({
            type: 'add-player',
            playerId,
            playerX,
            playerY
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyListeners({
            type: 'remove-player',
            playerId
        })
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 100000000)
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)


        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyListeners({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyListeners({
            type: 'remove-fruit',
            fruitId
        })
    }

    function movePlayer(command) {
        notifyListeners(command)

        console.log(`Moving ${command.playerId} with ${command.keyPressed}`)

        const acceptedMoves = {
            w(player) {
                if (player.y > 0) {
                    player.y--
                    return
                } else {
                    player.y = state.screen.width - 1
                    return
                }
            },
            s(player) {
                if (player.y + 1 < state.screen.height) {
                    player.y++
                    return
                } else {
                    player.y = 0
                    return
                }
            },
            a(player) {
                if (player.x > 0) {
                    player.x--
                    return
                } else {
                    player.x = state.screen.height - 1
                    return
                }
            },
            d(player) {
                if (player.x + 1 < state.screen.height) {
                    player.x++
                    return
                } else {
                    player.x = 0
                    return
                }
            },
        }

        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            console.log(`Checking ${playerId} and ${fruitId}`)

            if (player.x == fruit.x && player.y == fruit.y) {
                console.log(`Collision between ${playerId} and ${fruitId}`)
                removeFruit({ fruitId })
            }
        }
    }

    return {
        movePlayer,
        state,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        setState,
        subscribe,
        start
    }
}