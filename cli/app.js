const inquirer = require('inquirer');
const { Table } = require('console-table-printer');
const chalk = require('chalk');
const blockSearch = require('../module/index.js');

let ensResponse, collectionResponse;
let decentralandResponse;
let filterChoiceArr;
const tableBorderStyle = {
  headerTop: {
    left: '╔',
    mid: '╦',
    right: '╗',
    other: '═'
  },
  headerBottom: {
    left: '╟',
    mid: '╬',
    right: '╢',
    other: '═'
  },
  tableBottom: {
    left: '╚',
    mid: '╩',
    right: '╝',
    other: '═'
  },
  vertical: '║'
};

const _newSearchPrompt = typeOfRestart => {
  if (typeOfRestart === 'fresh') {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'newSearchWord',
          message: chalk.magenta('Enter new search keyword: ')
        }
      ])
      .then(input => {
        searchWithKeyword(input.newSearchWord);
      });
  } else {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'newSearchChoice',
          message: chalk.magenta(
            'End of the road.' + '\n' + 'What would you like to do next?'
          ),
          choices: ['New search', 'exit']
        }
      ])
      .then(answer => {
        if (answer.newSearchChoice === 'New search') {
          _newSearchPrompt('fresh');
        } else {
          console.log(chalk.redBright('exiting...'));
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
        message: chalk.magenta('Select the type of results you want to see.'),
        choices: filterChoiceArr
      }
    ])
    .then(selection => {
      const results = [];
      switch (selection.filter) {
        case 'Domains':
          for (const domain of ensResponse.domains) {
            results.push(chalk.blue(domain.name));
          }
          _resultsPrompt(selection.filter, results);
          break;

        case 'Users':
          for (const user of ensResponse.domains) {
            results.push(chalk.blue(user.labelName));
          }
          _resultsPrompt(selection.filter, results);
          break;

        case 'Collections':
          for (const collection of collectionResponse.nftContracts) {
            results.push(chalk.blue(collection.name));
          }
          _resultsPrompt(selection.filter, results);
          break;
      }
    });
};

const _resultsPrompt = (type, selectedFilterResults) => {
  const table = new Table({
    style: tableBorderStyle,
    columns: [
      { name: 'Index', alignment: 'right' },
      { name: type, alignment: 'left' }
    ]
  });
  let counter = 1;
  for (const listItem of selectedFilterResults) {
    table.addRow({
      Index: counter + '.' + chalk.gray(' ->'),
      [type]: listItem
    });
    counter++;
  }
  table.addRow({
    Index: chalk.green('0. ->'),
    [type]: chalk.green('Back to filters')
  });
  table.printTable();

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'item',
        message: chalk.magenta('Enter an index value to learn more.'),
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
          case 'Users':
            _displayInfo(type, ensResponse.domains[selection.item - 1]);
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
  let table;
  switch (type) {
    case 'Domains':
      table = new Table({
        style: tableBorderStyle,
        title: chalk.red('Selected Domain'),
        columns: [
          { name: 'Name', alignment: 'center' },
          { name: 'Parent', alignment: 'center' },
          { name: 'Owner Hash', alignment: 'center' },
          { name: 'Subdomains', alignment: 'center' }
        ]
      });
      table.addRow({
        Name: chalk.green(info.name),
        Parent: chalk.gray(info.parent.name),
        'Owner Hash': chalk.green(info.owner.id),
        Subdomains: info.subdomains.length
          ? chalk.green(info.subdomains.length)
          : chalk.red('0')
      });
      table.printTable();
      _newSearchPrompt('End');
      break;
    case 'Users':
      table = new Table({
        style: tableBorderStyle,
        title: info.labelName,
        columns: [
          { name: 'User Hash', alignment: 'center' },
          { name: 'Domains', alignment: 'center' },
          { name: 'Registrations', alignment: 'center' },
          { name: 'Owns Property', alignment: 'center' }
        ]
      });
      table.addRow({
        'User Hash': chalk.green(info.owner.id),
        Domains: chalk.gray(info.owner.domains.length),
        Registrations: info.owner.registrations.length
          ? chalk.gray(info.owner.registrations.length)
          : chalk.red('0'),
        'Owns Property': chalk.red('no')
      });
      table.printTable();
      _newSearchPrompt('End');
      break;
    case 'Collections':
      table = new Table({
        style: tableBorderStyle,
        title: info.labelName,
        columns: [
          { name: 'Name', alignment: 'center' },
          { name: 'Symbol', alignment: 'center' },
          { name: 'Type', alignment: 'center' },
          { name: 'Total Amount', alignment: 'center' },
          { name: 'Total Owners', alignment: 'center' }
        ]
      });
      table.addRow({
        Name: chalk.green(info.name),
        Symbol: chalk.gray(info.symbol),
        Type: chalk.gray(info.type),
        'Total Amount': chalk.blue(info.numTokens),
        'Total Owners':
          parseInt(info.numOwners) > 0
            ? chalk.blue(info.numOwners)
            : chalk.red(info.numOwners)
      });
      table.printTable();
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
