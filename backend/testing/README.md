# Backend Testing

This directory contains all testing-related files for the backend application.

## Test Files

### API Tests
- `test_chat_api.py` - Knowledge base chat API testing
- `test_celery.py` - Celery task testing

### LLM/AI Tests
- `test_llm_access.py` - LLM connection testing
- `test_openai_connection.py` - OpenAI API connection testing
- `test_openai_direct.py` - Direct OpenAI API testing
- `test_openai_fixed.py` - Fixed OpenAI API testing
- `test_openai_simple.py` - Simple OpenAI API testing
- `test_kb_chain.py` - Knowledge base chain testing

### Test Reports
- `OPENAI_API_TEST_REPORT.md` - OpenAI API test results and documentation

## Running Tests

### Individual Test Files
```bash
# From backend directory
cd backend
python testing/test_chat_api.py
python testing/test_celery.py
python testing/test_llm_access.py
```

### Prerequisites
- Backend dependencies installed (`pip install -r requirements.txt`)
- Environment variables configured (`.env` file)
- MongoDB running
- Redis running (for Celery tests)
- OpenAI API key configured (for LLM tests)

## Test Categories

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Fast execution

### Integration Tests
- Test API endpoints
- Test database interactions
- Test service layer

### LLM Tests
- Test AI model connections
- Test LangChain chains
- Verify API key configuration

## Notes

- Some tests require external services (OpenAI, MongoDB, Redis)
- Ensure proper environment configuration before running tests
- Test files may need updates if API contracts change

