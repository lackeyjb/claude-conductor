# TDD Workflow - Code Examples

Detailed examples for the Red-Green-Refactor cycle.

## RED Phase Example

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid email', async () => {
      const user = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User'
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        userService.createUser({ email: 'invalid', name: 'Test' })
      ).rejects.toThrow('Invalid email format');
    });
  });
});
```

## GREEN Phase Example

```typescript
// MINIMUM implementation to pass tests
class UserService {
  async createUser(data: { email: string; name: string }) {
    if (!data.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name
    };
  }
}
```

## REFACTOR Phase Example

```typescript
// REFACTORED version
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    this.validateEmail(data.email);
    return this.buildUser(data);
  }

  private validateEmail(email: string): void {
    if (!EMAIL_REGEX.test(email)) {
      throw new InvalidEmailError(email);
    }
  }

  private buildUser(data: CreateUserInput): User {
    return {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date()
    };
  }
}
```

## Arrange-Act-Assert Pattern

```typescript
it('should calculate discount correctly', () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 100 });

  // Act
  const discount = cart.calculateDiscount();

  // Assert
  expect(discount).toBe(10);
});
```

## Given-When-Then Pattern

```typescript
describe('given a cart with items over $100', () => {
  describe('when calculating discount', () => {
    it('then should apply 10% discount', () => {
      const cart = new Cart();
      cart.addItem({ price: 150 });

      const discount = cart.calculateDiscount();

      expect(discount).toBe(15);
    });
  });
});
```

## Anti-Pattern Examples

### BAD: Testing Implementation

```typescript
// Testing HOW (brittle, coupled to implementation)
expect(service.internalMethod).toHaveBeenCalled();
```

### GOOD: Testing Behavior

```typescript
// Testing WHAT (resilient, tests public contract)
expect(result).toEqual(expectedOutput);
```

### BAD: Brittle Assertions

```typescript
// Breaks if order changes
expect(users[0].name).toBe('Alice');
```

### GOOD: Resilient Assertions

```typescript
// Works regardless of order
expect(users).toContainEqual(expect.objectContaining({ name: 'Alice' }));
```
