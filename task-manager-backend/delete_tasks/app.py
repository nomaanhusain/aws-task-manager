import json
import boto3
from botocore.exceptions import ClientError
import logging
from boto3.dynamodb.conditions import Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Tasks")
def lambda_handler(event, context):
    user_id = event['requestContext']['authorizer']['claims']['sub']
    task_id = event['pathParameters']['id']

    try:
        table.delete_item(
            Key={'id': task_id},
            ConditionExpression=Attr('createdBy').eq(user_id)
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Task deleted successfully'})
        }
    except ClientError as e:
        if e.response['Error']['Code'] == "ConditionalCheckFailedException":
            return {
                'statusCode': 403,
                'body': json.dumps({'message': 'You are not authorized to delete this task'})
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Internal Server Error'})
            }