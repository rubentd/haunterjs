![logo](http://rubentd.com/haunterjs/img/icon.png "logo") 
# haunterjs
[![npm version](https://badge.fury.io/js/haunterjs.svg)](http://badge.fury.io/js/haunterjs) [![Build Status](https://travis-ci.org/rubentd/haunterjs.svg)](https://travis-ci.org/rubentd/haunterjs)

## Table of Contents
* [About haunterjs](#about-haunterjs)
* [Taking snaps](#taking-snaps)
* [Snap viewer](#snap-viewdeving-conflicts)
* [API documentation](#api-documentation)
* [Installation](#installation)


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

**start()**  
Initializes the test, saving a **hierarchy** or virtual path, and a **description** for the test.
```javascript
haunter.start(hierarchy, description)
```
<br>

**setViewport()**  
Sets up the width and height, to emulate different screen resolutions.
```javascript
haunter.setViewport(width, height)
```
<br>

**setUserAgent()**  
Sets up the user agent, to emulate different devices.
```javascript
haunter.setUserAgent(ua)
```
<br>

**goToUrl()**  
Go to a given url. (If you don't use this method, the test will start in the default url defined in the config.js file)
```javascript
haunter.goToUrl(url)
```
<br>

**snap()**  
Saves a **snap**. Which is a screenshot of the given selector, with an annotation.
```javascript
haunter.snap(cssSelector, annotation)
```
<br>

**snapExcluding()**  
Saves a **snap**, excluding a given cssSelector from the picture.
```javascript
haunter.snapExcluding(cssSelector, excludeSelector, annotation)
```
<br>

**click()**  
Clicks the selected element, eg. a link or a button.
```javascript
haunter.click(cssSelector)
```
<br>

**sendKeys()**  
Sets up an string as input for a given element. Eg a test input element.
```javascript
haunter.sendKeys(cssSelector, keys)
```
<br>

**pressEnter()**  
Press enter key in a given element.  Shortcut for:   sendKeys(cssSelector, casper.page.event.key.Enter , {keepFocus: true});
```javascript
haunter.pressEnter(cssSelector)
```
<br>

**exec()**  
Run a command syncronously, for example to load some data before the test
```javascript
haunter.exec(command, [args])
```
<br>

**end()**  
Finish the test and compare results.
```javascript
haunter.end()
```


<br>
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
