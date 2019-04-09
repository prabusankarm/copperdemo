module.exports = function(){
	return {
        userName: 'hub-admin',
        password: 'S0ftur@369',
        server: 'iot-hub.database.windows.net',
        options: {
          database: 'IotIpProd-dashboard',
          encrypt: true,
          rowCollectionOnRequestCompletion: true
        }
	};
};