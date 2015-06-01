![logo](http://rubentd.com/haunterjs/img/icon.png "logo") 
# haunterjs
[![npm version](https://badge.fury.io/js/haunterjs.svg)](http://badge.fury.io/js/haunterjs) [![Build Status](https://travis-ci.org/rubentd/haunterjs.svg)](https://travis-ci.org/rubentd/haunterjs)

## Table of Contents
* [About haunterjs](#about-haunterjs)
* [Taking snaps](#taking-snaps)
* [Responsive sites](#responsive-sites)
* [Snap viewer](#snap-viewer)
* [Solving conflicts](#solving-conflicts)
* [API documentation](#api-documentation)
* [Installation](#installation)
* [Best practices](#best-practices)


## About haunterjs
When you work on a big website or web application, you (and maybe a bunch of people) are constantly introducing changes in the visual components.  
Sometimes this changes are intentional, as you are improving the look and feel, or adding new features, but sometimes this changes are introduced by mistake.   
Imagine you are refactoring some component, for example a button, but you are not sure how this change is gonna impact the site. You would need to browse the whole site to make sure everything looks good.  
With css regression tests you can automate the process, and make sure none breaks the styles across the website.
<br>
There are some tools like [PhantomCSS](https://github.com/huddle/phantomcss) 
or [wraith](https://github.com/BBC-News/wraith) 
which allow you to write tests to compare screenshots of your website and detect changes.
  
<br>
haunterjs was built on top of [PhantomCSS](https://github.com/huddle/phantomcss), 
adding some new features:

1. Annotations for each screenshot
2. Sense of ordered steps in the execution of the test
3. More simplicity in the syntax for the tests
4. A viewer to compare and choose the correct screenshots


haunterjs masks some complex features of casperjs, allowing to code simple tests, with a more compact and readable syntax.

This example test opens github.com and searches for 'bootstrap'

```javascript
var haunter = require('../haunter.js');
haunter.start('search/bootstrap', 'Search for bootstrap repo');
haunter.goToUrl('https://github.com/');
haunter.snap('.header', 'Go to github.com');
haunter.sendKeys('input[type=text]', 'bootstrap');
haunter.snap('.header', 'Type bootstrap on the search field');
haunter.pressEnter('input[type=text]');
haunter.snap('.sort-bar', 'Press enter and view number of results');
haunter.end();
```

<br>
## Taking snaps

haunterjs is based on the concept of **snaps**.

A snap is a screenshot of a given css selector and an annotation for that screenshot, describing the current action being performed. 

```javascript
haunter.snap('.sort-bar', 'Press enter and view number of results');
```

  
<br>
## Responsive sites

haunterjs allows to configure multiple viewports, to test responsive sites in a single test.  
This way haunterjs will take screenshots with every screen size in each snap.

```javascript
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
```

If you want to take a snap of a single component, like a button, and you don't care about multiple screen sizes, call the snap method with the last parameter with false value.

```javascript
haunter.snap('.selector', 'Annotation', false);
```


<br>
## Snap viewer

haunterjs includes a snap viewer written in nodejs and angularjs. You can use this tool as a navigation manual, browsing the snapshots of a specific user flow. You can compare them and choose the correct one, in the event of conflict.

<br><br>
![snap viewer](http://rubentd.com/haunterjs/img/viewer-index.png "snap viewer")
<br><br>

haunterjs allows the test to be structured in a hierarchy or folder system, to facilitate the process of browsing/running the tests.
For example you can separate your tests by features or modules of your website.

This *virtual path* is setup in each test:

```javascript
haunter.start('search/bootstrap', 'Search for bootstrap repo');
```

<br>
## Solving conflicts

When a conflict it's found, the viewer asks you which one is the correct version of that component.

<br><br>
![snap viewer](http://rubentd.com/haunterjs/img/conflict.gif "snap viewer")
<br><br>

So you can update the baseline screenshot, or fix possible visual inconsistencies.

<br><br>
![snap viewer](http://rubentd.com/haunterjs/img/choose-correct.png "snap viewer")
<br><br>

After solving the conflicts, you must commit the changes in your repo.


<br>
## API Documentation

####`haunter.start(hierarchy, description)`
Initialize components needed to run the test  
*Parameters*  
    `hierarchy {String}` A virtual path to organize the test  
    `description {String}` Description of the test
___

####`haunter.setViewports(viewports)`
Sets viewport dimensions for the test. Setup the viewport after calling the method start()  
*Parameters*  
    `viewports {Array}` Array of desired viewports. Each viewport has name, width and height)
___

####`haunter.setUserAgent(ua)`
Sets user agent for the test  
*Parameters*  
    `ua {String}` User Agent string
___

####`haunter.goToUrl(url)`
Navigate to that url  
*Parameters*  
    `url {String}` Destination url
___

####`haunter.snap(cssSelector, annotation, multiple)`
Take a screenshot with an annotation  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to capture  
    `annotation {String}` Comment for the screnshot
    `multiple {boolean}` Take screenshot in all the viewports?
___

####`haunter.snapExcluding(cssSelector, excludeSelector, annotation, multiple)`
Take a screenshot excluding an element  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to capture  
    `excludeSelector {String}` CSS selector of the element to exclude  
    `annotation {String}` Comment for the screnshot
    `multiple {boolean}` Take screenshot in all the viewports?
___

####`haunter.click(cssSelector)`
Click an element  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to click
___

####`haunter.sendKeys(cssSelector, keys)`
Type some text into an element  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to send keys to  
    `keys {String}` String of text to input in the element
___

####`haunter.pressEnter(cssSelector)`
Press enter key while focused on an element  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to focus
___

####`haunter.mouseover(cssSelector)`
Place the mouse over some element  
*Parameters*  
    `cssSelector {String}` CSS selector of the element to mouseover
___

####`haunter.uploadFile(cssSelector, filePath)`
Upload a file to the browser  
*Parameters*  
    `cssSelector {String}` CSS selector for the file input
    `filePath {String}` Path to the file to upload
___

####`haunter.evaluate(actions, params)`
Evaluate some js code on the browser
*Parameters*  
    `actions {function}` JavaScript code to evaluate
    `params {Object}` Params for the js evaluation
___

####`haunter.wait()`
Wait some time in ms. Masks casperjs wait
*Parameters*  
    `miliseconds {Number}` Time in miliseconds to wait
___

####`haunter.end()`
Proceed to compare the screenshots and figure out if there are errors
___


## Installation

haunterjs is available as a node package

```
npm install haunterjs
```
<br>

Start by setting up your configuration on the *config.js* file. Or just leave all the values by default.
Make sure the *viewerPort* configured in the config.js file matches the one in *www/js/app.js*

Run the demo tests with:
```
casperjs test demo-tests
```

Run the snap viewer with: 
```
node viewer.js
```
And then open http://localhost:[viewerPort] in your browser  


## Best practices

### Organize tests  
Using a tidy hierarchization, you can sort them by features, or modules within your webapp.  


### Take a look at [PhantomCSS best practices](https://github.com/Huddle/PhantomCSS#best-practices)   
Which I will summarize here:  
* Try not to use complex CSS3 selectors for asserting or creating screenshots. Prefer ids.
* Do not use these as a replacement for functional tests
* Don't try to test all the visuals
* Full page screenshots are a bad idea
