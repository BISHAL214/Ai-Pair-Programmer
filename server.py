from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import secrets
import httpx
import asyncio
import base64
import json
from github import Github, Auth

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="RepoWizard - AI-Powered Repository Analysis")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=os.environ.get('SECRET_KEY', 'your-secret-key-here'))

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# GitHub OAuth Configuration
GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
GITHUB_REDIRECT_URI = os.environ.get('GITHUB_REDIRECT_URI', 'http://localhost:3000/auth/callback')

# AI Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    github_id: int
    username: str
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    access_token: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Repository(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    github_id: int
    name: str
    full_name: str
    description: Optional[str] = None
    language: Optional[str] = None
    size: int
    stars: int
    forks: int
    private: bool
    created_at: datetime
    updated_at: datetime
    html_url: str
    clone_url: str
    default_branch: str

class RepositoryAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    repository_id: str
    user_id: str
    total_files: int
    total_size: int
    languages: Dict[str, Any]
    file_structure: List[Dict[str, Any]]
    ai_insights: Optional[Dict[str, Any]] = None
    optimization_suggestions: Optional[List[str]] = None
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CodeAnalysisRequest(BaseModel):
    code: str
    language: Optional[str] = None
    context: Optional[str] = None

class CodeAnalysisResponse(BaseModel):
    explanation: str
    suggestions: List[str]
    optimization_tips: List[str]

# GitHub OAuth Handler
class GitHubOAuthHandler:
    def __init__(self):
        self.client_id = GITHUB_CLIENT_ID
        self.client_secret = GITHUB_CLIENT_SECRET
        self.redirect_uri = GITHUB_REDIRECT_URI
        self.authorize_url = "https://github.com/login/oauth/authorize"
        self.token_url = "https://github.com/login/oauth/access_token"
        self.user_api_url = "https://api.github.com/user"

    def generate_auth_url(self, state: Optional[str] = None) -> tuple:
        if state is None:
            state = secrets.token_urlsafe(32)
        
        scopes = ["read:user", "user:email", "repo"]
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(scopes),
            "state": state,
            "response_type": "code"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        auth_url = f"{self.authorize_url}?{query_string}"
        
        return auth_url, state

    async def exchange_code_for_token(self, code: str, state: str, expected_state: str) -> Dict:
        if state != expected_state:
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        token_data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                data=token_data,
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
            
            token_response = response.json()
            
            if "error" in token_response:
                raise HTTPException(status_code=400, detail=f"OAuth error: {token_response['error_description']}")
            
            return token_response

    async def get_user_info(self, access_token: str) -> Dict:
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(self.user_api_url, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to retrieve user information")
            
            return response.json()

# Repository Analysis Handler
class RepositoryAnalyzer:
    def __init__(self, access_token: str):
        self.access_token = access_token
        auth = Auth.Token(access_token)
        self.github = Github(auth=auth)

    async def get_user_repositories(self) -> List[Dict]:
        try:
            user = self.github.get_user()
            repositories = []
            
            for repo in user.get_repos():
                repo_data = {
                    "github_id": repo.id,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "description": repo.description,
                    "language": repo.language,
                    "size": repo.size,
                    "stars": repo.stargazers_count,
                    "forks": repo.forks_count,
                    "private": repo.private,
                    "created_at": repo.created_at.isoformat() if repo.created_at else None,
                    "updated_at": repo.updated_at.isoformat() if repo.updated_at else None,
                    "html_url": repo.html_url,
                    "clone_url": repo.clone_url,
                    "default_branch": repo.default_branch
                }
                repositories.append(repo_data)
                
            return repositories
            
        except Exception as e:
            logger.error(f"Failed to fetch repositories: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to fetch repositories: {str(e)}")

    async def analyze_repository_structure(self, repo_name: str) -> Dict:
        try:
            repo = self.github.get_repo(repo_name)
            
            # Get repository contents recursively
            contents = []
            def get_contents_recursive(path=""):
                try:
                    items = repo.get_contents(path)
                    for item in items:
                        if item.type == "dir":
                            contents.extend(get_contents_recursive(item.path))
                        else:
                            contents.append({
                                "path": item.path,
                                "name": item.name,
                                "size": item.size,
                                "type": item.type,
                                "download_url": item.download_url
                            })
                except Exception as e:
                    logger.warning(f"Error accessing path {path}: {str(e)}")
                return contents
            
            file_contents = get_contents_recursive()
            
            # Analyze file types and sizes
            file_analysis = {}
            total_size = 0
            
            for file_info in file_contents:
                extension = os.path.splitext(file_info["name"])[1].lower()
                if extension not in file_analysis:
                    file_analysis[extension] = {"count": 0, "total_size": 0}
                
                file_analysis[extension]["count"] += 1
                file_analysis[extension]["total_size"] += file_info["size"]
                total_size += file_info["size"]
            
            return {
                "repository": repo_name,
                "total_files": len(file_contents),
                "total_size": total_size,
                "file_types": file_analysis,
                "files": file_contents
            }
            
        except Exception as e:
            logger.error(f"Repository analysis failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Repository analysis failed: {str(e)}")

    async def get_file_content(self, repo_name: str, file_path: str) -> Dict:
        try:
            repo = self.github.get_repo(repo_name)
            file_content = repo.get_contents(file_path)
            
            if file_content.encoding == "base64":
                decoded_content = base64.b64decode(file_content.content).decode('utf-8')
            else:
                decoded_content = file_content.content
                
            return {
                "path": file_path,
                "size": file_content.size,
                "content": decoded_content,
                "sha": file_content.sha,
                "name": os.path.basename(file_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve file content: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to retrieve file content: {str(e)}")

# AI Code Analysis Handler
class AICodeAnalyzer:
    def __init__(self):
        self.api_key = EMERGENT_LLM_KEY

    async def analyze_code(self, code: str, language: Optional[str] = None, context: Optional[str] = None) -> CodeAnalysisResponse:
        try:
            # Import the AI library
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            # Initialize chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"code_analysis_{uuid.uuid4()}",
                system_message="You are an expert code reviewer and optimization specialist. Analyze code and provide clear explanations, suggestions, and optimization tips."
            ).with_model("openai", "gpt-4o-mini")
            
            # Create analysis prompt
            prompt = f"""
            Please analyze the following {language or 'code'} code:
            
            ```{language or 'text'}
            {code}
            ```
            
            Context: {context or 'No additional context provided'}
            
            Please provide:
            1. A clear explanation of what this code does
            2. Specific suggestions for improvement
            3. Optimization tips for better performance or readability
            
            Format your response as JSON with keys: explanation, suggestions (array), optimization_tips (array)
            """
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Try to parse JSON response, fallback to structured parsing
            try:
                parsed_response = json.loads(response)
                return CodeAnalysisResponse(
                    explanation=parsed_response.get("explanation", ""),
                    suggestions=parsed_response.get("suggestions", []),
                    optimization_tips=parsed_response.get("optimization_tips", [])
                )
            except json.JSONDecodeError:
                # Fallback parsing
                lines = response.split('\n')
                explanation = response[:500] + "..." if len(response) > 500 else response
                return CodeAnalysisResponse(
                    explanation=explanation,
                    suggestions=["AI analysis completed - see explanation for details"],
                    optimization_tips=["Consider code review best practices"]
                )
                
        except Exception as e:
            logger.error(f"AI code analysis failed: {str(e)}")
            return CodeAnalysisResponse(
                explanation=f"Analysis failed: {str(e)}",
                suggestions=["Unable to analyze code at this time"],
                optimization_tips=["Please try again later"]
            )

    async def generate_repository_insights(self, analysis_data: Dict) -> Dict:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"repo_insights_{uuid.uuid4()}",
                system_message="You are a software architecture expert. Analyze repository structure and provide insights about code organization, potential improvements, and best practices."
            ).with_model("openai", "gpt-4o-mini")
            
            prompt = f"""
            Analyze this repository structure:
            
            Repository: {analysis_data.get('repository')}
            Total Files: {analysis_data.get('total_files')}
            Total Size: {analysis_data.get('total_size')} bytes
            File Types: {json.dumps(analysis_data.get('file_types', {}), indent=2)}
            
            Provide insights about:
            1. Code organization and structure
            2. Potential improvements
            3. Technology stack assessment
            4. Best practices recommendations
            
            Format as JSON with keys: organization_insights, improvements, tech_stack, best_practices (all arrays)
            """
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "organization_insights": ["Repository analysis completed"],
                    "improvements": ["See detailed analysis"],
                    "tech_stack": ["Multiple languages detected"],
                    "best_practices": ["Follow standard conventions"]
                }
                
        except Exception as e:
            logger.error(f"Repository insights generation failed: {str(e)}")
            return {
                "organization_insights": ["Analysis not available"],
                "improvements": ["Please try again"],
                "tech_stack": ["Unknown"],
                "best_practices": ["Standard practices recommended"]
            }

# Initialize handlers
oauth_handler = GitHubOAuthHandler()
ai_analyzer = AICodeAnalyzer()

# Dependency to get current user
def get_current_user(request: Request):
    auth_data = request.session.get("github_auth")
    if not auth_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return auth_data

# Demo/Mock Authentication Route
@api_router.post("/auth/demo")
async def demo_login(request: Request):
    """Demo login with mock user data"""
    mock_user_data = {
        "github_id": 12345678,
        "username": "demo_user",
        "name": "Demo User",
        "email": "demo@repowizard.com",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345678?v=4",
        "access_token": "demo_token_12345",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    user_obj = User(**mock_user_data)
    
    # Store in database (optional for demo)
    await db.users.update_one(
        {"github_id": 12345678},
        {"$set": user_obj.dict()},
        upsert=True
    )
    
    # Store authentication data in session
    auth_data = {
        "user_id": user_obj.id,
        "access_token": "demo_token_12345",
        "user_info": {
            "id": 12345678,
            "login": "demo_user",
            "name": "Demo User",
            "email": "demo@repowizard.com",
            "avatar_url": "https://avatars.githubusercontent.com/u/12345678?v=4"
        }
    }
    
    request.session["github_auth"] = auth_data
    return {
        "message": "Demo authentication successful",
        "user": auth_data["user_info"]
    }

# OAuth Routes
@api_router.get("/auth/github")
async def initiate_github_auth(request: Request):
    auth_url, state = oauth_handler.generate_auth_url()
    request.session["oauth_state"] = state
    request.session["auth_initiated_at"] = datetime.now(timezone.utc).isoformat()
    return {"authorization_url": auth_url}

@api_router.get("/auth/github/callback")
async def github_auth_callback(
    code: str,
    state: str,
    request: Request,
    error: Optional[str] = None
):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth authorization failed: {error}")
    
    stored_state = request.session.get("oauth_state")
    if not stored_state:
        raise HTTPException(status_code=400, detail="No authentication session found")
    
    try:
        # Exchange code for token
        token_data = await oauth_handler.exchange_code_for_token(code, state, stored_state)
        
        # Get user information
        user_info = await oauth_handler.get_user_info(token_data["access_token"])
        
        # Store user in database
        user_data = {
            "github_id": user_info["id"],
            "username": user_info["login"],
            "name": user_info.get("name"),
            "email": user_info.get("email"),
            "avatar_url": user_info.get("avatar_url"),
            "access_token": token_data["access_token"],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        user_obj = User(**user_data)
        
        # Upsert user in database
        await db.users.update_one(
            {"github_id": user_info["id"]},
            {"$set": user_obj.dict()},
            upsert=True
        )
        
        # Store authentication data in session
        auth_data = {
            "user_id": user_obj.id,
            "access_token": token_data["access_token"],
            "user_info": {
                "id": user_info["id"],
                "login": user_info["login"],
                "name": user_info.get("name"),
                "email": user_info.get("email"),
                "avatar_url": user_info.get("avatar_url")
            }
        }
        
        request.session["github_auth"] = auth_data
        request.session.pop("oauth_state", None)
        request.session.pop("auth_initiated_at", None)
        
        return {
            "message": "Authentication successful",
            "user": auth_data["user_info"]
        }
        
    except Exception as e:
        request.session.pop("oauth_state", None)
        request.session.pop("auth_initiated_at", None)
        raise e

@api_router.get("/auth/status")
async def check_auth_status(request: Request):
    auth_data = request.session.get("github_auth")
    if not auth_data:
        return {"authenticated": False}
    
    return {
        "authenticated": True,
        "user": auth_data["user_info"]
    }

@api_router.post("/auth/logout")
async def logout(request: Request):
    request.session.pop("github_auth", None)
    return {"message": "Logged out successfully"}

# Repository Routes
@api_router.get("/repositories")
async def list_repositories(request: Request, auth_data: dict = Depends(get_current_user)):
    analyzer = RepositoryAnalyzer(auth_data["access_token"])
    repositories = await analyzer.get_user_repositories()
    return {"repositories": repositories}

@api_router.get("/repository/{owner}/{repo}/analyze")
async def analyze_repository(
    owner: str,
    repo: str,
    request: Request,
    auth_data: dict = Depends(get_current_user)
):
    analyzer = RepositoryAnalyzer(auth_data["access_token"])
    repo_name = f"{owner}/{repo}"
    
    try:
        # Analyze repository structure
        analysis = await analyzer.analyze_repository_structure(repo_name)
        
        # Generate AI insights
        insights = await ai_analyzer.generate_repository_insights(analysis)
        analysis["ai_insights"] = insights
        
        # Store analysis in database
        analysis_obj = RepositoryAnalysis(
            repository_id=f"{owner}_{repo}",
            user_id=auth_data["user_id"],
            total_files=analysis["total_files"],
            total_size=analysis["total_size"],
            languages=analysis["file_types"],
            file_structure=analysis["files"][:100],  # Limit for storage
            ai_insights=insights
        )
        
        await db.repository_analyses.insert_one(analysis_obj.dict())
        
        return analysis
        
    except Exception as e:
        logger.error(f"Repository analysis failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/repository/{owner}/{repo}/file")
async def get_file_content(
    owner: str,
    repo: str,
    file_path: str,
    request: Request,
    auth_data: dict = Depends(get_current_user)
):
    analyzer = RepositoryAnalyzer(auth_data["access_token"])
    repo_name = f"{owner}/{repo}"
    
    try:
        content = await analyzer.get_file_content(repo_name, file_path)
        return content
    except Exception as e:
        logger.error(f"File retrieval failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# AI Analysis Routes
@api_router.post("/analyze-code")
async def analyze_code(
    request_data: CodeAnalysisRequest,
    request: Request,
    auth_data: dict = Depends(get_current_user)
):
    try:
        analysis = await ai_analyzer.analyze_code(
            request_data.code,
            request_data.language,
            request_data.context
        )
        return analysis
    except Exception as e:
        logger.error(f"Code analysis failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Health check
@api_router.get("/")
async def root():
    return {"message": "RepoWizard API is running"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": "connected",
            "github_oauth": "configured" if GITHUB_CLIENT_ID else "not_configured",
            "ai_service": "configured" if EMERGENT_LLM_KEY else "not_configured"
        }
    }

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
