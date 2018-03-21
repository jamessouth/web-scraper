console.log('hello');
const fs = require('fs');
const scrapeIt = require('scrape-it');


// fs.mkdir('data', err => {
//   if(err){
//     if(err.code === 'EEXIST'){
//       console.log('directory already exists - exiting');
//       return;
//     } else {
//       console.log(err);
//       throw err;
//     }
//   } else {
//     console.log('directory created');
//     return;
//   }
// });
let g;

scrapeIt('http://shirts4mike.com/shirts.php', {
  items: {
    listItem: '.products li',
    data: {
      URL: {selector: 'a', attr: 'href'},
      imageURL: {selector: 'a img', attr: 'src'}
    }
  }

}).then(res => {
  g = Object.assign({}, res.data);
  // console.log(g);
  Promise.all(res.data.items.map(x => scrapeIt(`http://shirts4mike.com/${x.URL}`, {
    // details: {
      // data: {
        title: {selector: '.shirt-details h1'}
        // price: {selector: '.shirt-details h1 span.price'}
      // }
    // }

    })
    )
  ).then(resp => resp.map((x,i) => {

    let [price, ...title] = x.data.title.split(' ');

    // console.log(x.data.title);

    // console.log(res.data);
    // console.log(price);
    // console.log(title);
    return [price, title.join(' ')];
  })).then(rpns => {
    rpns.forEach((x,i) => {
      g.items[i].price = x[0];
      g.items[i].title = x[1];
      console.log(g.items[i]);
      // console.log(res.data[i]);
    })
  });
});











// 123
