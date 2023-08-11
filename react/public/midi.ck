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
    s[i].gain( .0 );
    s[i].freq( Std.mtof(notes[i]) );

    // initializing a light chorus effect
    // (try tweaking these values!)
    chor[i].baseDelay( 10::ms );
    chor[i].modDepth( .8 );
    chor[i].modFreq( 1 );
    chor[i].mix( .4 );
}
    // nothing to do here except advance time
    12::second => now;

