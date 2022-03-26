const inquirer = require('inquirer');
const { Table } = require('console-table-printer');
const blockSearch = require('../module/index.js');

let ensResponse, collectionResponse;
let decentralandResponse;
let filterChoiceArr;

const _newSearchPrompt = typeOfRestart => {
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
            'Welp. End of the road.' + '\n' + 'What would you like to do next?',
          choices: ['New search', 'exit']
        }
      ])
      .then(answer => {
        if (answer.newSearchChoice === 'New search') {
          _newSearchPrompt('fresh');
        } else {
          console.log('exiting...');
        }
      });
  }
};

const _filtersPrompt = filterChoiceArr => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'filter',
        message: 'Select the type of results you want to see.',
        choices: filterChoiceArr
      }
    ])
    .then(selection => {
      switch (selection.filter) {
        case 'Domains':
          const domainResults = [];
          for (const domain of ensResponse.domains) {
            domainResults.push(domain.name);
          }
          _resultsPrompt(selection.filter, domainResults);
          break;

        case 'Users':
          const userResults = [];
          for (const user of ensResponse.domains) {
            userResults.push(user.labelName);
          }
          _resultsPrompt(selection.filter, userResults);
          break;

        case 'Collections':
          const collectionResults = [];
          for (const collection of collectionResponse.nftContracts) {
            collectionResults.push(collection.name);
          }
          _resultsPrompt(selection.filter, collectionResults);
          break;
      }
    });
};

const _resultsPrompt = (type, selectedFilterResults) => {
  const table = new Table({
    columns: [
      { name: 'Index', alignment: 'right' },
      { name: type, alignment: 'left' }
    ]
  });
  let counter = 1;
  for (const listItem of selectedFilterResults) {
    table.addRow({
      Index: counter,
      [type]: listItem
    });
    counter++;
  }
  table.addRow({ Index: 0, [type]: 'Back to filters' });
  table.printTable();

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'item',
        message: 'Enter an index value to learn more.',
        validate(input) {
          if (parseInt(input) <= 9) {
            return true;
          }
          throw Error('Invalid selection.');
        }
      }
    ])
    .then(selection => {
      if (selection.item === '0') {
        _filtersPrompt(filterChoiceArr);
      } else {
        switch (type) {
          case 'Domains':
            _displayInfo(type, ensResponse.domains[selection.item - 1]);
            break;
          case 'Users':
            _displayInfo(type, ensResponse.domains[selection.item - 1].owner);
            break;
          case 'Collections':
            _displayInfo(
              type,
              collectionResponse.nftContracts[selection.item - 1]
            );
            break;
        }
      }
    });
};

const _displayInfo = (type, info) => {
  const table = new Table({
    columns: [
      { name: 'Name', alignment: 'center' },
      { name: 'Hash', alignment: 'center' },
      { name: 'Owner Hash', alignment: 'center' },
      { name: 'Subdomains', alignment: 'center' }
    ]
  });
  switch (type) {
    case 'Domains':
      // table.printTable();
      console.log(info);
      _newSearchPrompt('End');
      break;
    case 'Users':
      console.log(info);
      _newSearchPrompt('End');
      break;
    case 'Collections':
      console.log(info);
      _newSearchPrompt('End');
      break;
    default:
      console.log('what is that');
  }
};

const searchWithKeyword = async inputKeyword => {
  try {
    ensResponse = await blockSearch.ensSearch(inputKeyword);
    // collectionResponse = await blockSearch.collectionSearch(inputKeyword);
    filterChoiceArr = [];

    if (ensResponse.domains.length) filterChoiceArr.push('Domains', 'Users');
    // if (collectionResponse.nftContracts.length)
    //   filterChoiceArr.push('Collections');

    if (filterChoiceArr.length) {
      _filtersPrompt(filterChoiceArr);
    } else {
      _newSearchPrompt('emptyResponses');
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  searchWithKeyword
};
