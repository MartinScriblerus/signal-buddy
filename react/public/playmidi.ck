// SinOsc s => dac;
// <<< " FIRST ARG ", me.arg(0) >>>;
// <<< " SECOND ARG ", me.arg(1) >>>;
// <<< " THIRD ARG ", Std.atoi(me.arg(2)) >>>;
// <<< " FOURTH ARG ", Std.atoi(me.arg(3)) >>>;
// <<< " FIFTH ARG ", Std.atoi(me.arg(4)) >>>;
// while(true) {
//     0.5 => s.gain;
//     Std.mtof(150.0) => s.freq;
//     <<< 'frequency: ', s.freq >>>
//     1::second => now;
// }

// name: eval.ck
// desc: use Machine.eval() to compile and run code from a string;
//       this as enables chuck to generate code to run at run-time;
//       powerful! perilous!
//
// version: requires chuck-1.5.0.5 or higher
//          Machine.eval() was first introduced in 1.5.0.0;
//          the operation semantics was changed in 1.5.0.5 for
//          Machine eval to run immediately, and automatically
//          yielding the current shred to give the eval'ed code
//          a chance to run -- all this without advancing time
//
// uncomment this to print out info about Machine:
Machine.help();

//
// date: Spring 2023

// our code to run
"cherr <= \"hello!\" <= IO.newline();" => string codeStr;

// compile the string as code and spork it as a new shred
if( !Machine.eval( codeStr ) ) <<< "error evaluating code!", "" >>>;

// each of these will be evaluated and run as code,
// each on its independent shred; Machine.eval() automatically
// yields the originating "evaluator" shred, giving the evaluated
// code a chance to run without advancing time
Machine.eval( "<<< 1 >>>;" );
<<< "a" >>>;

Machine.eval( "<<< 3 >>>;" );
<<< "c" >>>;

<<< "are we running in realtime audio mode?", 
    Machine.realtime() ? "YES" : "NO " >>>;

<<< "are we running in silent mode (e.g., --silent)?", 
    Machine.silent() ? "YES" : "NO " >>>;

if (Machine.shreds().size() > 0) {
    Machine.eval( "<<< 2 >>>;" );
    <<< "in the IF" >>>;
    <<< Machine.shreds() >>>;
} else {
    Machine.eval( "<<< 4 >>>;" );
    <<< "in the ELSE" >>>;
    <<< Machine.shreds() >>>;
}