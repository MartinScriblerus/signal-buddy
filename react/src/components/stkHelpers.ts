export default function CLARINET(
    running: number, 
    bpm: number, 
    noteDivisions: number,
    note: number, 
    velocity: number,
    reed: number,
    noiseGain: number,
    vibratoFreq: number,
    vibratoGain: number,
    pressure: number,
    reverbMix: number,
    reverbGain: number,
    rtChords: Array<any>, 
    rtScales: Array<any>
    ) {  
        return (
        `
        ${running} => int running;
        // STK Clarinet
        // (also see examples/event/polyfony2.ck)
        
        // patch
        Clarinet clair => Dyno dyno => NRev r => Gain g => dac;
        .01 => g.gain;
        // ${reverbGain} => r.gain;
        ${reverbMix} => r.mix;
        0::ms => dyno.attackTime;
        0.8 => dyno.thresh;

        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        // our notes
        [ ${note} ] @=> int notes[];
        
        public void theSpork()
        {
            // infinite time-loop
            while( running > 0 )
            {
                ${reed} => clair.reed;
                ${noiseGain} => clair.noiseGain;
                ${vibratoFreq} => clair.vibratoFreq;
                ${vibratoGain} => clair.vibratoGain;
                ${pressure} => clair.pressure;
        
                for( int i; i < notes.size(); i++ )
                {
                    spork ~ play( notes[i], ${velocity/100} );
                    noteLengthInSecs::second => now;
                }
            }
        }
    
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start note
            Std.mtof( ${note} ) => clair.freq;
            velocity => clair.noteOn;
        }
    `)
}


export function STFKRP(
    running: number, 
    bpm: number, 
    noteDivisions: number, 
    note: number, 
    velocity: number, 
    pickupPosition: number,
    sustain: number,
    stretch: number,
    pluck: number,
    baseLoopGain: number,
    reverbMix: number,
    rtChords: Array<any>, 
    rtScales: Array<any>
    ) {
    return (
        `
        // STK StifKarp
        // StifKarp.help();
        ${running} => int running;
        // patch
        StifKarp m => Dyno dyno => Gain g => JCRev r => dac;
        0.05 => g.gain;

        5::ms => dyno.attackTime;
        0.7 => dyno.thresh;
        
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        ${reverbMix} => r.mix;

        // our notes
        [ ${note} ] @=> int notes[];

        
        public void theSpork()
        {
            // infinite time-loop
            while( running > 0 )
            {
                ${pickupPosition} => m.pickupPosition;
                ${sustain} => m.sustain;
                ${stretch} => m.stretch;
                ${pluck} => m.pluck;
                ${baseLoopGain} => m.baseLoopGain;
                
                for( int i; i < notes.size(); i++ )
                {
                    play( Std.mtof(notes[i]), ${velocity/100} );
                    // 100::ms => now;
                    noteLengthInSecs::second => now;
                }
            }
        }

        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start note *** octave adjustment to balance with other instruments
            Std.mtof( ${note} ) / 2 => m.freq;
            velocity => m.noteOn;
        }
        `
    )
}

export function SITAR(running: number, bpm: number, noteDivisions: number, note: number, velocity: number, pluck: number, reverbMix: number, rtChords: Array<any>, rtScales: Array<any>) {

    return(`
    ${running} => int running;
    // patch
    Sitar sit => Dyno dyno => NRev r => dac;
    ${reverbMix} => r.mix;
    0::ms => dyno.attackTime;
    0.8 => dyno.thresh;
    
    // set bpm
    ${bpm} => float bpm;
    
    (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

    // scale
    [${note}, ${note + 5}, ${note}, ${note - 5}] @=> int scale[];

    // time loop
    // while( true )
    // {
    public void theSpork()
    {
        // infinite time-loop
        while( running > 0 )
        {
            for (0 => int i; i < scale.size(); i++) {
                ${note} + scale[i] => int newNote;
                // set freq
                newNote => sit.freq;

                play( newNote, ${velocity / 100} );
                noteLengthInSecs::second => now;
            }
            <<< Machine.shreds() >>>;
        }
    }
    spork ~ theSpork();

    public void unSpork()
    {
        0 => running;
    }

    // while(true) .3::second => now; (this is the original but does not control time)
    while(true) 1::ms => now;

    // basic play function (add more arguments as needed)
    fun void play( float note, float velocity )
    {
        // start the note
        // freq
        Std.mtof( ${note} ) => sit.freq;

        // pluck!
        ${pluck} => sit.noteOn;
    }
    `)
}

