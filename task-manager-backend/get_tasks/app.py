import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Tasks')

def lambda_handler(event, context):

    # Handle OPTIONS request for CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Or your frontend URL instead of *
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
            },
            "body": ""
        }

    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    response = table.scan(
        FilterExpression=Attr("createdBy").eq(user_id) | Attr("assignedTo").contains(user_id)
    )

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
    }
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(response["Items"])
        }
