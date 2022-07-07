import clinicService from "../services/clinicService";

const createClinic = async (req, res) => {
  try {
    const data = await clinicService.createClinic(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getAllClinic = async (req, res) => {
  try {
    const data = await clinicService.getAllClinic();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getDetailClinicById = async (req, res) => {
  try {
    const data = await clinicService.getDetailClinicById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

module.exports = {
  createClinic,
  getAllClinic,
  getDetailClinicById,
};
