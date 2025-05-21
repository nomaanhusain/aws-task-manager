import boto3
import os
import json
# This Lambda function fetches user data from DynamoDB based on the user ID from the request context.
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])

def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    response = table.get_item(Key={"user_id": user_id})
    user = response.get("Item", {})

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        "body": json.dumps(user)
    }
