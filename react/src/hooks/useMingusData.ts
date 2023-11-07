import {useReducer} from "react";
import {ActionReducer} from '../interfaces/action-reducer.interface';
import { IInitialState } from "../interfaces/initialstate.interface";

const REQUEST = 'REQUEST';
const MINGUSDATA_SUCCESS = 'MINGUSDATA_SUCCESS';
const FAILURE = 'FAILURE';

const initialState: any = {
    // audioplayer: {
    //     currentTime: 0,
    //     value: true,
    //     currentTimeInterval: 0,
    //     duration: 0,
    //     startClip: 0,
    //     // isLoading: false,
    //     // error: null,
    // },
    mingusdata: {
        noteData: [],
    }
};

export const mingusdataReducer = (state = initialState, action: ActionReducer) => {
    switch (action.type) {
        case REQUEST:
            return {
                ...state,
                // isLoading: true,
                // error: null,
            };
        case MINGUSDATA_SUCCESS:
            const latestDataArray = state.mingusdata.noteData.map((i: any) => i.note);
            const latestData = latestDataArray.indexOf(action.payload.mingusdata.noteData.note) === -1 ? [...state.mingusdata.noteData, action.payload.mingusdata.noteData] : state.mingusdata.noteData;
            return {
                ...state,
                // isLoading: false,
                mingusdata: {
                    noteData: latestData,
                },
            };
        case FAILURE:
            return {
                ...state,
                // isLoading: false,
                // error: action.payload.error,
            };
        default:
            return state;
    }
};

export const useMingusData = () => {
    const [state, dispatch] = useReducer(mingusdataReducer, {...initialState});

    const getMingusData = (data: any) => {
        // dispatch({type: REQUEST, payload: {...initialState}});
        console.log("MING PAYLOAD: ", data);
        
        dispatch({
            type: MINGUSDATA_SUCCESS,
            payload: {
                ...state,
                mingusdata: {
                    noteData: [...state.mingusdata.noteData, data],
                }
            },
        });
        return {data, state};
    };
    console.log("STATE IN MINGUS DATA: ", state);
    const storedNames = JSON.parse(localStorage.getItem("keyboard"));
    if (state.mingusdata.noteData && state.mingusdata.noteData.length === 108 && !storedNames.length) {
        localStorage.setItem("keyboard", JSON.stringify(state.mingusdata.noteData));
    }
    return {
        getMingusData,
        ...state,
    };
};