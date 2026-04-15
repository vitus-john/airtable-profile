const axios = require("axios");

async function getAgifyData(name) {
  const response = await axios.get("https://api.agify.io", {
    params: { name },
    timeout: 5000,
  });

  return response.data;
}

module.exports = {
  getAgifyData,
};
