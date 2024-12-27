class TestCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Get the origin of the request
        origin = request.headers.get("Origin")

        # List of allowed origins
        allowed_origins = [
            "http://localhost:3000",  # React dev server
            "http://127.0.0.1:3000",  # Alternative local dev server
            "http://localhost:8001",
            "http://127.0.0.1:8001",
            "https://c21436494.xyz",  # Add your production domain here
        ]

        if origin in allowed_origins:
            response["Access-Control-Allow-Origin"] = origin

        # Allow specific HTTP methods
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"

        # Allow specific headers
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRFToken"

        # Allow credentials
        response["Access-Control-Allow-Credentials"] = "true"

        # Handle preflight (OPTIONS) requests
        if request.method == "OPTIONS":
            response.status_code = 200

        return response