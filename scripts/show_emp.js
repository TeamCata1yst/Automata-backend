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
if(data[i].process[163].name == "Store data on One Drive ") {
    data[i].process[163].dept = "ADMINISTRATOR OR PROCESS CORDINATOR";
    console.log(data[i].name + ": done");
} else {
    console.log(data[i].name + ": failed");
}
});

fs.writeFileSync(db, JSON.stringify(data));
