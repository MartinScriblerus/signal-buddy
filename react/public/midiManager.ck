<<< me.arg(0) >>>;
me.arg(0) => string codeStr;

// if( Machine.eval( codeStr ) ) {
//     Machine.eval( codeStr );
// }


if (Machine.shreds().size() <= 1) {
    <<< "RUNNING SHREDS!!! " >>>;
    // <<< Machine.shreds() >>>;
    <<< Machine.shreds().typeOf() >>>;
} else {
    <<< "THERE SHOULD BE NO SHREDS BELOW!!! " >>>;
    // <<< Machine.shreds() >>>;
}
// <<< "CLEAR??? ", me.arg(0) >>>;
// if (me.arg(0) == "clearShreds") {
//     for(0 => int s; s < Machine.shreds().size(); s++) {
//         // <<< "SHREED TO REMOVEL " >>>;
//         // <<<  Machine.shreds() >>>;

//         // Machine.remove(Machine.shreds()[s]);
 
//     };
// }