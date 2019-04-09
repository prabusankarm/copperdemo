var express = require('express');
var router = express.Router();
var moment = require('moment');
var sendRequest = require('request');
var ConnectionPool = require('tedious-connection-pool');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');
var multer = require('multer');
var path = require('path');
var configJson = require('../../config/widgetsConfig');
var restRequest = require('request');
var querystring = require('querystring');
var http = require('http');  
var spauth = require('node-sp-auth');  
var request = require('request-promise'); 
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, 'client/uploads')
        },
        filename: function (req, file, callback) {
            console.log(req.body.name)
            callback(null, file.originalname.split(".")[0] + path.extname(file.originalname))
        }
    })
});

module.exports = function (router, pool) {
    router.post('/upload-dashboard-image', upload.single('dashboardPic'), function (req, res, next) {
        res.send(req.file.path);
    });

    router.post('/create-new-dashboard', function (req, res) {
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("INSERT dbo.Dashboard (DashboardName,LastUpdatedTime) VALUES (@dashboardName,@updateTime);select @@identity", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.release();
                }
            });
            // request.addParameter('userID', TYPES.Int, parseInt(req.body.userId));
            request.addParameter('dashboardName', TYPES.NVarChar, req.body.dashboardName);
            request.addParameter('updateTime', TYPES.DateTime2, new Date());
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("id of inserted item is " + column.value);
                        tempObj = {
                            status: "success",
                            dashboardId: column.value
                        }
                        insertUserDashboard(req.body.userId, column.value);
                        insertDashboardPreference(req.body.userId, column.value);
                        insertWidget(tempObj, req.body.userId);
                    }
                });
            });
            connection.execSql(request);
        });
        function insertUserDashboard(userId, DashboardId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.UserDashboard (UserId,DashboardId) VALUES (@userId,@dashboardId);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, DashboardId);
                connection.execSql(request);
            });
        }
        function insertDashboardPreference(userId, DashboardId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.DashboardPreference (UserId,DashboardId,DashboardPreferenceJson,DefaultDashboard) VALUES (@userId,@dashboardId,@preference,'false');select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, DashboardId);
                request.addParameter('preference', TYPES.NVarChar, JSON.stringify({}));
                connection.execSql(request);
            });
        }
        function insertWidget(obj, userId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.DashboardWidgets (DashboardId,DashboardWidgetsJson) VALUES (@dashboardID,@dashboardWidget);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                    }
                });
                request.addParameter('dashboardID', TYPES.Int, parseInt(obj.dashboardId));
                request.addParameter('dashboardWidget', TYPES.NVarChar, JSON.stringify([]));
                request.on('row', function (columns) {
                    columns.forEach(function (column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            obj.widgetId = column.value;
                            insertWidgetPreference(obj, userId)
                        }
                    });
                });
                connection.execSql(request);
            });
        }
        function insertWidgetPreference(obj, userId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.WidgetPreference (UserId,DashboardId,WidgetsId,WidgetPreferenceJson) VALUES (@userId,@dashboardId,@widgetId,@preference);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        res.json(obj);
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, obj.dashboardId);
                request.addParameter('widgetId', TYPES.Int, obj.widgetId);
                request.addParameter('preference', TYPES.NVarChar, JSON.stringify({}));
                connection.execSql(request);
            });
        }
    });

    router.post('/dashboard-list/', function (req, res) {
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT d.DashboardId,d.DashboardName,dw.WidgetsId,dw.DashboardWidgetsJson,dp.DefaultDashboard,dp.DashboardPreferenceJson,wp.WidgetPreferenceJson FROM dbo.Dashboard d LEFT JOIN dbo.DashboardWidgets dw ON d.DashboardId = dw.DashboardId LEFT JOIN dbo.UserDashboard ud ON d.DashboardId = ud.DashboardId LEFT JOIN dbo.DashboardPreference dp ON d.DashboardId = dp.DashboardId LEFT JOIN dbo.WidgetPreference wp ON wp.DashboardId = ud.DashboardId WHERE ud.UserId = @id ORDER BY d.LastUpdatedTime DESC", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    // res.json(rows)
                    dashboardObj = {};
                    dashboardArr = [];
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < rows[i].length; j++) {
                            dashboardObj[rows[i][j].metadata.colName] = rows[i][j].value;
                        }
                        dashboardArr.push(dashboardObj);
                        dashboardObj = {};
                    }
                    tempObj = {
                        status: "success",
                        dashboardList: dashboardArr
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.userId);
            connection.execSql(request);
        });
    });

    router.get('/dashboard-widget-list/:id', function (req, res) {
        var id = parseInt(req.params.id);
        if(id){
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("SELECT * FROM DashboardWidgets dw LEFT JOIN Dashboard d on dw.DashboardId = d.DashboardId WHERE dw.DashboardId = @id ", function (err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        widgetsObj = {};
                        for (i = 0; i < rows.length; i++) {
                            for (j = 0; j < rows[i].length; j++) {
                                widgetsObj[rows[i][j].metadata.colName] = rows[i][j].value;
                            }
                        }
                        tempObj = {
                            status: "success",
                            widgets: widgetsObj
                        }
                        res.json(tempObj);
                        connection.release();
                    }
                });
                request.addParameter('id', TYPES.Int, id);
                connection.execSql(request);
            });
        }      
    });

    router.post('/save-dashboard', function (req, res) {
        console.log(req.body)
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("UPDATE dw SET dw.DashboardWidgetsJson = @widgets FROM dbo.DashboardWidgets dw LEFT JOIN dbo.UserDashboard ud ON ud.DashboardId = dw.DashboardId WHERE dw.DashboardId = @id and dw.WidgetsId = @widgetsId and ud.UserId = @userId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    tempObj = {
                        status: "success"
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.dashboardId);
            request.addParameter('userId', TYPES.Int, req.body.userId);
            request.addParameter('widgetsId', TYPES.Int, req.body.dashboardWidgetId);
            request.addParameter('widgets', TYPES.NVarChar, JSON.stringify(req.body.dashboardWidgets));
            connection.execSql(request);
        });
    });

    router.post('/save-dashboard-accesstime', function (req, res) {
        console.log(new Date());
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("UPDATE d SET LastUpdatedTime = @updateTime FROM dbo.Dashboard d LEFT JOIN dbo.UserDashboard ud ON ud.DashboardId = d.DashboardId WHERE d.DashboardId =@id and ud.UserId = @userId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    tempObj = {
                        status: "success"
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.id);
            request.addParameter('userId', TYPES.Int, req.body.userId);
            request.addParameter('updateTime', TYPES.DateTime2, new Date());
            connection.execSql(request);
        });
    });

    router.post('/widget-preference-update',function(req,res){
        console.log(req.body);
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("UPDATE WidgetPreference SET WidgetPreferenceJson = @preferenceJson WHERE DashboardId =@id and UserId = @userId and WidgetsId = @widgetId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    tempObj = {
                        status: "success"
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.dashboardId);
            request.addParameter('userId', TYPES.Int, req.body.userId);
            request.addParameter('preferenceJson', TYPES.VarChar, req.body.widgetsPreferenceJson);
            request.addParameter('widgetId', TYPES.Int, req.body.widgetsId);
            connection.execSql(request);
        });
    });

    router.delete('/delete-dashboard/:userId/:dashboardId', function (req, res) {
        var userId = req.params.userId;
        var dashboardId = req.params.dashboardId;
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("DELETE FROM dbo.Dashboard WHERE DashboardId IN (SELECT d.DashboardId FROM Dashboard d LEFT JOIN UserDashboard ud ON ud.DashboardId = d.DashboardId WHERE d.DashboardId =@id and ud.UserId = @userId)", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    tempObj = {
                        status: "success"
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('userId', TYPES.Int, userId);
            request.addParameter('id', TYPES.Int, dashboardId);
            connection.execSql(request);
        });
    });

    router.post('/update-dashboard', function (req, res) {
        console.log(req.body);
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("UPDATE d SET DashboardName = @updatedName FROM dbo.Dashboard d LEFT JOIN dbo.UserDashboard ud ON ud.DashboardId = d.DashboardId WHERE d.DashboardId =@id and ud.UserId = @userId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    tempObj = {
                        status: "success"
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.DashboardID);
            request.addParameter('userId', TYPES.Int, req.body.UserId);
            request.addParameter('updatedName', TYPES.NVarChar, req.body.DashboardName);
            connection.execSql(request);
        });
    });

    router.post('/mark-default', function (req, res) {
        console.log(req.body);
        var dashboardDetails = req.body;
        (function () {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("UPDATE dp SET dp.DefaultDashboard = 'false' FROM dbo.Dashboard d LEFT JOIN dbo.DashboardWidgets dw ON d.DashboardId = dw.DashboardId LEFT JOIN dbo.UserDashboard ud ON d.DashboardId = ud.DashboardId LEFT JOIN dbo.DashboardPreference dp ON d.DashboardId = dp.DashboardId WHERE ud.UserId = @userId", function (err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        (function () {
                            pool.acquire(function (err, connection) {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                request = new Request("UPDATE dp SET dp.DefaultDashboard = 'true' FROM dbo.Dashboard d LEFT JOIN dbo.DashboardWidgets dw ON d.DashboardId = dw.DashboardId LEFT JOIN dbo.UserDashboard ud ON d.DashboardId = ud.DashboardId LEFT JOIN dbo.DashboardPreference dp ON d.DashboardId = dp.DashboardId WHERE d.DashboardId =@dashboard and ud.UserId = @userId", function (err, rowCount, rows) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        tempObj = {
                                            status: "success"
                                        }
                                        res.json(tempObj);
                                        connection.release();
                                    }
                                });
                                request.addParameter('userId', TYPES.Int, dashboardDetails.userId);
                                request.addParameter('dashboard', TYPES.Int, dashboardDetails.dashboardId);
                                connection.execSql(request);
                            });
                        })();
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, dashboardDetails.userId);
                connection.execSql(request);
            });
        })();
    });

    router.post('/clone-dashboard', function (req, res) {
        console.log(req.body);
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            var timestamp = (Number(new Date().getTime()) / 10000000).toString().split(".")[1];
            request = new Request("INSERT INTO Dashboard ( DashboardName , LastUpdatedTime ) (SELECT  DashboardName + '-clone" + timestamp + "',@updateTime FROM Dashboard WHERE DashboardId = @id );select @@identity", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.dashboardId);
            request.addParameter('updateTime', TYPES.DateTime2, new Date());
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("id of inserted item is " + column.value);
                        tempObj = {
                            status: "success",
                            dashboardId: column.value
                        }
                        console.log(tempObj);
                        cloneUserDashboard(tempObj, req.body);
                        // res.json(tempObj);
                    }
                });
            });
            connection.execSql(request);
        });

        function cloneUserDashboard(dashboard, detailsObj) {
            console.log(dashboard.dashboardId);
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO UserDashboard ( UserId,DashboardId ) VALUES (@userID,@dashboardId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        console.log(dashboard);
                        cloneDashboardPreferences(dashboard, detailsObj);
                    }
                });
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('userID', TYPES.Int, detailsObj.userId);
                connection.execSql(request);
            });
        }

        function cloneDashboardPreferences(dashboard, detailsObj) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO DashboardPreference ( UserId , DashboardId, DashboardPreferenceJson,DefaultDashboard) (SELECT  @userId, @dashboardId ,DashboardPreferenceJson,'false' FROM DashboardPreference WHERE DashboardId = @id AND UserId = @userId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        console.log(dashboard);
                        cloneDashboardWidget(dashboard, detailsObj);
                    }
                });
                request.addParameter('userId', TYPES.Int, detailsObj.userId);
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                connection.execSql(request);
            });
        }
        function cloneDashboardWidget(dashboard, detailsObj) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT INTO DashboardWidgets ( DashboardId , DashboardWidgetsJson) (SELECT  @dashboardId, DashboardWidgetsJson FROM DashboardWidgets WHERE DashboardId = @id);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                    }
                });
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                request.on('row', function (columns) {
                    columns.forEach(function (column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {

                            dashboard.widgetId = column.value;
                            console.log(dashboard);
                            cloneWidgetPreferences(dashboard, detailsObj);
                        }
                    });
                });
                connection.execSql(request);
            });
        }

        function cloneWidgetPreferences(dashboard, detailsObj) {
            console.log(dashboard, detailsObj);
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO WidgetPreference ( UserId, DashboardId,WidgetsId, WidgetPreferenceJson) (SELECT  @userId, @dashboardId,@widgetId,WidgetPreferenceJson FROM WidgetPreference WHERE DashboardId = @id AND UserId = @userId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        res.json(dashboard);
                    }
                });
                request.addParameter('userId', TYPES.Int, detailsObj.userId);
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('widgetId', TYPES.Int, dashboard.widgetId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                connection.execSql(request);
            });
        }
    });

    router.post('/share-dashboard', function (req, res) {
        console.log(req.body);
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            var timestamp = (Number(new Date().getTime()) / 10000000).toString().split(".")[1];
            request = new Request("INSERT INTO Dashboard ( DashboardName , LastUpdatedTime ) (SELECT  DashboardName + '-shared" + timestamp + "',@updateTime FROM Dashboard WHERE DashboardId = @id );select @@identity", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.dashboardId);
            request.addParameter('updateTime', TYPES.DateTime2, new Date());
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("id of inserted item is " + column.value);
                        tempObj = {
                            status: "success",
                            dashboardId: column.value
                        }
                        console.log(tempObj);
                        cloneUserDashboard(tempObj, req.body);
                        // res.json(tempObj);
                    }
                });
            });
            connection.execSql(request);
        });

        function cloneUserDashboard(dashboard, detailsObj) {
            console.log(dashboard.dashboardId);
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO UserDashboard ( UserId,DashboardId ) VALUES (@shareUserId,@dashboardId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        console.log(dashboard);
                        cloneDashboardPreferences(dashboard, detailsObj);
                    }
                });
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('shareUserId', TYPES.Int, detailsObj.shareUserId);
                connection.execSql(request);
            });
        }

        function cloneDashboardPreferences(dashboard, detailsObj) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO DashboardPreference ( UserId , DashboardId, DashboardPreferenceJson,DefaultDashboard) (SELECT  @shareUserId, @dashboardId ,DashboardPreferenceJson,'false' FROM DashboardPreference WHERE DashboardId = @id AND UserId = @userId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        console.log(dashboard);
                        cloneDashboardWidget(dashboard, detailsObj);
                    }
                });
                request.addParameter('shareUserId', TYPES.Int, detailsObj.shareUserId);
                request.addParameter('userId', TYPES.Int, detailsObj.userId);
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                connection.execSql(request);
            });
        }
        function cloneDashboardWidget(dashboard, detailsObj) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT INTO DashboardWidgets ( DashboardId , DashboardWidgetsJson) (SELECT  @dashboardId, DashboardWidgetsJson FROM DashboardWidgets WHERE DashboardId = @id);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                    }
                });
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                request.on('row', function (columns) {
                    columns.forEach(function (column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {

                            dashboard.widgetId = column.value;
                            console.log(dashboard);
                            cloneWidgetPreferences(dashboard, detailsObj);
                        }
                    });
                });
                connection.execSql(request);
            });
        }

        function cloneWidgetPreferences(dashboard, detailsObj) {
            console.log(dashboard, detailsObj);
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO WidgetPreference ( UserId, DashboardId,WidgetsId, WidgetPreferenceJson) (SELECT  @shareUserId, @dashboardId,@widgetId,WidgetPreferenceJson FROM WidgetPreference WHERE DashboardId = @id AND UserId = @userId);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        res.json({status:"success"});
                    }
                });
                request.addParameter('shareUserId', TYPES.Int, detailsObj.shareUserId);
                request.addParameter('userId', TYPES.Int, detailsObj.userId);
                request.addParameter('dashboardId', TYPES.Int, dashboard.dashboardId);
                request.addParameter('widgetId', TYPES.Int, dashboard.widgetId);
                request.addParameter('id', TYPES.Int, detailsObj.dashboardId);
                connection.execSql(request);
            });
        }
    });

    router.post('/dashboard-details', function (req, res) {
        console.log(req.body.dashboardId,"check for erro");
        if(req.body.dashboardId){
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("SELECT d.DashboardId,d.DashboardName,dw.WidgetsId,dw.DashboardWidgetsJson,dp.DefaultDashboard,dp.DashboardPreferenceJson,wp.WidgetPreferenceJson FROM dbo.Dashboard d LEFT JOIN dbo.DashboardWidgets dw ON d.DashboardId = dw.DashboardId LEFT JOIN dbo.DashboardPreference dp ON d.DashboardId = dp.DashboardId LEFT JOIN dbo.WidgetPreference wp ON wp.DashboardId = d.DashboardId WHERE d.DashboardId = @id ORDER BY d.LastUpdatedTime DESC", function (err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        // res.json(rows)
                        dashboardObj = {};
                        for (i = 0; i < rows.length; i++) {
                            for (j = 0; j < rows[i].length; j++) {
                                dashboardObj[rows[i][j].metadata.colName] = rows[i][j].value;
                            }
                        }
                        tempObj = {
                            status: "success",
                            dashboardDetails: dashboardObj
                        }
                        res.json(tempObj);
                        connection.release();
                    }
                });
                request.addParameter('id', TYPES.Int, parseInt(req.body.dashboardId));
                connection.execSql(request);
            });
        }       
    });

    router.get('/config', function (req, res) {
        tempObj ={
            status:"success",
            widgetConfigList:configJson
        }
        res.json(tempObj);
    });

    router.post('/calender', function (req, res) {
        console.log(req.body);
    });

    router.post('/create-new-datasource', function (req, res) {
        console.log(req.body)
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("INSERT dbo.DataSource (DataSourceName,RefreshTime,RetryFrequency,APIConfigJson) VALUES (@dataSourceName,@refreshTime,@retryFrequency,@config);select @@identity", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.release();
                }
            });
            request.addParameter('dataSourceName', TYPES.NVarChar, req.body.dataSourceName);
            request.addParameter('refreshTime', TYPES.Int, req.body.dataSourceRefreshTime);
            request.addParameter('config', TYPES.NVarChar, JSON.stringify(req.body.request));
            request.addParameter('retryFrequency', TYPES.Int, req.body.dataSourceRetryFrequency);
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("id of inserted item is " + column.value);
                        tempObj = {
                            status: "success",
                            dataSourceId: column.value
                        }
                        console.log(tempObj);
                        insertTenantDataSource(tempObj, req.body.tenantId);
                    }
                });
            });
            connection.execSql(request);
        });
        function insertTenantDataSource(obj, tenantId){
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                }
                request = new Request("INSERT INTO TenantDataSource ( TenantId,DataSourceId ) VALUES (@tenantId,@dataSourceID);", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                        tempObj = {
                            status: "success"
                        }
                        console.log(tempObj);
                        res.json(tempObj);
                    }
                });
                request.addParameter('dataSourceID', TYPES.Int, obj.dataSourceId);
                request.addParameter('tenantId', TYPES.Int, tenantId);
                connection.execSql(request);
            });
        }
    });

    router.post('/getWidgetConfig',function(req,res){
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT * FROM dbo.WidgetMaster WHERE TenantId = @tenantId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    widgetConfig = {};
                    widgetConfigArr = [];
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < rows[i].length; j++) {
                            widgetConfig[rows[i][j].metadata.colName] = rows[i][j].value;
                        }
                        widgetConfigArr.push(widgetConfig);
                        widgetConfig = {};
                    }
                    tempObj = {
                        status: "success",
                        widgetConfigList: widgetConfigArr
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('tenantId', TYPES.Int, req.body.tenantId);
            connection.execSql(request);
        });
    });

    router.post('/getApiConfig',function(req,res){
        console.log(req.body)
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT ds.DataSourceId,ds.DataSourceName,ds.RefreshTime,ds.RetryFrequency,ds.APIConfigJson FROM dbo.DataSource ds LEFT JOIN dbo.TenantDataSource tds on tds.DataSourceId = ds.DataSourceId WHERE TenantId = @tenantId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    apiConfig = {};
                    apiConfigArr = [];
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < rows[i].length; j++) {
                            apiConfig[rows[i][j].metadata.colName] = rows[i][j].value;
                        }
                        apiConfigArr.push(apiConfig);
                        apiConfig = {};
                    }
                    tempObj = {
                        status: "success",
                        apiConfigList: apiConfigArr
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('tenantId', TYPES.Int, req.body.tenantId);
            connection.execSql(request);
        });
    });

    router.post('/getTemplatesList',function(req,res){
        console.log(req.body)
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT * FROM dbo.Template WHERE TenantId = @tenantId", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    templateConfig = {};
                    templateArr = [];
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < rows[i].length; j++) {
                            templateConfig[rows[i][j].metadata.colName] = rows[i][j].value;
                        }
                        templateArr.push(templateConfig);
                        templateConfig = {};
                    }
                    tempObj = {
                        status: "success",
                        templateList: templateArr
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('tenantId', TYPES.Int, req.body.tenantId);
            connection.execSql(request);
        });
    });

    router.post('/user-list',function(req,res){
        console.log(req.body)
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("SELECT UserId,UserName,Email from UserDetail WHERE UserId !=@id", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    userList = {};
                    userListArr = [];
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < rows[i].length; j++) {
                            userList[rows[i][j].metadata.colName] = rows[i][j].value;
                        }
                        userListArr.push(userList);
                        userList = {};
                    }
                    tempObj = {
                        status: "success",
                        userList: userListArr
                    }
                    res.json(tempObj);
                    connection.release();
                }
            });
            request.addParameter('id', TYPES.Int, req.body.userId);
            connection.execSql(request);
        });
    });

    router.post('/templates-dashboard', function (req, res) {
        console.log(req.body);
        pool.acquire(function (err, connection) {
            if (err) {
                console.error(err);
                return;
            }
            request = new Request("INSERT dbo.Dashboard (DashboardName,LastUpdatedTime) VALUES (@dashboardName,@updateTime);select @@identity", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.release();
                }
            });
            // request.addParameter('userID', TYPES.Int, parseInt(req.body.userId));
            request.addParameter('dashboardName', TYPES.NVarChar, req.body.dashboardName);
            request.addParameter('updateTime', TYPES.DateTime2, new Date());
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("id of inserted item is " + column.value);
                        tempObj = {
                            status: "success",
                            dashboardId: column.value
                        }
                        insertUserDashboard(req.body.userId, column.value);
                        insertDashboardPreference(req.body.userId, column.value);
                        insertWidget(tempObj, req.body);
                    }
                });
            });
            connection.execSql(request);
        });
        function insertUserDashboard(userId, DashboardId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.UserDashboard (UserId,DashboardId) VALUES (@userId,@dashboardId);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, DashboardId);
                connection.execSql(request);
            });
        }
        function insertDashboardPreference(userId, DashboardId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.DashboardPreference (UserId,DashboardId,DashboardPreferenceJson,DefaultDashboard) VALUES (@userId,@dashboardId,@preference,'false');select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, DashboardId);
                request.addParameter('preference', TYPES.NVarChar, JSON.stringify({}));
                connection.execSql(request);
            });
        }
        function insertWidget(obj, dashboardDetails) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.DashboardWidgets (DashboardId,DashboardWidgetsJson) VALUES (@dashboardID,@dashboardWidget);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.release();
                    }
                });
                request.addParameter('dashboardID', TYPES.Int, parseInt(obj.dashboardId));
                request.addParameter('dashboardWidget', TYPES.NVarChar, dashboardDetails.templateWidgets);
                request.on('row', function (columns) {
                    columns.forEach(function (column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            obj.widgetId = column.value;
                            insertWidgetPreference(obj, dashboardDetails.userId)
                        }
                    });
                });
                connection.execSql(request);
            });
        }
        function insertWidgetPreference(obj, userId) {
            pool.acquire(function (err, connection) {
                if (err) {
                    console.error(err);
                    return;
                }
                request = new Request("INSERT dbo.WidgetPreference (UserId,DashboardId,WidgetsId,WidgetPreferenceJson) VALUES (@userId,@dashboardId,@widgetId,@preference);select @@identity", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("success");
                        res.json(obj);
                        connection.release();
                    }
                });
                request.addParameter('userId', TYPES.Int, userId);
                request.addParameter('dashboardId', TYPES.Int, obj.dashboardId);
                request.addParameter('widgetId', TYPES.Int, obj.widgetId);
                request.addParameter('preference', TYPES.NVarChar, JSON.stringify({}));
                connection.execSql(request);
            });
        }
    });

    router.post('/get-sharepointData',function(req,res){
        console.log(req.body);
        var options = {
            uri: req.body.url,
            method: 'GET',
            json: true,
            headers: {
                'Authorization': 'Bearer',
            },
        };
        restRequest(options, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                tempResponse = response.rawHeaders[7].split(',');
                tempTenantId = tempResponse[0].split('"')[1];
                tempClientId = tempResponse[1].split('"')[1];
                reqBody = {
                    grant_type:"client_credentials",
                    client_id:req.body.clientId+"@"+tempTenantId,
                    client_secret:req.body.clientSecret,
                    resource:tempClientId+"/"+req.body.url.split("/")[2]+"@"+tempTenantId
                }
                var options = {
                    uri: "https://accounts.accesscontrol.windows.net/"+tempTenantId+"/tokens/OAuth/2",
                    method: 'POST',
                    json: true,
                    body:querystring.stringify(reqBody),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                };
                restRequest(options, function (error, innerResponse) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(innerResponse.body.access_token);
                        bearerToken = innerResponse.body.access_token;
                        var options = {
                            uri: req.body.url+"/_api/web/lists/getbytitle('"+req.body.tableName+"')/items?$select=EncodedAbsUrl",
                            method: 'GET',
                            json: true,
                            headers: {
                                'Accept': 'application/json;odata=verbose',
                                'Authorization':"Bearer "+bearerToken
                            }
                        };
                        restRequest(options, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response);
                                tempArr =[];
                                tempObj ={};
                                response.body.d.results.forEach(element => {
                                    console.log(element.EncodedAbsUrl);
                                    var options = {
                                        uri: element.EncodedAbsUrl,
                                        method: 'GET',
                                        json: true,
                                        headers: {
                                            'Accept': 'application/json;odata=verbose',
                                            'Authorization':"Bearer "+bearerToken
                                        }
                                    };
                                    restRequest(options, function (error, response) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log(response);
                                        }
                                    });
                                    tempObj.url=element.EncodedAbsUrl;
                                    tempArr.push(tempObj);
                                    tempObj={};
                                });
                                res.json({type:"sharepoint","values":tempArr,token:"Bearer "+bearerToken});
                            }
                        });
                    }
                });
            }
        });
    });

    router.post('/get-azureBlobData',function(req,res){

    });

    router.post('/get-sample',function(req,res){
        spauth
        .getAuth('https://softuraus.sharepoint.com/sites/PhillipsPOC', {
          clientId: 'fa8b6ce2-b024-40b1-b8ac-0a014034889a',
          clientSecret: 'UFtHmKExvSzKMT3LyjeP5P8A6YtAMntzdel62UvT+ns=',
        //   realm: '85e5f09b-4c17-4d80-afea-260bb171c456'
        })
        .then(data => {
          var headers = data.headers;
          headers['Accept'] = 'application/json;odata=verbose';      
          request.get({
            url: "https://softuraus.sharepoint.com/sites/PhillipsPOC/_api/web/lists/getbytitle('Slider')/items?$select=EncodedAbsUrl",
            headers: headers,
            json: true
          }).then(response => {
            console.log(JSON.stringify(response));
            response.d.results.forEach(element => {
                request.get({
                    url: element.EncodedAbsUrl,
                    headers: headers,
                    json: true
                  }).then(response => {
                    console.log(response);
                  });
            });
          });
        });
    });
    
}