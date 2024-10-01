import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorGray = combineRgb(110, 110, 110)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	let eventStatusChoices = [
		{ id: 'running', label: 'Running' },
		{ id: 'pending', label: 'Pending' },
		{ id: 'complete', label: 'Complete' },
		{ id: 'error', label: 'Error' },
		{id: 'preprocessing', label: 'Preprocessing'},
		{id: 'postprocessing', label: 'Postprocessing'},
	]

	let systemStatusChoices = [
		{ id: 'green_status', label: 'Running' },
		{ id: 'orange_status', label: 'Pending' },
	]

	feedbacks['relayValue'] = {
		type: 'boolean',
		name: 'Relay Value Status',
		description: "Change style if Relay Value Changes",
		defaultStyle: {
			bgcolor: ColorGreen,
		},
		options: [
			{
				type: 'textinput',
				label: 'I/O Name',
				id: 'io_name',
				default: '',
			},
			{
				type: 'dropdown',
				label: 'Value',
				id: 'value',
				default: 'on',
				choices: [		
					{ id: '1', label: 'On' },
					{ id: '0', label: 'Off' },
				],
			},
		],
		callback: (feedback) => {		
			return this.relays?.[`${feedback.options.io_name}`]?.value == feedback.options.value
		},
	}

	return feedbacks
}
