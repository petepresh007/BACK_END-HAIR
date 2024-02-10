const { BadRequestError } = require("../errors");
const { body, validationResult } = require("express-validator");

const validateUsernamePassword = (field, min, max) => {
    return [
        body(field)
            .isLength({ min, max })
            .withMessage(`${field} must be within ${min} and ${max} characters`),
    ]
};

const validateEmail = (email) => {
    return [
        body(email)
            .isEmail().withMessage(`the email provided is not a valid email`)
    ]
}

const validateRegistration = [
    ...validateUsernamePassword("username", 4, 12),
    ...validateUsernamePassword("password", 8, 12),
    ...validateEmail("email"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //throw new BadRequestError({ errors: errors.array() })
            /**MAPPING THROUGH ERRORS*/
            // const Err = errors.array().map(err => {
            //     console.log(Object.keys(err));
            // })

            return res.status(400).json({ errors: errors.array() })
        }
        next();
    },
];

module.exports = { validateUsernamePassword, validateRegistration };