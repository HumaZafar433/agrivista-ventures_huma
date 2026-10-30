import { REQUEST, SUCCESS, FAILURE, MAINTENANCE_REQUEST as T } from "../utilities";
import { getMaintenance, createService, updateService, removeService } from "../../api/maintenance";
import { GETEQUIPMENT } from "../equipment";

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
    if (success !== T.GET_MAINTENANCE_SUCCESS) await dispatch(GETEQUIPMENT());
    onSuccess?.();
    return true;
  } catch (err) {
    dispatch(FAILURE(failure, err.message));
    onFailure?.(err.message);
    return false;
  }
};
export const GETMAINTENANCE = () => perform(T.GET_MAINTENANCE_REQUEST, T.GET_MAINTENANCE_SUCCESS, T.GET_MAINTENANCE_FAILURE, getMaintenance);
export const ADDSERVICE = (record, yes, no) => perform(T.ADD_SERVICE_REQUEST, T.ADD_SERVICE_SUCCESS, T.ADD_SERVICE_FAILURE, () => createService(record), yes, no);
export const UPDATESERVICE = (record, yes, no) => perform(T.UPDATE_SERVICE_REQUEST, T.UPDATE_SERVICE_SUCCESS, T.UPDATE_SERVICE_FAILURE, () => updateService(record), yes, no);
export const REMOVESERVICE = (id, yes, no) => perform(T.REMOVE_SERVICE_REQUEST, T.REMOVE_SERVICE_SUCCESS, T.REMOVE_SERVICE_FAILURE, () => removeService(id), yes, no);
