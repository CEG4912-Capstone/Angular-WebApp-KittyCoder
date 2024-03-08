const db = require("../db/conn");
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.userName) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a User
  const user = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    avatar: req.body.avatar,
  };

  // Save User in the database
  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

// Find a single User with an email
exports.findOne = (req, res) => {
  const email = req.params.email;

  User.findOne({ where:
      {
        email: email
      }
  })
    .then(data => {
      res.send(data);
    })
    .catch(() => {
      res.status(500).send({
        message: "Error retrieving User with email=" + email
      });
    });
};

// Find a single User with username
exports.findUser = (req, res) => {
  const userName = req.params.userName;

  User.findOne({ where:
      {
        userName: userName
      }
  })
    .then(data => {
      res.send(data);
    })
    .catch(() => {
      res.status(500).send({
        message: "Error retrieving User with email=" + email
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {

      if (num === "1") {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(() => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num === "1") {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(() => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Retrieve all Tasks from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  User.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tasks."
      });
    });
};
