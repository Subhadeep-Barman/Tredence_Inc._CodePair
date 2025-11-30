from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os
import time
from typing import Optional

router = APIRouter()

class ExecuteRequest(BaseModel):
    code: str
    language: str

class ExecuteResponse(BaseModel):
    output: str
    error: Optional[str] = None
    execution_time: float

@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    start_time = time.time()
    
    try:
        if request.language == "python":
            return await execute_python(request.code, start_time)
        elif request.language == "cpp":
            return await execute_cpp(request.code, start_time)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
    
    except Exception as e:
        return ExecuteResponse(
            output="",
            error=str(e),
            execution_time=time.time() - start_time
        )

async def execute_python(code: str, start_time: float) -> ExecuteResponse:
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        result = subprocess.run(
            ['python3', temp_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            return ExecuteResponse(
                output=result.stdout,
                execution_time=execution_time
            )
        else:
            return ExecuteResponse(
                output=result.stdout,
                error=result.stderr,
                execution_time=execution_time
            )
    
    except subprocess.TimeoutExpired:
        return ExecuteResponse(
            output="",
            error="Execution timeout (10 seconds)",
            execution_time=10.0
        )
    
    finally:
        os.unlink(temp_file)

async def execute_cpp(code: str, start_time: float) -> ExecuteResponse:
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
        f.write(code)
        cpp_file = f.name
    
    exe_file = cpp_file.replace('.cpp', '')
    
    try:
        # Compile
        compile_result = subprocess.run(
            ['g++', '-o', exe_file, cpp_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_result.returncode != 0:
            return ExecuteResponse(
                output="",
                error=f"Compilation error: {compile_result.stderr}",
                execution_time=time.time() - start_time
            )
        
        # Execute
        run_result = subprocess.run(
            [exe_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        execution_time = time.time() - start_time
        
        if run_result.returncode == 0:
            return ExecuteResponse(
                output=run_result.stdout,
                execution_time=execution_time
            )
        else:
            return ExecuteResponse(
                output=run_result.stdout,
                error=run_result.stderr,
                execution_time=execution_time
            )
    
    except subprocess.TimeoutExpired:
        return ExecuteResponse(
            output="",
            error="Execution timeout (10 seconds)",
            execution_time=10.0
        )
    
    finally:
        for file_path in [cpp_file, exe_file]:
            if os.path.exists(file_path):
                os.unlink(file_path)