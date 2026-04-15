const axios = require("axios");

async function getGenderData(name) {
  const response = await axios.get("https://api.genderize.io", {
    params: { name },
    timeout: 5000,
  });

  return response.data;
}

module.exports = {
  getGenderData,
};