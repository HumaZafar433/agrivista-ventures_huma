import { REQUEST, SUCCESS, FAILURE, EQUIPMENT_REQUEST as T } from "../utilities";
import { getEquipment, createEquipment, updateEquipment, removeEquipment } from "../../api/equipment";

const perform = (request, success, failure, api, onSuccess, onFailure) => async (dispatch) => {
  dispatch(REQUEST(request));
  try {
    const result = await api();
    if (!result.data.succeeded) {
      dispatch(FAILURE(failure, result.data.message));
      onFailure?.(result.data.message);
      return false;
    }
    dispatch(SUCCESS(success, result.data.data));
    onSuccess?.();
    return true;
  } catch (err) {
    dispatch(FAILURE(failure, err.message));
    onFailure?.(err.message);
    return false;
  }
};

export const GETEQUIPMENT = () => perform(T.GET_EQUIPMENT_REQUEST, T.GET_EQUIPMENT_SUCCESS, T.GET_EQUIPMENT_FAILURE, getEquipment);
export const ADDEQUIPMENT = (item, yes, no) => perform(T.ADD_EQUIPMENT_REQUEST, T.ADD_EQUIPMENT_SUCCESS, T.ADD_EQUIPMENT_FAILURE, () => createEquipment(item), yes, no);
export const UPDATEEQUIPMENT = (item, yes, no) => perform(T.UPDATE_EQUIPMENT_REQUEST, T.UPDATE_EQUIPMENT_SUCCESS, T.UPDATE_EQUIPMENT_FAILURE, () => updateEquipment(item), yes, no);
export const REMOVEEQUIPMENT = (id, yes, no) => perform(T.REMOVE_EQUIPMENT_REQUEST, T.REMOVE_EQUIPMENT_SUCCESS, T.REMOVE_EQUIPMENT_FAILURE, () => removeEquipment(id), yes, no);
