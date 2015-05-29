/*
 * viewer.js
 * Node app to browse tests in the browser
 */
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	methodOverride = require('method-override'),
	moment = require('moment'),
	fs = require('fs'),
	path = require('path'),
	hostname = process.env.HOSTNAME || 'localhost',
	config = require('./config.js'),
	port = require('./config.js').viewerPort,
	publicDir = './www';


app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(publicDir));
app.use('/screenshots', express.static(config.phantom.screenshotRoot));

app.use(errorHandler({
	dumpExceptions: true,
	showStack: true
}));

//API endpoints
app.get('/total-failed', function (req, res) {
	res.send({ totalFailed: viewer.getFailedTests().length });
});

//Retrieve a list of failed tests
app.get('/failed-tests', function (req, res) {
	res.send(viewer.getFailedTests());
});

app.get('/contents', function (req, res) {
	res.send(viewer.getFolderContents(req.query.path));
});

app.get('/root-contents', function (req, res) {
	res.send(viewer.getRootContents());
});

app.get('/details', function (req, res) {
	res.send(viewer.getTestDetails(req.query.path));
});

/*
 * The new screenshot is wrong, delete latest and keep baseline
 */
app.get('/keep-baseline', function (req, res) {
	var screenshotPath = req.query.screenshotPath;
	//Clear double dots to avoid navigation to unwanted path
	screenshotPath = screenshotPath.replace(/\.\./g, '');
	//normalize screenshots root
	screenshotPath = screenshotPath.replace(config.phantom.screenshotRoot, '');
	screenshotPath = config.phantom.screenshotRoot + screenshotPath;
	var failScreenshotPath;
	failScreenshotPath = screenshotPath.replace('.png', '.fail.png');
	var latestPath = screenshotPath.replace('.png', '.diff.png');

	//Delete latest file
	fs.unlink(latestPath, function(){
		console.log('delete ' + latestPath);
		
		fs.unlink(failScreenshotPath, function(){
			console.log('delete ' + failScreenshotPath);
			//respond request
			res.sendStatus(200);
		});
	});

});

/*
 * The baseline screenshot is wrong, update to latest
 */
app.get('/update-baseline', function (req, res) {
	var baselinePath = req.query.screenshotPath;

	//Clear double dots to avoid navigation to unwanted path
	baselinePath = baselinePath.replace(/\.\./g, '');
	//normalize screenshots root
	baselinePath = baselinePath.replace(config.phantom.screenshotRoot, '');
	baselinePath = config.phantom.screenshotRoot + baselinePath;
	var failScreenshotPath;
	failScreenshotPath = baselinePath.replace('.png', '.fail.png');
	var latestPath = baselinePath.replace('.png', '.diff.png');

	//Delete baseline file
	fs.unlink(baselinePath, function(){
		console.log('delete ' + baselinePath);
		
		//Rename latest to baseline
		fs.rename(latestPath, baselinePath, function(){
			console.log('rename  ' + latestPath + ' to ' + baselinePath);
			
			//Delete .fail and respond request
			fs.unlink(failScreenshotPath, function(){
				console.log('delete ' + failScreenshotPath);
				//respond request
				res.sendStatus(200);
			});
		});

	});

});
app.listen(port, hostname);

//Viewer object with
var viewer = {};

viewer.getRootContents = function(){
	return viewer.getFolderContents('/');
};

viewer.getFolderContents = function(folder){

	folder = config.resultsRoot + path.sep + folder;
	var files = fs.readdirSync(folder);

	files = files.filter(function(f){ return !f.startsWith('.'); });
	//Skip screenshots folder
	if(folder == config.resultsRoot){
		var scrFolderParts = config.phantom.screenshotRoot.split(path.sep);
		var scrFolderName = scrFolderParts[scrFolderParts.length - 1];
		files = files.filter(function(f){ return !f != scrFolderName; });
	}
	var tree = {};
	tree.folders = [];
	tree.tests = [];
	
	files.forEach( function(f){
		var node = {};
		node.name = f;
		if(fs.lstatSync(folder + path.sep + f).isDirectory()){
			var folderStats = viewer.getFolderStats(folder + path.sep + f);
			node.nPassedTests = folderStats.passedTests.length;
			node.nFailedTests = folderStats.failedTests.length;
			node.nTests = folderStats.nTests;
			tree.folders.push(node);

		}else if(f.endsWith('.json')){
			//Remove file extension
			node.name = node.name.substring(0, node.name.length - 5); 
			//Load result data
			var resultData = fs.readFileSync(folder + path.sep + f);
			var result = JSON.parse(resultData);

			node.testId = result.testId;
			node.description = result.description;
			node.snaps = result.snaps;
			node.passed = result.passed;
			node.lastExecution = moment(result.lastExecution).fromNow();
			tree.tests.push(node);
		}
	});
	return tree;
};

//Recursive function to get number of tests, passed tests and failed tests
viewer.getFolderStats = function(folder){
	var stats = {};
	stats.nTests = 0;
	stats.passedTests = [];
	stats.failedTests = [];
	
	var files = fs.readdirSync(folder);
	files = files.filter(function(f){ return !f.startsWith('.'); });
	files.forEach( function(f){
		if(fs.lstatSync(folder + path.sep + f).isDirectory()){
			var subStats = viewer.getFolderStats(folder + path.sep + f);
			stats.nTests += subStats.nTests;
			stats.passedTests = stats.passedTests.concat(subStats.passedTests);
			stats.failedTests = stats.failedTests.concat(subStats.failedTests);

		}else if(f.endsWith('.json')){
			var resultData = fs.readFileSync(folder + path.sep + f);
			var result = JSON.parse(resultData);

			stats.nTests ++;
			if(result.passed){
				stats.passedTests.push(result);
			}else{
				stats.failedTests.push(result);
			}
		}
	});

	return stats;
};

//Load detils from test results
viewer.getTestDetails = function(testPath){
	
	var resultData = fs.readFileSync(config.resultsRoot + path.sep + testPath + '.json');
	var result = JSON.parse(resultData);
	//Format date
	result.lastExecution = moment(result.lastExecution).fromNow();
	result.viewport = 0;

	//Set-up screenshots
	for(var i = 0; i < result.snaps.length; i++){

		result.snaps[i].activeTab = 'latest';
		result.snaps[i].baseScreenshot = [];
		result.snaps[i].latestScreenshot = [];
		result.snaps[i].failScreenshot = [];

		for(var j = 0; j < result.snaps[i].screenshots.length; j++){

			var scr = result.snaps[i].screenshots[j];
			var latest = scr.replace('.png', '.diff.png');
			var fail = scr.replace('.png', '.fail.png');
			
			try{
				if(fs.lstatSync(scr).isFile()){
					result.snaps[i].baseScreenshot[j] = scr;
				}
			}catch(ex){}

			try{
				if(fs.lstatSync(latest).isFile()){
					result.snaps[i].latestScreenshot[j] = latest;
				}else{
					result.snaps[i].activeTab = 'baseline';
				}
			}catch(ex){
				result.snaps[i].activeTab = 'baseline';
			}

			try{
				if(fs.lstatSync(fail).isFile()){
					result.snaps[i].failScreenshot[j] = fail;
					result.snaps[i].activeTab = 'diff';
				}
			}catch(ex){}

		}
		
	}
	return result;

}

//Recursive function to get all failed tests
viewer.getFailedTests = function(){
	var stats = viewer.getFolderStats(config.resultsRoot);
	return stats.failedTests;
}

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function (prefix){
	return this.indexOf(prefix) === 0;
};
