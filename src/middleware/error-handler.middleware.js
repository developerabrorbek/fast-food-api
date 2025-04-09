import logger from "../config/winston.config.js";

function dublicateFieldError(err) {
  if (err?.code === 11000) {
    err.status = 409;
    err.isException = true;
    err.message = `Ushbu: "${Object.values(err.keyValue).join(
      ", "
    )}" qiymatlari allaqachon ishlatilgan`;
  }

  return err;
}

export const ErrorHandlerMiddleware = (err, req, res, __) => {
  logger.info(err);

  err = dublicateFieldError(err);

  if (err.isException) {
    return res.status(err.status).send({
      message: err.message,
    });

    // return res.redirect(`${req.url}?errorMsg=${err.message}`);
  }
  // console.log(err);
  res.status(500).send({
    message: "Internal Server Error",
  });
};
