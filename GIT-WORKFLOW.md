# Git Workflow for Audit Fixes

This document describes the Git branching strategy and workflow for managing audit fixes in the DigiSence project.

## Branching Strategy Overview

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/audit-fixes-security
        ├── feature/audit-fixes-architecture
        ├── feature/audit-fixes-performance
        └── feature/audit-fixes-accessibility
```

## Branch Types

| Branch | Purpose | Base Branch | Merges To |
|--------|---------|-------------|-----------|
| `main` | Production-ready code | - | - |
| `develop` | Integration branch for testing | `main` | `main` |
| `feature/audit-fixes-*` | Specific category fixes | `develop` | `develop` |

## Feature Branches

### 1. Security Fixes
- **Branch**: `feature/audit-fixes-security`
- **Purpose**: Critical security vulnerabilities and patches
- **Priority**: HIGH - Must be reviewed and merged first
- **Examples**: XSS prevention, CSRF protection, input sanitization, authentication fixes

### 2. Architecture Improvements
- **Branch**: `feature/audit-fixes-architecture`
- **Purpose**: Code structure and design pattern improvements
- **Priority**: MEDIUM
- **Examples**: Refactoring, dependency management, modularization

### 3. Performance Optimizations
- **Branch**: `feature/audit-fixes-performance`
- **Purpose**: Speed and efficiency improvements
- **Priority**: MEDIUM
- **Examples**: Query optimization, caching, lazy loading, bundle size reduction

### 4. Accessibility Fixes
- **Branch**: `feature/audit-fixes-accessibility`
- **Purpose**: WCAG compliance and inclusive design
- **Priority**: MEDIUM
- **Examples**: ARIA labels, keyboard navigation, color contrast, screen reader support

## Workflow Process

### Phase 1: Initialize Workflow
```bash
# Run the automation script
./scripts/git-workflow.sh init
```

This creates:
- `develop` branch from `main`
- All feature branches from `develop`

### Phase 2: Develop Fixes
Work on each feature branch independently:

```bash
# Switch to security branch
git checkout feature/audit-fixes-security

# Make your security fixes
# ... edit files ...

# Commit changes
git add .
git commit -m "fix(security): description of fix"

# Push to remote
git push origin feature/audit-fixes-security
```

### Phase 3: Merge Process
```bash
# Run merge workflow
./scripts/git-workflow.sh merge
```

The script will:
1. Switch to `develop` branch
2. Merge each feature branch in priority order
3. Handle conflicts if any
4. Test for conflicts between branches
5. Create a release branch if needed

### Phase 4: Production Release
```bash
# Run production release
./scripts/git-workflow.sh release
```

This will:
1. Merge `develop` to `main`
2. Create a version tag
3. Push all changes

## Priority Order for Merging

When merging multiple feature branches, follow this order to minimize conflicts:

1. **Security** (merged first - most critical)
2. **Architecture** (foundation for other fixes)
3. **Performance** (optimizations may depend on architecture)
4. **Accessibility** (usually independent)

## Conflict Resolution

If conflicts occur:

1. **Check which branches have conflicts**:
   ```bash
   git merge feature/audit-fixes-security --no-commit --no-ff
   ```

2. **Resolve conflicts manually**:
   ```bash
   # Edit conflicting files
   git add <resolved-files>
   git commit -m "merge: resolve conflicts between branches"
   ```

3. **Continue merge**:
   ```bash
   git merge --continue
   ```

## Quick Reference Commands

### Initialize branches
```bash
git checkout -b develop main
git checkout -b feature/audit-fixes-security develop
git checkout -b feature/audit-fixes-architecture develop
git checkout -b feature/audit-fixes-performance develop
git checkout -b feature/audit-fixes-accessibility develop
```

### Switch between branches
```bash
git checkout feature/audit-fixes-security
git checkout feature/audit-fixes-architecture
git checkout develop
git checkout main
```

### View branch status
```bash
git branch -a
git log --oneline --graph --all --decorate
```

### Delete feature branch (after merge)
```bash
git branch -d feature/audit-fixes-security
git push origin --delete feature/audit-fixes-security
```

## Best Practices

1. **Always work from the correct base branch**
   - Feature branches should always branch from `develop`
   - Never commit directly to `main` or `develop`

2. **Keep branches focused**
   - Each fix should be in its appropriate category branch
   - Don't mix security fixes with accessibility changes

3. **Commit messages**
   - Use conventional commit format: `type(scope): description`
   - Examples: `fix(security):`, `perf(api):`, `fix(a11y):`

4. **Pull regularly**
   - Sync your feature branch with develop frequently
   - `git pull origin develop` before merging

5. **Test before merge**
   - Always run tests locally before merging
   - Verify no regressions in functionality

6. **Use pull requests**
   - Create PRs for code review
   - Require approval before merging to main

## Automation Script Usage

```bash
# Make script executable
chmod +x scripts/git-workflow.sh

# Initialize all branches
./scripts/git-workflow.sh init

# Merge all feature branches to develop
./scripts/git-workflow.sh merge

# Release to production
./scripts/git-workflow.sh release

# Show help
./scripts/git-workflow.sh help
```

## Rollback Procedure

If something goes wrong:

```bash
# Revert merge
git revert -m 1 <merge-commit>

# Or reset to previous state
git reset --hard <previous-commit>

# Force push (use with caution!)
git push origin develop --force-with-lease
```

---

**Last Updated**: 2026-03-21
**Version**: 1.0.0
