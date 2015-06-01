/*
 *	haunterjs
 *	Tool for simple visual regression tests, based in PhantomCSS
 * 	Ruben Torres
 *  https://github.com/rubentd/haunterjs
 */

var phantomcss = require('phantomcss'),
	fs = require('fs'),
	process = require("child_process"),
	spawn = process.spawn,
	execFile = process.execFile,
	haunter = {};

haunter.config = require('./config.js');
haunter.executingCommand = false;
haunter.viewports = null;

/**
 *  Initialize components needed to run the test
 *  @param {String} hierarchy - A virtual path to organize the test
 *  @param {String} description - Description of the test
 */
haunter.start = function(hierarchy, description){

	//Initialize casper
	casper.start(haunter.config.baseUrl);
	
	while(haunter.executingCommand){
		//Wait until command has been executed	
	}

	//Handle failure
	haunter.config.phantom.onFail = function(failure) {
		haunter.hasFailed = true;
		if(!haunter.failureReason){
			haunter.failureReason = 'Test execution failed';
		}
		haunter._saveResults();
	};

	//Hanbdle completion
	haunter.config.phantom.onComplete = function(){
		haunter._saveResults();
	};

	casper.test.on('fail', function(){
		haunter.hasFailed = true;
		if(!haunter.failureReason){
			haunter.failureReason = 'Test execution failed';
		}
		haunter._saveResults();
	});

	//Initialize phantomcss
	phantomcss.init(haunter.config.phantom);

	//Initialize casper object
	console.log(description);
	haunter.snapNumber = 0;
	haunter.description = description;

	//Save hierarchy
	haunter.hierarchy = hierarchy;
	//Create a unique id, based on the test path
	haunter.testId = hierarchy.replace(/\//g, '-');
	haunter.result = {};
	haunter.snaps = [];

	haunter.hasFailed = false;
	haunter.failureReason = '';

	haunter.setViewports(haunter.config.defaultViewports);

};

/**
 *  Sets viewport dimensions for the test. Setup the viewport after calling the method start()
 *  @param {Array} viewports - Array of desired viewports {name, width, height}
 */
haunter.setViewports = function(viewports){
	haunter.viewports = viewports;
};

/**
 *  Sets user agent for the test
 *  @param {String} ua - User Agent string
 */
haunter.setUserAgent = function(ua){
	casper.userAgent(ua);
};

/**
 *  Navigate to that url
 *  @param {String} url - Destination url
 */
haunter.goToUrl = function(url){
	casper.thenOpen(url);
};

/**
 *  Take a screenshot with an annotation
 *  @param {String} cssSelector - CSS selector of the element to capture
 *  @param {String} annotation - Comment for the screnshot
 *  @param {Boolean} multiple - Take screenshots in all viewports?
 */
haunter.snap = function(cssSelector, annotation, multiple){
	haunter._snap(cssSelector, null, annotation, multiple);
};

/**
 *  Take a screenshot excluding an element
 *  @param {String} cssSelector - CSS selector of the element to capture
 *  @param {String} excludeSelector - CSS selector of the element to exclude
 *  @param {String} annotation
 *  @param {Boolean} multiple - Take screenshots in all viewports?
 */
haunter.snapExcluding = function(cssSelector, excludeSelector, annotation, multiple){
	haunter._snap(cssSelector, excludeSelector, annotation, multiple);
};

/**
 * Save snaps with or without excluding an area
 * @param  {[type]} cssSelector     - CSS selector of the element to capture
 * @param  {[type]} excludeSelector - CSS selector of the element to exclude
 * @param  {[type]} annotation      - Comment for the screnshot
 * @param  {[type]} multiple        - Take screenshots in all viewports?
 */
haunter._snap = function(cssSelector, excludeSelector, annotation, multiple){
	
	multiple = (typeof multiple != 'undefined') ? multiple : true;

	var vp = haunter.viewports;
	var screenshots = [],
		snapId = haunter.hierarchy + haunter.snapNumber;

	if(!multiple){
		var screenshotFilename = snapId;
		haunter._singleScreenshot(cssSelector, excludeSelector, screenshotFilename, vp[0]);
		screenshots[0] = haunter.config.phantom.screenshotRoot + fs.separator + screenshotFilename + '.png';
	}else{
		for(var i = 0, n = vp.length; i < n; i++){
			var screenshotFilename = snapId + '_' + vp[i].name;
			haunter._singleScreenshot(cssSelector, excludeSelector, screenshotFilename, vp[i]);
			screenshots[i] = haunter.config.phantom.screenshotRoot + fs.separator + screenshotFilename + '.png';
		}
	}
	haunter._saveSnap(snapId, annotation, cssSelector, screenshots);
	console.log(haunter.snapNumber + '- ' + annotation);
};

/**
 * Takes a single screenshot
 * @param {String} cssSelector - CSS selector of the element to capture
 * @param {String} excludeSelector - CSS selector of the element to exclude
 * @param {String} screenshotFileName - Filename for the screenshot
 * @param {Object} viewport - Size of viewport for the screenshot
 */
haunter._singleScreenshot = function(cssSelector, excludeSelector, screenshotFileName, viewport){

	casper.then( function(){
		casper.viewport( viewport.width, viewport.height );
		casper.waitForSelector(cssSelector, function success(){

			if(excludeSelector){
				phantomcss.screenshot(cssSelector, 0, excludeSelector, screenshotFileName);
			}else{
				phantomcss.screenshot(cssSelector, screenshotFileName);
			}
		});
	});
};

/**
 *  Saves the snap files
 *  @param {String} id - Unique identifier for the snap
 *  @param {String} annotation - Comment for the screnshot
 *  @param {String} cssSelector - CSS selector of the element to capture
 *  @param {Array} screeshots - List of filenames of screenshots taken
 */
haunter._saveSnap = function(id, annotation, cssSelector, screenshots){
	//Delete old diffs if existent
	for(var i = 0, n = screenshots.length; i < n; i++){
		var toDelete = haunter.config.phantom.screenshotRoot + fs.separator + screenshots[i] + '.diff.png';
		if(fs.isFile(toDelete)){
			fs.remove(toDelete);
		}
	}
	var snap = {
		screenshots: screenshots,
		annotation: annotation,
		cssSelector: cssSelector
	};
	haunter.snaps.push(snap);
	haunter.snapNumber++;
};

/**
 *  Click an element
 *  @param {String} cssSelector - CSS selector of the element to click
 */
haunter.click = function(cssSelector){
	casper.then( function(){
		casper.waitForSelector(cssSelector, function success(){
			casper.click(cssSelector);
		}, function fail(){
			haunter._selectorNotFound(cssSelector);
		});
	});
};

/**
 *  Type some text into an element
 *  @param {String} cssSelector - CSS selector of the element to send keys to
 *  @param {String} keys - String of text to input in the element
 */
haunter.sendKeys = function(cssSelector, keys){
	casper.waitForSelector(cssSelector, function success(){
		casper.sendKeys(cssSelector, keys);
	}, function fail(){
		haunter._selectorNotFound(cssSelector);
	});
};

/**
 * Upload a file to the browser
 * @param  {String} cssSelector - CSS selector for the file input
 * @param  {String} filePath - Path to the file to upload
 */
haunter.uploadFile = function(cssSelector, filePath){
	casper.then(function(){
		casper.page.uploadFile(cssSelector, filePath);
	});
}

/**
 *  Press enter key while focused on an element
 *  @param {String} cssSelector - CSS selector of the element to focus
 */
haunter.pressEnter = function(cssSelector){
	casper.waitForSelector(cssSelector, function success(){
		this.sendKeys(cssSelector, casper.page.event.key.Enter , {keepFocus: true});
	}, function fail(){
		haunter._selectorNotFound(cssSelector);
	});
};

/**
 *  Save results for the test execution into a file
 */
haunter._saveResults = function(){

	var result = {};
	result.description = haunter.description;
	result.testId = haunter.testId;
	result.testHierarchy = haunter.hierarchy;
	result.snaps = haunter.snaps ? haunter.snaps.slice(0) : [];
	result.passed = !haunter.hasFailed;
	result.lastExecution = Date.now(); 
	result.viewports = haunter.viewports;
	if(!result.passed){
		result.failureReason = haunter.failureReason;
	}

	fs.write(haunter.config.resultsRoot + fs.separator + result.testHierarchy + '.json', JSON.stringify(result), 'w');
};

/**
 * Place the mouse over some element
 * @param  {String} cssSelector - CSS selector for the element to mouseover
 */
haunter.mouseover = function(cssSelector){

	casper.then( function(){
		casper.waitForSelector(cssSelector, function success(){
			casper.mouse.move(cssSelector);
		}, function fail(){
			haunter._selectorNotFound(cssSelector);
		});
	});

};

/**
 * Evaluate some js code on the browser
 * @param  {function} actions - JavaScript code to evaluate
 * @params {Object} params - params for the js evaluation
 */
haunter.evaluate = function(actions, params){
	casper.then( function(){
		casper.evaluate(actions, params)
	});
};

/**
 * Masks casperjs wait
 * @param  {Number} miliseconds - Time in miliseconds to wait
 */
haunter.wait = function(miliseconds){
	casper.then( function(){
		casper.wait(miliseconds);
	});
}

/**
 *  Proceed to compare the screenshots and figure out if there are errors
 */
haunter.end = function(){

	casper.then( function now_check_the_screenshots(){
		// compare screenshots
		phantomcss.compareSession();
	});

	casper.then( function end_it(){
		casper.test.done();
	});

	// Casper runs tests 
	casper.run(function(){
		setTimeout(phantom.exit(phantomcss.getExitStatus()), 100);
	});

	delete haunter;

}

/**
 *  Actions to perform when a selector was not found
 */
haunter._selectorNotFound = function(cssSelector){
	haunter.hasFailed = true;
	haunter.failureReason = 'Selector \'' + cssSelector + '\' not found';
	casper.test.fail('Selector not found ' + cssSelector);
}

/**
 *  Execute a command syncronously
 */
haunter.exec = function(command, args){

	haunter.executingCommand = true;
	console.log('Executing command: ' + command + ' ' + args);

	var child = spawn(command, args)

	child.stdout.on("data", function (data) {
		console.log(data);
	});

	child.stderr.on("data", function (data) {
		console.log(data);
	});

	child.on("exit", function (code) {
		haunter.executingCommand = false;
	});
}

//Select 'public' methods
module.exports = {
	config: haunter.config,
	start: haunter.start,
	setViewports: haunter.setViewports,
	setUserAgent: haunter.setUserAgent,
	goToUrl: haunter.goToUrl,
	snap: haunter.snap,
	snapExcluding: haunter.snapExcluding,
	click: haunter.click,
	mouseover: haunter.mouseover,
	sendKeys: haunter.sendKeys,
	pressEnter: haunter.pressEnter,
	uploadFile: haunter.uploadFile,
	evaluate: haunter.evaluate,
	end: haunter.end,
	exec: haunter.exec,
	wait: haunter.wait
};
