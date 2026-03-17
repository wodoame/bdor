import traceback
from datetime import datetime
import time
from django.utils.deprecation import MiddlewareMixin


class ExceptionLoggingMiddleware:
    """
    Middleware that catches unhandled exceptions and logs them to the database.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            self._log_exception(e, request)
            raise

    def _log_exception(self, exception, request):
        """Log exception details to database"""
        try:
            from api.models import AppLog
            AppLog.objects.create(
                level='ERROR',
                logger_name='api.middleware.ExceptionLoggingMiddleware',
                message=str(exception),
                path=request.path,
                method=request.method,
                exception_type=type(exception).__name__,
                traceback=traceback.format_exc(),
            )
        except Exception:
            pass  # Silently fail to avoid recursive errors




class RequestLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._start_time = time.time()

    def process_response(self, request, response):
        try:
            from api.models import RequestLog
            duration = (time.time() - getattr(request, '_start_time', time.time())) * 1000
            RequestLog.objects.create(
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                ip_address=request.META.get('REMOTE_ADDR'),
                response_time_ms=round(duration, 2),
            )
        except Exception:
            pass
        return response