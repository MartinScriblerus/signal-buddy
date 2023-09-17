SndBuf buf => dac;

me.dir() + "MinipopsKick.wav" => string kickdrum;
kickdrum => buf.read;

0.5 => buf.gain;
1 => buf.pos;
1 => buf.rate;
0.5::second => now;
0 => buf.pos;