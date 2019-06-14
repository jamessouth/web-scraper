# JS-Project-6
node.js content scraper

This project is a command-line web scraper using node.js and npm packages csv-writer, moment and scrape-it.  It scrapes t-shirt data from the Treehouse demo site http://shirts4mike.com/ using the entry point http://shirts4mike.com/shirts.php.  The data are saved to a CSV file.

Download the ZIP, run ```npm install``` then ```npm start```.  The script will check for a data folder and create it if it doesn't exist.  Inside it will save the CSV file.  The CSV is overwritten if the script is run again.  If there is an error a log file will be created if it doesn't already exist and the error will be appended.  
