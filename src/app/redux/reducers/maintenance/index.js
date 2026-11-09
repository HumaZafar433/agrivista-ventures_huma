
import {
  MAINTENANCE_REQUEST as T
} from "../../actions/utilities";

const initialState = {
  services: [],
  loading: false,
  error: null,

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

const maintenanceReducer = (
  state = initialState,
  action
) => {
  switch (action.type) {

    // LOAD FROM POSTGRESQL
    case T.GET_MAINTENANCE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case T.GET_MAINTENANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        services: Array.isArray(action.payload)
          ? action.payload
          : [],
        error: null
      };

    case T.GET_MAINTENANCE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ADD SERVICE
    case T.ADD_SERVICE_REQUEST:
      return {
        ...state,
        addLoading: true,
        addSuccess: false,
        addError: null
      };

    case T.ADD_SERVICE_SUCCESS:
      return {
        ...state,
        addLoading: false,
        addSuccess: true,
        services: [
          ...state.services,
          action.payload
        ]
      };

    case T.ADD_SERVICE_FAILURE:
      return {
        ...state,
        addLoading: false,
        addError: action.payload
      };

    // UPDATE SERVICE
    case T.UPDATE_SERVICE_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateSuccess: false,
        updateError: null
      };

    case T.UPDATE_SERVICE_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateSuccess: true,
        services: state.services.map((service) =>
          String(service.id) ===
          String(action.payload.id)
            ? action.payload
            : service
        )
      };

    case T.UPDATE_SERVICE_FAILURE:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload
      };

    // DELETE SERVICE
    case T.REMOVE_SERVICE_REQUEST:
      return {
        ...state,
        removeLoading: true,
        removeSuccess: false,
        removeError: null
      };

    case T.REMOVE_SERVICE_SUCCESS:
      return {
        ...state,
        removeLoading: false,
        removeSuccess: true,
        services: state.services.filter(
          (service) =>
            String(service.id) !==
            String(action.payload.id)
        )
      };

    case T.REMOVE_SERVICE_FAILURE:
      return {
        ...state,
        removeLoading: false,
        removeError: action.payload
      };

    default:
      return state;
  }
};

export default maintenanceReducer;
