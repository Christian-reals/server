function preventMultipleResponses(req, res, next) {
    if (res.headersSent) {
      return next(new Error('Headers have already been sent'));
    }
  
    res.once('finish', () => {
      if (!res.headersSent) {
        return next(new Error('Response was not sent'));
      }
    });
  
    next();
  }

  module.exports = preventMultipleResponses