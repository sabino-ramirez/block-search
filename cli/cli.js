const yargs = require('yargs');
const app = require('./app.js');

yargs(process.argv.slice(2))
  .command(
    'search <keyword>',
    'get info from blockchain',
    yargs => {
      return yargs.positional('keyword', {
        describe: 'the keyword to search by',
        type: 'string'
      });
    },
    arg => {
      app.searchWithKeyword(arg.keyword);
      // console.log(arg.keyword);
    }
  )
  .alias('h', 'help').argv;
