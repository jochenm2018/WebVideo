/* get access to the filesystem */
const fs = require('fs');

class FrameCollector {

	/**
	 * Initializes member variables
	 *
	 * @param {String} Name The chosen identifier
	 * @param {Object} Browser The browser instance
	 * @param {Object} Config The config object
	 */
	constructor(Name, Browser, Config) {
		this.name = Name;
		this.browser = Browser;
		this.config = Config;
		this.imagePath = Config.generalSettings.imagePath;
		this.imageFormat = Config.generalSettings.imageFormat;
	}

	/**
	 * Starts the chrome browser under the selected conditions
	 * Then collects the websites frames
	 *
	 * @param {String} url The website url
	 * @param {String} networkPreset The network preset
	 * @param {String} devicePreset The device preset
	 *
	 * @return {Promise <Void>}
	 */
	run(url, networkPreset, devicePreset) {
		
		/**
		 * This is a wrapper function
		 * It is called with the FrameCollectors 'this' using 'apply'
		 * Returning a promise without passing the correct 'this' leads to an error
		 *
		 * @return {Promise <Void>}
		 */
		function _run() {

			return new Promise(async (resolve, reject) => {

				if (!Object.keys(this.config.deviceOptions).includes(devicePreset.toLowerCase())) {
					throw new Error("Device preset " + devicePreset + " does not exist.");
				}

				if (!Object.keys(this.config.networkOptions).includes(networkPreset.toLowerCase())) {
					throw new Error("Network preset " + networkPreset + " does not exist.");
				}

				/* start the browser */
				await this.browser.start(this.config.chromeSettings).catch(reject);

				/* emulate device with the given preset */
				await this.browser.emulateDevice(this.config.deviceOptions[devicePreset.toLowerCase()]).catch(reject);

				/* retrieve the DevTools client and extract necessary DevTools-Domains */
				const
				  client = this.browser.get()
				, { Page, Network } = client
				, frames = []
				;

				/* emulate network with the given preset */
				await this.browser.emulateNetwork(this.config.networkOptions[networkPreset.toLowerCase()]).catch(reject);

				/* make DevTools start recording frames and navigate to the given url */
				Page.startScreencast({"format": this.imageFormat}).then(() => {
					console.log("FrameCollector: navigate to " + url);
					Page.navigate({"url": url}).catch(reject);
				});

				/* collect frame information and push into frames array */
				Page.screencastFrame(async (frame) => {
					await Page.screencastFrameAck({'sessionId': frame.sessionId}).catch(reject);
					frames.push(frame);
				});

				/**
				 * stop recording after loading finished
				 * create images out of frameinformation
				 **/
				Page.loadEventFired(async () => {
					await this.browser.sleep(2000);
					await Page.stopScreencast().catch(reject);
					await Promise.race([this.browser.stop(), this.browser.sleep(3000)]);
					frames.forEach((frame) => {
						this.__writeScreenshot(frame.data, frame.metadata.timestamp + '_' + this.name, this.imagePath, this.imageFormat);
					});

					resolve();
				});
			});
		}
		return _run.apply(this);
	}

	/**
	 * Creates an image file with the given framedata
	 *
	 * @param {String} data The framedata
	 * @param {String} name The image identifier
	 * @param {String} dest The destination path
	 * @param {String} format The image format
	 */
	__writeScreenshot(data, name, dest, format) {
		const encoding = 'base64';
		fs.writeFileSync(dest + '/' + name + '.' + format, data, encoding);
	}
}

(async (args) => {
	const
	  Config = _readConfig()
	, Browser = require('./Chrome')
	, Name = args[2]
	, url = args[3]
	, networkPreset = args[4] || Config.generalSettings.defaultNetwork
	, devicePreset = args[5] || Config.generalSettings.defaultDevice

	/* create a FrameCollector instance */
	, Collector = new FrameCollector(Name, Browser, Config)
	;

	/* collect frames */
	await Collector.run(url, networkPreset, devicePreset).catch(_fail);

	console.log("FrameCollector: completed.");
	Browser.stop();
	process.exit(0);

	/**
	 * Reads the config.json and parses it into a js object
	 */
	function _readConfig() {
		try {
			return obj = JSON.parse(fs.readFileSync('config.json'));
		} catch(e) {
			throw new Error("FrameCollector: " + e);
		}
	}

	/**
	 * Errorhandler function, logs the error and stops involved processes
	 *
	 * @param {String} e The error message
	 *
	 * @return {Promise <Void>}
	 */
	async function _fail(e) {
		console.log(e);
		await Browser.stop().catch(fail);
		process.exit(1);
	}
})(process.argv).catch(fail);

/**
 * Errorhandler function global scope
 *
 * @param {String} e The error message
 */
function fail(e) {
	console.log(e);
	process.exit(1);
}
