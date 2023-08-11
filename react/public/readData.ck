// default file
me.dir() + "readData.txt" => string filename;

// // look at command line
// if( me.args() > 0 ) me.arg(0) => filename;

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