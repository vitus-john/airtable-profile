const { v7: uuidv7 } = require("uuid");

const Profile = require("../models/Profile");
const { enrichProfile } = require("../services/profileEnrichment");
const { errorResponse } = require("../utils/response");

function formatProfile(profileDocument) {
  const profile = profileDocument.toObject ? profileDocument.toObject() : profileDocument;

  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.gender_probability,
    sample_size: profile.sample_size,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
    country_probability: profile.country_probability,
    created_at: new Date(profile.created_at).toISOString(),
  };
}

function formatListProfile(profileDocument) {
  const profile = profileDocument.toObject ? profileDocument.toObject() : profileDocument;

  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
  };
}

async function createProfile(req, res) {
  try {
    const name = req.body.name.trim();
    const normalizedName = name.toLowerCase();

    const existingProfile = await Profile.findOne({ normalized_name: normalizedName });
    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existingProfile),
      });
    }

    const enrichedProfile = await enrichProfile(normalizedName);

    const createdProfile = await Profile.create({
      id: uuidv7(),
      name: normalizedName,
      normalized_name: normalizedName,
      ...enrichedProfile,
      created_at: new Date(),
    });

    return res.status(201).json({
      status: "success",
      data: formatProfile(createdProfile),
    });
  } catch (error) {
    if (error.code === 11000) {
      const normalizedName = String(req.body.name || "").trim().toLowerCase();
      const existingProfile = await Profile.findOne({ normalized_name: normalizedName });

      if (existingProfile) {
        return res.status(200).json({
          status: "success",
          message: "Profile already exists",
          data: formatProfile(existingProfile),
        });
      }
    }

    if (error.status === 502) {
      if (error.message.includes("returned an invalid response")) {
        return res.status(502).json(errorResponse(error.message));
      }

      return res.status(502).json(errorResponse("External API request failed"));
    }

    return res.status(500).json(errorResponse("Internal server error"));
  }
}

async function getProfileById(req, res) {
  try {
    const profile = await Profile.findOne({ id: req.params.id });

    if (!profile) {
      return res.status(404).json(errorResponse("Profile not found"));
    }

    return res.status(200).json({
      status: "success",
      data: formatProfile(profile),
    });
  } catch (error) {
    return res.status(500).json(errorResponse("Internal server error"));
  }
}

async function listProfiles(req, res) {
  try {
    const filter = {};

    const filterableFields = ["gender", "country_id", "age_group"];

    for (const field of filterableFields) {
      const value = req.query[field];

      if (typeof value === "string" && value.trim().length > 0) {
        filter[field] = new RegExp(`^${value.trim()}$`, "i");
      }
    }

    const profiles = await Profile.find(filter)
      .sort({ created_at: -1 })
      .select("id name gender age age_group country_id");

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles.map(formatListProfile),
    });
  } catch (error) {
    return res.status(500).json(errorResponse("Internal server error"));
  }
}

async function deleteProfile(req, res) {
  try {
    const deletedProfile = await Profile.findOneAndDelete({ id: req.params.id });

    if (!deletedProfile) {
      return res.status(404).json(errorResponse("Profile not found"));
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json(errorResponse("Internal server error"));
  }
}

module.exports = {
  createProfile,
  getProfileById,
  listProfiles,
  deleteProfile,
};
