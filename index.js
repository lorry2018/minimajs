try {
    require('babel-core/register')({
        ignore: /node_modules\/(?!minimajs)/
    });
} catch (error) {
    // Ignore the error.
}

module.exports = require('./src/Minima.js');