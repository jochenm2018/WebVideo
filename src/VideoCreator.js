class VideoCreator {

	/**
	 * Initializes member variables
	 *
	 * @param {Object} Config The config object
	 */
	constructor(Config) {
		const { videoPath, imagePath, imageFormat } = Config.generalSettings;
		this.vs = require('videoshow');
		this.videoPath = __dirname + '/../' + videoPath;
		this.imagePath = __dirname + '/../' + imagePath;
		this.imageFormat = imageFormat;
		this.videoSettings = Config.videoSettings;
	}

	/**
	 * It sorts collected frames and calculates the correct visibility duration
	 * Creates a video using the collected frame data/information
	 *
	 * @param {String} identifier The frame identifier
	 * @return {Promise <Void>}
	 */
	run(identifier) {
		return new Promise(async (resolve, reject) => {
			if (!identifier) {
				throw new Error('VideoCreator: A frame-identifier is required.');
			}
			this.finalVideoPath = this.videoPath + '/' + identifier + '.' + this.videoSettings.format;
			await this.__createVideo(this.__prepareFrames(identifier)).catch(reject);
			resolve();
		});
	}

	/**
	 * Creates a video out of frames
	 * Make use of videoshow which executes the FFmpeg commands
	 *
	 * @param {Object[]} frames The collected frames
	 *
	 * @return {Promise <Void>}
	 */
	__createVideo(frames) {
		return new Promise((resolve, reject) => {
			console.log('VideoCreator: starting ffmpeg process..(' + frames.length + ' items)');
			/* run videoshow which uses FFmpeg */
			this.vs(frames, this.videoSettings)
			.save(this.finalVideoPath)
			.on('stderr', (err) => {
				console.log(err);
				reject();
			})
			.on('error', (err) => {
				console.log("\n" + err);
				reject();
			})
			.on('end', (output) => {
				console.log("VideoCreator: Success creating a video!");
				console.log("VideoCreator: video-url: " + this.finalVideoPath);
				resolve();
			});
		});
	}

	/**
	 * Sorts the collected frames
	 * Calculates the visibility duration for each frame
	 *
	 * @param {String} identifier The frame identifier
	 * @return {Object[]} The required information for each frame
	 */
	__prepareFrames(identifier) {
		const
		  files = require('fs').readdirSync(this.imagePath)
		, timestamps = []
		, frames = []
		;

		/* get timestamps from filenames */
		files.forEach((file) => {
			if (file.includes('_' + identifier + '.')) {
				timestamps.push(file.substring(0, file.indexOf('_')));
			}
		});

		/* sort timestamps */
		timestamps.sort((a, b) => { return a - b });

		/* calculate frame duration */
		timestamps.forEach((timestamp, i) => {
			const
			  frameInfo = {}
			, nextTimestamp = timestamps[i + 1]
			;
			if (nextTimestamp) {
				frameInfo.loop = nextTimestamp - timestamp;
			}
			frameInfo.path = this.imagePath + '/' + timestamp + '_' + identifier + '.' + this.imageFormat;
			frames.push(frameInfo);
		});
		frames[frames.length - 1].loop = 0.1;
		return frames;
	}
}

(async (args) => {
	const
	  Config = _readConfig()

	/* create a VideoCreator instance */
	, Creator = new VideoCreator(Config)
	, Identifier = args[2]
	;

	/* create the video */
	await Creator.run(Identifier).catch(fail);
})(process.argv).catch(fail);

/**
 * Allows to read the config file
 */
function _readConfig() {
	const fs = require('fs');
	try {
		return obj = JSON.parse(fs.readFileSync('config.json'));
	} catch(e) {
		throw new Error("VideoCreator: " + e);
	}
}

/**
 * Errorhandler function
 *
 * @param {String} e The error message
 */
function fail(e) {
	console.log(e);
	process.exit(1);
}
