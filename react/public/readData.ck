// default file
me.dir() + "readData.txt" => string filename;

// // look at command line
// if( me.args() > 0 ) me.arg(0) => filename;

// on-the-fly shred management

// this is kind of like using the OTF commands 
//     add / remove / replace etc.
// except this is done from code and also can be timed.
// (this is also a hack for including other files)

// infinite time loop 
// while( true )
// {
//     // the path is relative to where 'chuck' is invoked
//     Machine.add( "/MinipopsKick.wav" ) => int moe;

//     // the operation is sample synchronous
//     500::ms => now;

//     // replace
//     Machine.replace( moe, "/MinipopsSnare.wav" ) => int wind;

//     500::ms => now;

//     // remove
//     Machine.remove( wind );
// }


// instantiate
FileIO fio;
StringTokenizer tok;
// open a file
fio.open( filename, FileIO.READ );

2::second => dur beat;
48 => int offset;

// ensure it's ok
if( !fio.good() )
{
    cherr <= "can't open file: " <= filename <= " for reading..."
          <= IO.newline();
    me.exit();
}

// variable to read into
int val;
SinOsc osc => ADSR env => dac;
(1::ms, 100::ms, 0, 1::ms) => env.set;
// loop until end
// while (true) {
//     while( fio.more() )
//     {
//         fio.readLine() => string line;

//         if (line.find("//") == 0) 
//         {
//             line => ProcessComment;
//         } 
//         else if (line.find("R") == 0)
//         {
//             line => ProcessRest;
//         }
//         else 
//         {
//             line => ProcessNote;
//         }
//     }
//     fio.seek( 0 );
// }

fun void ProcessComment(string line) {
    // chout <= line <= IO.newline();
}

fun void ProcessRest(string line) {
    tok.set(line);
    tok.next() => string rest;
    tok.next() => Std.atoi => int div;
    // cherr <= line <= IO.newline();
    beat / div => now;
}

fun void ProcessNote(string line) {
    tok.set(line);
    tok.next() => Std.atoi => int note;
    tok.next() => Std.atoi => int div;
    tok.next() => Std.atof => float val;
    note + offset => Std.mtof => osc.freq;
    val => osc.gain;
    1 => env.keyOn;
    beat / div => now;
}