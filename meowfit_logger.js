require('events').EventEmitter.prototype._maxListeners = 100;

var Bean = require('ble-bean');
var fs = require('fs');

var intervalId;
var connectedBean;
var tempData = 0;
var movement = 0;

var lastX = 0;
var lastY = 0;
var lastZ = 0;

Bean.discover(function(bean){
  console.log("Bean Discovered");
  connectedBean = bean;

  bean.on("accell", function(x, y, z, valid){
    var status = valid ? "valid" : "invalid";

    diffX = Math.abs(x - lastX).toFixed(5);
    diffY = Math.abs(y - lastY).toFixed(5);
    diffZ = Math.abs(z - lastZ).toFixed(5);

    // check for movement
    if( diffX < 0.06 && diffY < 0.06 && diffZ < 0.06){
      movement = 0;
    } else if ( diffX > 0.8 || diffY > 0.8 || diffZ > 0.8) {
      movement = 2;
    } else {
      movement = 1;
    }

    var now = new Date();
    var jsonDate = now.toJSON();

    var data = jsonDate + ", " + diffX + ", " + diffY + ", " + diffZ + ", " + movement + ", " + tempData + "\n"


    // output useful data to console
    console.log(data);

    //write to log file
    fs.appendFile(global.logFile, data, function(err){
    })

    // update the last known values
    lastX = x;
    lastY = y;
    lastZ = z;

  });

  bean.on("temp", function(temp, valid){
    var status = valid ? "valid" : "invalid";
    tempData = temp
  });

  bean.on("disconnect", function(){
    console.log("Bean Disconnected");

    fs.appendFile(global.logFile, "Bean Disconnected", function(err){
    })

    process.exit();

  });

  bean.connectAndSetup(function(){
    console.log("Connect and Setup")
    var now = new Date();
    var jsonDate = now.toJSON();
    global.logFile = '/home/pi/meowfit/data/' + jsonDate + '_log.csv';

    fs.writeFile(global.logFile, '', function(err){
      if (err) throw err;
      console.log('Logfile created');
    });

    var readData = function() {

      bean.requestAccell(
      function(){
      });

      bean.requestTemp(
      function(){
      });

    }

    intervalId = setInterval(readData,1000);

  });

});