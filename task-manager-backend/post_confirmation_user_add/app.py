import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ["USERS_TABLE"])

def lambda_handler(event, context):
    user_id = event["userName"]  # This is the Cognito user ID in PostConfirmation trigger
    username = event["request"]["userAttributes"].get("email")

    table.put_item(
        Item={
            "user_id": user_id,
            "username": username
        }
    )

    return event  # Required by Cognito
