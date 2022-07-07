import db from "../models/index";
import CRUDService from "../services/CRUDService";

const getHomePage = async (req, res) => {
  try {
    // let data = await db.User.findAll();
    return res.render("homepage.ejs", {
      data: JSON.stringify(),
    });
  } catch (e) {
    console.error(e);
  }
};

const getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

const postCRUD = async (req, res) => {
  const message = await CRUDService.createNewUser(req.body);
  console.log(message);
  return res.send("Data from service!");
};

const displayGetCRUD = async (req, res) => {
  const data = await CRUDService.getAllData();
  return res.render("displayCRUD.ejs", {
    data: data,
  });
};

const getEditCRUD = async (req, res) => {
  const userId = req.query.id;
  if (userId) {
    const userData = await CRUDService.getUserInfoById(userId);
    //check data not found!
    return res.render("editCRUD.ejs", {
      user: userData,
    });
  }

  return res.send("Not Found!");
};

const putCRUD = async (req, res) => {
  const data = req.body;
  const allUsers = await CRUDService.updateUserData(data);
  return res.render("displayCRUD.ejs", {
    data: allUsers,
  });
};

const deleteCRUD = async (req, res) => {
  const id = req.query.id;
  if (id) {
    await CRUDService.deleteUserById(id);
    return res.send("Deleted successfully");
  } else {
    return res.send("User not found!");
  }
};

module.exports = {
  getHomePage,
  getCRUD,
  postCRUD,
  displayGetCRUD,
  getEditCRUD,
  putCRUD,
  deleteCRUD,
};