export function MOOG(running: number, bpm: number, noteDivisions: number, note: number, velocity: number, valueLfoSpeed: number, valueLfoDepth: number, valueFilterQ: number, valueFilterSweepRate: number, valueVibratoFreq: number, valueVibratoGain: number, valueMoogGain: number, valueAftertouch: number, valueModSpeed: number, valueModDepth: number, valueOpMode: number, rtChords: Array<any>, rtScales: Array<any>) {
    return (
        `
        // STK ModalBar
        // Moog.help();
        // patch
        ${running} => int running;
        Moog moog => Dyno dyno => Gain g => dac;

        0.5 => g.gain;

        0::ms => dyno.attackTime;
        0.7 => dyno.thresh;
        
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        // me.dir() + "/ByronGlacier.wav" => string filePath;

        // scale
        [${note}, ${note + 5}, ${note}, ${note - 5}] @=> int scale[];

        // infinite time loop

        // while(true) {
        public void theSpork()
        {
            // infinite time-loop
            while( running > 0 )
            {
                // ding!
                ${valueFilterQ} => moog.filterQ;
                ${valueFilterSweepRate} => moog.filterSweepRate;
                ${valueLfoSpeed} => moog.lfoSpeed;
                ${valueLfoDepth} => moog.lfoDepth;
                ${valueVibratoFreq} => moog.vibratoFreq;
                ${valueVibratoGain} => moog.vibratoGain;
                ${valueMoogGain} => moog.volume;
                ${valueModSpeed} => moog.modSpeed;
                ${valueModDepth} => moog.modDepth;
                ${valueAftertouch} => moog.afterTouch;
                moog.op(${valueOpMode});

                Math.random2f( 0, 1 ) => moog.volume;
                0.2 => moog.volume;
                // 0.02 => moog.lfoDepth;
                // 0.02 => moog.filterQ;

                for (0 => int i; i < scale.size(); i++) {
                    ${note} + scale[i] => int newNote;
                    // set freq
                    newNote => moog.freq;

                    // go
                    // .6 => moog.noteOn;
                    play( newNote, ${velocity / 100} );
                    noteLengthInSecs::second => now;
                }
                <<< Machine.shreds() >>>;
            }
        }
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => moog.freq;
            velocity => moog.noteOn;
        }
        `
    )
}

export function MOOG2(note: number) {
    return (
        `
        // STK ModalBar

        // patch
        Moog moog => dac;

        // scale
        [${note}, ${note + 2}, ${note + 4}, ${note + 7}, ${note + 8}, ${note + 11}] @=> int scale[];

        // infinite time loop
        while( true )
        {
            // ding!
            // Math.random2f( 0, 128 ) => float filterQ;
            // Math.random2f( 0, 128 ) => float filterSweep;
            Math.random2f( 0, 128 ) => float vol;
            // Math.random2f( 0, 128 ) => float vibratoFreq;
            // Math.random2f( 0, 128 ) => float vibratoGain;

            // moog.controlChange( 2, filterQ);
            // moog.controlChange( 4, filterSweep);
            // moog.controlChange( 11, vibratoFreq);
            // moog.controlChange( 1, vibratoGain);
            // moog.controlChange( 128, vol);

            // set freq
            scale[Math.random2(0,scale.size()-1)] => int winner;
            57 + Math.random2(0,2)*12 + winner => Std.mtof => moog.freq;
            // go
            .8 => moog.noteOn;

            // advance time
            .5::second => now;
        }
        `
    )
}

export function FRNCHRN(
    running: number, 
    bpm: number, 
    noteDivisions: number, 
    note: number, 
    velocity: number,
    lfoSpeed: number,
    lfoDepth: number,
    controlOne: number,
    controlTwo: number,  
    reverbMix: number, 
    rtChords: Array<any>, 
    rtScales: Array<any>) {
    return (
        `
        // STK FrencHrn
    
        ${running} => int running;

        // patch
        FrencHrn f => Dyno dyno => Gain g => JCRev r => dac;
        0.2 => g.gain;
    
        0::ms => dyno.attackTime;
        0.7 => dyno.thresh;
        ${reverbMix/100} => r.mix;
            
        // set bpm
        ${bpm} => float bpm;
            
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;
    
        // our notes
        [ ${note} ] @=> int notes[];
            
        public void theSpork()
        {
            // // infinite time-loop
            // while( running > 0 )
            // {
                // set
                //  Now play a proper French Horn solo
                ${controlOne} => f.controlOne; 
                ${controlTwo} => f.controlTwo;
                ${lfoSpeed} => f.lfoSpeed;
                ${lfoDepth} => f.lfoDepth;

                for( int i; i < notes.size(); i++ )
                {
                    play( notes[i], ${velocity / 100} );
                    noteLengthInSecs::second => now;
                }
                <<< Machine.shreds() >>>;
            // }
        }
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => f.freq;
            velocity => f.noteOn;
        }
        `
        )
}

