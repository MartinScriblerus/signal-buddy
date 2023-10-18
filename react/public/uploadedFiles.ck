SndBuf buf => dac;
string array[0];

array << me.arg(0);

array << me.arg(0);
for(0 => int i; i < array.size(); i++) {
    array[0] => buf.read;
    0.5 => buf.gain;
    1 => buf.pos;
    1 => buf.rate;
}

0.5::second => now;
0 => buf.pos;