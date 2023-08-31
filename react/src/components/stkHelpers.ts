export default function CLARINET(
    note: number, 
    velocity: number,
    reed: number,
    noiseGain: number,
    vibratoFreq: number,
    vibratoGain: number,
    pressure: number,
    reverbMix: number,
    reverbGain: number,
    ) {  
        return (
        `
        // STK Clarinet
        // (also see examples/event/polyfony2.ck)
        
        // patch
        Clarinet clair => Dyno dyno => NRev r => Gain g => dac;
        .01 => g.gain;
        // ${reverbGain} => r.gain;
        ${reverbMix} => r.mix;
        0::ms => dyno.attackTime;
        0.8 => dyno.thresh;

        // our notes
        [ ${note} ] @=> int notes[];
        // infinite time-loop
        while( true )
        {
            ${reed} => clair.reed;
            ${noiseGain} => clair.noiseGain;
            ${vibratoFreq} => clair.vibratoFreq;
            ${vibratoGain} => clair.vibratoGain;
            ${pressure} => clair.pressure;
        
            for( int i; i < notes.size(); i++ )
            {
                spork ~ play( notes[i], ${velocity/100} );
                1000::ms => now;
            }
        }
    
        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( note ) => clair.freq;
            velocity => clair.noteOn;
        }
    `)
}


export function STFKRP(
    note: number, 
    velocity: number, 
    pickupPosition: number,
    sustain: number,
    stretch: number,
    pluck: number,
    baseLoopGain: number,
    reverbMix: number,
    ) {
    return (
        `
        // STK StifKarp

        // patch
        StifKarp m => Dyno dyno => JCRev r => dac;
        ${reverbMix} => r.mix;
        0::ms => dyno.attackTime;
        0.8 => dyno.thresh;

        // our notes
        [ ${note} ] @=> int notes[];

        
        // infinite time-loop
        while( true )
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
                10000::ms => now;
            }
        }

        // basic play function (add more arguments as needed)
        fun void play( float note, float velocity )
        {
            // start the note
            Std.mtof( ${note} ) => m.freq;
            velocity => m.pluck;
        }
        `
    )
}

export function SITAR(note: number, velocity: number, pluck: number, reverbMix: number) {

    return(`
    // patch
    Sitar sit => Dyno dyno => NRev r => dac;
    ${reverbMix} => r.mix;
    0::ms => dyno.attackTime;
    0.8 => dyno.thresh;

    // time loop
    while( true )
    {
        // freq
        Std.mtof( ${note} ) => sit.freq;

        // pluck!
        ${pluck} => sit.noteOn;

        // advance time
        // note: Math.randomf() returns value between 0 and 1
        if( Math.randomf() > .5 ) {
            .5::second => now;
        } else { 
            0.25::second => now;
        }
    }
    `)
}

