SndBuf buf => dac;
<<< me.arg(0) >>>;
<<< "ME ARG ABOVE" >>>;
float secLenBeat;

if (1.0 > 0.1) {
    1.0 => secLenBeat;
} else {
    .5 => secLenBeat;
} 
fun void playSixteenthNote( int count, int numeratorSignature, string file, dur beat, dur bar, int pat_test[][] ) {
    <<< "FILE IN 16th" >>>;
    <<< file >>>;
    <<< "COUNT" >>>;
    <<< count >>>;
    0 => int playForce;
    0 => int doNotPlay; 
    <<< "PAT TEST SIZE" >>>;
    <<< pat_test[1].size() >>>;
    for (0 => int v; v < pat_test[1].size(); v++){
        if (count == pat_test[1][v]) {
            <<< "COUNT EQUALS PAT_TEST" >>>;
            <<< pat_test[1][v] >>>;
            1 => playForce;
        };
    }
    <<< "PAT TEST 2 SIZE" >>>;
    <<< pat_test[2].size() >>>;
    for (0 => int v; v < pat_test[2].size(); v++){
        if (count == pat_test[2][v]) {
            1 => doNotPlay;
        };
    }
    if ((playForce == 1 | ((count + 1) % pat_test[0][0] == 0) && (pat_test[0][1] == 0 | (pat_test[0][1] != 0 && (count + 1) % pat_test[0][1] != 0))) & (doNotPlay != 1)) {

        <<< file >>>;

        file => string sample;
        sample => buf.read;
        // <<< buf >>>;
        Machine.add( sample ) => int f;

        1::beat => now;
    
        Machine.remove( f );
    
        Machine.resetShredID();
    } else {
        1::beat => now;
    }
}

fun void loopBar(int numeratorSignature, string file, dur beat, dur bar, int running, int pat_test[][]) {

    beat / 4 => dur sixteenthBeat;
    
    for (0 => int count; count < numeratorSignature * 4; count++) {
        (secLenBeat * numeratorSignature)::second => bar;
        <<< "DO WE HAVE A F I L E" >>>;
        <<< file >>>;
        <<< "FILE ABOVE" >>>;
        playSixteenthNote(count, numeratorSignature, file, sixteenthBeat, bar, pat_test);
    }

}

if (secLenBeat > .000000001) {
    <<< "LAST BPM:" >>>;
    <<< Std.atoi(me.arg(3)) >>>;
    Std.atoi(me.arg(3)) => int numeratorSignature;
    secLenBeat::second => dur beat;
    (secLenBeat * numeratorSignature)::second => dur bar;
    
    me.arg(0) => string fileArr;
    <<< "WTF FILE" >>>;
    <<< fileArr >>>;

    // "uploadedFiles.ck" => string hatFilename;
    // "MinipopsKick.ck"  => string snareFilename;
    // "MinipopsSnare.ck"  => string kickFilename;

    fileArr => string hatFilename;
    "MinipopsSnare.ck" => string snareFilename;
    "MinipopsKick.ck" => string kickFilename;
                        
    [ hatFilename, snareFilename, kickFilename ] @=> string fileArray[ ];
    <<< "FILE ARR START" >>>;
    <<< fileArray.toString() >>>;
    <<< "FILE ARR END" >>>;
    int running;
    <<< "RUNNING:" >>>;
    <<< Std.atoi(me.arg(2)) >>>;
    Std.atoi(me.arg(2)) => running;

    [   
        [[1, 0], [1000], [1000]],
        [[16, 16], [1], [1000]],
        [[2, 0], [0, 1, 2, 3], [6, 8]] 
    ] @=> int patterns[][][];
        
    for (0 => int s; s < patterns.size(); s++) {
        <<< fileArray >>>;
        <<< "NUMERATOR SIGNATURE!" >>>;
        <<< me.arg(4) >>>;
        <<< "LAST BPM" >>>;
        <<< Std.atoi(me.arg(3)) >>>;
        <<< "FILE ARRAY S" >>>;
        <<< fileArray[s] >>>;
        spork ~ loopBar(Std.atoi(me.arg(4)), fileArray[s], beat, bar, running, patterns[s]) @=> Shred s;

    }


    1::bar => now;
    me.exit();
}
