import doctorService from "../services/doctorService";

const getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 20;
  try {
    const doctors = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const postInforDoctor = async (req, res) => {
  try {
    const response = await doctorService.saveDetailInforDoctor(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getDetailDoctorById = async (req, res) => {
  try {
    const data = await doctorService.getDetailDoctorById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const bulkCreateSchedule = async (req, res) => {
  try {
    const data = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getScheduleDoctorByDate = async (req, res) => {
  try {
    const data = await doctorService.getDetailDoctorByDate(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getExtraInforDoctorById = async (req, res) => {
  try {
    const data = await doctorService.getExtraInforDoctorById(
      req.query.doctorId
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getProfileDoctorById = async (req, res) => {
  try {
    const data = await doctorService.getProfileDoctorById(req.query.doctorId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getListPatientsForDoctor = async (req, res) => {
  try {
    const data = await doctorService.getListPatientsForDoctor(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const sendRemedy = async (req, res) => {
  try {
    const data = await doctorService.sendRemedy(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

module.exports = {
  getTopDoctorHome,
  getAllDoctors,
  postInforDoctor,
  getDetailDoctorById,
  bulkCreateSchedule,
  getScheduleDoctorByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  getListPatientsForDoctor,
  sendRemedy,
};
