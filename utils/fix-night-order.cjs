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
  
  const roles = JSON.parse(data);
  
  const firstNights = roles.filter(role => role.firstNight >= 10).toSorted((a, b) => {
    return a.firstNight - b.firstNight;
  });
 
  const otherNights = roles.filter(role => role.otherNight >= 2).toSorted((a, b) => {
    return a.otherNight - b.otherNight;
  });
  
  const newRoles = roles.map((role) => {
    const otherNightC = otherNights.findIndex(r => r.id === role.id);
    const firstNightC = firstNights.findIndex(r => r.id === role.id);
    
    role.firstNight = (firstNightC !== -1 ? firstNightC + 10 : role.firstNight);
    role.otherNight = (otherNightC !== -1 ? otherNightC + 2 : role.otherNight);
    
    return {
      ...role, 
    }
  });
  
  console.log(roles);
  
  function replacer(key, value) {
    if (value === 0) {
        return '0';
    }
  }
  
  fs.writeFileSync( 'update_'+filename, JSON.stringify(newRoles, null, 2) );
});