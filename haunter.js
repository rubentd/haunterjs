/*
 *	haunterjs
 *	Tool for simple visual regression tests, based in PhantomCSS
 * 	Ruben Torres
 *  https://github.com/darthrubens/haunterjs
 */

var phantomcss = require('phantomcss'),
	fs = require('fs'),
	process = require("child_process"),
	spawn = process.spawn,
	execFile = process.execFile,
	haunter = {};

haunter.config = require('./config.js');
haunter.executingCommand = false;

/**
 *  Initialize components needed to run the test
 *  @param {String} hierarchy - A virtual path to organize the test
 *  @param {String} description - Description of the test
 */
haunter.start = function(hierarchy, description){

	while(haunter.executingCommand){
		//Wait until command has been executed
	}

	//Initialize casper
	casper.start(haunter.config.baseUrl);
	casper.viewport( haunter.config.defaultViewport.width, haunter.config.defaultViewport.height );

	//Handle failure
	haunter.config.phantom.onFail = function(failure) {
		haunter.hasFailed = true;
		haunter.failureReason = 'FAIL';
		haunter._saveResults();
	};

	//Hanbdle completion
	haunter.config.phantom.onComplete = function(){
		haunter._saveResults();
	};

	casper.test.on('fail', function(){
		haunter.hasFailed = true;
		haunter.failureReason = 'FAIL';
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

};

/**
 *  Sets viewport dimensions for the test
 *  @param {Number} width - Desired width of the viewport
 *  @param {Number} height - Desired height of the viewport
 */
haunter.setViewport = function(width, height){
	casper.viewport(width, height);
}

/**
 *  Sets user agent for the test
 *  @param {String} ua - User Agent string
 */
haunter.setUserAgent = function(ua){
	casper.userAgent(ua);
}

/**
 *  Navigate to that url
 *  @param {String} url - Destination url
 */
haunter.goToUrl = function(url){
	casper.thenOpen(url);
}

/**
 *  Take a screenshot with an annotation
 *  @param {String} cssSelector - CSS selector of the element to capture
 *  @param {String} annotation - Comment for the screnshot
 */
haunter.snap = function(cssSelector, annotation){

	casper.then( function(){
		var snapId = haunter.hierarchy + haunter.snapNumber;
		
		casper.waitForSelector(cssSelector, function success(){
			phantomcss.screenshot(cssSelector, snapId);
			haunter._saveSnap(snapId, annotation, cssSelector);
			console.log(haunter.snapNumber + '- ' + annotation);
		}, function fail(){
			haunter._saveSnap(snapId, annotation, 'Selector not found: ' + cssSelector);
			haunter._selectorNotFound(cssSelector);
		});

	});

}

/**
 *  Saves the snap files
 *  @param {String} id - Unique identifier for the snap
 *  @param {String} annotation - Comment for the screnshot
 *  @param {String} cssSelector - CSS selector of the element to capture
 */
haunter._saveSnap = function(id, annotation, cssSelector){
	//Delete old diff if existent
	var toDelete = haunter.config.phantom.screenshotRoot + fs.separator + haunter.hierarchy + haunter.snapNumber + '.diff.png';
	if(fs.isFile(toDelete)){
		fs.remove(toDelete);
	}
	var snap = {};
	snap.screenshot = haunter.config.phantom.screenshotRoot + fs.separator + id + '.png';
	snap.annotation = annotation;
	snap.cssSelector = cssSelector;
	haunter.snaps.push(snap);
	haunter.snapNumber++;
}

/**
 *  Take a screenshot excluding an element
 *  @param {String} cssSelector - CSS selector of the element to capture
 *  @param {String} excludeSelector - CSS selector of the element to exclude
 *  @param {String} annotation - Comment for the screnshot
 */
haunter.snapExcluding = function(cssSelector, excludeSelector, annotation){
	casper.then( function(){
		phantomcss.screenshot(cssSelector, 0, excludeSelector, 'test1');
	});
}

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
}

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
}

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
	if(!result.passed){
		result.failureReason = haunter.failureReason;
	}

	fs.write(haunter.config.resultsRoot + fs.separator + result.testHierarchy + '.json', JSON.stringify(result), 'w');
}

/**
 *  Proceed to compare the screenshots and figure out if there are errors
 */
haunter.end = function(){

	while(haunter.executingCommand){
		//Wait until command has been executed
	}

	casper.then( function now_check_the_screenshots(){
		// compare screenshots
		phantomcss.compareSession();
	});

	casper.then( function end_it(){
		casper.test.done();
	});

	// Casper runs tests 
	casper.run(function(){
		phantom.exit(phantomcss.getExitStatus());
	});
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
	setViewport: haunter.setViewport,
	setUserAgent: haunter.setUserAgent,
	goToUrl: haunter.goToUrl,
	snap: haunter.snap,
	snapExcluding: haunter.snapExcluding,
	click: haunter.click,
	sendKeys: haunter.sendKeys,
	pressEnter: haunter.pressEnter,
	end: haunter.end,
	exec: haunter.exec
};
