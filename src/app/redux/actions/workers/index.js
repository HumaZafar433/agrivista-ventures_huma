import { REQUEST, SUCCESS, FAILURE, WORKER_REQUEST as T } from "../utilities";

import {
  getWorkers,
  createWorker,
  updateWorker,
  removeWorker
} from "../../api/workers";

const runAction = (request, success, failure, apiCall, callback) =>
  async (dispatch) => {
    dispatch(REQUEST(request));

    try {
      const response = await apiCall();

      if (response.data.succeeded) {
        dispatch(SUCCESS(success, response.data.data));
        if (callback) callback();
      } else {
        dispatch(FAILURE(failure, response.data.message));
      }
    } catch (error) {
      dispatch(FAILURE(failure, error.message));
    }
  };

export const GETWORKERS = () =>
  runAction(
    T.GET_WORKERS_REQUEST,
    T.GET_WORKERS_SUCCESS,
    T.GET_WORKERS_FAILURE,
    getWorkers
  );

export const ADDWORKER = (data, callback) =>
  runAction(
    T.ADD_WORKER_REQUEST,
    T.ADD_WORKER_SUCCESS,
    T.ADD_WORKER_FAILURE,
    () => createWorker(data),
    callback
  );

export const UPDATEWORKER = (data, callback) =>
  runAction(
    T.UPDATE_WORKER_REQUEST,
    T.UPDATE_WORKER_SUCCESS,
    T.UPDATE_WORKER_FAILURE,
    () => updateWorker(data),
    callback
  );

export const REMOVEWORKER = (id, callback) =>
  runAction(
    T.REMOVE_WORKER_REQUEST,
    T.REMOVE_WORKER_SUCCESS,
    T.REMOVE_WORKER_FAILURE,
    () => removeWorker(id),
    callback
  );