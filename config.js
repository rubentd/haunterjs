var config = {};

//Main configuration
config.baseUrl = './demo-app/index.html';
config.defaultViewports = [
	{ 
		name: 'small',
		width: 320, 
		height: 480
	},
	{ 
		name: 'medium',
		width: 768, 
		height: 480
	},
	{ 
		name: 'large',
		width: 1024, 
		height: 768
	}
];
config.resultsRoot = './results';
config.viewerPort = 8080;

//PhantomCSS configuration
config.phantom = {};
config.phantom = {
	libraryRoot: './node_modules/phantomcss',
	/*
	 * Please setup these three the same for it to work properly 
	 */
	screenshotRoot: './screenshots',
	comparisonResultRoot: './screenshots',
	failedComparisonsRoot: './screenshots',

	//Please keep this on false for the viewer to work properly
	cleanupComparisonImages: false, 
	addLabelToFailedImage: false,
	
	outputSettings: {
		errorColor: {
			red: 255,
			green: 0,
			blue: 0
		},
		errorType: 'movement',
		transparency: 0.3
	},
	mismatchTolerance: .5,
	fileNameGetter: function(root, filename){ 
		//Remove suffix
		if(filename.match(/.+_[0-9]+.+/)){
			var parts = filename.split("_");
			var suffix = "_" + parts[parts.length - 1];
			filename = filename.replace(suffix, "");
		}
		var fileName = root + fs.separator + filename + '.png';
		if(fs.isFile(fileName)){
			return fileName.replace('.png', '.diff.png');
		} else {
			return fileName;
		}
    }
};

module.exports = config;
