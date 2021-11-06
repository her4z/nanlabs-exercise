const fetch = require('node-fetch');
const express = require('express');
const app = express();
const XLSX = require('xlsx');
const fs = require('fs');

app.get('/', (req, res) => {
  res.send('Hi Nan-LABS!')
});

async function getLength(row){
  if(row.website.split(':')[0] === 'http' || row.website.split(':')[0] === 'https'){      // If it has 'http' or 'https' at the beginning of the string it's a url, if not it's a file's path
    let res = await fetch(row.website); 
    let data = await res.text();        // Returns its complete html code
    return({website: row.website.split('.')[1], length: data.length});       // '.length' to get the size on bytes of the element
  }else{
    let file = await fs.readFileSync(`./websites${row.website.split('~')[1]}`); 
    let data = file.toString();
    return({website: row.website.split('/')[1], length: data.length});
  }
}

async function getDependencies(row, needFrequency){
  let data;
  if(row.website.split(':')[0] === 'http' || row.website.split(':')[0] === 'https'){ 
    let res = await fetch(row.website);
    data = await res.text();
  }else{
    let file = await fs.readFileSync(`./websites${row.website.split('~')[1]}`); 
    data = file.toString();
  }
  let headTag = data.split('<head')[1]; // Get the head tag element from website html 
  let scriptsParsed = await headTag.split('<script').filter((script)=> script.includes('src=')) // Get the <script/> tags of the head element that have a defined 'src' property
  let response = [];
  let allDependencies = [];
  scriptsParsed.map((script)=>{
    let dependencies = script.match(/[A-Za-z-0-9]+\.(js)/g);  // Iterate each script tag and get the javascript dependencies defined on the src property.
    if(dependencies){
      for(let dependency of dependencies){
        allDependencies.push(dependency);      
      }
    }
  });
  if(needFrequency === true) return allDependencies; // If needFrecuency it's set to true the function will return all the dependencies before building the arrays.
  if(allDependencies){
    for(let dependency of allDependencies){
    if(row.website.split(':')[0] === 'http' || row.website.split(':')[0] === 'https'){
      response.push([row.website.split('.')[1], dependency])    
    }else{
      response.push([row.website.split('/')[1], dependency])
    }
    }
  }
  return(response); 
}

app.get('/websites/length', async(req, res) => {                             // Read the .csv file and parse its rows into a json object for handling them.
  let workbook = XLSX.readFile('./websites.csv');
  let sheetJSON= XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
  let response = [];
  for(let row of sheetJSON){
    obj = await getLength(row);
    response.push(obj);
  }
  res.send(response);
});

app.get('/websites/dependencies', async(req, res)=>{
  let workbook = XLSX.readFile('./websites.csv');
  let sheetJSON= XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
  let response = [];
  for(let row of sheetJSON){
    obj = await getDependencies(row);
    response.push(obj);
  }
  res.send(response);

});

app.get('/websites/dependenciesfrequency', async (req, res)=>{
  let workbook = XLSX.readFile('./websites.csv');
  let sheetJSON= XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
  let response = [];
  let allDependencies = [];
  for(let row of sheetJSON){
    let dependencies = await getDependencies(row, true);
    for(let dependency of dependencies){
      allDependencies.push(dependency);
    }
  }
  let aux = [];
  for(let dependency of allDependencies){           // Use an auxiliar array for saving which dependencies have been iterated.
    if(aux.includes(dependency)){
      let obj = response.find(object => object.dependency === dependency);
      obj.frequency++;                                                       // If the dependency it's already on the array It' will only increase it's frequeny value on the response object.
    }else{
      aux.push(dependency);
      response.push({dependency: dependency, frequency: 1})       // If not it will push the dependency into the auxiliar array and the response object.
    }
  }
  res.send(response);

});

app.listen(8000, () => {
  console.log('Listening at http://localhost:8000...')
});