import { recognizerLogger as logger } from '../configuration/LoggerConfig';
import * as InkModel from '../model/InkModel';
import * as RecognizerContext from '../model/RecognizerContext';
import Constants from '../configuration/Constants';

/**
 * Triggers
 * @typedef {Object} Triggers
 * @property {Array<String>} exportContent Supported triggers for exporting content.
 * @property {Array<String>} [addStrokes] Supported triggers for adding strokes.
 */

/**
 * Recognizer info
 * @typedef {Object} RecognizerInfo
 * @property {Array<String>} types Supported recognition types (TEXT, MATH, SHAPE, MUSIC, ANALYZER).
 * @property {String} protocol Supported protocol (REST, WEBSOCKET).
 * @property {String} apiVersion Supported API version.
 * @property {Triggers} availableTriggers Supported triggers for this recognizer.
 */

/**
 * Recognizer callback
 * @typedef {function} RecognizerCallback
 * @param {Object} [err] Error
 * @param {Model} [model] Result
 * @param {...String} [types] Result types
 */

/**
 * Recognition service entry point
 * @typedef {Object} Recognizer
 * @property {function(): RecognizerInfo} getInfo Get information about the supported configuration (protocol, type, apiVersion, ...).
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} init Initialize recognition.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} clear Clear server context. Currently nothing to do there.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} close Close and free all resources that will no longer be used by the recognizer.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [undo] Undo Undo the last done action.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [redo] Redo Redo the previously undone action.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [resize] Resize.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [addStrokes] Add strokes.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [exportContent] Export content.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [convert] Convert.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [waitForIdle] Wait for idle.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [setPenStyle] Set pen style.
 * @property {function(recognizerContext: RecognizerContext, model: Model, callback: RecognizerCallback)} [setTheme] Set theme.
 */

/**
 * Initialize recognition
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function init(recognizerContext, model, callback) {
  const modelRef = InkModel.resetModelPositions(model);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef);
  recognizerContextRef.initPromise = Promise.resolve(modelRef);
  recognizerContextRef.initPromise
    .then((res) => {
      recognizerContextRef.initialized = true;
      logger.debug('Updated recognizer context', recognizerContextRef);
      callback(undefined, res, Constants.EventType.CHANGED);
    });
}

/**
 * Reset server context. Currently nothing to do there.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function reset(recognizerContext, model, callback) {
  const modelRef = InkModel.resetModelPositions(model);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef);
  delete recognizerContextRef.instanceId;
  logger.debug('Updated recognizer context', recognizerContextRef);
  callback(undefined, modelRef);
}

/**
 * Clear server context. Currently nothing to do there.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function clear(recognizerContext, model, callback) {
  const modelRef = InkModel.cloneModel(model);
  InkModel.clearModel(modelRef);
  logger.debug('Updated model', modelRef);
  const recognizerContextRef = RecognizerContext.updateRecognitionPositions(recognizerContext, modelRef);
  delete recognizerContextRef.instanceId;
  logger.debug('Updated recognizer context', recognizerContextRef);
  callback(undefined, modelRef);
}

/**
 * Close and free all resources that will no longer be used by the recognizer.
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {Model} model Current model
 * @param {RecognizerCallback} callback
 */
export function close(recognizerContext, model, callback) {
  clear(recognizerContext, model, (err, res) => callback(err, res, Constants.EventType.CHANGED));
}
