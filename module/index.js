const { request, gql } = require('graphql-request');
const config = require('./config.json');

const ensSearch = async inputKeyword => {
  try {
    const query = gql`
      query getInfo($keyword: String!) {
        domains(first: 9, where: { labelName_starts_with: $keyword }) {
          name
          labelName
          labelhash
          parent {
            name
          }
          subdomains {
            name
          }
          owner {
            id
            domains {
              name
            }
            registrations {
              labelName
              cost
              registrationDate
            }
          }
        }
      }
    `;

    return request({
      url: config.ens_url,
      document: query,
      variables: { keyword: inputKeyword }
    });
  } catch (err) {
    console.log(err);
  }
};

const collectionSearch = async (inputKeyword) => {
  try {
    const query = gql`
      query getInfo($keyword: String!) {
        nftContracts(first: 9, where: {name_starts_with: $keyword}) {
          id
          name
          type
          symbol
          numTokens
          numOwners
        }
      }
    `;

    return request({
      url: config.nft_owners_url,
      document: query,
      variables: { keyword: inputKeyword }
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  ensSearch,
  collectionSearch
};
