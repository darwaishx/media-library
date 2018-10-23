# Content Moderation

In this module you will extend the Media Analysis Solution to identify un-safe images including explicit or suggestive content or offensive text in the images. After you complete this module, your solution will automatically detect and isolate un-safe content as it is uploaded.

We will be using [DetectModerationLabels](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectModerationLabels.html) and [DetectText](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectText.html) APIs of Amazon Rekognition to perform content moderation.

To enhance the solution, you will modify three components of the solution:

  1. **Media Analysis Lambda Function**: Add code to detect text, moderation labels and then analyze the extracted meta-data for un-safe content.

  2. **IAM Role for Media Analysis Lambda Function**: Give IAM role the permissions to call the DetectModerationLabels and DetectText API.

  3. **Media Analysis Step Functions**: Modify the step functions to change the workflow to detect, isolate un-safe images as they are uploaded.

## Modify Media Analysis Lambda Function

In this step, you will modify the Media Analysis Solution lambda function to extract text from images and then use detected labels, text and moderation labels to identify un-safe content.

1. [Download](./code/lambda.zip) lambda package on your local machine. This lambda function has been updated to include logic for content moderation.

2. We have updated index.js and image.js as well as added content moderation module.

![Lambda](assets/lambda-00.png)

![Lambda](assets/lambda-01.png)

![Lambda](assets/lambda-03.png)

![Lambda](assets/lambda-05.png)

3. Go to the CloudFormation console https://console.aws.amazon.com/cloudformation/home

4. Click on the stack with Stack Name - `Media Analysis`, select **Resources** tab from the bottom pane and navigate to Media Analysis Function. Click on the hyperlink to open the Media Analysis Function.

  ![CloudFormation Stack Lambda](assets/lambda-cf-01.png)

5. Under Function code, click on Upload button, select the zip file you downloaded in earlier step and click Save. It can take a minute to upload the zip file.

![Lambda](assets/lambda-07.png)

6. Under Environment variables, make following changes and click Save.
  - Update value of CONFIDENCE_SCORE to 50
  - Add two new environment variables:
     - Key: moderate_label_keywords
     - Value: ocean, sun
     - Key: moderate_text_keywords
     - Value: sand, beach

![Lambda](assets/lambda-08.png)

7. Make note of the arn of lambda function. You will need this in the step below as you modify state machine.

![Lambda](assets/lambda-09.png)

  **You have successfully completed step 1 and updated lambda function to perform additional analysis.!**

## Add permissions to IAM Role

In this step you will provide the Media Analysis Lambda Function necessary permissions to call the Rekognition DetectModerationLabels and DetectText APIs.

1. Go to the CloudFormation console https://console.aws.amazon.com/cloudformation/home

2. Click on the stack with Stack Name - `Media Analysis`, select **Resources** tab from the bottom pane and navigate to Media Analysis Function Role. Click on the hyperlink to open the IAM Role

  ![CloudFormation Stack output screenshot](assets/iam-01.png)

3. On summary screen, under Permissions tab, click on the arrow to view details of the policy "media-analysis-function-policy".

  ![Policy](assets/iam-02.png)

4. Click on Edit Policy

![Edit Policy](assets/iam-03.png)

5. Expand Rekognition, and hover over Actions to get the edit icon and then click on it.

![Visual Editor](assets/iam-04.png)

6. Select DetectModerationLabels and DetectText and click on the button Review policy.

![Visual Editor](assets/iam-05.png)

7. Under Review policy, click Save changes.

![Visual Editor](assets/iam-06.png)

**You have successfully completed step 2 and updated IAM role to allows Lambda function to call additional Rekognition APIs.**

## Modify Media Analysis Step Function

In this step, you will modify the Media Analysis Step Function to orchestrate the Lambda function calls.

1. Download [state machine JSON](code/step-function.json) on your local machine.

2. Use an editor of your choice to replace all instances of "REPLACE-WITH-ARN-OF-YOUR-LAMBDA-FUNCTION" with the arn of lambda function of your instance of Media Analysis Solution that you noted in step 1.

![Step Functions Edit](assets/sf-04.png)

3. Go to AWS Step function console at https://console.aws.amazon.com/states/home

4. In the left navigation click on State Machines and type **media** in the search box. You will see state machine for your instance of Media Analysis Solution. Click on the state machine.

![Step Functions](assets/sf-01.png)

5. On the state machine details screen, click Edit to update the state machine.

![Step Functions Edit](assets/sf-02.png)

6. Under State machine definition, replace JSON of you state machine definition with the updated JSON from your code editor and click Save.

![Step Functions Edit](assets/sf-05.png)

8. In the right pane, you will see updated visual workflow showing updated state machine.

![New Branches](assets/sf-06.png)

![Content Moderation Branch](assets/sf-07.png)

  **You have successfully completed step 3 and updated state machine.**

## Testing it out

1. Download [sample image](assets/yoga-swimwear.jpg) on your local machine.

2. Go to the Media Analysis Portal, and upload the image you just saved.

3. Click on View progress in your AWS Console. You can see in the visual workflow, image did not get indexed as the solution found it to be un-safe content.

![unsafe content](assets/test-01.png)

4. Go to S3 bucket where content for your Media Analysis Solutions is uploaded. Locate the folder for the image you just uploaded and you will find contentModerationWarning.json.

![unsafe content](assets/test-02.png)

5. Download and open the JSON file contentModerationWarning.json and you should the message from content moderation engine about the nature of un-safe content.

![unsafe content message](assets/test-03.png)

## Completion

You have successfully extended Media Analysis Solution to detect text and moderate un-safe content for images. You can use the same technique to update the workflow and lambda function to enable content moderation for videos.

## Clean up

1. Go to the CloudFormation console https://console.aws.amazon.com/cloudformation/home

2. Select stack with Stack Name - `Media Analysis`, click Actions and click on Delete Stack. This will also delete all the nested stacks.

  ![CloudFormation Stack Delete](assets/mas-cf-delete.png)
