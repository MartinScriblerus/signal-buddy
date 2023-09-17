float secLenBeat;

if (60 / Std.atof(me.arg(0)) > .1) {
    60 / Std.atof(me.arg(0)) => secLenBeat;
} else {
    .5 => secLenBeat;
} 

fun void playWholeNote( int count, int numeratorSignature, string hatFilename, dur beat, dur bar ) {
    if (count + 1 == numeratorSignature) {
        <<< "Whole BAR!" >>>;
    } else {
        <<< count >>>;
    }

    Machine.add( hatFilename ) => int hat;
    1::beat => now;
    Machine.remove( hat );
    Machine.resetShredID();
}

fun void playHalfNote( int count, int numeratorSignature, string hatFilename, dur beat, dur bar ) {
    if (count + 1 == numeratorSignature) {
        <<< "Half BAR!" >>>;
    } else {
        <<< count >>>;
    }

    Machine.add( hatFilename ) => int hat;
    1::beat => now;
    Machine.remove( hat );
    Machine.resetShredID();
}

fun void playQuarterNote( int count, int numeratorSignature, string hatFilename, dur beat, dur bar ) {
    if (count + 1 == numeratorSignature) {
        <<< "Quarter BAR!" >>>;
    } else {
        <<< count >>>;
    }

    Machine.add( hatFilename ) => int hat;
    1::beat => now;
    Machine.remove( hat );
    Machine.resetShredID();
}

fun void playEighthNote( int count, int numeratorSignature, string hatFilename, dur beat, dur bar ) {
    if (count + 1 == numeratorSignature) {
        <<< "Eighth BAR!" >>>;
    } else {
        <<< count >>>;
    }

    Machine.add( hatFilename ) => int hat;
    1::beat => now;
    Machine.remove( hat );
    Machine.resetShredID();
}

fun void playSixteenthNote( int count, int numeratorSignature, string file, dur beat, dur bar, int pat_test[][] ) {
    <<< "Sixteenth!" >>>;
    0 => int playForce;
    0 => int doNotPlay; 
    for (0 => int v; v < pat_test[1].size(); v++){
        if (count == pat_test[1][v]) {
            1 => playForce;
        };
    }
    for (0 => int v; v < pat_test[2].size(); v++){
        if (count == pat_test[2][v]) {
            1 => doNotPlay;
        };
    }
    if ((playForce == 1 | ((count + 1) % pat_test[0][0] == 0) && (pat_test[0][1] == 0 | (pat_test[0][1] != 0 && (count + 1) % pat_test[0][1] != 0))) & (doNotPlay != 1)) {
        Machine.add( file ) => int f;
        1::beat => now;
        Machine.remove( f );
        Machine.resetShredID();
    } else {
        1::beat => now;
    }
}

fun void loopBar(int numeratorSignature, string file, dur beat, dur bar, int running, int pat_test[][]) {
    beat => dur quarterBeat;
    beat * 2 => dur halfBeat;
    beat * 4 => dur wholeBeat;
    beat / 2 => dur eighthBeat;
    beat / 4 => dur sixteenthBeat;
 
    // TODO => FIGURE OUT DENOMINATOR SIGNATURES
    for (0 => int count; count < numeratorSignature * 4; count++) {
        (secLenBeat * numeratorSignature)::second => bar;
        playSixteenthNote(count, numeratorSignature, file, sixteenthBeat, bar, pat_test);
    }
    Machine.resetShredID();
}

if (secLenBeat > .000000001) {
    Std.atoi(me.arg(3)) => int numeratorSignature;
    secLenBeat::second => dur beat;
    (secLenBeat * numeratorSignature)::second => dur bar;
    me.dir() + "MinipopsHH.ck" => string hatFilename;
    me.dir() + "MinipopsSnare.ck" => string snareFilename;
    me.dir() + "MinipopsKick.ck" => string kickFilename;

    [ hatFilename, snareFilename, kickFilename ] @=> string fileArray[];

    int running;
    Std.atoi(me.arg(1)) => running;
    <<< "RUNNING$$$$ : " >>>;
    <<< running >>>;

    [   
        [[1, 0], [1000], [1000]], // [fileArray[i], [%x, @!y], [special#s], [!#special#s]]
        [[16, 16], [1], [1000]],
        [[2, 0], [0, 1, 2, 3], [6, 8]] 
    ] @=> int patterns[][][];

    for (0 => int s; s < patterns.size(); s++) {
        spork ~ loopBar(numeratorSignature, fileArray[s], beat, bar, running, patterns[s]) @=> Shred s;

    }
    
    1::bar => now;
    me.exit();
}



//////////////////////////////////////////////////////////
// LISA IMPLEMENTATION +++++++++++++++++++++++++++++++++++
// me.dir() + "MinipopsSnare.ck" => string snareFilename;
// me.dir() + "MinipopsKick.ck" => string kickFilename;
// me.dir() + "MinipopsHH.ck" => string hihatFilename;

// 0.5::second => dur beat;
// beat * 4 => dur bar;

// while( true )
// {
//     // the path is relative to where 'chuck' is invoked
//     Machine.add( kickFilename ) => int moe;

//     // the operation is sample synchronous
//     1::beat => now;

//     replace
//     Machine.replace( moe, snareFilename) => int wind;

//     1::beat => now;

//     // // remove
//     // Machine.remove( wind );
// }
// FileIO io;


// SndBuf buf1 => dac;
// SndBuf buf2 => dac;
// SndBuf buf3 => dac;

// "MinipopsSnare.wav" => string snare;
// snare => buf2.read;
// "MinipopsKick.wav" => string kickdrum;
// kickdrum => buf1.read;
// "MinipopsHH.wav" => string hihat;
// hihat => buf3.read;

// 0.5::second => dur beat;
// beat * 4 => dur bar;

// 0.5 => buf1.gain;
// 0.5 => buf2.gain;
// 0.5 => buf3.gain;
// // 2::beat => lisa.duration;
// // 1 => lisa.record;
// while(true) {
//     for (0 => int b; b < 8; b++)
//     {
//         if (b % 4 == 0) {
//             1 => buf2.pos;
//             1 => buf3.pos;
//             1::beat => now;
//             0 => buf2.pos;
//             0 => buf3.pos;
//         }
//         if (b % 2 == 0) {
//             1 => buf1.pos;
//             1 => buf3.pos;
//             1::beat => now;
//             0 => buf1.pos;
//             0 => buf3.pos;
//         }
//     }
// }
// // 2::beat => lisa.duration;
// // 1 => lisa.record;
// // 2::beat => now;
// // 0 => lisa.record;
// // 1 => lisa.loop;
// // 1 => lisa.play;
// // 1 => lisa.bi;

// // while(true)
// // {
// //     0 => lisa.playPos;
// //     [-1.0] @=> float rates[];
// //     for( float x : rates )
// //     {
// //         // rates[Math.random2(0, rates.size()-1)] => lisa.rate;
// //         x => lisa.rate;
// //         2::beat => now;
// //     }
    
// //     // -1 => lisa.rate;
    
// // }