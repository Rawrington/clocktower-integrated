// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}
// Read the file
const fs = require('fs')
  , filename = process.argv[2];
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('CONVERTING: ' + filename);
  
  const jinxes = JSON.parse(data).map(jinx => {
    return {
        id: jinx.id.replace(/[^A-Z]/ig, '').toLowerCase(),
        jinxes: jinx.hatred.map(hate => {
             return {
                id: hate.id.replace(/[^A-Z]/ig, '').toLowerCase(),
                reason: hate.reason,
             };
        }),
    }
  });
  
  console.log(jinxes);
  
  function replacer(key, value) {
    if (value === 0) {
        return '0';
    }
  }
  
  fs.writeFileSync( 'update_'+filename, JSON.stringify(jinxes, null, 2) );
});