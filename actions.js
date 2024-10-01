export function getActions() {
	let relayStateChoices = [
		{ id: 'on', label: 'On' },
		{ id: 'off', label: 'Off' },
		{ id: 'toggle', label: 'Toggle' },
	]

	let actions = {
		changeRelayState: {
			name: 'Change Relay State',
			options: [
				{
					id: 'io_name',
					type: 'textinput',
					label: 'I/O Name',
					default: '',
				},
				{
					type: 'dropdown',
					label: 'Relay State',
					id: 'relay_state',
					default: 'toggle',
					choices: relayStateChoices,
				},
			],
			callback: (action) => {
				if (action.options.relay_state == 'toggle') {
					this.sendGetRequestCommand(`state.xml?${action.options.io_name}State=5`)
				}

				if (action.options.relay_state == 'on') {
					this.sendGetRequestCommand(`state.xml?${action.options.io_name}State=1`)
				}

				if (action.options.relay_state == 'off') {
					this.sendGetRequestCommand(`state.xml?${action.options.io_name}State=0`)
				}
			},
		},
	}
	return actions
}
