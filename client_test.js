var EventSource = require('eventsource');
var es = new EventSource('http://localhost:8131/time')
es.addEventListener('server-time', function (e) {
  console.log(e.data)
});