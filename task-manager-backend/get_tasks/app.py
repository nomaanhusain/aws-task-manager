import boto3
import json
import uuid
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Tasks')

def lambda_handler(event, context):

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
    }

    # Handle OPTIONS request for CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    response = table.scan(
        FilterExpression=Attr("createdBy").eq(user_id) | Attr("assigned_to").contains(user_id)
    )

    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(response["Items"])
        }
