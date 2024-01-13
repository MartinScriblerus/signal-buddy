// default file
"./readData.txt" => string filename;

<<< filename >>>;

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

Std.atof(me.arg(0)) => float bpm;
Std.atoi(me.arg(1)) => int numeratorSignature;
Std.atoi(me.arg(2)) => int denominatorSignature;
me.arg(3) => string fileUpload;

((60.0 / bpm)) => float secLenBeat;

// secLenBeat => float beatUpdate;
        
(secLenBeat * denominatorSignature * numeratorSignature)::second => dur bar;

// <<< div >>>;
// <<< numeratorSignature >>>;
// <<< denominatorSignature >>>;
// <<< beat >>>;
// <<< bar >>>;


// instantiate
FileIO fio;
StringTokenizer tok;
// open a file
fio.open( filename, FileIO.READ );

(secLenBeat)::second => dur beat;
48 => int offset;

// ensure it's ok
if( !fio.good() )
{
    cherr <= "can't open file: " <= filename <= " for reading..."
          <= IO.newline();
    me.exit();
}

/////////////////////////
SndBuf buffy => LiSa lisa => dac;
1.0 => lisa.rate;
1 => lisa.loop;
1 => lisa.bi;

fileUpload => buffy.read;
0 => buffy.pos;
0.5 => buffy.gain;
0.5 => buffy.rate;
buffy.samples()::samp => lisa.duration;

for (0 => int i; i < buffy.samples(); i++) {
    lisa.valueAt(buffy.valueAt(i), i::samp);
}
1 => lisa.play;
/////////////////////////


// variable to read into
int val;
SinOsc osc => ADSR env => LPF lpf => Pan2 pan => dac;
(0.5::ms, 100::ms, 0, 1::ms) => env.set;

0.2 => osc.gain;
1000 => lpf.freq;
4 => lpf.Q;

// loop until end
while (true) {
    while( fio.more() )
    {
        fio.readLine() => string line;

        if (line.find("//") == 0) 
        {
            line => ProcessComment;
        } 
        else if (line.find("R") == 0)
        {
            line => ProcessRest;
        }
        else 
        {
            line => ProcessNote;
        }
    }
    fio.seek( 0 );
}

fun void ProcessComment(string line) {
    chout <= line <= IO.newline();
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
    ProcessExtras(tok);
    1 => env.keyOn;
    beat / div => now;
}

fun void ProcessExtras(StringTokenizer tok) {
    while(tok.more()) {
        tok.next() => string extra;
        if(extra.find("P")==0)
        {
            extra.substring(1) => Std.atof => pan.pan;
        }
        if(extra.find("F")==0)
        {
            extra.substring(1) => Std.atof => lpf.freq;
        }
        if(extra.find("Q")==0)
        {
            extra.substring(1) => Std.atof => lpf.Q;
        }
    }
}