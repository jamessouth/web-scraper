const fs = require('fs');
const scrapeIt = require('scrape-it');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');
let dataObj, timeStamp, errTime;

fs.mkdir('data', err => {
  if(err){
    if(err.code === 'EEXIST'){
      console.log('directory already exists');
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

scrapeIt('http://shirts4mike.com/shirts.php', {
  items: {
    listItem: '.products li',
    data: {
      URL: {selector: 'a', attr: 'href'},
      imageURL: {selector: 'a img', attr: 'src'}
    }
  }
}).then(res => {
  if(res.data.items.length === 0){
    Promise.reject('website routing error').then(() => {}, err => {
      errHand('There was an error with the requested website and no data was returned.  Please check the address and try again.');
    });
    return;
  }
  dataObj = Object.assign({}, res.data);
  timeStamp = moment().format();
  Promise.all(res.data.items.map(x => scrapeIt(`http://shirts4mike.com/${x.URL}`, {
        title: {selector: '.shirt-details h1'}
      })
    )
  ).then(resp => resp.map((x,i) => {
    let [price, ...title] = x.data.title.split(' ');
    return [price, title.join(' ')];
  }), err => console.error(err)).then(rpns => {
    rpns.forEach((x,i) => {
      dataObj.items[i].price = x[0];
      dataObj.items[i].title = x[1];
      dataObj.items[i].time = timeStamp;
    });
  }, err => console.error(err))
  .then(res => {
    let fileName = timeStamp.split('T')[0];
    const csvWriter = createCsvWriter({
        path: `data/${fileName}.csv`,
        header: [
            {id: 'title', title: 'TITLE'},
            {id: 'price', title: 'PRICE'},
            {id: 'imageURL', title: 'IMAGEURL'},
            {id: 'URL', title: 'URL'},
            {id: 'time', title: 'TIME'}
        ]
    });
    const records = dataObj.items.map(y => {
      y.imageURL = `http://shirts4mike.com/${y.imageURL}`;
      y.URL = `http://shirts4mike.com/${y.URL}`;
      return y;
    });
    csvWriter.writeRecords(records)
    .then(() => {
        console.log('Your csv file is ready.');
    }, err => {
      errHand('The file you are trying to write to is open in another program.  Please close it and try again.  This error could also be a problem with the path to the file.  Please check and fix if necessary.');
    });
  }, err => console.error(err));
}, err => {
  errHand('The requested website was not found.  Please check the address or your internet connection and try again.');
});

function errHand(msg){
  console.log(msg);
  errTime = moment().toDate().toString();
  fs.open('./scraper-error.log', 'a', (err, fd) => {
    if(err){
      console.error('file open error', err);
    }
    fs.write(fd, `[${errTime}] ${msg}`, (err, written, string) => {
      if(err){
        console.error('file write error', err);
      }
      fs.close(fd, err => {
        if(err){
          console.error('file close error', err);
        }
        console.log('error log file scraper-error.log updated');
      });
    });
  });
}
