const axios = require("axios");

async function getNationalizeData(name) {
  const response = await axios.get("https://api.nationalize.io", {
    params: { name },
    timeout: 5000,
  });

  return response.data;
}

module.exports = {
  getNationalizeData,
};
