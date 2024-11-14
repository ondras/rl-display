let action = generateAction()
let result = processAction(action)


let actions = [
	{type:"launch", sourcePosition:[5, 5], direction:[1, 1], distance: 5}
]

document.createElement
function processAction(action) {
	switch (action.type) {
		case "launch":
			// play sound
			let actions = [];
			for (let i = 0; i < action.distance; i++) {
				let action = {
					type: "move",
					what: "projectile",
					position: [action.sourcePosition[0] + action.direction[0] * i, action.sourcePosition[1] + action.direction[1] * i]
				}
				actions.push(action)
			}
			actions.push({type:"impact", position: [action.sourcePosition[0] + action.direction[0] * action.distance, action.sourcePosition[1] + action.direction[1] * action.distance]})
			return {actions}
		break;

		case "move":
		break;

		case "impact":
		break;
	}
}


let state = {}
let actionQueue = []

while (true) {
	if (!actionQueue.length) {
		let action = generateAction(state) // fixme await user input
		actionQueue.push(action)
	}
	let action = actions.shift()
	let { newState, newActions } = applyAction(action, state) // fixme await ui

	actionQueue.push(...newActions)
	state = newState
}
