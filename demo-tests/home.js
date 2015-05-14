var haunter = require('../haunter.js');
haunter.start('home', 'Take a look at the home page');
haunter.snap('.jumbotron', 'Make sure Hello World message is correct');
haunter.click('.dropdown-toggle');
haunter.snap('.dropdown-menu', 'Open dropdown menu');
haunter.sendKeys('#search', 'How to cat');
haunter.snap('#search', 'Write something on the search field');
haunter.end();