import json
import boto3
import uuid
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Tasks")

def lambda_handler(event, context):
    user_id = event['requestContext']['authorizer']['claims']['sub']
    task_id = event['pathParameters']['id']
    body = json.loads(event['body'])

    update_expression = []
    expression_attribute_values = {}
    
    headers = {
        "Access-Control-Allow-Origin": "*",  # Or your frontend URL
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
    }

    if 'title' in body:
        update_expression.append("title = :t")
        expression_attribute_values[':t'] = body['title']

    if 'completion_status' in body:
        update_expression.append("completion_status = :s")
        expression_attribute_values[':s'] = body['completion_status']
    
    if 'assigned_to' in body:
        update_expression.append("assigned_to = :a")
        expression_attribute_values[':a'] = body['assigned_to']

    if not update_expression:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"message": "Nothing to update"})
        }

    try:
        # First, get the task to verify ownership
        response = table.get_item(Key={'id': task_id})
        item = response.get('Item')

        if not item:
            return {"statusCode": 404, "headers": headers, "body": json.dumps({"message": "Task not found"})}
        if item['createdBy'] != user_id:
            return {"statusCode": 403, "headers": headers, "body": json.dumps({"message": "Not authorized to modify this task"})}

        # Update the item
        table.update_item(
            Key={'id': task_id},
            UpdateExpression="SET " + ", ".join(update_expression), # makes a dynamodb update expression
            ExpressionAttributeValues=expression_attribute_values
        )

        return {"statusCode": 200, "headers": headers, "body": json.dumps({"message": "Task updated"})}

    except Exception as e:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"message": "Internal Server Error", "error": str(e)})}