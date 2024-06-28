if(process.argv.length != 3) {
    console.log("Error: invalid arguments");
    console.log("Help:\n\tnode complete_tasks.js projects.json\n\nIt requires projects from database. Export projects from database as JSON.")
    process.exit(-1);
}


const fs  = require('fs');

const db = process.argv[2];
const project_id = process.argv[3];
const task_id = process.argv[4];
const milestones = [];

const data = JSON.parse(fs.readFileSync(db));
let mil =  [ 
    { name: "Engagement ", rating: -1},
    { name: "Design sign Off", rating: -1},
    { name: "Design Development (DD)", rating: -1},
    { name: "Foundation Packet", rating: -1},
    { name: "Architecture Packet", rating: -1},
    { name: "Interior Presentation-1", rating: -1},
    { name: "Interior Presentation-2", rating: -1},
    { name: "Interior Packet-1", rating: -1},
    { name: "Interior Packet-2", rating: -1},
    { name: "After completion", rating: -1}
  ]
data.forEach((x, i) => {
    data[i].milestones = mil
})

fs.writeFileSync(db, JSON.stringify(data));
