// var Docker = require('dockerode');
// var docker = new Docker({host: 'http://13.233.49.252', port: 5555});

// var auth = {
//     username: 'sr9k1nt8',
//     password: '381n4u',
//     auth: '',
//     email: 'srikanth.pn6699@gmail.com',
//     serveraddress: 'https://index.docker.io/v1'
//   };

var requestContainer = require('request');
let dockerHubAPI = require('docker-hub-api');
dockerHubAPI.setCacheOptions({enabled: true, time: 60});
dockerHubAPI.login('sr9k1nt8', '381n4u').then(function(info) {
    console.log(`My Docker Hub login token is '${info.token}'!`);
    token = info;
});

dockerHubAPI.tags('sr9k1nt8', 'softura-docker').then(function(info) {
    console.log(info);
});



  module.exports = function (router, pool) {
    router.get('/get-docker-image', function (req, res, next) {
        // var options = {
        //     uri: 'http://13.233.49.252:5555/images/json?digests=1',
        //     method: 'get',
        //     json: true,
        // };
        // console.log(options);
        // requestContainer(options, function (error, response) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log(response);
        //         tempObj = {
        //             status: "success",
        //             imagesList: response.body
        //             }
        //         res.json(tempObj);
        //     }
        // });
        // dockerHubAPI.repositories('sr9k1nt8').then(function(info) {
        //     console.log(info);
        //     tempObj = {
        //         status: "success",
        //         imagesList: info
        //         }
        //     res.json(tempObj);
        // });

        dockerHubAPI.tags('sr9k1nt8', 'softura-docker').then(function(info) {
            console.log(info);
            tempObj = {
                        status: "success",
                        imagesList: info.results
                        }
                    res.json(tempObj);
        });
    });

    router.post('/push-image', function (req, res, next) {
        console.log(req.body.image)
        var options = {
            uri: 'http://13.233.49.252:5555/containers/json',
            method: 'get',
            json: true,
        };
        console.log(options);
        requestContainer(options, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response.body);
                
                if(response.body.length!=0){
                    response.body.forEach((element,index) => {
                        console.log(element);
                        if(index==response.body.length-1){
                            var options = {
                                uri: 'http://13.233.49.252:5555/v1.24/containers/'+element.Id+'/stop',
                                method: 'post',
                                json: true,
                            };
                            console.log(options);
                            requestContainer(options, function (error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    dockerHubAPI.login('sr9k1nt8', '381n4u').then(function(info) {
                                        console.log(`My Docker Hub login token is '${info.token}'!`);
                                        var options = {
                                            uri: 'http://13.233.49.252:5555/v1.24/images/create?fromImage='+req.body.image+'&tag='+req.body.tagName,
                                            method: 'post',
                                            json: true,
                                            headers:{"X-Registry-Auth" :{
                                                "identitytoken": info.token
                                          }}
                                        };
                                        console.log(options)
                                        requestContainer(options, function (error, response) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log(response.body);
                                                var options = {
                                                    uri: 'http://13.233.49.252:5555/v1.24/containers/create',
                                                    method: 'post',
                                                    json: true,
                                                    body:{"PortBindings": {
                                                        "8088/tcp": [
                                                        {
                                                        "HostPort": "8088"
                                                        }
                                                        ]
                                                        },Image:req.body.image+":"+req.body.tagName}
                                                };
                                                requestContainer(options, function (error, response) {
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        console.log(response.body.Id);
                                                        var options = {
                                                            uri: 'http://13.233.49.252:5555/v1.24/containers/'+response.body.Id+'/start',
                                                            method: 'post',
                                                            json: true,
                                                            
                                                        };
                                                        console.log(options)
                                                        requestContainer(options, function (error, response) {
                                                            if (error) {
                                                                console.log(error);
                                                            } else {
                                                                console.log(response.body);
                                                res.json({status:"success"});

                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                           
                        }else{
                            var options = {
                                uri: 'http://13.233.49.252:5555/v1.24/containers/'+element.Id+'/stop',
                                method: 'post',
                                json: true,
                            };
                            console.log(options);
                            requestContainer(options, function (error, response) {
                                if (error) {
                                    console.log(error);
                                } 

                            });
                        }
                    });
                   
                }else{
                    dockerHubAPI.login('sr9k1nt8', '381n4u').then(function(info) {
                        console.log(`My Docker Hub login token is '${info.token}'!`);
                        var options = {
                            uri: 'http://13.233.49.252:5555/v1.24/images/create?fromImage='+req.body.image+'&tag='+req.body.tagName,
                            method: 'post',
                            json: true,
                            headers:{"X-Registry-Auth" :{
                                "identitytoken": info.token
                          }}
                        };
                        // console.log(options)
                        requestContainer(options, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response.body,'151');
                                var options = {
                                    uri: 'http://13.233.49.252:5555/v1.24/containers/create',
                                    method: 'post',
                                    json: true,
                                    body:{"PortBindings": {
                                        "8088/tcp": [
                                        {
                                        "HostPort": "8088"
                                        }
                                        ]
                                        },Image:req.body.image+":"+req.body.tagName}
                                };
                                console.log(options,151);
                                requestContainer(options, function (error, response) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log(response.body.Id);
                                        var options = {
                                            uri: 'http://13.233.49.252:5555/v1.24/containers/'+response.body.Id+'/start',
                                            method: 'post',
                                            json: true,
                                            
                                        };
                                        console.log(options)
                                        requestContainer(options, function (error, response) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log(response.body);
                                                res.json({status:"success"});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                        
                    
                }              
               
            }
        });
    });
    
  };
  