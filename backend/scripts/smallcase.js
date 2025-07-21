if(process.argv.length != 3) {
    console.log("Error: invalid arguments");
    console.log("Help:\n\tnode complete_tasks.js projects.json\n\nIt requires projects from database. Export projects from database as JSON.")
    process.exit(0);
}


const fs  = require('fs');

const db = process.argv[2];
const project_id = process.argv[3];
const task_id = process.argv[4];


const data = JSON.parse(fs.readFileSync(db));
data.forEach((x, i) => {
    data[i].email = x.email.toLowerCase();
});
console.log(data);
fs.writeFileSync(db, JSON.stringify(data));
