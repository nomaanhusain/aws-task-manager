import json
import boto3
import uuid
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Tasks")

def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    body = json.loads(event["body"])
    task_id = str(uuid.uuid4())
    task_title = body.get("title")
    assigned_to = body.get("assignedTo", [])  # optional field
    logger.info(f"Creating a new task with ID: {task_id}, and title {task_title} for user: {user_id}")
    # it is important that there is a field with the exact name "id" otherwise DynamoDB will not be able to create the item, you can change it in Template.yaml tho
    item = {
        "id": task_id,
        "title": task_title,
        "createdBy": user_id,
        "assignedTo": assigned_to,
        "completionStatus": "not_started"
    }
    
    table.put_item(Item=item)

    return {
        "statusCode": 201,
        "headers": {
        "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({"message": "Task created", "id": task_id, "createdBy": user_id})
    }