var machina = require('machina');

var NodeCache = require( "node-cache" );
var ninjaCache = new NodeCache();

var jFSM = machina.BehavioralFsm.extend( {
    namespace: "jobs-fsm",
    initialState: "start",
    states: {    
        start:{
            newJob:function(job){                
                job.ninjas = ['N1','N2', 'N3']      
                console.log('start',job.id, job.ninjas)
                this.transition(job,"contactNinja")
            },
        },
        contactNinja: {
             _onEnter: function(job) {
                  console.log('contactNinja _onEnter : Calling :',job.id,job.ninjas[0]);   
                 this.emit( "ninjaContacted",{'id': job.ninjas[0]});
                 job.timer = setTimeout( function() {
                     console.log("Timeout",job.id)
                     this.handle(job, "timeout" );
                 }.bind( this ), 10000 );                 
            },
            timeout: "ninjaRejected",
            _onExit: function( client ) {
                clearTimeout( client.timer );
            },
            accept: "ninjaAccepted",
            reject: "ninjaRejected"
        },
        ninjaAccepted :{
            _onEnter: function(job){
                console.log('contactNinja accept',job.id);
                this.transition(job, "second")
            }           
        },
        ninjaRejected: {
            _onEnter:function(job){                
                job.ninjas.shift();  
                console.log('ninjaRejected',job.id, job.ninjas);
                if(job.ninjas.length > 0){
                    this.transition(job,"contactNinja")    
                }else{
                    this.transition(job,"terminate")    
                }
            }
        },
        terminate : {
            _onEnter:function(job){                
                console.log('Cant find any more Ninjas! Exiting',job.id)
            }
        }
    },
    newJob: function(job) {
        console.log('New Job Handler', job)
        this.handle(job, "newJob" );
    },
    accept: function(job){
        this.handle(job, "accept" );        
    },
    reject: function(job){
        this.handle(job, "reject" );        
    }
} );

var nFSM = machina.BehavioralFsm.extend({
    namespace: "ninja-fsm",
    initialState: "start",
    states: {         
        start:{
            available:function(ninja){
                console.log("NFSM:: " + ninja.id + ' start available')
                this.transition(ninja,"free");
            }
        },
        free:{
            _onEnter:function(ninja){
                console.log("NFSM:: " + ninja.id + ' free _onEnter')
            },
            kontacted:function(ninja){
                this.transition(ninja,"contacted")   
            }
        },
        contacted:{
            _onEnter:function(ninja){
                console.log("NFSM:: " + ninja.id + ' contacted _onEnter')
            },
             rejected:function(ninja){
                this.transition(ninja,"free")   
            }
        },
        onjob:{
            _onEnter:function(ninja){}
        },
        offline:{
            _onEnter:function(ninja){}
        }
    },
    available: function(ninja){
        console.log("NFSM:: " + ninja.id + ' available')
        this.handle(ninja,"available")
    },
    kontacted:function(ninja){
        console.log("NFSM:: " + ninja.id + ' kontacted')
        this.handle(ninja,"kontacted")
    },
    rejected: function(ninja){
        console.log("NFSM:: " + ninja.id + ' rejected')
        this.handle(ninja,"rejected")
    }
});

var test1 = new jFSM();
var nFSMTest = new nFSM();

/*test1.on("ninjaContacted",function(data){
    console.log('Event:ninjaContacted', data);
    ninja = ninjaCache.get(data.id);
    nFSMTest.rejected(ninja);
});


var ninja1 = {id: "N1"};
var ninja2 = {id: "N2"};
var ninja3 = {id: "N3"};


nFSMTest.available(ninja1)
nFSMTest.available(ninja2)
nFSMTest.available(ninja3)

ninjaCache.set( ninja1.id, ninja1, function(err, succ){if(!err && succ) console.log(succ)});
ninjaCache.set( ninja2.id, ninja2, function(err, succ){if(!err && succ) console.log(succ)});
ninjaCache.set( ninja3.id, ninja3, function(err, succ){if(!err && succ) console.log(succ)});*/

var job1 = { id:"job1" };
var job2 = { id:"job2" };

test1.newJob(job1);
test1.newJob(job1);
//test1.reject(job1);

//test1.newJob(job2);
//test1.accept(job2);




