
var serviceAuth = (req, res, next) => {
    const token = process.env.SERVICE_TRIGGER_TOKEN;
    //const requestToken = req.body.requestToken; //0206a31c-e032-44e6-98a1-7ac40abef233
    const requestToken = req.params.token; //0206a31c-e032-44e6-98a1-7ac40abef233
  
    if(token === requestToken){
      next();
    }
    else{
      const error = new Error(`Service token didn't match`);
      error.status = 401;
      throw error;
    }
  
  }

  module.exports =  serviceAuth;