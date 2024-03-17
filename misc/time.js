const totalTime = (start, process) => {
    var time = 0;
    var alt = 0
    let ptr = start
    var check = false
    while(true) {
        console.log(process[ptr])
        if(process[ptr].time_req) {
            time += process[ptr].time_req
        }
        if(process[ptr].next && process[ptr].next.length > 1) {
            check = true
            alt = ptr
            break       
        }
        if(process[ptr].next.length == 1) {
            ptr = process[ptr].next[0]
        } else {
            break
        }
    }
    var maxTime = 0 
    if(check) {
        process[alt].next.forEach(i => {
            console.log(i)
            let t = totalTime(i, process)
            if(t > maxTime) {
                maxTime = t
            }
        })
    }
    return time + maxTime
}

const endTime = (time, buffer) => {
    const curr = Date.now();
    // Later for precise timing
    // mark the deadline of each tash
    // this would require you to implement the same logic as totaltime
    
}

module.exports = { totalTime, endTime };
