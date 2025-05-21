import boto3
import json
import os
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ["USERS_TABLE"])
# GET /users
def lambda_handler(event, context):
    users = table.scan()["Items"]
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET"
        },
        "body": json.dumps(users)
    }
