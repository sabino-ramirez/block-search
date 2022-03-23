const inquirer = require('inquirer');
const blockSearch = require('../school/js_class/custom_node_modules/block-search/index.js');

let ensResponse;
let decentralandResponse;
let filterChoiceArr;

const newSearchPrompt = typeOfRestart => {
  if (typeOfRestart === 'fresh') {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'newSearchWord',
          message: 'Enter new search keyword: '
        }
      ])
      .then(input => {
        searchWithKeyword(input.newSearchWord);
      });
  } else {
    inquirer
      .prompt([
        {
          type: 'rawlist',
          name: 'newSearchChoice',
          message:
            'Nothing to find regarding <keyword>.' +
            '\n' +
            'What would you like to do next?',
          choices: ['New search', 'exit']
        }
      ])
      .then(answer => {
        if (answer.newSearchChoice === 'New search') {
          newSearchPrompt('fresh');
        } else {
          console.log('exiting...');
        }
      });
  }
};

const filtersPrompt = filterChoiceArr => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'filter',
        message: 'Select the type of results you want to see.',
        choices: filterChoiceArr
      }
    ])
    // decides what results to show based on filter selection
    .then(selection => {
      if (selection.filter === 'Domains') {
        const domainResults = [];
        domainResults.push(new inquirer.Separator('---Domain Results---'));
        for (const domain of ensResponse.domains) {
          domainResults.push(domain.name);
        }
        domainResults.push('Back to filter choices.');
        resultsPrompt(selection.filter, domainResults);
      } else if (selection.filter === 'Users') {
        const userResults = [];
        userResults.push(new inquirer.Separator('---Users---'));
        for (const user of ensResponse.domains) {
          userResults.push(user.labelName);
        }
        userResults.push('Back to filter choices.');
        resultsPrompt(selection.filter, userResults);
      }
    });
};

const resultsPrompt = (type, selectedFilterResults) => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'item',
        message: 'Select an item to learn more.',
        choices: selectedFilterResults
      }
    ])
    .then(selection => {
      if (selection.item === 'Back to filter choices.') {
        filtersPrompt(filterChoiceArr);
      } else if (type === 'Domains') {
        console.log(
          ensResponse.domains[selectedFilterResults.indexOf(selection.item) - 1]
        );
      } else if (type === 'Users') {
        console.log(
          ensResponse.domains[selectedFilterResults.indexOf(selection.item) - 1]
            .owner
        );
      }
    });
};

const searchWithKeyword = async inputKeyword => {
  try {
    ensResponse = await blockSearch.ensSearch(inputKeyword);
    filterChoiceArr = [];
    if (ensResponse.domains.length) filterChoiceArr.push('Domains', 'Users');

    if (filterChoiceArr.length) {
      filtersPrompt(filterChoiceArr);
    } else {
      newSearchPrompt('emptyResponse');
    }
  } catch (err) {
    return err;
  }
};

module.exports = {
  searchWithKeyword
};
