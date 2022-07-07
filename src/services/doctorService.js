import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import _ from "lodash";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

const getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await db.User.findAll({
        limit: limit,
        order: [["createdAt", "DESC"]],
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const checkRequiredField = (inputData) => {
  const arrField = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId",
  ];

  let isValid = true;
  let element = "";

  for (let i = 0; i < arrField.length; i++) {
    if (!inputData[arrField[i]]) {
      isValid = false;
      element = arrField[i];
      break;
    }
  }

  return {
    isValid,
    element,
  };
};

const saveDetailInforDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkObj = checkRequiredField(data);
      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameters ${checkObj.element}`,
        });
      } else {
        //upsert to Markdown
        if (data.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: data.contentHTML,
            contentMarkdown: data.contentMarkdown,
            description: data.description,
            doctorId: data.doctorId,
          });
        }

        if (data.action === "EDIT") {
          const doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: data.doctorId },
            raw: false,
          });

          console.log(doctorMarkdown);

          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = data.contentHTML;
            doctorMarkdown.contentMarkdown = data.contentMarkdown;
            doctorMarkdown.description = data.description;
            doctorMarkdown.updatedAt = new Date();
            await doctorMarkdown.save();
          }
        }

        //upsert to Doctor Information
        const doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: data.doctorId,
          },
          raw: false,
        });

        if (doctorInfor) {
          //UPDATE
          doctorInfor.doctorId = data.doctorId;
          doctorInfor.priceId = data.selectedPrice;
          doctorInfor.provinceId = data.selectedProvince;
          doctorInfor.paymentId = data.selectedPayment;
          doctorInfor.addressClinic = data.addressClinic;
          doctorInfor.nameClinic = data.nameClinic;
          doctorInfor.note = data.note;
          doctorInfor.specialtyId = data.specialtyId;
          doctorInfor.clinicId = data.clinicId;

          await doctorInfor.save();
        } else {
          //CREATE
          await db.Doctor_Infor.create({
            doctorId: data.doctorId,
            priceId: data.selectedPrice,
            provinceId: data.selectedProvince,
            paymentId: data.selectedPayment,
            addressClinic: data.addressClinic,
            nameClinic: data.nameClinic,
            note: data.note,
            specialtyId: data.specialtyId,
            clinicId: data.clinicId,
          });
        }

        resolve({
          errCode: 0,
          errMessage: "Save Infor doctor success!!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailDoctorById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters...",
        });
      } else {
        const data = await db.User.findOne({
          where: { id: id },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentMarkdown", "contentHTML"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.date) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameters",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: "" + data.date },
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });

        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailDoctorByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        const data = await db.Schedule.findAll({
          where: { doctorId: doctorId, date: date },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) data = [];

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getExtraInforDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        const data = await db.Doctor_Infor.findOne({
          model: db.Doctor_Infor,
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getProfileDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        const data = await db.User.findOne({
          where: { id: doctorId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentMarkdown", "contentHTML"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
              raw: false,
              nest: true,
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getListPatientsForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        const data = await db.Booking.findAll({
          where: {
            doctorId: doctorId,
            date: date,
            statusId: "S2",
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["email", "firstName", "address", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });

        resolve({
          errCode: 0,
          data: data,
          errMessage: "Get Patient Successfully!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const sendRemedy = (data) => {
  return new Promise(async(resolve, reject) => {
    try {
      if(!data.email || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      }else {
        const appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });

        if(appointment) {
          appointment.statusId = 'S3';
          await appointment.save();
        }

        await emailService.sendAttachment(data);

        resolve({
          errCode: 0,
          data: data,
          errMessage: "Update Status Successfully!",
        });
      }
    } catch (error) {
      reject(error);
    }
  })
}

module.exports = {
  getTopDoctorHome,
  getAllDoctors,
  saveDetailInforDoctor,
  getDetailDoctorById,
  bulkCreateSchedule,
  getDetailDoctorByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  getListPatientsForDoctor,
  sendRemedy,
};
