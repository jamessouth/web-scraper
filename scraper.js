const fs = require('fs');
const scrapeIt = require('scrape-it');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');
let dataObj, timeStamp;


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





scrapeIt('http://shirts4mike.com/shirts.php', {
  items: {
    listItem: '.products li',
    data: {
      URL: {selector: 'a', attr: 'href'},
      imageURL: {selector: 'a img', attr: 'src'}
    }
  }
}).then(res => {
  // console.log(res.response);
  if(res.data.items.length === 0){
    Promise.reject('website routing error').then(() => {}, err => {
      console.log('There was an error with the requested website and no data was returned.  Please check the address and try again.');
      // console.error(err);

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
  })).then(rpns => {
    rpns.forEach((x,i) => {
      dataObj.items[i].price = x[0];
      dataObj.items[i].title = x[1];
      dataObj.items[i].time = timeStamp;
    })
  })
  .then(res => {
    // console.log(dataObj);
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
    // const records = [
    //   {name: 'Bob', lang: 'French, English'},
    //   {name: 'bill', lang: 'English'}
    // ];

    const records = dataObj.items.map(y => {
      y.imageURL = `http://shirts4mike.com/${y.imageURL}`;
      y.URL = `http://shirts4mike.com/${y.URL}`;
      return y;
    });
    // console.log(records);
    csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('Your csv file is ready.');
    }, err => {
      console.log('The file you are trying to write to is open in another program.  Please close it and try again.  This error could also be a problem with the path to the file.  Please check and fix if necessary.');
    });


  });



}, err => {
  console.log('The requested website was not found.  Please check the address and try again.');
  // console.error(err);
});











// 123