export function RHODEY(running: number, bpm: number, noteDivisions: number, note: number, rtChords: Array<any>, rtScales: Array<any>) {
    return (
        `
        // more music for replicants
        ${running} => int running;
        // patch
        Rhodey voc => Dyno dyno => JCRev r => Echo a => Echo b => Echo c => dac;

        0::ms => dyno.attackTime;
        0.8 => dyno.thresh;
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        Std.mtof(${note}) => voc.freq;

        0.8 => voc.gain;
        // .8 => r.gain;
        .1 => r.mix;
        noteLengthInSecs::second => a.max => b.max => c.max;
        (.75 * noteLengthInSecs)::second => a.delay => b.delay => c.delay;
        (.5 * noteLengthInSecs) => a.mix => b.mix => c.mix;

        // scale
        [ 0, 2, 4, 7, 9 ] @=> int scale[];

        public void theSpork()
        {
            // our main loop
            while( running > 0 )
            {

                // pentatonic
                scale[Math.random2(0,scale.size()-1)] => int freq;

                Std.mtof( ( ${note} + freq ) ) => voc.freq;
                Math.random2f( 0.6, 0.8 ) => voc.noteOn;

                // note: Math.randomf() returns value between 0 and 1
                if( Math.randomf() > 0.85 )
                { noteLengthInSecs::second => now; }
                else
                {
                    0 => int i;
                    2 * Math.random2( 1, 3 ) => int pick;
                    0 => int pick_dir;
                    0.0 => float pluck;

                    for( ; i < pick; i++ )
                    {
                        Math.random2f(.4,.6) + i*.035 => pluck;
                        pluck + -0.02 * (i * pick_dir) => voc.noteOn;
                        !pick_dir => pick_dir;
                        (0.25 * noteLengthInSecs)::second => now;
                    }
                }
            }
        }
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => voc.freq;
            velocity => voc.noteOn;
        }
        `
    )
}

export function MANDOLIN(running: number, bpm: number, noteDivisions: number, note: number, velocity: number, bodySize: number, pluckPos: number, stringDamping: number, stringDetune: number, reverbMix: number, rtChords: Array<any>, rtScales: Array<any>) {
    console.log('WOO HOO GOT CHORDS: ', rtChords);
    console.log('WOO HOO GOT SCALES: ', rtScales);
    return (
        `
        // STK Mandolin
        <<< "GETTING TO CHUCK" >>>;
        ${running} => int running;
        
        // patch
        Mandolin m => Dyno dyno => Gain g => JCRev r => dac;
        0.5 => g.gain;

        0::ms => dyno.attackTime;
        0.7 => dyno.thresh;
        ${reverbMix/100} => r.mix;
        
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        me.dir() + "/ByronGlacier.wav" => string filePath;

        // our notes
        [ ${note}, ${note + 2}, ${note + 4}, ${note + 5}, ${note + 7}, ${note + 9}, ${note + 11}, ${note + 12} ] @=> int notes[];
        
        public void theSpork()
        {
            // infinite time-loop
            while( running > 0  )
            {
                // set
                filePath => m.bodyIR;
                ${bodySize} => m.bodySize;
                ${pluckPos} => m.pluckPos;
                ${stringDamping} => m.stringDamping;
                ${stringDetune} => m.stringDetune;
                    
                for( int i; i < notes.size(); i++ )
                {
                    play( notes[i], ${velocity / 100} );
                    noteLengthInSecs::second => now;
                }
                <<< Machine.shreds() >>>;
            }
        }
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => m.freq;
            velocity => m.pluck;
        }
        `
    )
} 

