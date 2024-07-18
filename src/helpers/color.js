const chalk = require('chalk');

/**
 * Applies color to the given text.
 * @param {string} text - The text to be colored.
 * @param {string} [color] - The color to apply. If not provided, defaults to green.
 * @returns {string} The colored text.
 */
function color(text, color) {
    return !color ? chalk.green(text) : chalk.keyword(color)(text);
}

module.exports = color;