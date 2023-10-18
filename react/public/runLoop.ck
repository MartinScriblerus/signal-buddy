SndBuf buf => dac;

me.args() - 1 => int argsSize;

string fileArrayUploaded[argsSize - 4];
Machine.loglevel(0);
// set bpm
Std.atof(me.arg(0)) => float bpm;

((60.0 / bpm)) => float secLenBeat;

fun void loopBar(int numeratorSignature, string file[ ], dur beat, dur bar, int running, int pat_test[][][]) {
    beat / 4 => dur sixteenthBeat;
    (secLenBeat / numeratorSignature)::second => bar;
    SndBuf bufArr[file.size()];
    for (0 => int count; count < numeratorSignature * 4; count++) {
        // (secLenBeat / numeratorSignature)::second => bar;
        sixteenthBeat => dur thisBeat;
        for (0 => int p; p < file.size(); p++) {
            if (count % pat_test[p][0][0] == 0) {
                // <<< "COUNT IS: ", count >>>;
                <<< "PAT TEST: ", pat_test[p][0][0] >>>;
                file[p] => string sample;
                sample => bufArr[p].read;
                bufArr[p] => dac;
            }
            me.yield(); 
        }
        1::thisBeat => now;
    }
    for (int f; f < file.size(); f++){    
        Machine.remove(f);
    }
    Machine.removeAllShreds();
    Machine.resetShredID();
}

if (secLenBeat > .000000001) {
    Std.atoi(me.arg(2)) => int numeratorSignature;
    secLenBeat::second => dur beat;
    (secLenBeat * numeratorSignature)::second => dur bar;
    for (0 => int a; a < me.args(); a++) {
        if (a > 4 & me.arg(a) != "") {
            if (me.arg(a) != "") {
                fileArrayUploaded << me.arg(a);
            }
        }
    } 

    int erased;

    for (0=>int i; i < fileArrayUploaded.size(); i++) {
        if (fileArrayUploaded[i] == "") {
            fileArrayUploaded.erase( i );
            erased + 1 => erased;
        }
    }            

    fileArrayUploaded @=> string fileArray[ ];
    int running;
    Std.atoi(me.arg(1)) => running;

    [   
        [[1], [6], [3]],
        [[2], [8], [16]],
        [[4], [3], [9]],
        [[1], [6], [3]],
        [[2], [8], [16]],
        [[4], [3], [9]]  
    ] @=> int patterns[][][];
        
    for (0 => int s; s < fileArrayUploaded.size(); s++) {
        spork ~ loopBar(Std.atoi(me.arg(3)), fileArray, beat, bar, running, patterns) @=> Shred s;
    }
    1::bar => now;
    me.exit();
}
