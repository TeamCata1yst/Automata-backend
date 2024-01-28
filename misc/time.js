const totalTime = (start, process) => {
    var time = 0;
    var alt = 0
    let ptr = start
    var check = false
    while(true) {
        if(process[ptr].time) {
            time += process[ptr].time
        }
        if(process[ptr].next && process[ptr].next.length > 1) {
            check = true
            alt = ptr
            break       
        }
        if(process[ptr].next) {
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



module.exports = { totalTime };
