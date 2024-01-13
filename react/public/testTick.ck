Std.atoi(me.arg(0)) => int tickCount;

Std.atof(me.arg(1)) => float bpm;

((60.0 / bpm)) => float secLenBeat;

0::ms => dur totalSeconds;
0 => int beatCount;
int startTime;


            // SndBuf testbuf => dac;
            // "/KEY_1.wav" => testbuf.read;
            // 0 => testbuf.pos;
            // 0.5 => testbuf.gain;
            // 0.5 => testbuf.rate;
            // <<< testbuf >>>;
            // 10000000000::second => now;
fun void loopBar(int numeratorSignature, float beat, dur bar, int denominatorSignature) {
    // beat => dur sixteenthBeat;
    //(secLenBeat)::second => bar;
    for (0 => int count; count < (4 * 4); count++) {
    // if (beatCount < numeratorSignature) {
        // sixteenthBeat => dur thisBeat;
        // totalSeconds + thisBeat => totalSeconds;

        secLenBeat / (numeratorSignature * 2) => float secLenTick;
        
        for (0 => int i; i < (numeratorSignature * 2); i++) {
            <<< "me dir", me.dir() >>>;
            <<< "subTick-", i >>>;
            (beat/4)::second => now;
            if (i == (numeratorSignature * 2) - 1) {
                beatCount + 1 => beatCount;
                <<< "tick-", beatCount >>>;
            }
        };
        // 1::thisBeat => now;
        // beat::second => now;
        // if (count == 0) {
            // <<< "tick-beat",count >>>;
        // }
    }
        Machine.removeAllShreds();
        Machine.resetShredID();
}

// infinite time loop
<<< Std.atoi(me.arg(3)) >>>;
while( true )
{
    if (secLenBeat > .000000001) {
        4 => int denominatorSignature;
        Std.atoi(me.arg(2)) => int numeratorSignature;
for (0 => int count; count < numeratorSignature * denominatorSignature; count++) {
        
        secLenBeat => float beat;
        
        (secLenBeat * denominatorSignature * numeratorSignature)::second => dur bar;
        // spork ~ loopBar(numeratorSignature, beat, bar, denominatorSignature) @=> Shred s;
        loopBar(numeratorSignature, beat, bar, denominatorSignature);
        // <<< "B A R ! ! ! : ", bar >>>;
        // <<< "ZERO! ",Std.atoi(me.arg(0)) >>>;
        // <<< "FOUR! ",Std.atoi(me.arg(4)) >>>;
        // 1::bar => now;
        if (Std.atoi(me.arg(0)) == 0) {
           Std.atoi(me.arg(4)) => startTime;
           <<< "starttime", startTime >>>;
        }
        // if ((count + 1) % numeratorSignature == 0) {
            
        // }
}
    }
    me.exit();
}
