const notFoundPage = (req, res, next) => res.status(404).json({ msg: "404 error, page not found" });
module.exports = notFoundPage;