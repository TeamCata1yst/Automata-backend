const totalTime = (start, now_t, init_time, hours, weekend, process) => {
    var time = 0
    var alt = 0
    var process = process
    let ptr = start
    var check = false
    while(true) {
        ptr = process.findIndex( (obj) => {
            return obj.task_id == ptr
        })
        if(process[ptr].time_req && process[ptr].time_req != 0 && (!process[ptr].status || (process[ptr].status == 0 || process[ptr].status == -1 || process[ptr].status == 4))) {
            time += process[ptr].time_req
            if(now_t != 0) { 
                while(weekend.includes(now_t.getDay)) {
                    now_t.setHours(init_time[0], init_time[1])    
                    now_t.setDate(now_t.getDate() + 1)
                }
                if(now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 && now_t.getHours() + now_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) {
                    process[ptr].init_time = new Date(Date.parse(now_t))
                    var after_t = new Date(Date.parse(now_t) + process[ptr].time_req)
                    if((after_t.getHours() + after_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 && after_t.getHours() + after_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) && now_t.getDate() == after_t.getDate() && now_t.getFullYear() == after_t.getFullYear() && now_t.getMonth() == after_t.getMonth()) {
                        let val = process[ptr].time_req/(1000*60*60)
                        now_t.setHours(now_t.getHours() + Math.floor(val), now_t.getMinutes() + ((val*10)%10)*6) 
                        process[ptr].deadline = new Date(Date.parse(now_t))
                    } else {
                                            
                        let dis = ((init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) - (now_t.getHours() + now_t.getMinutes()/60)
                        var left_over = process[ptr].time_req/(1000*60*60) - dis
                        now_t.setHours(init_time[0], init_time[1])
                        now_t.setDate(now_t.getDate() + 1)
                        
                        while(weekend.includes(now_t.getDay())) {
                            now_t.setDate(now_t.getDate() + 1) 
                        }

                        while(left_over > hours[0] + hours[1]/10) {
                            if(weekend.includes(now_t.getDay())) {
                                now_t.setDate(now_t.getDate() + 1) 
                            } else {
                                left_over -= (hours[0] + hours[1]/10)
                                now_t.setDate(now_t.getDate() + 1)
                            }
                        }
                        now_t.setHours(now_t.getHours() + Math.floor(left_over), now_t.getMinutes() + ((left_over*10)%10)*6)
                        process[ptr].deadline = new Date(Date.parse(now_t))
                    }
                } else {
                    if(now_t.getHours() + now_t.getMinutes()/60 > (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) {
                        now_t.setDate(now_t.getDate() + 1)
                    }
                    now_t.setHours(init_time[0], init_time[1])
                    while(weekend.includes(now_t)) {
                        now_t.setDate(now_t.getDate() + 1)
                    }
                    process[ptr].init_time = new Date(Date.parse(now_t))
                    var left_over = process[ptr].time_req/(1000*60*60)
                    while(left_over > hours[0] + hours[1]/10) {
                        if(weekend.includes(now_t.getDay())) {
                            now_t.setDate(now_t.getDate() + 1) 
                        } else {
                            left_over -= (hours[0] + hours[1]/10)
                            now_t.setDate(now_t.getDate() + 1)
                        }
                    }
                    now_t.setHours(now_t.getHours() + Math.floor(left_over), now_t.getMinutes() + ((left_over*10)%10)*6)
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
            
            var obj = totalTime(i, now_t, init_time, hours, weekend, process)
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
