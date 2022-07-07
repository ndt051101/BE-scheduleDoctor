import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";


const buildUrlEmail = (doctorId, token) => {
  const result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;

  return result;
}

const postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.timeString ||
        !data.selectedGender ||
        !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        const token = uuidv4();

        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });
        const user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            gender: data.selectedGender,
            address: data.address,
            firstName: data.fullName,
          },
        });
        //create booking schudule
        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: { patientId: user[0].id },
            defaults: {
              statusId: "S1",
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token
            },
          });
        }

        resolve({
          errCode: 0,
          errMessage: "Save infor doctor successed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if(!data.doctorId || !data.token) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!"
        })
      }else {
        const appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId, 
            token: data.token,
            statusId: 'S1'
          },
          raw: false
        })

        if(appointment) {
          appointment.statusId = 'S2';
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the appointment successed!"
          })
        }else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist!"
          })
        }
      }
    } catch (error) {
      reject(error);
    }
  })
}

module.exports = {
  postBookAppointment,
  postVerifyBookAppointment,
};
