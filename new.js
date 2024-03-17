const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
var data = fs.readFileSync('./work.users.json')
var data2 = fs.readFileSync('./work.departments.json')

data = JSON.parse(data);
data2 = JSON.parse(data2);

data2[0].department.forEach((_, i) => {
    data2[0].department[i].users = []
})

for(let i = 0; i < 16; i++) {
    data[i].id = uuidv4();
    data2[0].department.forEach((x, j) => {
        if(data[i].department == x.name) {
            data2[0].department[j].users.push(data[i].id)
        }
    })
}

fs.writeFileSync('./work.users.json', JSON.stringify(data));
fs.writeFileSync('./work.departments.json', JSON.stringify(data2));
