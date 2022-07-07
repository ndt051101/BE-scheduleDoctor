import db from "../models/index";
require("dotenv").config();

const createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        await db.Clinic.create({
          name: data.name,
          address: data.address,
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

const getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.Clinic.findAll({});

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

const getDetailClinicById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 0,
          errMessage: "Missing required parameters!",
        });
      } else {
        let data = await db.Clinic.findOne({
          where: {
            id: id,
          },
          attributes: ["name", "address", "descriptionHTML", "descriptionHTML"],
        });

        if (data) {
          let doctorClinic = [];
          doctorClinic = await db.Doctor_Infor.findAll({
            where: {
              clinicId: id,
            },
            attributes: ["doctorId", "provinceId"],
          });

          data.doctorClinic = doctorClinic;
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
  createClinic,
  getAllClinic,
  getDetailClinicById,
};
