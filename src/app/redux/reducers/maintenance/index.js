import { MAINTENANCE_REQUEST as T } from "../../actions/utilities";
const initial = { services: [], loading: false, error: "", success: false };
const reducer = (state = initial, action) => {
  switch (action.type) {
    case T.GET_MAINTENANCE_REQUEST:
    case T.ADD_SERVICE_REQUEST:
    case T.UPDATE_SERVICE_REQUEST:
    case T.REMOVE_SERVICE_REQUEST:
      return { ...state, loading: true, error: "", success: false };
    case T.GET_MAINTENANCE_SUCCESS:
      return { ...state, services: action.payload, loading: false, success: true };
    case T.ADD_SERVICE_SUCCESS:
      return { ...state, services: [...state.services, action.payload], loading: false, success: true };
    case T.UPDATE_SERVICE_SUCCESS:
      return { ...state, services: state.services.map(s => String(s.id) === String(action.payload.id) ? action.payload : s), loading: false, success: true };
    case T.REMOVE_SERVICE_SUCCESS:
      return { ...state, services: state.services.filter(s => String(s.id) !== String(action.payload.id)), loading: false, success: true };
    case T.GET_MAINTENANCE_FAILURE:
    case T.ADD_SERVICE_FAILURE:
    case T.UPDATE_SERVICE_FAILURE:
    case T.REMOVE_SERVICE_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };
    default: return state;
  }
};
export default reducer;
