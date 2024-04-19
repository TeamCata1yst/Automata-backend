const totalTime = (start, now_t, init_time, hours, process) => {
    var time = 0
    var alt = 0
    var process = process
    let ptr = start
    var check = false
    while(true) {
        ptr = process.findIndex( (obj) => {
            return obj.task_id == ptr
        })
        if(process[ptr].time_req && process[ptr].time_req != 0) {
            time += process[ptr].time_req
            if(now_t != 0) {
                let now_d = now_t.getDay();

                if(now_d == 0) {
                    now_t.setHours(init_time[0], init_time[1])
                    now_t = new Date(Date.parse(now_t) + 24*60*60*1000) 
                }
            
                let v = new Date(Date.parse(now_t) + process[ptr].time_req)
                let a = v.getHours()
                let b = v.getMinutes()
                if( (a + b/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1])) && (a + b/60 >= init_time[0] + init_time[1]/60) && now_t.getDay() == v.getDay() && now_t.getDate() == v.getDate() ) { 
                    process[ptr].init_time = new Date(Date.parse(now_t))
                    let val = new Date(process[ptr].time_req)
                    
                    now_t.setHours(now_t.getHours() + val.getHours())
                    now_t.setMinutes(now_t.getMinutes() + val.getMinutes())
                    
                    var n = new Date()
                    n.setHours(init_time[0] + hours[0], init_time[1] + hours[1]*60)
                    n.setDate(now_t.getDate())
                    n.setMonth(now_t.getMonth())
                    process[ptr].deadline = n
                } else { 
                    now_t.setHours(init_time[0], init_time[1])
                    if(!( a + b/60 < init_time[0] + init_time[1]/60 && a + b/60 >= 0))
                        now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                    //left hour logic with while
                    var left_over = process[ptr].time_req/(24*60*60*1000)
                    while(left)
                    
                    var n = new Date()
                    n.setHours(init_time[0] + hours[0], init_time[1] + hours[1]*60)
                    n.setDate(now_t.getDate())
                    n.setMonth(now_t.getMonth())
                    
                    
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
            var obj = totalTime(i, now_t, init_time, hours, process)
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
