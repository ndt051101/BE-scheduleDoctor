import db from "../models/index";
require("dotenv").config();

const createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        await db.Specialty.create({
          name: data.name,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });

        resolve({
          errCode: 0,
          errMessage: "Create Specialty Successfully!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.Specialty.findAll({});

      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, "base64").toString("binary");
          return item;
        });
      }

      resolve({
        errCode: 0,
        errMessage: "Get Data Successfully!",
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailSpecialtyById = (id, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id || !location) {
        resolve({
          errCode: 0,
          errMessage: "Missing required parameters!",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: {
            id: id,
          },
          attributes: ["descriptionHTML", "descriptionHTML"],
        });

        if (data) {
          let doctorSpecialty = [];
          if (location === "ALL") {
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: {
                specialtyId: id,
              },
              attributes: ["doctorId", "provinceId"],
            });
          } else {
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: {
                specialtyId: id,
                provinceId: location,
              },
              attributes: ["doctorId", "provinceId"],
            });
          }
          data.doctorSpecialty = doctorSpecialty;
          
        } else data = {};
        resolve({
          errCode: 0,
          errMessage: "Get Data Successfully!",
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createSpecialty,
  getAllSpecialty,
  getDetailSpecialtyById,
};
