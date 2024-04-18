const totalTime = (start, now_t, init_time, hours, leaves, process) => {
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
                while(leaves.includes(now_t.getDay())) {
                    
                    now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                }
                if( !( ( now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 ) && ( now_t.getHours() + now_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10) ) )) {
                    if( !( now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + hours[0] + init_time[1]/60 + hours[1]/10 )) {
                        now_t.setHours(init_time[0], init_time[1])
                        
                    } else {
                        now_t.setHours(init_time[0], init_time[1])
                        now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                        
                    }
                }
                
                var after_t = new Date(Date.parse(now_t) + process[ptr].time_req)
                process[ptr].init_time = new Date(Date.parse(now_t))

                
                if((after_t.getHours() + after_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10) ) && after_t.getDay() == now_t.getDay() && after_t.getDate() == now_t.getDate()) {
                    
                    process[ptr].deadline = new Date(Date.parse(after_t))
                    now_t = after_t
                } else {
                    var out_t = new Date(Date.parse(now_t))
                    out_t.setHours(init_time[0] + hours[0], init_time[1] + (hours[1]/10)*60)

                    
                    var left_over = (process[ptr].time_req - (Date.parse(out_t) - Date.parse(now_t)))/(1000*60*60)
                    if(left_over < 0)
                        left_over = 0
                    
                    while(left_over > (hours[0] + hours[1]/10)) {
                        
                        if(leaves.includes(now_t.getDay())) {
                            now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                            continue
                        }
                        now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                        left_over -= (hours[0] + hours[1]/10)
                        
                    }
                    now_t.setHours(init_time[0], init_time[1])
                    
                    
                    now_t = new Date(Date.parse(now_t) + (left_over*60*60*1000) + 24*60*60*1000)
                    process[ptr].deadline = new Date(Date.parse(now_t))
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
            
            var obj = totalTime(i, now_t, init_time, hours, leaves, process)
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
