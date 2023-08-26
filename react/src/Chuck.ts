import DeferredPromise from './DeferredPromise';
import type { File, Filename } from "./utils";
import { InMessage, OutMessage } from "./enums";
import { defer, loadWasm, preloadFiles } from './utils'

// Create a Record type for deferredPromises and eventCallbacks
type DeferredPromisesMap = Record<number, DeferredPromise<unknown>>;
type EventCallbacksMap = Record<number, () => void>;
declare var Blob: {
  prototype: Blob;
  new (): Blob;
  new (request: any, mime: string): Blob;
}
/**
 * WebChucK: ChucK Web Audio Node class.
 * See init() to get started
 */
const win: Window & typeof globalThis = window;
export default class Chuck extends win.AudioWorkletNode {
    private deferredPromises: DeferredPromisesMap = {};
    private deferredPromiseCounter: number = 0;
    private eventCallbacks: EventCallbacksMap = {};
    private eventCallbackCounter: number = 0;
    private isReady: DeferredPromise<void> = defer();
  
    static chuckID: number = 1;
  
    /**
     * Constructor for a ChucK Web Audio Node
     * @param preloadedFiles Files to preload into ChucK's filesystem
     * @param audioContext AudioContext to connect to
     * @param wasm WebChucK WebAssembly binary
     * @param numOutChannels Number of output channels
     * @returns WebChucK ChucK instance
     */
    constructor(
      preloadedFiles: File[],
      audioContext: AudioContext,
      wasm: ArrayBuffer,
      numOutChannels: number = 2
    ) {
      super(audioContext, "chuck-node", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        // important: "number of inputs / outputs" is like an aggregate source
        // most of the time, you only want one input source and one output
        // source, but each one has multiple channels
        outputChannelCount: [numOutChannels],
        processorOptions: {
          chuckID: Chuck.chuckID,
          srate: audioContext.sampleRate,
          preloadedFiles,
          wasm,
        },
      });
      this.port.onmessage = this.receiveMessage.bind(this);
      this.onprocessorerror = (e) => console.error(e);
      Chuck.chuckID++;
    }
  
    /**
     * Quick initialize a default instance of the ChucK Web Audio Node
     * @param filenamesToPreload Files to preload into ChucK's filesystem [{serverFileName: ./path, virtualFileName: path}]
     * @param audioContext AudioContext to connect connect WebChuck node to
     * @param numOutChannels Number of output channels
     * @returns 
     */
    static async init(
      filenamesToPreload: Filename[],
      audioContext?: AudioContext,
      numOutChannels: number = 2
    ): Promise<Chuck> {
      const wasm = await loadWasm();
      console.log('got wasm');
      if (typeof audioContext === "undefined") {
        audioContext = new AudioContext();
      }
  
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
  
      await audioContext.audioWorklet.addModule(
        "https://chuck.stanford.edu/webchuck/src/webchuck.js"
      );
      const preloadedFiles = await preloadFiles(filenamesToPreload);
      const chuck = new Chuck(preloadedFiles, audioContext, wasm, numOutChannels);
      console.log('preloaded: ', preloadedFiles);
      chuck.connect(audioContext.destination);
      await chuck.isReady.promise;
      return chuck;
    }
  
    /**
     * Private function for ChucK to handle execution of tasks. 
     * Will create a Deferred Promise that wraps a task for WebChucK to execute
     * @returns callbackID to a an action for ChucK to perform
     */
    private nextDeferID(): number {
      const callbackID = this.deferredPromiseCounter++;
      this.deferredPromises[callbackID] = defer();
      return callbackID;
    }
  
    // ================== Filesystem ===================== //
    /**
     * Create a virtual file in ChucK's filesystem. 
     * You should first locally fetch() the contents of your file, then pass the data to this method.
     * @param directory Virtual directory to create file in
     * @param filename Name of file to create
     * @param data Data that you want to write to the file
     */
    public createFile(directory: string, filename: string, data: string | ArrayBuffer) {
      this.sendMessage(OutMessage.LOAD_FILE, {
        directory,
        filename,
        data,
      });
    }
    /**
     * Automatically fetch and load in a file from a URL to ChucK's virtual filesystem
     * @param filename URL to file to fetch and load file
     */
    public async loadFile(filename: string) {
      if (filename.endsWith(".ck")) {
        return fetch(filename).then((response) => response.text()).then((text) => {
          this.createFile("", filename, text)
        });
      } else {
        return fetch(filename).then((response) => response.arrayBuffer()).then((buffer) => {
          this.createFile("", filename, new Uint8Array(buffer));
        });
      }
    }
  
    // ================== Run/Replace Code ================== //
    /**
     * Run a string of ChucK code
     * @param code ChucK code string to be executed
     * @returns promise to the shred ID
     */
    public runCode(code: string) {
      const callbackID = this.nextDeferID();
      // console.log('o u t m s g: ', OutMessage.RUN_CODE);
      // console.log('c o d e: ', code);
      this.sendMessage(OutMessage.RUN_CODE, { callback: callbackID, code });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Run a string of ChucK code using a different dac (unsure of functionality)
     * -tf (5/30/2023)
     * @param code ChucK code string to be executed
     * @param dacName dac for ChucK (??)
     * @returns promise to the shred ID
     */
    public runCodeWithReplacementDac(code: string, dacName: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.RUN_CODE_WITH_REPLACEMENT_DAC, {
        callback: callbackID,
        code,
        dac_name: dacName,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace last running shred with string of ChucK code to execute
     * @param code ChucK code string to replace last Shred
     * @returns promise to shred ID
     */
    public replaceCode(code: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_CODE, {
        callback: callbackID,
        code,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace last running shred with string of ChucK code to execute, to another dac (??)
     * @param code ChucK code string to replace last Shred
     * @param dacName dac for ChucK (??)
     * @returns promise to shred ID
     */
    public replaceCodeWithReplacementDac(code: string, dacName: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_CODE_WITH_REPLACEMENT_DAC, {
        callback: callbackID,
        code,
        dac_name: dacName,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Remove the last running shred 
     * @returns promise to the shred ID that was removed
     */
    public removeLastCode() {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REMOVE_LAST_CODE, { callback: callbackID });
      return this.deferredPromises[callbackID];
    }
  
    // ================== Run/Replace File ================== //
    /**
     * Run a ChucK file that is already in the WebChucK virtual file system.
     * Note that the file must already have been loaded via preloadedFiles[], createFile(), or loadFile()
     * @param filename ChucK file to be run
     * @returns promise to shred ID
     */
    public runFile(filename: string) {
      console.log('filename: ', filename);
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.RUN_FILE, {
        callback: callbackID,
        filename,
      });
      console.log('callback id: ', callbackID);
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Run a ChucK file that is already in the WebChucK virtual file system, on separate dac (??).
     * Note that the file must already have been loaded via preloadedFiles[], createFile(), or loadFile()
     * @param filename ChucK file to be run
     * @param dacName dac for ChucK (??)
     * @returns promise to shred ID
     */
    public runFileWithReplacementDac(filename: string, dacName: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.RUN_FILE_WITH_REPLACEMENT_DAC, {
        callback: callbackID,
        dac_name: dacName,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Run a ChucK file that is already in the WebChucK virtual file system with arguments.
     * e.g. native equivalent of `chuck myFile:arg`
     * @param filename ChucK file to be run
     * @param colonSeparatedArgs arguments to pass to the file
     * @returns promise to shred ID
     */
    public runFileWithArgs(filename: string, colonSeparatedArgs: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.RUN_FILE_WITH_ARGS, {
        callback: callbackID,
        colon_separated_args: colonSeparatedArgs,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Run a ChucK file that is already in the WebChucK virtual file system with arguments.
     * e.g. native equivalent of `chuck myFile:arg`
     * @param filename ChucK file to be run
     * @param colonSeparatedArgs arguments to pass to the file
     * @param dacName dac for ChucK (??)
     * @returns promise to shred ID
     */
    public runFileWithArgsWithReplacementDac(
      filename: string,
      colonSeparatedArgs: string,
      dacName: string
    ) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.RUN_FILE_WITH_ARGS, {
        callback: callbackID,
        colon_separated_args: colonSeparatedArgs,
        dac_name: dacName,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace the last running shred with a file to execute.
     * Note that the file must already be in the WebChucK virtual file system via preloadedFiles[], createFile(), or loadFile() 
     * @param filename file to be replace last 
     * @returns promise to shred ID
     */
    public replaceFile(filename: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_FILE, {
        callback: callbackID,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace the last running shred with a file to execute.
     * Note that the file must already be in the WebChucK virtual file system via preloadedFiles[], createFile(), or loadFile() 
     * @param filename file to be replace last 
     * @param dacName dac for ChucK (??)
     * @returns promise to shred ID
     */
    public replaceFileWithReplacementDac(filename: string, dacName: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_FILE_WITH_REPLACEMENT_DAC, {
        callback: callbackID,
        dac_name: dacName,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace the last running shred with a file to execute, passing arguments.
     * Note that the file must already be in the WebChucK virtual file system via preloadedFiles[], createFile(), or loadFile() 
     * @param filename file to be replace last running shred
     * @param colonSeparatedArgs arguments to pass in to file
     * @returns promise to shred ID
     */
    public replaceFileWithArgs(filename: string, colonSeparatedArgs: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_FILE_WITH_ARGS, {
        callback: callbackID,
        colon_separated_args: colonSeparatedArgs,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Replace the last running shred with a file to execute, passing arguments, and dac.
     * Note that the file must already be in the WebChucK virtual file system via preloadedFiles[], createFile(), or loadFile() 
     * @param filename file to be replace last running shred
     * @param colonSeparatedArgs arguments to pass in to file
     * @param dacName dac for ChucK (??)
     * @returns promise to shred ID
     */
    public replaceFileWithArgsWithReplacementDac(
      filename: string,
      colonSeparatedArgs: string,
      dacName: string
    ) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REPLACE_FILE_WITH_ARGS, {
        callback: callbackID,
        colon_separated_args: colonSeparatedArgs,
        dac_name: dacName,
        filename,
      });
      return this.deferredPromises[callbackID];
    }
  
    // ================== Shred =================== //
    /**
     * Remove a shred from ChucK VM by ID
     * @param shred shred ID to be removed
     * @returns promise to whether Shred was removed successfully
     */
    public removeShred(shred: number | string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.REMOVE_SHRED, {
        shred,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
  
    /**
     * Check if a shred from ChucK VM is running
     * @param shred which shred ID to check
     * @returns promise to whether Shred was removed successfully
     */
    public isShredActive(shred: number | string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.IS_SHRED_ACTIVE, {
        shred,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    // ================== Event =================== //
    /**
     * Signal a ChucK event, will wake the first waiting Shred
     * @param variable ChucK event variable to be signaled
     */
    public signalEvent(variable: string) {
      this.sendMessage(OutMessage.SIGNAL_EVENT, { variable });
    }
  
    /**
     * Broadcast a ChucK event to all
     * @param variable ChucK event variable to be signaled
     */
    public broadcastEvent(variable: string) {
      this.sendMessage(OutMessage.BROADCAST_EVENT, { variable });
    }
  
    /**
     * <more information needed>
     * @param variable 
     * @param callback 
     */
    public listenForEventOnce(variable: string, callback: () => void) {
      const callbackID = this.eventCallbackCounter++;
      this.eventCallbacks[callbackID] = callback;
      this.sendMessage(OutMessage.LISTEN_FOR_EVENT_ONCE, {
        variable,
        callback: callbackID,
      });
    }
  
    /**
     * <more information needed>
     * @param variable 
     * @param callback 
     * @returns 
     */
    public startListeningForEvent(variable: string, callback: () => void) {
      const callbackID = this.eventCallbackCounter++;
      this.eventCallbacks[callbackID] = callback;
      this.sendMessage(OutMessage.START_LISTENING_FOR_EVENT, {
        variable,
        callback: callbackID,
      });
      return callbackID;
    }
  
    /**
     * <more informatino needed>
     * @param variable 
     * @param callbackID 
     */
    public stopListeningForEvent(variable: string, callbackID: number) {
      this.sendMessage(OutMessage.STOP_LISTENING_FOR_EVENT, {
        variable,
        callback: callbackID,
      });
    }
  
    // ================== Int, Float, String ============= //
    /**
     * Set the value of a global int variable in ChucK
     * @param variable name of variable
     * @param value value to set
     */
    public setInt(variable: string, value: number) {
      this.sendMessage(OutMessage.SET_INT, { variable, value });
    }
  
    /**
     * Get the value of a global int variable in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getInt("var").value();
     * @param variable name of variable
     * @returns deferred promise with value of the variable
     */
    public getInt(variable: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_INT, {
        variable,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Set the value of a global float variable in ChucK
     * @param variable name of variable
     * @param value value to set
     */
    public setFloat(variable: string, value: number) {
      this.sendMessage(OutMessage.SET_FLOAT, { variable, value });
    }
  
    /**
     * Get the value of a global float variable in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getFloat("var").value();
     * @param variable name of variable
     * @returns deferred promise with value of the variable
     */
    public getFloat(variable: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_FLOAT, {
        variable,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Set the value of a global string variable in ChucK
     * @param variable name of string variable
     * @param value new string to set
     */
    public setString(variable: string, value: string) {
      this.sendMessage(OutMessage.SET_STRING, { variable, value });
    }
  
    /**
     * Get the value of a global string variable in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getString("var").value();
     * @param variable name of string variable
     * @returns deferred promise with string value
     */
    public getString(variable: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_STRING, {
        variable,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    // ================== Int[] =================== //
    /**
     * Set the values of a global int array in ChucK
     * @param variable name of int array variable
     * @param values array of numbers
     */
    public setIntArray(variable: string, values: number[]) {
      this.sendMessage(OutMessage.SET_INT_ARRAY, { variable, values });
    }
  
    /**
     * Get the values of a global int array in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getIntArray("var").value();
     * @param variable name of int array variable
     * @returns deferred promise of array of numbers
     */
    public getIntArray(variable: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_INT_ARRAY, {
        variable,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
  
    /**
     * Set a single value (by index) in a global int array in ChucK
     * @param variable name of int array variable
     * @param index array index to set
     * @param value value to set
     */
    public setIntArrayValue(variable: string, index: number, value: number[]) {
      this.sendMessage(OutMessage.SET_INT_ARRAY_VALUE, {
        variable,
        index,
        value,
      });
    }
  
    /**
     * Get a single value (by index) in a global int array in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getIntArrayValue("var", index).value();
     * @param variable name of int array variable
     * @param index array index to get
     * @returns deferred promise for a number
     */
    public getIntArrayValue(variable: string, index: number) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_INT_ARRAY_VALUE, {
        variable,
        index,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Set the value (by key) of an associative int array in ChucK.
     * Note that "associative array" is ChucK's version of a dictionary with string keys mapping to values (see ChucK documentation).
     * @param variable name of global associative int array to set
     * @param key the key index of the associative array
     * @param value the new value
     */
    public setAssociativeIntArrayValue(
      variable: string,
      key: string,
      value: number | string
    ) {
      this.sendMessage(OutMessage.SET_ASSOCIATIVE_INT_ARRAY_VALUE, {
        variable,
        key,
        value,
      });
    }
  
    /**
     * Get the value (by key) of an associative int array in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getAssociateIntArrayValue("var", "key").value();
     * @param variable name of gobal associative int arry
     * @param key the key index to get 
     * @returns deferred promise with associative int array value
     */
    public getAssociativeIntArrayValue(variable: string, key: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_ASSOCIATIVE_INT_ARRAY_VALUE, {
        variable,
        key,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    // ================== Float[] =================== //
    /**
     * Set the values of a global float array in ChucK
     * @param variable name of float array 
     * @param values values to set
     */
    public setFloatArray(variable: string, values: number[]) {
      this.sendMessage(OutMessage.SET_FLOAT_ARRAY, { variable, values });
    }
  
    /**
     * Get the values of a global float array in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getFloatArray("var").value();
     * @param variable name of float array
     * @returns deferred promise of float values
     */
    public getFloatArray(variable: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_FLOAT_ARRAY, {
        variable,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Set the float value of a global float array by index
     * @param variable name of float array
     * @param index index of element
     * @param value value to set
     */
    public setFloatArrayValue(variable: string, index: number, value: number) {
      this.sendMessage(OutMessage.SET_FLOAT_ARRAY_VALUE, {
        variable,
        index,
        value,
      });
    }
  
    /**
     * Get the float value of a global float arry by index.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getFloatArray("var", index).value();
     * @param variable name of float arry
     * @param index indfex of element
     * @returns deferred promise of float value
     */
    public getFloatArrayValue(variable: string, index: number) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_FLOAT_ARRAY_VALUE, {
        variable,
        index,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    /**
     * Set the value (by key) of an associative float array in ChucK.
     * Note that "associative array" is ChucK's version of a dictionary with string keys mapping to values (see ChucK documentation).
     * @param variable name of global associative float array to set
     * @param key the key index of the associative array
     * @param value the new value
     */
    public setAssociativeFloatArrayValue(
      variable: string,
      key: string,
      value: number
    ) {
      this.sendMessage(OutMessage.SET_ASSOCIATIVE_FLOAT_ARRAY_VALUE, {
        variable,
        key,
        value,
      });
    }
  
    /**
     * Get the value (by key) of an associative float array in ChucK.
     * Resolve the deferred promise with .value().
     * e.g. theChucK.getAssociateIntArrayValue("var", "key").value();
     * @param variable name of gobal associative float arry
     * @param key the key index to get 
     * @returns deferred promise with associative int array value
     */
    public getAssociativeFloatArrayValue(variable: string, key: string) {
      const callbackID = this.nextDeferID();
      this.sendMessage(OutMessage.GET_ASSOCIATIVE_FLOAT_ARRAY_VALUE, {
        variable,
        key,
        callback: callbackID,
      });
      return this.deferredPromises[callbackID];
    }
  
    // ================= Clear ====================== //
    /**
     * Remove all shreds and reset the WebChucK instance
     */
    public clearChuckInstance() {
      this.sendMessage(OutMessage.CLEAR_INSTANCE);
    }
  
    /**
     * Reset all global variables in ChucK
     */
    public clearGlobals() {
      this.sendMessage(OutMessage.CLEAR_GLOBALS);
    }
  
    // ================== Print Output ================== //
    /**
     * Override this method to redirect ChucK console output. Current default is console.log().
     * Set your own method to handle output or process it.
     * @param message Message that ChucK prints to console
     */
    public chuckPrint(message: string) {
      // Default ChucK output destination
      console.log(message);
    }
  
    // ================ Internal Private ================== //
    /**
     * Internal: Communicate via JS to WebChucK WASM
     */
    private sendMessage(type: OutMessage, body?: { [prop: string]: unknown }) {
      const msgBody = body ? { type, ...body } : { type };
      try {
        this.port.postMessage(msgBody);
      } catch (e) {
        console.error(e);
      }
    }
  
    /**
     * Internal: Communicate via JS to WebChucK WASM
     */
    private receiveMessage(event: MessageEvent) {
      const type: InMessage = event.data.type;
  
      switch (type) {
        case InMessage.INIT_DONE:
          if (this.isReady && this.isReady.resolve) {
            this.isReady.resolve();
          }
          break;
        case InMessage.PRINT:
          this.chuckPrint(event.data.message);
          break;
        case InMessage.EVENT:
          if (event.data.callback in this.eventCallbacks) {
            const callback = this.eventCallbacks[event.data.callback];
            callback();
          }
          break;
        case InMessage.INT:
        case InMessage.FLOAT:
        case InMessage.STRING:
        case InMessage.INT_ARRAY:
        case InMessage.FLOAT_ARRAY:
          if (event.data.callback in this.deferredPromises) {
            const promise = this.deferredPromises[event.data.callback];
            if (promise.resolve) {
              promise.resolve(event.data.result);
            }
            delete this.deferredPromises[event.data.callback];
          }
          break;
        case InMessage.NEW_SHRED:
          if (event.data.callback in this.deferredPromises) {
            const promise = this.deferredPromises[event.data.callback];
            // console.log('event data: ', event.data);
            if (event.data.shred > 0) {
              if (promise.resolve) {
                promise.resolve(event.data.shred);
              }
            } else {
              if (promise.reject) {
                promise.reject("Running code failed");
              }
            }
          }
          break;
        case InMessage.REPLACED_SHRED:
          if (event.data.callback in this.deferredPromises) {
            const promise = this.deferredPromises[event.data.callback];
            if (event.data.newShred > 0) {
              if (promise.resolve) {
                promise.resolve({
                  newShred: event.data.newShred,
                  oldShred: event.data.oldShred,
                });
              }
            } else {
              if (promise.reject) {
                promise.reject("Replacing code failed");
              }
            }
          }
          break;
        case InMessage.REMOVED_SHRED:
          if (event.data.callback in this.deferredPromises) {
            const promise = this.deferredPromises[event.data.callback];
            if (event.data.shred > 0) {
              if (promise.resolve) {
                promise.resolve(event.data.shred);
              }
            } else {
              if (promise.reject) {
                promise.reject("Removing code failed");
              }
            }
          }
        break;
        default:
          break;
      }
    }
  }