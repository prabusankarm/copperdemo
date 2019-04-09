var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var multer = require('multer');
var path = require('path');
module.exports = function (router,pool) {
    router.post('/authenticate', function (req, res) {
        console.log( JSON.stringify(req.body));
        // pool.on('error', function (err) {
        //     console.log(err)
        //     tempErrStatus = {status: 500, message: 'Database connection Failed'+err};
        //     console.log(tempErrStatus);
        //     res.json(tempErrStatus);
        //   });
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT ud.UserId,t.TenantId FROM dbo.UserDetail ud LEFT JOIN dbo.Tenant t ON ud.UserGroupId = t.UserGroupId WHERE Email =  @mail AND Password = @password", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    if(rows.length){
                        userObj = {};
                        for (i = 0; i < rows.length; i++) {
                            for (j = 0; j < rows[i].length; j++) {
                                userObj[rows[i][j].metadata.colName] = rows[i][j].value;
                            }
                        }
                        tempObj = {
                            status: "success",
                            userDetails: userObj
                        }
                    }else{
                        tempObj = {
                            status: "failed"
                        }
                    }                    
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('mail',  TYPES.NVarChar, req.body.email);
            request.addParameter('password', TYPES.NVarChar, req.body.password);
            connection.execSql(request);
        });
    });
}