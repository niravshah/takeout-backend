var machina = require('machina');

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
            }
        },
        contacted:{
            _onEnter:function(ninja){}
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
    }
});

var ninja1 = {id: "N1"};
var ninja2 = {id: "N2"};
var ninja3 = {id: "N3"};
var nFSMTest = new nFSM();
nFSMTest.available(ninja1)
