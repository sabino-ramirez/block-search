const { request, GraphQLClient, gql } = require('graphql-request');
const config = require('./config.json');

const baseURL = config.ens_url;

// query ENS subgraph for domains regarding keyword
const ensSearch = async inputKeyword => {
  try {
    const query = gql`
      query getInfo($keyword: String!) {
        domains(first: 5, where: { labelName_starts_with: $keyword }) {
          name
          labelName
          labelhash
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

    // one way graphql-request allows us to make requests
    return request({
      url: config.ens_url,
      document: query,
      variables: { keyword: inputKeyword }
    });
  } catch (err) {
    return err;
  }
};

// const cryptoMediaSearch = async inputKeyword => {
//   try {
//     const endpoint = config.ens_url;
//     const variables = {
//       keyword: inputKeyword
//     };
//     const query = gql``;
//   } catch (err) {
//     return err;
//   }
// };

module.exports = {
  ensSearch
};
