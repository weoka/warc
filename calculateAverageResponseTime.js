const fs = require('fs');

/**
 * Calculate average response time from chat log
 * @filename File path of the chat log
 * @participants Array of strings with both participants
 * @debug Boolean to enable debug mode
 * @return {Object} The average response time for both participants
 */
function calculateAverageResponseTime(filename, participants, debug = false) {
  const data = fs.readFileSync(filename, 'utf8');
  const messages = data.split('\n');

  let responseTimes = {};

  responseTimes[participants[0]] = { total: 0, count: 0 };
  responseTimes[participants[1]] = { total: 0, count: 0 };

  let lastResponse = null;

  for (let msg of messages) {
    let match = msg.match(/\[(.+),\s(.+)]\s(.+):\s.+/);
    
    if(match) {
      let [, date, time, sender] = match;
      let [day, month, year] = date.split('/');
      let [hour, minute, second] = time.split(':');

      // month in JavaScript Date constructor is 0-based (0 = January, 1 = February, etc.)
      let timestamp = new Date(Date.UTC(parseInt(year) + 2000, month-1, day, hour, minute, second)).getTime(); 
      
      if (lastResponse && sender !== lastResponse.sender && responseTimes[sender] && responseTimes[lastResponse.sender]) {
        responseTimes[sender].total += timestamp - lastResponse.timestamp;
        responseTimes[sender].count++;

        if(debug) console.log({
          sender: sender,
          response: timestamp,
          lastMessage: lastResponse.timestamp,
          result: timestamp - lastResponse.timestamp
        });
      }

      lastResponse = { sender, timestamp };
    }
  }

  let result = {};

  result['Total messages'] = messages.length;
  result[`${participants[0]} avg. response time (min)`] = responseTimes[participants[0]].total / responseTimes[participants[0]].count / 60000;
  result[`${participants[1]} avg. response time (min)`] = responseTimes[participants[1]].total / responseTimes[participants[1]].count / 60000;
  
  if(!debug) return result;

  return console.log(responseTimes);
}

module.exports = { calculateAverageResponseTime };
