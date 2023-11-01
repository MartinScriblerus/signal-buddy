import {useReducer} from "react";
import {ActionReducer} from '../interfaces/action-reducer.interface';
import { IMingusData } from "../interfaces/mingusdata.interface";

const REQUEST = 'REQUEST';
const MINGUSDATA_SUCCESS = 'MINGUSDATA_SUCCESS';
const FAILURE = 'FAILURE';

const initialState = {
    isLoading: false,
    error: null,
    currentTime: 0,
    value: true,
    currentTimeInterval: 0,
    duration: 0,
    startClip: 0,
    noteData: [] as IMingusData[],
};

export const mingusdataReducer = (state = initialState, action: ActionReducer) => {
    switch (action.type) {
        case REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case MINGUSDATA_SUCCESS:
            const latestDataArray = state.noteData.map((i: any) => i.note);
            const latestData = latestDataArray.indexOf(action.payload.noteData.note) === -1 ? [...state.noteData, action.payload.noteData] : state.noteData;
            return {
                ...state,
                isLoading: false,
                noteData: latestData,
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

export const useMingusData = () => {
    const [state, dispatch] = useReducer(mingusdataReducer, {...initialState});

    const getMingusData = async (data: any) => {

        dispatch({type: REQUEST, payload: {...initialState}});

        dispatch({
            type: MINGUSDATA_SUCCESS,
            payload: {
                ...state,
                noteData: data,
            },
        });
        state.noteData = [...state.noteData, data];
        return {data, state};
    };
    console.log("STATE IN MINGUS DATA: ", state);
    return {
        getMingusData,
        ...state,
    };
};