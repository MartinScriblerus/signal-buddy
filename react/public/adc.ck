adc => Gain g => NRev r => dac;

while( true )
{
    1.2 => r.mix;
    1.0 => g.gain;
    100::ms => now;
}