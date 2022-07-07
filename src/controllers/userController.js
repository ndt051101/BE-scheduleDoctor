import userService from "../services/userService";

const handleLogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "Missing input parameter!",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  console.log(userData);

  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {},
  });
};

const handleCreateNewUser = async (req, res) => {
  const message = await userService.createNewUser(req.body);
  return res.status(200).json(message);
};

const getAllCode = async (req, res) => {
  try {
    setTimeout(async () => {
      let data = await userService.getAllCodeService(req.query.type);
      return res.status(200).json(data);
    }, 5000);
  } catch (error) {
    console.log("Get all code error: " + error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const handleGetAllUsers = async (req, res) => {
  let id = req.query.id;

  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters",
      users: [],
    });
  }
  let users = await userService.getAllUsers(id);
  console.log(users);
  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

const handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters",
    });
  }
  const message = await userService.deleteUser(req.body.id);
  return res.status(200).json(message);
};

const handleEditUser = async (req, res) => {
  const data = req.body;
  const message = await userService.updateUser(data);
  return res.status(200).json(message);
};

module.exports = {
  handleLogin,
  getAllCode,
  handleCreateNewUser,
  handleGetAllUsers,
  handleEditUser,
  handleDeleteUser,
};
