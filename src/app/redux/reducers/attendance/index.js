import {
  ATTENDANCE_REQUEST as T
} from "../../actions/utilities";

const initialState = {
  records: [],

  loading: false,
  error: null,

  addLoading: false,
  addSuccess: false,

  updateLoading: false,
  updateSuccess: false,

  removeLoading: false,
  removeSuccess: false
};

function attendanceReducer(state = initialState, action) {
  switch (action.type) {


    case T.GET_ATTENDANCE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case T.GET_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        records: action.payload,
        error: null
      };

    case T.GET_ATTENDANCE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };


    case T.MARK_ATTENDANCE_REQUEST:
      return {
        ...state,
        addLoading: true,
        addSuccess: false,
        error: null
      };

    case T.MARK_ATTENDANCE_SUCCESS:
      return {
        ...state,
        addLoading: false,
        addSuccess: true,
        records: [...state.records, action.payload]
      };

    case T.MARK_ATTENDANCE_FAILURE:
      return {
        ...state,
        addLoading: false,
        addSuccess: false,
        error: action.payload
      };


    case T.UPDATE_ATTENDANCE_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateSuccess: false,
        error: null
      };

    case T.UPDATE_ATTENDANCE_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateSuccess: true,
        records: state.records.map((record) =>
          record.id === action.payload.id
            ? action.payload
            : record
        )
      };

    case T.UPDATE_ATTENDANCE_FAILURE:
      return {
        ...state,
        updateLoading: false,
        updateSuccess: false,
        error: action.payload
      };


    case T.REMOVE_ATTENDANCE_REQUEST:
      return {
        ...state,
        removeLoading: true,
        removeSuccess: false,
        error: null
      };

    case T.REMOVE_ATTENDANCE_SUCCESS:
      return {
        ...state,
        removeLoading: false,
        removeSuccess: true,
        records: state.records.filter(
          (record) => record.id !== action.payload.id
        )
      };

    case T.REMOVE_ATTENDANCE_FAILURE:
      return {
        ...state,
        removeLoading: false,
        removeSuccess: false,
        error: action.payload
      };

    default:
      return state;
  }
}

export default attendanceReducer;