export function MOOG(note: number, velocity: number, valueLfoSpeed: number, valueLfoDepth: number, valueFilterQ: number, valueFilterSweepRate: number, valueVibratoFreq: number, valueVibratoGain: number, valueMoogGain: number, valueAftertouch: number, valueModSpeed: number, valueModDepth: number, valueOpMode: number) {
    return (
        `
        // STK ModalBar
        Moog.help();
        // patch
        Moog moog => Dyno dyno => Gain g => dac;

        0.5 => g.gain;

        0::ms => dyno.attackTime;
        0.7 => dyno.thresh;

        // scale
        [0, 5, 0, -5] @=> int scale[];

        // infinite time loop

        // while(true) {
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
                .6 => moog.noteOn;

                // advance time
                2000::ms => now;
            }
            // }
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

export function BANDEDWAVE(note: number) {
    return (
        `
        // banded waveguide sample

        // the patch
        BandedWG band => JCRev r => dac;

        // presets
        0.95 => band.gain;
        1 => band.preset;
        Std.mtof( ${note} ) => band.freq;
        // .8 => r.gain;
        .02 => r.mix;

        // scale
        [ 0, 2, 4, 7, 9 ] @=> int scale[];

        // our main time loop
        while( true )
        {
            Math.random2f( 0.1, 0.9 ) => band.bowRate;
            Math.random2f( 0.2, 0.35 ) => band.bowPressure;
            Math.random2f( 0.6, 0.8 ) => band.startBowing;

            // note: Math.randomf() returns value between 0 and 1
            if( Math.randomf() > 0.85 )
            { 1000::ms => now; }
            else if( Math.randomf() > .85 )
            { 500::ms => now; }
            else if( Math.randomf() > 0.6 )
            { .250::second => now; }
            else
            {
                0 => int i;
                4 * Math.random2( 1, 4 ) => int pick;
                0 => int pick_dir;
                0.0 => float pluck;
                Math.random2f( 50.0, 200.0 ) => float d;

                for( ; i < pick; 1 +=> i )
                {
                    Math.random2f(.4,.6) + i*.35/pick => pluck;
                    pluck + 0.1 * pick_dir => band.pluck;
                    !pick_dir => pick_dir;
                    d::ms => now;
                }
            }

            // note: Math.randomf() returns value bewteen 0 and 1
            if( Math.randomf() > 0.2 )
            { 
                1::second => now;
                0.001 => band.stopBowing;
                0.5::second *  Math.random2(1,3) => now;

                // scale
                scale[Math.random2(0, scale.size()-1)] => int freq;
                Std.mtof( 21 + Math.random2(0,5) * 12 + freq ) => band.freq;
                // note: Math.randomf() returns value between 0 and 1
                if( Math.randomf() > 0.85 ) 
                    Math.random2(0,3) => band.preset;
            }
        }
        `
    )
}

export function RHODEY(note: number) {
    return (
        `
        // more music for replicants

        // patch
        Rhodey voc => Dyno dyno => JCRev r => Echo a => Echo b => Echo c => dac;

        0::ms => dyno.attackTime;
        0.8 => dyno.thresh;
        Std.mtof(${note}) => voc.freq;
        0.8 => voc.gain;
        // .8 => r.gain;
        .02 => r.mix;
        1000::ms => a.max => b.max => c.max;
        750::ms => a.delay => b.delay => c.delay;
        .50 => a.mix => b.mix => c.mix;

        // shred to modulate the mix
        fun void vecho_Shred( )
        {
            0.0 => float decider;
            0.0 => float mix;
            0.0 => float old;
            0.0 => float inc;
            0 => int n;

            // time loop
            while( true )
            {
                Math.random2f( 0, 1 ) => decider;
                if( decider < .3 ) 0.0 => mix;
                else if( decider < .6 ) .08 => mix;
                else if( decider < .8 ) .5 => mix;
                else .15 => mix;

                // find the increment
                (mix-old)/1000.0 => inc;
                1000 => n;
                while( n-- )
                {
                    old + inc => old;
                    old => a.mix => b.mix => c.mix;
                    1::ms => now;
                }
                mix => old;
                Math.random2(2,6)::second => now;
            }
        }


        // let echo shred go
        spork ~ vecho_Shred();

        // scale
        [ 0, 2, 4, 7, 9 ] @=> int scale[];

        // our main loop
        while( true )
        { 
            // pentatonic
            scale[Math.random2(0,scale.size()-1)] => int freq;

            Std.mtof( ( ${note} + Math.random2(0,1) * 12 + freq ) ) => voc.freq;
            Math.random2f( 0.6, 0.8 ) => voc.noteOn;

            // note: Math.randomf() returns value between 0 and 1
            if( Math.randomf() > 0.85 )
            { 1000::ms => now; }
            else if( Math.randomf() > .85 )
            { 500::ms => now; }
            else if( Math.randomf() > .1 )
            { .250::second => now; }
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
                    250::ms => now;
                }
            }
        }
        `
    )
}

export function MANDOLIN(bpm: number, noteDivisions: number, note: number, velocity: number, bodySize: number, pluckPos: number, stringDamping: number, stringDetune: number, reverbMix: number, rtChords: Array<any>, rtScales: Array<any>) {
    console.log('WOO HOO GOT CHORDS: ', rtChords);
    console.log('WOO HOO GOT SCALES: ', rtScales);
    return (
        `
        // STK Mandolin

        // patch
        Mandolin m => JCRev r => dac;
        .025 => r.mix;
        
        // set bpm
        ${bpm} => float bpm;
        
        (60.0 / bpm) / ${noteDivisions} => float noteLengthInSecs;

        me.dir() + "/ByronGlacier.wav" => string filePath;

        // our notes
        [ ${note}, ${note + 2}, ${note + 4}, ${note + 5}, ${note + 7}, ${note + 9}, ${note + 11}, ${note + 12} ] @=> int notes[];
        
        public void theSpork()
        {
            // infinite time-loop
            while( true )
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
                    // 1000::ms => now;
                    noteLengthInSecs::second => now;
                }
                <<< Machine.shreds() >>>;
            }
        }
        spork ~ theSpork();
        // while(true) .3::second => now; (this is the original but does not control time)
        while(true) 10::second => now;

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
