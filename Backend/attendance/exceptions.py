"""
Custom exception handler for consistent error responses.
"""
from rest_framework.views import exception_handler
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns error responses in the format:
    {
        "error": {
            "message": "Human-readable error message",
            "code": "ERROR_CODE",
            "statusCode": 400
        }
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        error_message = str(exc)
        
        # Extract first error message if it's a dict
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_message = response.data['detail']
            else:
                # Get first error from validation errors
                for key, value in response.data.items():
                    if isinstance(value, list) and len(value) > 0:
                        error_message = f"{key}: {value[0]}"
                        break
                    elif isinstance(value, str):
                        error_message = f"{key}: {value}"
                        break
        
        # Map status codes to error codes
        error_code_map = {
            status.HTTP_400_BAD_REQUEST: 'VALIDATION_ERROR',
            status.HTTP_401_UNAUTHORIZED: 'UNAUTHORIZED',
            status.HTTP_403_FORBIDDEN: 'FORBIDDEN',
            status.HTTP_404_NOT_FOUND: 'NOT_FOUND',
            status.HTTP_429_TOO_MANY_REQUESTS: 'RATE_LIMIT_EXCEEDED',
            status.HTTP_500_INTERNAL_SERVER_ERROR: 'SERVER_ERROR',
        }
        
        error_code = error_code_map.get(response.status_code, 'ERROR')
        
        response.data = {
            'error': {
                'message': error_message,
                'code': error_code,
                'statusCode': response.status_code
            }
        }
    
    return response
