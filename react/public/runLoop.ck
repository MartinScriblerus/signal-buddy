SndBuf buf => dac;

me.args() - 1 => int argsSize;

string fileArrayUploaded[argsSize - 4];
// Machine.loglevel(0);
// set bpm3
Std.atof(me.arg(0)) => float bpm;

((60.0 / bpm)) => float secLenBeat;

// int totalSeconds = 0;
// int beatCount = 0;
int totalSeconds = 0;
int beatCount = 0;

fun void loopBar(int numeratorSignature, string file[ ], dur beat, dur bar, int running, int pat_test[][][]) {
    beat / 4 => dur sixteenthBeat;
    (secLenBeat)::second => bar;
    SndBuf bufArr[file.size()];
    int playSpecificCount[file.size()];
    for (0 => int count; count < numeratorSignature * 4; count++) {
        // (secLenBeat / numeratorSignature)::second => bar;
        sixteenthBeat => dur thisBeat;

        for (0 => int p; p < file.size(); p++) {
            0 => playSpecificCount[p];
            
            for(int a : pat_test[p][2]){ if (a == count) {1 => playSpecificCount[p]; } }
            // <<< playSpecificCount[p] >>>;
            if ((count % pat_test[p][0][0] == 0 & count % pat_test[p][1][0] != 0) | playSpecificCount[p] == 1 ) {
                <<< "COUNT IS: ", count >>>;
                file[p] => string sample;
                sample => bufArr[p].read;
                0 => bufArr[p].pos;
                0.1 => bufArr[p].gain;
                bufArr[p] => dac;
            }
            me.yield(); 
        }
        totalSeconds = totalSeconds + thisBeat;
        beatCount = beatCount + 1; 
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
        [[2], [4], [4, 5, 6]],
        [[4], [3], [7, 8, 9, 10]],
        [[4], [32], [8, 9, 10, 11]],
        [[8], [32], [9, 10, 11, 12]],
        [[16], [32], [1000]],
        [[32], [32], [1000]]  
    ] 
    @=> int patterns[][][];
        
    for (0 => int s; s < fileArrayUploaded.size(); s++) {
        spork ~ loopBar(Std.atoi(me.arg(3)), fileArray, beat, bar, running, patterns) @=> Shred s;
    }
    1::bar => now;
    me.exit();
}
