import requests
import json
from app.schemas.autocomplete import AutocompleteRequest, AutocompleteResponse


class AutocompleteService:
    # Free Hugging Face API endpoint
    HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
    
    @staticmethod
    def get_autocomplete_suggestion(request: AutocompleteRequest) -> AutocompleteResponse:
        """Generate free AI-powered autocomplete suggestion using Hugging Face"""
        try:
            # Get context around cursor position
            lines = request.code.split('\n')
            cursor_line = request.code[:request.cursorPosition].count('\n')
            
            if cursor_line < len(lines):
                current_line = lines[cursor_line]
                line_position = request.cursorPosition - sum(len(line) + 1 for line in lines[:cursor_line])
                current_text = current_line[:line_position] if line_position >= 0 else ""
            else:
                current_text = ""
            
            # Get surrounding context (2 lines before)
            start_line = max(0, cursor_line - 2)
            context_lines = lines[start_line:cursor_line + 1]
            context = "\n".join(context_lines)
            
            # Create prompt for code completion
            prompt = f"Complete this {request.language} code: {context}"
            
            # First check for syntax completion
            syntax_suggestion = AutocompleteService._check_syntax_completion(current_text, request.language)
            if syntax_suggestion:
                return AutocompleteResponse(
                    suggestion=syntax_suggestion,
                    insertPosition=request.cursorPosition,
                    confidence=0.95
                )
            
            # Call free Hugging Face API for complex completions
            response = requests.post(
                AutocompleteService.HF_API_URL,
                headers={"Content-Type": "application/json"},
                json={"inputs": prompt, "parameters": {"max_length": 50}},
                timeout=3
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    suggestion = result[0].get('generated_text', '').replace(prompt, '').strip()
                    if suggestion:
                        return AutocompleteResponse(
                            suggestion=suggestion[:100],
                            insertPosition=request.cursorPosition,
                            confidence=0.8
                        )
            
            # Fallback to smart suggestions
            return AutocompleteService._smart_suggestion(request)
            
        except Exception as e:
            print(f"Hugging Face API error: {e}")
            return AutocompleteService._smart_suggestion(request)
    
    @staticmethod
    def _smart_suggestion(request: AutocompleteRequest) -> AutocompleteResponse:
        """Smart syntax-aware suggestions"""
        lines = request.code.split('\n')
        cursor_line = request.code[:request.cursorPosition].count('\n')
        
        if cursor_line < len(lines):
            current_line = lines[cursor_line]
            line_position = request.cursorPosition - sum(len(line) + 1 for line in lines[:cursor_line])
            current_text = current_line[:line_position] if line_position >= 0 else ""
        else:
            current_text = ""
        
        # Check for syntax completion needs
        suggestion = AutocompleteService._check_syntax_completion(current_text, request.language)
        if suggestion:
            return AutocompleteResponse(
                suggestion=suggestion,
                insertPosition=request.cursorPosition,
                confidence=0.9
            )
        
        # Pattern-based suggestions
        suggestion = AutocompleteService._pattern_suggestion(current_text, request.language)
        
        return AutocompleteResponse(
            suggestion=suggestion,
            insertPosition=request.cursorPosition,
            confidence=0.7
        )
    
    @staticmethod
    def _check_syntax_completion(text: str, language: str) -> str:
        """Check for incomplete syntax and suggest completion"""
        text = text.strip()
        
        if language.lower() == 'python':
            # Check for unclosed parentheses
            open_parens = text.count('(') - text.count(')')
            if open_parens > 0:
                return ')' * open_parens
            
            # Check for unclosed brackets
            open_brackets = text.count('[') - text.count(']')
            if open_brackets > 0:
                return ']' * open_brackets
            
            # Check for unclosed braces
            open_braces = text.count('{') - text.count('}')
            if open_braces > 0:
                return '}' * open_braces
            
            # Check for unclosed quotes
            if text.count('"') % 2 == 1:
                return '"'
            if text.count("'") % 2 == 1:
                return "'"
            
            # Check for print statement without closing
            if text.endswith('print(') or 'print(' in text and text.count('(') > text.count(')'):
                return ')'
            
        elif language.lower() == 'cpp':
            # Check for unclosed parentheses
            open_parens = text.count('(') - text.count(')')
            if open_parens > 0:
                return ')' * open_parens
            
            # Check for unclosed braces
            open_braces = text.count('{') - text.count('}')
            if open_braces > 0:
                return '}' * open_braces
            
            # Check for missing semicolon
            if text and not text.endswith((';', '{', '}', ':')) and not text.startswith(('#', '//', '/*')):
                return ';'
        
        return ""
    
    @staticmethod
    def _pattern_suggestion(text: str, language: str) -> str:
        """Pattern-based code suggestions"""
        if language.lower() == 'python':
            if 'def ' in text:
                return "function_name():"
            elif 'class ' in text:
                return "ClassName:"
            elif 'if ' in text:
                return "condition:"
            elif 'for ' in text:
                return "item in items:"
            elif 'print(' in text:
                return '"Hello, World!"'
            else:
                return "pass"
        elif language.lower() == 'cpp':
            if '#include' in text:
                return "<iostream>"
            elif 'int main' in text:
                return "() {\n    return 0;\n}"
            elif 'cout' in text:
                return ' << "Hello, World!" << endl;'
            elif 'cin' in text:
                return ' >> variable;'
            else:
                return "// TODO"
        else:
            return "// Complete this"