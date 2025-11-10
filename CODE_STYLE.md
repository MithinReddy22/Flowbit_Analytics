# Code Style Guide

## TypeScript

- Use `strict: true` in `tsconfig.json`
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use type aliases for unions and complex types

## Naming Conventions

- **Files**: kebab-case (e.g., `invoice-trends.ts`)
- **Components**: PascalCase (e.g., `InvoiceTrendsChart`)
- **Functions/Variables**: camelCase (e.g., `getInvoiceTrends`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ROWS`)
- **Types/Interfaces**: PascalCase (e.g., `InvoiceTrend`)

## Code Organization

- Group imports: external → internal → types
- Use named exports for components
- Use default exports sparingly (only for pages/components)
- Keep functions small and focused
- Extract reusable logic into utilities

## Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Remove commented-out code before committing

## Git Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(api): add /vendors/top10 endpoint
fix(seed): handle missing vendor objects in JSON
chore(docker): add docker-compose for db + vanna
docs(readme): update deployment instructions
test(api): add tests for stats endpoint
refactor(web): extract chart components
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## ESLint & Prettier

- Run `pnpm lint` before committing
- Run `pnpm format` to auto-format code
- Fix all linting errors before pushing

## Testing

- Write tests for all API endpoints
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

## Error Handling

- Use try-catch for async operations
- Return appropriate HTTP status codes
- Log errors with context
- Never expose sensitive information in error messages


