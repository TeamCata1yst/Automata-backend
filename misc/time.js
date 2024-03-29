const totalTime = (start, now_t, process) => {
    var time = 0
    var alt = 0
    var process = process
    let ptr = start
    var check = false
    while(true) {
        ptr = process.findIndex( (obj) => {
            return obj.task_id == ptr
        })
        if(process[ptr].time_req) {
            time += process[ptr].time_req
            if(now_t != 0) {
                let now_d = now_t.getDay();

                if(now_d == 0) {
                    now_t.setHours(9)
                    now_t.setDate(now_t.getDate() + 1)
                }
            
                let a = new Date(now_t + process[ptr].time_req).getHours() 
            
                if(a <= 19 && a >= 9) { 
                    let val = new Date(process[ptr].time_req)
                    
                    now_t.setHours(now_t.getHours() + val.getHours())
                    now_t.setMinutes(now_t.getMinutes() + val.getMinutes())
                    
                    var n = new Date()
                    n.setHours(17, 30)
                    n.setDate(now_t.getDate())
                    process[ptr].deadline = n
                } else { 
                    now_t.setHours(9)
                    if(!(a < 9 && a >= 0))
                        now_t.setDate(now_t.getDate() + 1) 
                        
                    var n = new Date()
                    n.setHours(17, 30)
                    n.setDate(now_t.getDate())
                    process[ptr].deadline = n
                }
            }
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
            console.log(process, i)
            var obj = totalTime(i, now_t, process)
            process = obj.process
            t = obj.t
            if(t > maxTime) {
                maxTime = t
            }
        })
    }
    return { t: time + maxTime, process } 
}

module.exports = { totalTime };
