import {
  REQUEST,
  SUCCESS,
  FAILURE,
  ATTENDANCE_REQUEST as T
} from "../utilities";

import {
  getAttendance,
  markAttendance,
  updateAttendance,
  removeAttendance
} from "../../api/attendance";

const runAction = (
  requestType,
  successType,
  failureType,
  apiFunction,
  onSuccess,
  onFailure
) => async (dispatch) => {

  dispatch(REQUEST(requestType));

  try {
    const response = await apiFunction();

    if (response.data.succeeded) {
      dispatch(
        SUCCESS(successType, response.data.data)
      );

      if (onSuccess) onSuccess();
    } else {
      dispatch(
        FAILURE(failureType, response.data.message)
      );

      if (onFailure) {
        onFailure(response.data.message);
      }
    }
  } catch (error) {
    dispatch(
      FAILURE(failureType, error.message)
    );

    if (onFailure) {
      onFailure(error.message);
    }
  }
};

export const GETATTENDANCE = () =>
  runAction(
    T.GET_ATTENDANCE_REQUEST,
    T.GET_ATTENDANCE_SUCCESS,
    T.GET_ATTENDANCE_FAILURE,
    getAttendance
  );
export const MARKATTENDANCE = (data, onSuccess, onFailure) =>
  runAction(
    T.MARK_ATTENDANCE_REQUEST,
    T.MARK_ATTENDANCE_SUCCESS,
    T.MARK_ATTENDANCE_FAILURE,
    () => markAttendance(data),
    onSuccess,
    onFailure
  );

export const UPDATEATTENDANCE = (data, onSuccess, onFailure) =>
  runAction(
    T.UPDATE_ATTENDANCE_REQUEST,
    T.UPDATE_ATTENDANCE_SUCCESS,
    T.UPDATE_ATTENDANCE_FAILURE,
    () => updateAttendance(data),
    onSuccess,
    onFailure
  );

export const REMOVEATTENDANCE = (id, onSuccess, onFailure) =>
  runAction(
    T.REMOVE_ATTENDANCE_REQUEST,
    T.REMOVE_ATTENDANCE_SUCCESS,
    T.REMOVE_ATTENDANCE_FAILURE,
    () => removeAttendance(id),
    onSuccess,
    onFailure
  );