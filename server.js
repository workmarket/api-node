var request = require('request');
var _ = require('underscore');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var BASE_URL = 'https://api.dev.workmarket.com/api/v1';
var TOKEN = 'W53IIPyKNP9CvHu6W0T6';
var SECRET = 'UGpp9xHK0RW3vsn24DRTJ95UzulBNN8vIsVSa7RE';
var ACCESS_TOKEN = '';

var lastTimeStamp = Date.now();
var pollingIntervalInMinutes = 0.1;

var updateTokenRunner = setInterval(refreshAccessToken(TOKEN, SECRET), (1000 * 60 * 60 * 24));
var updateRunner = setInterval(pollForUpdates, (pollingIntervalInMinutes * 1000 * 60));

function refreshAccessToken(token, secret, callback) {
  request.post({
    url: BASE_URL + '/authorization/request',
    form: {token: token, secret: secret}
  }, function (error, response, body) {
    var apiResponse = JSON.parse(body);

    if (!error && response.statusCode == 200) {
      ACCESS_TOKEN = apiResponse.response.access_token
      if (callback) {
        callback();
      }
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
