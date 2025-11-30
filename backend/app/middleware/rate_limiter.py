import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, Tuple[int, float]] = {}
        self.max_requests = 10
        self.window_seconds = 60
    
    def is_allowed(self, ip: str) -> bool:
        current_time = time.time()
        
        if ip not in self.requests:
            self.requests[ip] = (1, current_time)
            return True
        
        count, window_start = self.requests[ip]
        
        if current_time - window_start > self.window_seconds:
            self.requests[ip] = (1, current_time)
            return True
        
        if count >= self.max_requests:
            return False
        
        self.requests[ip] = (count + 1, window_start)
        return True

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limiter: RateLimiter):
        super().__init__(app)
        self.rate_limiter = rate_limiter
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/", "/docs"]:
            return await call_next(request)
        
        if not self.rate_limiter.is_allowed(request.client.host):
            raise HTTPException(status_code=429, detail="Too many requests")
        
        return await call_next(request)

rate_limiter = RateLimiter()