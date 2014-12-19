var request = require('request');
var _ = require('underscore');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var BASE_URL = 'https://api.dev.workmarket.com/api/v1';
var TOKEN = '';
var SECRET = '';
var ACCESS_TOKEN = '';

var lastTimeStamp = Date.now();
var pollingIntervalInMinutes = 0.1;

refreshAccessToken(TOKEN, SECRET, function () {
  var runner = setInterval(pollForUpdates, (pollingIntervalInMinutes * 1000 * 60));
});


function refreshAccessToken(token, secret, callback) {
  request.post({
    url: BASE_URL + '/authorization/request',
    form: {token: token, secret: secret}
  }, function (error, response, body) {
    var apiResponse = JSON.parse(body);

    if (!error && response.statusCode == 200) {
      ACCESS_TOKEN = apiResponse.response.access_token
      callback();
    } else {
      console.log(error);
    }
    console.log(apiResponse);
  })
}

function processAssignmentList(assignmentList) {
  _.each(assignmentList, function (assignment) {
    getAssignment(assignment.id, function(assignment) {
      console.log(assignment);
    })
  });
}

function pollForUpdates() {
  request.get({
    url: BASE_URL + '/assignments/list_updated?access_token=' + ACCESS_TOKEN + '&modified_since=' + lastTimeStamp
  }, function (error, response, body) {
    var apiResponse = JSON.parse(body);

    if (!error && response.statusCode == 200) {
      // update timestamp
      lastTimeStamp = apiResponse.meta.timestamp;
      processAssignmentList(apiResponse.response.data);
    } else {
      console.log(error);
    }
    console.log(apiResponse);
  })
}

function getAssignment(id, callback) {
  request.get({
    url: BASE_URL + '/assignments/get?access_token=' + ACCESS_TOKEN + '&id=' + id
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(JSON.parse(body));
    } else {
      console.log(error);
    }
  });
}
