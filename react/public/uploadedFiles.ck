SndBuf buf => dac;

<<< "OY VEY!" >>>;
<<< me.arg(0) >>>;
<<< me.args >>>;
<<< "in uploaded files ck" >>>;
me.arg(0) => string sample;
sample => buf.read;
<<< buf >>>;
0.5 => buf.gain;
1 => buf.pos;
1 => buf.rate;
0.5::second => now;
0 => buf.pos;