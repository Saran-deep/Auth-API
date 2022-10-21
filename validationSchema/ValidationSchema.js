const yup = require("yup");

const registrationSchema = yup.object({
  body: yup.object({
    username: yup.string().min(6).required(),
    password: yup.string().min(8).required(),
    email: yup.string().email().required(),
  }),
});

const loginSchema = yup.object({
  body: yup.object({
    password: yup.string().min(8).required(),
    email: yup.string().email().required(),
  }),
});

module.exports = {
  registrationSchema,
  loginSchema,
};
