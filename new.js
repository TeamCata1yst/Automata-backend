const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
var data = fs.readFileSync('./work.templates.json')

data = JSON.parse(data);

data.forEach((elem, i) => {
    elem.process.forEach( (elem2, j)=> {
        data[i].process[j].task_id = data[i].process[j].id
        delete data[i].process[j].id
    })
})

fs.writeFileSync('./work.templates.json', JSON.stringify(data));
