import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import UpgradeScripts from './upgrades.js'

import fetch from 'node-fetch'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '',
	allowBooleanAttributes: true,
	ignoreDeclaration: true,
})

class X600Instance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.initConnection()

		this.initActions()
		this.initPresets()
		this.initVariables()
		this.initFeedbacks()
	}

	async destroy() {
		this.stopPoll()
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.startPoll()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP',
				width: 6,
				regex: Regex.IP,
			},

			  {
				type: 'static-text',
				id: 'apiPollingDisclaimer',
				width: 12,
				value: `
							
							<h5>WARNING</h5>
							API polling of the X600M may be delayed further than 500ms when showing feedbacks.
							
						`,
			},
			  
			{
				type: 'number',
				id: 'apiPollInterval',
				label: 'API Polling interval (ms) (default: 500, min: 250)',
				width: 6,
				default: 500,
				min: 250,
				max: 60000,
			  },
			{
				type: 'static-text',
				id: 'rejectUnauthorizedInfo',
				width: 12,
				value: `
							
							<h5>WARNING</h5>
							This module rejects server certificates considered invalid for the following reasons:
							<ul>
								<li>Certificate is expired</li>
								<li>Certificate has the wrong host</li>
								<li>Untrusted root certificate</li>
								<li>Certificate is self-signed</li>
							</ul>
							<p>
								We DO NOT recommend turning off this option. However, if you NEED to connect to a host
								with a self-signed certificate you will need to set <strong>Unauthorized Certificates</strong>
								to <strong>Accept</strong>.
							</p>
							<p><strong>USE AT YOUR OWN RISK!<strong></p>
						`,
			},
			{
				type: 'dropdown',
				id: 'rejectUnauthorized',
				label: 'Unauthorized Certificates',
				width: 6,
				default: true,
				choices: [
					{ id: true, label: 'Reject' },
					{ id: false, label: 'Accept - Use at your own risk!' },
				],
			},
		]
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	sendGetRequest(request, command) {
		if (!this.config.rejectUnauthorized) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
		}
		let url = `http://${this.config.host}/${request}`

		fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
			.then((res) => {
				if (res.status == 200) {
					this.updateStatus(InstanceStatus.Ok)

					return res.text()
				} else if (res.status == 401) {
					this.updateStatus('bad_config', 'Authentication Error')
				}
			})
			.then((data) => {
				if (!command) {
					let object = JSON.parse(data)
					this.processData(object)
				}
			})
			.catch((error) => {
				let errorText = String(error)
				if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND') || errorText.match('ECONNREFUSED')) {
					this.updateStatus('connection_failure')
				}
				this.log('debug', errorText)
			})
	}

	sendGetRequestCommand(request) {
		if (!this.config.rejectUnauthorized) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
		}
		let url = `http://${this.config.host}/${request}`

		fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
			.then((res) => {
				if (res.status == 200) {
					this.updateStatus(InstanceStatus.Ok)

					return res.text()
				} else if (res.status == 401) {
					this.updateStatus('bad_config', 'Authentication Error')
				}
			})
			.then((data) => {
			})
			.catch((error) => {
				let errorText = String(error)
				if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND') || errorText.match('ECONNREFUSED')) {
					this.updateStatus('connection_failure')
				}
				this.log('debug', errorText)
			})
	}

	initConnection() {
		this.relays = {}
		this.sendGetRequest('state.json', false)

		this.startPoll()
	}

	startPoll() {
		this.stopPoll()

		this.poll = setInterval(() => {
			this.pollDevice()
		}, this.config.apiPollInterval)
	}

	stopPoll() {
		if (this.poll) {
			clearInterval(this.poll)
			delete this.poll
		}
	}

	pollDevice() {
		this.sendGetRequest('state.json', false)
		this.checkFeedbacks()
	}

	processData(data) {
		let oldEventCount = Object.keys(this.relays).length
		let newEventCount = Object.keys(data).length

		if (oldEventCount != newEventCount){
		}

		for (const [key, value] of Object.entries(data)) {
			if (key == 'time') {
				this.setVariableValues({
					[`poll_time`]: value,
				})
			} else {
				this.relays[key] = { io_name: key, value: value }
				if (oldEventCount != newEventCount) {
					this.initVariables()

					this.setVariableValues({
						[`io_${key}_value`]: value,
					})
				}
			}
		}
	}
}

runEntrypoint(X600Instance, UpgradeScripts)