export function SAXOFONY(
    running: number, 
    bpm: number, 
    noteDivisions: number, 
    note: number,
    velocity: number,
    stiffness: number, 
    aperture: number, 
    noiseGain: number, 
    blowPosition: number, 
    vibratoFreq: number, 
    vibratoGain: number, 
    pressure: number,
    reverbMix: number,
    rtChords: Array<any>, 
    rtScales: Array<any>
) {
    return (
        `
        // STK Saxofony

        ${running} => int running;
        
        // patch
        Saxofony sax => Dyno dyno => Gain g => JCRev r => dac;
        0.03 => g.gain;

        0::ms => dyno.attackTime;
        0.7 => dyno.thresh;
        ${reverbMix/100} => r.mix;
        
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        // our notes
        [ ${note}, ${note + 2}, ${note + 4}, ${note + 5}, ${note + 7}, ${note + 9}, ${note + 11}, ${note + 12} ] @=> int notes[];
        
        public void theSpork()
        {
            // infinite time-loop
            while( running > 0 )
            {
                // // set
                ${stiffness} => sax.stiffness;
                ${aperture} => sax.aperture;
                ${noiseGain} => sax.noiseGain;
                ${blowPosition} => sax.blowPosition;
                ${vibratoFreq} => sax.vibratoFreq;
                ${vibratoGain} => sax.vibratoGain;
                ${pressure} => sax.pressure;
                    
                for( int i; i < notes.size(); i++ )
                {
                    play( notes[i], ${velocity / 100} );
                    noteLengthInSecs::second => now;
                }
                <<< Machine.shreds() >>>;
            }
        }
        spork ~ theSpork();

        public void unSpork()
        {
            0 => running;
        }

        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 1::ms => now;

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => sax.freq;
            velocity => sax.noteOn;
        }
        `
    )
}

// export function SAMPLER(running: number, bpm: number, noteDivisions: number, note: number, file: ArrayBuffer, reverbMix: number)
export async function SAMPLER(
    running: number, 
    bpm: number, 
    noteDivisions: number, 
    note: number, 
    file: any, 
) {
    // function cloneAudioBuffer(fromAudioBuffer: any) {
    //     const audioBuffer = new AudioBuffer({
    //       length:fromAudioBuffer.length, 
    //       numberOfChannels:fromAudioBuffer.numberOfChannels, 
    //       sampleRate:fromAudioBuffer.sampleRate
    //     });
    //     for(let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
    //       const samples = fromAudioBuffer.getChannelData(channelI);
    //       audioBuffer.copyToChannel(samples, channelI);
    //     }
    //     return audioBuffer;
    //   }
    //   const file = cloneAudioBuffer(fileArg);
    console.log("RUNNING >? ", running);
    console.log("RUNNING >? ", bpm);
    console.log("NOTE DIVS>? ", noteDivisions);
    console.log("NOTE>? ", note);
    console.log("FILE>? ", file);


    return (
        `
        0 => int a => int t;
        1 => int b;
        15 => int c;

        while( c > 0 ) 
        {
            a + b => t;
            b => a;
            <<<t => b>>>;
            c - 1 => c;
        }
        FileIO io;
        // FileIO.help();
        

        io.dirList() @=> string fileList[];

        ${running} => int running;
        <<< "${running}" >>>;

        SndBuf buf => LiSa lisa => dac;
        "wanna_die.wav" => string filename;
        <<< filename >>>;
        <<< io.open( filename, FileIO.READ | FileIO.BINARY ) >>>;
        <<< "IIIOOO: ", io.mode() >>>;
        filename => buf.read;
        <<< "SAMPS: ", buf.samples() >>>;
        0.5 => buf.gain;
        // 0.5 => buf.rate;
        12611298 / 4 => buf.pos;
        
        500::ms => lisa.duration;
        1 => lisa.record;
        500::ms => now;
        0 => lisa.record;
        1 => lisa.loop;
        1 => lisa.play;
        1 => lisa.bi;
        
        while(running > 0)
        {
            0 => lisa.playPos;
            [-1.0, -0.7, -0.5, -1.0] @=> float rates[];
            for( float x : rates )
            {
                // rates[Math.random2(0, rates.size()-1)] => lisa.rate;
                x => lisa.rate;
                2500::ms => now;
            }
            
            // -1 => lisa.rate;
            
        }
        `
    )
} 


export function CHORUS(note: number) {
    return (
            `
            // set up signal chain
            SinOsc s[4]; Chorus chor[4];
            // chorus often "shines" best with polyphonic textures!
            [62, 65, 69, 72] @=> int notes[];
            
            // connect
            for( int i; i < s.size(); i++ )
            {
                // patch each voice
                s[i] => chor[i] => dac;
            
                // sine wave as source signal
                s[i].gain( .02 );
                s[i].freq( Std.mtof(${note}) );
            
                // initializing a light chorus effect
                // (try tweaking these values!)
                chor[i].baseDelay( 10::ms );
                chor[i].modDepth( .8 );
                chor[i].modFreq( 1 );
                chor[i].mix( .4 );
            }
            1::second => now;
        `
    )
}
