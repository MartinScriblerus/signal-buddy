let midi = null; // global MIDIAccess object

const noteOn = (note: any, velocity: any) => {
  console.log('NOTE ON! ', note);
  console.log('VELOCITY: ', velocity);
} 

const noteOff = (note: any) => {
  console.log('NOTE OFF! ', note);
}

export function onMIDISuccess(midiAccess: any) {
    // console.log("MIDI ready!");
    midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
    const inputs = midiAccess.inputs;
    const outputs = midiAccess.outputs;
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = getMIDIMessage;
      // console.log('what is MIDI?? ', input);
    }
    
    return midi;
  }
  
export function onMIDIFailure(msg: any) {
    console.error(`Failed to get MIDI access - ${msg}`);
    return undefined;
}

export function getMIDIMessage(message: any) {
  const command = message.data[0];
  const note = message.data[1];
  const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
  console.log('MIDI MSG!: ', message);
  switch (command) {
      case 144: // noteOn
          if (velocity > 0) {
              noteOn(note, velocity);
              // console.log('note ', note);
              // console.log('velocity ', velocity);
          } else {
              noteOff(note);
          }
          break;
      case 128: // noteOff
          noteOff(note);
          // console.log('note ', note);
          break;
      // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
  }
}