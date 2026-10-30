import { EQUIPMENT_REQUEST as T } from "../../actions/utilities";
const initial = { items: [], loading: false, error: "", success: false };
const reducer = (state = initial, action) => {
  switch (action.type) {
    case T.GET_EQUIPMENT_REQUEST:
    case T.ADD_EQUIPMENT_REQUEST:
    case T.UPDATE_EQUIPMENT_REQUEST:
    case T.REMOVE_EQUIPMENT_REQUEST:
      return { ...state, loading: true, error: "", success: false };
    case T.GET_EQUIPMENT_SUCCESS:
      return { ...state, items: action.payload, loading: false, success: true };
    case T.ADD_EQUIPMENT_SUCCESS:
      return { ...state, items: [...state.items, action.payload], loading: false, success: true };
    case T.UPDATE_EQUIPMENT_SUCCESS:
      return { ...state, items: state.items.map(e => String(e.id) === String(action.payload.id) ? action.payload : e), loading: false, success: true };
    case T.REMOVE_EQUIPMENT_SUCCESS:
      return { ...state, items: state.items.filter(e => String(e.id) !== String(action.payload.id)), loading: false, success: true };
    case T.GET_EQUIPMENT_FAILURE:
    case T.ADD_EQUIPMENT_FAILURE:
    case T.UPDATE_EQUIPMENT_FAILURE:
    case T.REMOVE_EQUIPMENT_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };
    default: return state;
  }
};
export default reducer;
