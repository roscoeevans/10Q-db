# Contributing to 10Q Database

Thank you for your interest in contributing to the 10Q Database project!

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see README.md)
4. **Create a feature branch** for your changes

## 🔐 Security & Access

This is a private tool with restricted access. Please note:

- **Admin access required**: Only authorized users can access the application
- **Firebase integration**: Requires proper service account setup
- **Secrets management**: Never commit sensitive files or API keys

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Testing
- Test authentication flows thoroughly
- Verify admin permission checks
- Test Firebase integration locally

### Security Checklist
- [ ] No hardcoded API keys or secrets
- [ ] Proper error handling for authentication
- [ ] Input validation on all forms
- [ ] Permission checks in place

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📋 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Test thoroughly** including authentication flows
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## 🔒 Security Considerations

- Never commit files from the `secrets/` directory
- Ensure `.env` files are properly ignored
- Test permission systems thoroughly
- Verify Firebase security rules

## 📞 Support

For questions or issues:
- Contact Roscoe for admin access
- Check the documentation in the repository
- Review Firebase setup guide

## 📄 License

This is an internal tool for authorized users only. 