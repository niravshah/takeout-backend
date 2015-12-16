var machina = require('machina');

var vehicleSignal = new machina.BehavioralFsm( {

    initialize: function( options ) {
        // your setup code goes here...
    },

    namespace: "vehicle-signal",

    initialState: "uninitialized",

    states: {
        uninitialized: {
            "*": function( client ) {
                console.log('uninitialized *');
                this.deferUntilTransition( client );
                this.transition( client, "green" );
            }
        },
        green: {
            _onEnter: function( client ) {
                console.log('green _onEnter');
                client.timer = setTimeout( function() {
                    this.handle(  client, "timeout" );
                }.bind( this ), 10000 );
                this.emit( "vehicles", { client: client, status: 'GREEN' } );
            },
            timeout: "green-interruptible",
            pedestrianWaiting: function( client ) {
                console.log('green pedestrianWaiting');
                this.deferUntilTransition(  client, "green-interruptible" );
            },
            _onExit: function( client ) {
                console.log('green _onExit');
                clearTimeout( client.timer );
            }
        },
        "green-interruptible": {
            pedestrianWaiting: "yellow"
        },
        yellow: {
            _onEnter: function( client ) {
                console.log('yellow _onEnter', client);
                client.timer = setTimeout( function() {
                    this.handle( client, "timeout" );
                }.bind( this ), 5000 );
                this.emit( "vehicles", { client: client, status: 'YELLOW' } );
            },
            timeout: "red",
            _onExit: function( client ) {
                clearTimeout( client.timer );
            }
        },
        red: {
            _onEnter: function( client ) {
                console.log('red _onEnter');
                client.timer = setTimeout( function() {
                    this.handle( client, "timeout" );
                }.bind( this ), 1000 );
            },
            _reset: "green",
            _onExit: function( client ) {
                clearTimeout( client.timer );
            }
        }
    },

    reset: function( client ) {
        this.handle(  client, "_reset" );
    },

    pedestrianWaiting: function( client ) {
        console.log('pedestrianWaiting');
        this.handle( client, "pedestrianWaiting" );
    }
} );

var light1 = { location: "Dijsktra Ave & Hunt Blvd", direction: "north-south" };
var light2 = { location: "Dijsktra Ave & Hunt Blvd", direction: "east-west" };

// to use the behavioral fsm, we pass the "client" in as the first arg to API calls:
vehicleSignal.pedestrianWaiting(light1);
console.log('Light1', light1);
setTimeout(function(){console.log('Timeout - Light1',light1)},8000)

// Now let's signal a pedestrian waiting at light2
//vehicleSignal.pedestrianWaiting(light2);
//console.log('Light2', light2);



