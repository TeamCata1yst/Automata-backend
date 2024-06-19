if(process.argv.length != 5) {
    console.log("Error: invalid arguments");
    console.log("Help:\n\tnode change_start.js projects.json project_id task_id\n\nIt requires projects from database. Export projects from database as JSON.")
    process.exit(0);
}

function change_start(counter, task_id) {
    while(counter != task_id) {
        pro[counter].selected_resource = "";
        pro[counter].name = "";
        pro[counter].dept = "";

        if(pro[counter].next.length > 1) {
            break;
        }
        if(pro[counter].next.length == 1) {
            counter = pro[counter].next[0];
        } else {
            break;
        }
    }
    if(counter != task_id) {
        pro[counter].next.forEach(x => {
            change_start(x, task_id);
        })
    }
}

const fs  = require('fs');
const db = process.argv[2];
const project_id = process.argv[3];
const task_id = process.argv[4];

const data = JSON.parse(fs.readFileSync(db));
let index = data.findIndex(x => x.id == project_id);

let pro = data[index].process;

change_start(1, task_id);
data[index].process = pro;
data[index].process[0].next = [ task_id ]

console.log(data[index].process)
console.log("Change Successful.")
fs.writeFileSync("we.json", JSON.stringify(pro))
