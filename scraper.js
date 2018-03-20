console.log('hello');
const fs = require('fs');


fs.mkdir('data', err => {
  if(err){
    if(err.code === 'EEXIST'){
      console.log('directory already exists - exiting');
      return;
    } else {
      console.log(err);
      throw err;
    }
  } else {
    console.log('directory created');
    return;
  }
});
