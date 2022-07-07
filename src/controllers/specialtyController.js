import specialtyService from "../services/specialtyService";

const createSpecialty = async (req, res) => {
  try {
    const data = await specialtyService.createSpecialty(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getAllSpecialty = async (req, res) => {
  try {
    const data = await specialtyService.getAllSpecialty();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error the server...",
    });
  }
};

const getDetailSpecialtyById = async (req, res) => {
  try {
    const data = await specialtyService.getDetailSpecialtyById(
      req.query.id,
      req.query.location
    );
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
  createSpecialty,
  getAllSpecialty,
  getDetailSpecialtyById,
};
