# Testing Guide for 10Q Database

## Overview

This document outlines the testing strategy and implementation for the 10Q Database project. We use **Vitest** as our testing framework with **React Testing Library** for component testing.

## Testing Stack

- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for testing
- **@testing-library/jest-dom**: Custom matchers for DOM testing

## Test Structure

```
src/
├── test/
│   └── setup.ts                 # Global test configuration
├── features/
│   ├── questions/
│   │   └── services/
│   │       └── __tests__/
│   │           └── questionService.test.ts
│   └── auth/
│       └── services/
│           └── __tests__/
│               └── authService.test.ts
├── lib/
│   ├── utils/
│   │   └── __tests__/
│   │       └── common.test.ts
│   └── errors/
│       └── __tests__/
│           └── errorTypes.test.ts
└── components/
    └── ui/
        └── __tests__/
            └── Button.test.tsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Open test UI
npm run test:ui
```

## Test Categories

### 1. Unit Tests (Highest Priority)

**Business Logic Services**
- `QuestionService`: Core question management logic
- `AuthService`: Authentication and permission handling
- Error handling and validation

**Utility Functions**
- Common utilities (`debounce`, `deepClone`, etc.)
- Date formatting and manipulation
- Error classes and types

### 2. Component Tests (Medium Priority)

**Critical UI Components**
- `Button`: Reusable UI component
- `QuestionUploadFlow`: Multi-step question creation
- `LoginScreen`: Authentication entry point

### 3. Integration Tests (Future)

**Feature Integration**
- Question upload flow end-to-end
- Authentication flow
- Dashboard statistics

## Testing Best Practices

### 1. Test Organization

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test directories: `__tests__/`
- Test descriptions: "should [expected behavior] when [condition]"

### 3. Mocking Strategy

```typescript
// Mock external dependencies
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

// Mock internal modules
vi.mock('@/lib/firestore-admin', () => ({
  getAllQuestions: vi.fn(),
}));
```

### 4. Test Data

```typescript
const mockQuestions = [
  {
    id: '1',
    question: 'What is the capital of France?',
    choices: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
    // ... other properties
  }
];
```

## Priority Test Implementation

### Phase 1: Core Business Logic ✅

1. **QuestionService Tests** ✅
   - Question CRUD operations
   - Search and filtering
   - Validation logic
   - Error handling

2. **AuthService Tests** ✅
   - Authentication flow
   - Permission checking
   - State management
   - Error handling

3. **Utility Tests** ✅
   - Common utility functions
   - Error classes
   - Date utilities

### Phase 2: Component Tests

1. **UI Component Tests**
   - Button component variants
   - Form components
   - Modal components

2. **Feature Component Tests**
   - QuestionUploadFlow
   - LoginScreen
   - Dashboard components

### Phase 3: Integration Tests

1. **End-to-End Flows**
   - Complete question upload process
   - Authentication flow
   - Dashboard statistics

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for business logic
- **Component Tests**: 80%+ coverage for critical components
- **Integration Tests**: Key user flows covered

## Common Test Patterns

### Service Testing

```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    vi.clearAllMocks();
    service = ServiceName.getInstance();
  });

  it('should handle success case', async () => {
    // Arrange
    const mockData = { /* test data */ };
    vi.mocked(mockFunction).mockResolvedValue(mockData);

    // Act
    const result = await service.methodName();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
  });

  it('should handle error case', async () => {
    // Arrange
    vi.mocked(mockFunction).mockRejectedValue(new Error('Test error'));

    // Act & Assert
    await expect(service.methodName()).rejects.toThrow('Test error');
  });
});
```

### Component Testing

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Error Testing

```typescript
it('should throw ValidationError for invalid input', async () => {
  const invalidData = { /* invalid data */ };
  
  await expect(service.methodName(invalidData))
    .rejects.toThrow(ValidationError);
});
```

## Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

## Mocking Firebase

```typescript
// In test setup
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// In tests
const mockUser = { uid: 'test-uid', email: 'test@example.com' };
vi.mocked(signInWithPopup).mockResolvedValue({
  user: mockUser,
  providerId: 'google.com',
  operationType: 'signIn'
} as any);
```

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Main branch commits
- Release builds

## Debugging Tests

```bash
# Run specific test file
npm test questionService.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --inspect-brk
```

## Performance Testing

For performance-critical functions:
```typescript
it('should complete within time limit', () => {
  const start = performance.now();
  service.expensiveOperation();
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // 100ms limit
});
```

## Future Enhancements

1. **Visual Regression Testing**: For UI components
2. **Accessibility Testing**: Using `@testing-library/jest-dom`
3. **Performance Testing**: For critical user flows
4. **Security Testing**: For authentication and authorization
5. **Load Testing**: For database operations

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 