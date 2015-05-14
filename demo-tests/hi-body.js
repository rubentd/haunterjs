var haunter = require('../haunter.js');
haunter.start('sayhi/form', 'Say hi to a cat');
haunter.goToUrl('./demo-app/say-hi-to-cat.html');
haunter.snap('.col-md-6', 'Check out cat form');
haunter.sendKeys('#name', 'John Doe');
haunter.sendKeys('#message', 'Hello kitty');
haunter.snap('.col-md-6', 'Check out cat form with values in the fields');
haunter.end();