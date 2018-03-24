/* get access to the filesystem */
const fs = require('fs');

class Chrome {

	/**
	 * Imports required modules and initializes member variables
	 */
	constructor() {
		this.launcher = require('chrome-launcher');
		this.cdp      = require('chrome-remote-interface');

		this.launchOptions = {
		  port: 9222
		, logLevel: 'silent'
		, chromeFlags: [
			  '--no-sandbox'
			, '--headless'
			, '--disable-web-security'
			, '--disable-gpu'
			, '--hide-scrollbars'
			]
		}

		this.chromeSettings = {
		  enable: ["Page", "Security", "Network"]
		, initVP: {"x": 1920, "y": 1080}
		, ignoreSSLErrors: true
		}

		this.ChromeEXE = null;
		this.CDPClient = null;
	}

	/**
	 * Start chrome process and connect to it's DevTools
	 *
	 * @return {Promise <Object>} CDPClient
	 */
	start(settings) {

		settings = settings || this.chromeSettings;

		return new Promise(async (res, rej) => {

			/* add necessary flags which were specified in the config */
			this.launchOptions.chromeFlags.push("--window-size=" + settings.initVP.x + "," + settings.initVP.y);

			/* start chrome process using ChromeLauncher */
			this.ChromeEXE = await this.__startEXE().catch((e) => {console.log(e)});

			/* connect to DevTools using CDP */
			this.CDPClient = await this.__connectCDP(settings.enable);

			res(this.CDPClient);

		});

	}

	/**
	 * Start the chrome process using ChromeLauncher
	 *
	 * @return {Object} ChromeEXE
	 */
	__startEXE() {
		return this.launcher.launch(this.launchOptions);
	}

	/**
	 * Connect to Chrome DevTools using the Chrome Devtools Protocol
	 * Chrome Devtools running under default port 9222
	 *
	 * @param {Array} domains DevTools-Domains which will be used
	 * @return {Promise <Object>} CDPClient
	 **/
	__connectCDP(domains) {

		return new Promise(async (res, rej) => {

			const __CDPClient = await this.cdp();

			try {
				const
				  promisesEnable = []
				, { Security } = __CDPClient
				;

				/* enable required domains and push each promise into an array */
				domains.forEach((domain) => {
					promisesEnable.push(__CDPClient[domain].enable());
				});

				/**
				 * wait until all required domains are enabled
				 * this is necessary to make use of the required DevTools functionalities
				 * */
				await Promise.all(promisesEnable);

				/* skip certificate errors */
				Security.certificateError(({eventId}) => {
					Security.handleCertificateError({
						  eventId
						, action: 'continue'
					}).catch(e => {});
				});
		
				/* resolve CDPClient */
				res(__CDPClient);

			} catch(e) {
				console.error(e);
				__CDPClient && __CDPClient.close();
				this.stop();
			}
		});
	}

	/**
	 * Returns the client which is connected to DevTools
	 *
	 * @return {Object} CDPClient
	 */
	get() {
		return this.CDPClient;
	}

	/**
	 * Emulates the selected device
	 * Uses emulation settings for the selected device
	 *
	 * @param {Object} device Emulation settings from config.json
	 * @return {Promise <Void>}
	 */
	emulateDevice(device) {
		const { Emulation, Network } = this.CDPClient;
		return new Promise(async (res, rej) => {
			await Network.setUserAgentOverride({"userAgent": device.ua }).catch(rej);
			await Emulation.setDeviceMetricsOverride(device.metrics).catch(rej);
			res();
		});
	}

	/**
	 * Emulates the selected connection
	 * Uses connection settings for the selected preset
	 *
	 * @param {String} connection Emulation settings from config.json
	 * @return {Promise <Void>}
	 */
	emulateNetwork(connection) {
		return new Promise(async (res, rej) => {
			const { Network } = this.CDPClient;
			if (!await Network.canEmulateNetworkConditions().catch(rej)) {
				throw new Error("Chrome: The installed chrome version does not support network emulation.");
			}
			await Network.emulateNetworkConditions(connection).catch(rej);
			res();
		});
	}

	/**
	 * Stops the chrome process
	 * Times out after 3000 seconds if chrome does not stop
	 *
	 * @return {Promise <Void>}
	 */
	stop() {
		return new Promise(async (res) => {
			await Promise.race([
				this.ChromeEXE.kill(),
				this.sleep(3000)
			]);
			res();
		});
	}

	/**
	 * The returned promise is resolved after a given amount of time
	 *
	 * @param {number} ms The timeout duration in miliseconds
	 * @return {Promise <Void>}
	 */
	sleep(ms) {
		return new Promise((res) => {
			setTimeout(res, ms);
		});
	}
}

module.exports = new Chrome();
