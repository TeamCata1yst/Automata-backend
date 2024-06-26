if(process.argv.length != 5) {
    console.log("Error: invalid arguments");
    console.log("Help:\n\tnode complete_tasks.js projects.json project_id task_id\n\nIt requires projects from database. Export projects from database as JSON.")
    process.exit(0);
}

function set_complete(counter) {
    while(true) {
        
        if(pro[counter].next.length > 1) {
            break;
        }
        if(pro[counter].next.length == 1) {
            counter = pro[counter].next[0];
        } else {
            break;
        }
    }
    if(pro[counter].next.length != 0) {
        pro[counter].next.forEach(x => {
            set_complete(x, task_id);
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

set_complete(0, task_id);

