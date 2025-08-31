# Contributing to DigiPIN.js

Thank you for your interest in contributing to DigiPIN.js! This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold the values of respect, inclusivity, and collaboration.

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide your operating system and Node.js version
- Include any error messages or stack traces

### Suggesting Enhancements

- Use the GitHub issue tracker for feature requests
- Describe the enhancement and its use case
- Consider the impact on existing functionality
- Discuss implementation approaches

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run the linter (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/rajatguptaa/digipinjs.git
cd digipinjs

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Run examples
node examples/full-usage-npm.js
node examples/geocode-example.js

# If you are in a restricted environment (e.g., CI or sandbox) that disallows opening network sockets,
# skip the Express demo inside the example by setting an env flag:
NO_NET=1 node examples/full-usage-npm.js
```

## Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add JSDoc comments for public functions
- Keep functions small and focused
- Use meaningful variable and function names

## Testing

- Write tests for new functionality
- Ensure existing tests continue to pass
- Use descriptive test names
- Test both success and error cases

## Commit Messages

- Use clear and descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep the first line under 50 characters
- Add more details in the body if needed

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please open an issue or contact the maintainers. 
