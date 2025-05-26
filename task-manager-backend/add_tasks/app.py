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
    assigned_to = body.get("assigned_to", [])  # optional field
    logger.info(f"Creating a new task with ID: {task_id}, and title {task_title} for user: {user_id}")
    # it is important that there is a field with the exact name "id" otherwise DynamoDB will not be able to create the item, 
    # you have to change it in the Template.yaml if you want to use a different name for the id field
    task_obj = {
        "id": task_id,
        "title": task_title,
        "createdBy": user_id,
        "assigned_to": assigned_to,
        "completion_status": "not_started"
    }
    
    table.put_item(Item=task_obj)

    return {
        "statusCode": 201,
        "headers": {
        "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({"message": "Task created", "id": task_id, "createdBy": user_id})
    }