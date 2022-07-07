import patientService from '../services/patientService';

const postBookAppointment = async (req, res) => {
  try {
    const data = await patientService.postBookAppointment(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const postVerifyBookAppointment = async (req, res) => {
  try {
    const data = await patientService.postVerifyBookAppointment(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
}

module.exports = {
  postBookAppointment,
  postVerifyBookAppointment,
};
