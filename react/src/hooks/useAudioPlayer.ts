import {useReducer} from "react";
import {ActionReducer} from '../interfaces/action-reducer.interface';
import { IAudioPlayer } from "../interfaces/audioplayer.interface";

const REQUEST = 'REQUEST';
const AUDIOPLAYER_SUCCESS = 'AUDIOPLAYER_SUCCESS';
const FAILURE = 'FAILURE';

const initialState = {
    isLoading: false,
    error: null,

        currentTime: 0,
        value: true,
        currentTimeInterval: 0,
        duration: 0,
        startClip: 0,
        noteData: [],
} as IAudioPlayer;

export const audioplayerReducer = (state = initialState, action: ActionReducer) => {
    console.log("check audio reducer state ", state);
    switch (action.type) {
        case REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case AUDIOPLAYER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                currentTime: action.payload.currentTime,
                value: action.payload.value,
                currentTimeInterval: action.payload.currentTimeInterval,
                duration: action.payload.duration,
                startClip: action.payload.startClip,
            };
        case FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        default:
            return state;
    }
};

const useAudioPlayer = () => {
    const [state, dispatch] = useReducer(audioplayerReducer, {...initialState});

    const request = () => {
        dispatch({type: REQUEST, payload: {...initialState}});
    };

    const success = (data: IAudioPlayer) => {
        dispatch({
            type: AUDIOPLAYER_SUCCESS,
            payload: {
                currentTime: data.currentTime,
                value: data.value,
                currentTimeInterval: data.currentTimeInterval,
                duration: data.duration,
                startClip: data.startClip,
            },
        });
    };

    const failure = (error: any) => {
        dispatch({
            type: FAILURE,
            payload: {
                error,
            },
        });
    };

    return {
        request,
        success,
        failure,
        ...state,
    };
};