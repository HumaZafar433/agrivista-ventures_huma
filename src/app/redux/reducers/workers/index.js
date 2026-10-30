import { WORKER_REQUEST as T } from "../../actions/utilities";

const initialState = {
  workers: [],

  workersLoading: false,
  workersError: null,

  addLoading: false,
  addSuccess: false,
  addError: null,

  updateLoading: false,
  updateSuccess: false,
  updateError: null,

  removeLoading: false,
  removeSuccess: false,
  removeError: null
};

const workersReducer = (state = initialState, action) => {
  switch (action.type) {

    case T.GET_WORKERS_REQUEST:
      return {
        ...state,
        workersLoading: true,
        workersError: null
      };

    case T.GET_WORKERS_SUCCESS:
      return {
        ...state,
        workersLoading: false,
        workers: action.payload,
        workersError: null
      };

    case T.GET_WORKERS_FAILURE:
      return {
        ...state,
        workersLoading: false,
        workersError: action.payload
      };

    case T.ADD_WORKER_REQUEST:
      return {
        ...state,
        addLoading: true,
        addSuccess: false,
        addError: null
      };

    case T.ADD_WORKER_SUCCESS:
      return {
        ...state,
        addLoading: false,
        addSuccess: true,
        workers: [...state.workers, action.payload]
      };

    case T.ADD_WORKER_FAILURE:
      return {
        ...state,
        addLoading: false,
        addError: action.payload
      };

    case T.UPDATE_WORKER_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateSuccess: false,
        updateError: null
      };

    case T.UPDATE_WORKER_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateSuccess: true,
        workers: state.workers.map((worker) =>
          worker.id === action.payload.id
            ? action.payload
            : worker
        )
      };

    case T.UPDATE_WORKER_FAILURE:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload
      };

    case T.REMOVE_WORKER_REQUEST:
      return {
        ...state,
        removeLoading: true,
        removeSuccess: false,
        removeError: null
      };

    case T.REMOVE_WORKER_SUCCESS:
      return {
        ...state,
        removeLoading: false,
        removeSuccess: true,
        workers: state.workers.filter(
          (worker) => worker.id !== action.payload.id
        )
      };

    case T.REMOVE_WORKER_FAILURE:
      return {
        ...state,
        removeLoading: false,
        removeError: action.payload
      };

    default:
      return state;
  }
};

export default workersReducer;