/*********************************************************************************************************************
 *  Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Kashif Imran
 */

'use strict';

let AWS = require('aws-sdk');
let creds = new AWS.EnvironmentCredentials('AWS');
let upload = require('./../upload');

/**
 * Performs operations for content moderation
 *
 * @class moderation
 */
let moderation = (function() {

    /**
     * @class moderation
     * @constructor
     */
    let moderation = function() {};

    /**
     * Moderate a document
     * @param {JSON} doc - document to be moderated
     * @param {ModerateDocument~callback} cb - The callback that handles the response
     */
    moderation.prototype.moderateDocument = function(doc, cb) {
      let o = doc;
      console.log('Moderating document:', o);

      let labelList = []
      let wordList = []

      if(doc.moderate_label_keywords)
        labelList = doc.moderate_label_keywords.split(',');
      if(doc.moderate_text_keywords)
        wordList = doc.moderate_text_keywords.split(',')

      let outputMessages = []

      if(o.labels && o.labels.labels){
        let clb = o.labels.labels.filter(value => -1 !== labelList.indexOf(value));
        if (clb.length > 0){
          outputMessages.push("Keyword match: " + clb.join(',') + ".");
        }
      }

      if(o.moderation_labels && o.moderation_labels.moderation_labels){
        if(o.moderation_labels.moderation_labels.length > 0)
          outputMessages.push("Moderation labels found: " + o.moderation_labels.moderation_labels.join(',') + ".");
      }

      if(o.detect_text && o.detect_text.detect_text){
        let textMatch = []
        let text = o.detect_text.detect_text.join(' ')
        for(let i =0; i<wordList.length; i++){
          if(text.includes(wordList[i])){
            textMatch.push(wordList[i])
          }
        }
        if(textMatch.length > 0){
          outputMessages.push("Text match: " + textMatch.join(',') + ".");
        }
      }

      if(outputMessages.length > 0){
        let fm = outputMessages.join(' ')
        console.log(fm)

        let cm_key = ['private',doc.owner_id,'media',doc.object_id,'results','contentModerationWarning.json'].join('/');
        let s3Bucket = doc.bucket;

        let s3_params = {
            Bucket: s3Bucket,
            Key: cm_key,
            Body: JSON.stringify(fm),
            ContentType: 'application/json'
        };

        upload.respond(s3_params, function(err, response) {
            if (err){
              console.log(err);
              return cb(err, null);
            }
            else {
                console.log(response);
                return cb(null, fm)
            }
        });
      }
      else {
          console.log('SafeContent')
          return cb(null, 'SafeContent')
      }
    };

    return moderation;

})();

module.exports = moderation;
