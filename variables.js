export function getVariables() {
	const variables = []

	// //System Variables
	variables.push({
		name: `Poll Time`,
		variableId: `poll_time`,
	})
	// variables.push({
	// 	name: `System Memory`,
	// 	variableId: `system_memory`,
	// })
	// variables.push({
	// 	name: `System GPU`,
	// 	variableId: `system_gpu`,
	// })

	//Event Specific Variables
	for (let x in this.relays) {
		let relay = this.relays[x]

		variables.push({
			name: `I/O ${relay.io_name} Value`,
			variableId: `io_${relay.io_name}_value`,
		})
		// variables.push({
		// 	name: `Event ${event.id} - Duration`,
		// 	variableId: `event_${event.id}_duration`,
		// })
	}
	return variables
}
