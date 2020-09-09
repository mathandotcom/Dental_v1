var path = require('path');
var fs = require('fs');

module.exports = (function () {
    const __dirname = path.resolve();
    var rootDir = path.dirname(require.main.filename || process.mainModule.filename).replace('bin','');
    var pathname = 'public/uploads';
    /*
    fs.mkdir(path.resolve(__dirname, pathname), { recursive: true }, e => {
        if (e) {
            console.error(e);
            throw e;
        } else {
            console.log('Success: uploads folder was created');
            var imageFolder = path.join(__dirname, pathname);
            return imageFolder;
        }
    });
    */
   if (!fs.existsSync(pathname)){
        fs.mkdir(path.resolve(__dirname, pathname), { recursive: true }, err => {
            if (err) throw err;
        });
    }else
    {
        console.log("Directory already exist");
    }
    var imageFolder = path.join(__dirname, pathname);
    return imageFolder;

})();