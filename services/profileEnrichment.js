const { getGenderData } = require("./genderize");
const { getAgifyData } = require("./agify");
const { getNationalizeData } = require("./nationalize");

function createInvalidExternalApiError(externalApi) {
  const error = new Error(`${externalApi} returned an invalid response`);
  error.status = 502;
  return error;
}

function classifyAgeGroup(age) {
  if (age <= 12) {
    return "child";
  }else if(age <= 19) {
    return "teenager";
  }else if (age <= 59) {
    return "adult";
  }

  return "senior";
}

async function enrichProfile(name) {
  let genderizeData;
  let agifyData;
  let nationalizeData;

  try {
    [genderizeData, agifyData, nationalizeData] = await Promise.all([
      getGenderData(name),
      getAgifyData(name),
      getNationalizeData(name),
    ]);
  } catch (error) {
    error.status = 502;
    throw error;
  }

  if (genderizeData.gender === null || Number(genderizeData.count) === 0) {
    throw createInvalidExternalApiError("Genderize");
  }

  if (agifyData.age === null) {
    throw createInvalidExternalApiError("Agify");
  }

  if (!Array.isArray(nationalizeData.country) || nationalizeData.country.length === 0) {
    throw createInvalidExternalApiError("Nationalize");
  }

  const topCountry = nationalizeData.country.reduce((best, current) => {
    if (!best || current.probability > best.probability) {
      return current;
    }

    return best;
  }, null);

  return {
    gender: genderizeData.gender,
    gender_probability: Number(genderizeData.probability),
    sample_size: Number(genderizeData.count),
    age: Number(agifyData.age),
    age_group: classifyAgeGroup(Number(agifyData.age)),
    country_id: String(topCountry.country_id).toUpperCase(),
    country_probability: Number(topCountry.probability),
  };
}

module.exports = {
  enrichProfile,
};
