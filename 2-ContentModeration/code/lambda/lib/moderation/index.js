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
let Moderation = require('./moderation.js');

const s3Bucket = process.env.S3_BUCKET;
const solution_id = process.env.SOLUTIONID;
const uuid = process.env.UUID;

module.exports.respond = function(event, cb) {

    if (event.lambda.function_name == 'moderate_content') {

        let doc = {
          upload_time: event.upload_time,
          bucket: s3Bucket,
          key: event.key,
          file_type: event.file_type,
          size: event.size,
          object_id: event.object_id,
          owner_id: event.owner_id,
          name: event.file_name
        };

        if (event.hasOwnProperty('duration')) {
            doc['duration'] = event.duration;
        }

        let branches = event.final_metadata;
        for (var branch in branches) {
            for (var b in branches[branch]) {
                for (var result in branches[branch][b].results) {
                    doc[result] = branches[branch][b].results[result];
                    if (branches[branch][b].results[result].hasOwnProperty('duration')) {
                        doc['duration'] = branches[branch][b].results[result].duration;
                    }
                }
            }
        }

        if(process.env.moderate_label_keywords)
          doc.moderate_label_keywords = process.env.moderate_label_keywords;

        if(process.env.moderate_text_keywords)
          doc.moderate_text_keywords = process.env.moderate_text_keywords;

        let _moderation = new Moderation();
        _moderation.moderateDocument(doc, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
              console.log(data);
              return cb(null,data);
            }
        });
    }
};
